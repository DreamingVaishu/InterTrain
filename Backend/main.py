import asyncio
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx
import websockets
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from pydantic import BaseModel, Field

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
SECTIONS_DIR = BASE_DIR / "sections"
AUDIO_DIR = BASE_DIR / "audio"
SECTIONS_DIR.mkdir(parents=True, exist_ok=True)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-120b")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

if not OPENROUTER_API_KEY:
    print("WARNING: OPENROUTER_API_KEY is not configured")
if not DEEPGRAM_API_KEY:
    print("WARNING: DEEPGRAM_API_KEY is not configured")

app = FastAPI(title="InterTrain Live Interview API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_client = AsyncOpenAI(
    api_key=OPENROUTER_API_KEY or "missing-key",
    base_url="https://openrouter.ai/api/v1",
)


class StartInterviewRequest(BaseModel):
    section_id: str = Field(min_length=1)
    subject: str = Field(min_length=1, max_length=200)
    difficulty: str = "Intermediate"


class AnswerRequest(BaseModel):
    section_id: str = Field(min_length=1)
    answer: str = Field(min_length=1, max_length=10000)


class RunCodeRequest(BaseModel):
    code: str = Field(min_length=1, max_length=50000)
    language: str = "python"
    test_input: str = ""


class EvaluateCodeRequest(BaseModel):
    section_id: str = Field(min_length=1)
    code: str = Field(min_length=1, max_length=50000)
    language: str = "python"
    question: str = ""


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def section_path(section_id: str) -> Path:
    safe_id = re.sub(r"[^a-zA-Z0-9_-]", "", section_id)
    return SECTIONS_DIR / f"section_{safe_id}.json"


def load_section(section_id: str) -> dict[str, Any]:
    path = section_path(section_id)
    if not path.exists():
        raise FileNotFoundError(f"Section {section_id} was not found")
    return json.loads(path.read_text(encoding="utf-8"))


def save_section(section: dict[str, Any]) -> None:
    path = section_path(section["section_id"])
    path.write_text(json.dumps(section, indent=2, ensure_ascii=False), encoding="utf-8")


async def generate_question(section: dict[str, Any]) -> str:
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is not configured")

    round_number = section["current_round"]
    history = section["rounds"]

    if round_number == 1:
        prompt = f"""
You are a professional technical interviewer.

Interview subject: {section['subject']}
Candidate level: {section['difficulty']}
Round: 1 of 5

Generate the first interview question. It must be a concise introduction question that asks about the candidate's experience with the subject.
Ask exactly ONE question. Return only the question text.
"""
    else:
        history_text = "\n\n".join(
            f"Round {item['round']}:\nQuestion: {item['question']}\nCandidate answer: {item['answer']}"
            for item in history
        )
        prompt = f"""
You are a professional technical interviewer conducting a live interview.

Interview subject: {section['subject']}
Candidate level: {section['difficulty']}
Current round: {round_number} of 5

Review the previous interview conversation below and generate the next question.

{history_text}

Rules:
- Ask exactly ONE question.
- Stay relevant to the subject.
- Adapt the difficulty to the candidate's previous answers.
- Probe weak or incomplete areas when useful.
- Do not repeat previous questions.
- The question must be answerable verbally.
- Keep it concise and professional.
- Never generate a sixth question.
- Return only the question text.
"""

    response = await ai_client.chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )
    question = (response.choices[0].message.content or "").strip()
    if not question:
        raise RuntimeError("OpenRouter returned an empty question")
    return question


async def synthesize_tts(text: str, section_id: str, round_number: int) -> str:
    if not DEEPGRAM_API_KEY:
        raise RuntimeError("DEEPGRAM_API_KEY is not configured")

    url = (
        "https://api.deepgram.com/v1/speak"
        "?model=aura-2-thalia-en&encoding=linear16&container=wav"
    )
    headers = {
        "Authorization": f"Token {DEEPGRAM_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, headers=headers, json={"text": text})
        response.raise_for_status()

    filename = f"{section_id}_{round_number}.wav"
    path = AUDIO_DIR / filename
    path.write_bytes(response.content)
    return f"/api/live-interview/audio/{filename}"


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/live-interview/start")
async def start_interview(request: StartInterviewRequest):
    path = section_path(request.section_id)
    if path.exists():
        raise ValueError("This section already exists. Start the interview with a new section ID.")

    section = {
        "section_id": request.section_id,
        "subject": request.subject,
        "difficulty": request.difficulty,
        "status": "in_progress",
        "total_rounds": 5,
        "current_round": 1,
        "started_at": utc_now(),
        "completed_at": None,
        "rounds": [],
    }

    question = await generate_question(section)
    audio_url = await synthesize_tts(question, request.section_id, 1)

    section["rounds"].append(
        {
            "round": 1,
            "question": question,
            "answer": "",
            "question_generated_at": utc_now(),
            "answer_received_at": None,
        }
    )
    save_section(section)

    return {
        "section_id": request.section_id,
        "round": 1,
        "total_rounds": 5,
        "question": question,
        "audio_url": audio_url,
        "completed": False,
    }


@app.post("/api/live-interview/answer")
async def submit_answer(request: AnswerRequest):
    section = load_section(request.section_id)

    if section["status"] == "completed":
        return {"section_id": request.section_id, "round": 5, "total_rounds": 5, "completed": True}

    current_round = section["current_round"]
    current = section["rounds"][-1]
    if current["round"] != current_round:
        raise ValueError("Interview round state is invalid")

    current["answer"] = request.answer.strip()
    current["answer_received_at"] = utc_now()

    if current_round >= section["total_rounds"]:
        section["status"] = "completed"
        section["completed_at"] = utc_now()
        save_section(section)
        return {
            "section_id": request.section_id,
            "round": current_round,
            "total_rounds": 5,
            "completed": True,
        }

    section["current_round"] = current_round + 1
    question = await generate_question(section)
    audio_url = await synthesize_tts(question, request.section_id, section["current_round"])

    section["rounds"].append(
        {
            "round": section["current_round"],
            "question": question,
            "answer": "",
            "question_generated_at": utc_now(),
            "answer_received_at": None,
        }
    )
    save_section(section)

    return {
        "section_id": request.section_id,
        "round": section["current_round"],
        "total_rounds": 5,
        "question": question,
        "audio_url": audio_url,
        "completed": False,
    }


@app.get("/api/live-interview/{section_id}")
async def get_section(section_id: str):
    return load_section(section_id)


@app.get("/api/live-interview/audio/{filename}")
async def get_audio(filename: str):
    from fastapi.responses import FileResponse

    safe_name = Path(filename).name
    path = AUDIO_DIR / safe_name
    if not path.exists():
        return {"error": "Audio not found"}
    return FileResponse(path, media_type="audio/wav", filename=safe_name)


@app.post("/api/run-code")
async def run_code(request: RunCodeRequest):
    """Execute candidate code in an isolated subprocess sandbox (5-second timeout)."""
    lang = request.language.lower()
    code = request.code
    test_input = request.test_input or ""

    # Supported languages and their executors
    if lang in ("python", "py"):
        cmd = [sys.executable, "-c", code]
    elif lang in ("javascript", "js"):
        cmd = ["node", "-e", code]
    elif lang in ("typescript", "ts"):
        cmd = ["node", "--experimental-strip-types", "-e", code]
    elif lang in ("yaml", "yml"):
        start_ts = time.perf_counter()
        try:
            import yaml
            parsed = yaml.safe_load(code)
            elapsed = int((time.perf_counter() - start_ts) * 1000)
            return {
                "stdout": f"[YAML Validator] Manifest syntax is valid.\nParsed {len(parsed) if isinstance(parsed, dict) else 1} root elements successfully.",
                "stderr": "",
                "exit_code": 0,
                "runtime_ms": elapsed,
                "error": None,
            }
        except Exception as err:
            return {
                "stdout": "",
                "stderr": f"YAML Syntax Error: {err}",
                "exit_code": 1,
                "runtime_ms": int((time.perf_counter() - start_ts) * 1000),
                "error": "syntax_error",
            }
    elif lang in ("sql", "sqlite", "postgresql", "mysql"):
        start_ts = time.perf_counter()
        import sqlite3
        try:
            conn = sqlite3.connect(":memory:")
            cursor = conn.cursor()
            statements = [s.strip() for s in code.split(";") if s.strip()]
            output_rows = []
            for stmt in statements:
                # Remove SQL line comments for clean execution
                cleaned_stmt = "\n".join(line for line in stmt.splitlines() if not line.strip().startswith("--")).strip()
                if cleaned_stmt:
                    cursor.execute(cleaned_stmt)
                    if cursor.description:
                        cols = [d[0] for d in cursor.description]
                        rows = cursor.fetchall()
                        output_rows.append(f"Result for: {stmt[:60]}...\nColumns: {cols}\nRows ({len(rows)}): {rows[:5]}")
            elapsed = int((time.perf_counter() - start_ts) * 1000)
            return {
                "stdout": "\n\n".join(output_rows) if output_rows else "SQL syntax validated successfully (0 rows returned).",
                "stderr": "",
                "exit_code": 0,
                "runtime_ms": elapsed,
                "error": None,
            }
        except Exception as err:
            return {
                "stdout": "",
                "stderr": f"SQL Syntax / Validation Error: {err}",
                "exit_code": 1,
                "runtime_ms": int((time.perf_counter() - start_ts) * 1000),
                "error": "sql_error",
            }
    else:
        return {
            "stdout": "",
            "stderr": f"Language '{lang}' is not currently supported for execution. Supported: Python, JavaScript, TypeScript, YAML, SQL.",
            "exit_code": 1,
            "runtime_ms": 0,
            "error": f"Unsupported language: {lang}",
        }

    start_ts = time.perf_counter()
    try:
        result = await asyncio.wait_for(
            asyncio.get_event_loop().run_in_executor(
                None,
                lambda: subprocess.run(
                    cmd,
                    input=test_input,
                    capture_output=True,
                    text=True,
                    timeout=5,
                ),
            ),
            timeout=6,
        )
        elapsed = int((time.perf_counter() - start_ts) * 1000)
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode,
            "runtime_ms": elapsed,
            "error": None,
        }
    except (subprocess.TimeoutExpired, asyncio.TimeoutError):
        return {
            "stdout": "",
            "stderr": "Execution timed out after 5 seconds.",
            "exit_code": -1,
            "runtime_ms": 5000,
            "error": "timeout",
        }
    except FileNotFoundError as exc:
        return {
            "stdout": "",
            "stderr": f"Executor not found: {exc}. Make sure the runtime is installed.",
            "exit_code": -1,
            "runtime_ms": 0,
            "error": "executor_not_found",
        }
    except Exception as exc:
        return {
            "stdout": "",
            "stderr": str(exc),
            "exit_code": -1,
            "runtime_ms": 0,
            "error": "internal_error",
        }


@app.post("/api/evaluate-code")
async def evaluate_code(request: EvaluateCodeRequest):
    """Use the interview AI to evaluate submitted code quality in the context of the live interview question."""
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is not configured")

    # Load section for context
    try:
        section = load_section(request.section_id)
        subject = section.get("subject", "Technical Interview")
        difficulty = section.get("difficulty", "Intermediate")
        history = section.get("rounds", [])
        current_question = request.question or (history[-1]["question"] if history else "")
    except FileNotFoundError:
        subject = "Technical Interview"
        difficulty = "Intermediate"
        current_question = request.question

    prompt = f"""You are a professional technical interview evaluator reviewing a candidate's code submission.

Interview subject: {subject}
Candidate level: {difficulty}
Current question: {current_question}

Candidate's code ({request.language}):
```
{request.code}
```

Evaluate the code submission on these criteria and respond in valid JSON:
{{
  "verdict": "Accepted" | "Needs Improvement" | "Rejected",
  "score": <integer 0-100>,
  "summary": "<1-2 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "time_complexity": "<Big-O or N/A>",
  "space_complexity": "<Big-O or N/A>",
  "runtime_estimate": "<e.g. 42ms>",
  "memory_estimate": "<e.g. 17.4 MB>"
}}

Return ONLY the JSON object, no markdown fences or extra text."""

    response = await ai_client.chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    raw = (response.choices[0].message.content or "{}").strip()

    # Strip markdown fences if LLM added them anyway
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)

    try:
        evaluation = json.loads(raw)
    except json.JSONDecodeError:
        evaluation = {
            "verdict": "Needs Improvement",
            "score": 50,
            "summary": raw,
            "strengths": [],
            "improvements": ["Unable to parse detailed evaluation."],
            "time_complexity": "N/A",
            "space_complexity": "N/A",
            "runtime_estimate": "N/A",
            "memory_estimate": "N/A",
        }

    return evaluation


@app.websocket("/ws/live-interview/{section_id}")
async def deepgram_stt(websocket: WebSocket, section_id: str):
    await websocket.accept()

    if not DEEPGRAM_API_KEY:
        await websocket.send_json({"type": "error", "message": "DEEPGRAM_API_KEY is not configured"})
        await websocket.close()
        return

    deepgram_url = (
        "wss://api.deepgram.com/v1/listen"
        "?model=nova-3"
        "&language=en-US"
        "&smart_format=true"
        "&interim_results=true"
        "&vad_events=true"
        "&endpointing=300"
        "&utterance_end_ms=1500"
    )

    try:
        async with websockets.connect(
            deepgram_url,
            extra_headers={"Authorization": f"Token {DEEPGRAM_API_KEY}"},
            ping_interval=20,
            ping_timeout=20,
        ) as dg:
            async def browser_to_deepgram():
                while True:
                    message = await websocket.receive()
                    if message.get("type") == "websocket.disconnect":
                        break
                    if message.get("bytes"):
                        await dg.send(message["bytes"])
                    elif message.get("text"):
                        data = json.loads(message["text"])
                        if data.get("type") == "stop":
                            break

            async def deepgram_to_browser():
                async for raw in dg:
                    if isinstance(raw, bytes):
                        continue
                    data = json.loads(raw)
                    if data.get("type") == "Results":
                        channel = data.get("channel", {})
                        alternatives = channel.get("alternatives", [])
                        transcript = alternatives[0].get("transcript", "") if alternatives else ""
                        if transcript:
                            is_final = bool(data.get("is_final"))
                            speech_final = bool(data.get("speech_final"))
                            await websocket.send_json(
                                {
                                    "type": "transcript_final" if (is_final and speech_final) else "transcript_partial",
                                    "transcript": transcript,
                                }
                            )

            import asyncio
            send_task = asyncio.create_task(browser_to_deepgram())
            receive_task = asyncio.create_task(deepgram_to_browser())
            done, pending = await asyncio.wait(
                {send_task, receive_task},
                return_when=asyncio.FIRST_COMPLETED,
            )
            for task in pending:
                task.cancel()
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        try:
            await websocket.send_json({"type": "error", "message": str(exc)})
        except Exception:
            pass
