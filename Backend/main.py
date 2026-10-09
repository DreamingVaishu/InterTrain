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
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
SECTIONS_DIR = BASE_DIR / "sections"
AUDIO_DIR = BASE_DIR / "audio"
SECTIONS_DIR.mkdir(exist_ok=True)
AUDIO_DIR.mkdir(exist_ok=True)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-120b")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
WANDBOX_URL = os.getenv("WANDBOX_URL", "https://wandbox.org/api").rstrip("/")
WANDBOX_COMPILER_CACHE: dict[str, tuple[float, list[dict[str, Any]]]] = {}

app = FastAPI(title="InterTrain Live Interview API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StartInterviewRequest(BaseModel):
    section_id: str = Field(min_length=1)
    subject: str = Field(min_length=1, max_length=200)
    difficulty: str = "Intermediate"


class AnswerRequest(BaseModel):
    section_id: str = Field(min_length=1)
    answer: str = Field(min_length=1, max_length=20000)


class CompleteInterviewRequest(BaseModel):
    section_id: str = Field(min_length=1)


class SummaryRequest(BaseModel):
    subject: str = Field(default="Technical interview", max_length=200)
    questions: list[dict[str, Any]] = Field(default_factory=list)
    code: str = Field(default="", max_length=50000)
    language: str = ""
    code_problem: dict[str, Any] | None = None
    code_review: dict[str, Any] | None = None


class CodeSubmitRequest(BaseModel):
    section_id: str = Field(min_length=1)
    code: str = Field(min_length=1, max_length=50000)
    language: str = "python"


class RunCodeRequest(BaseModel):
    code: str = Field(min_length=1, max_length=50000)
    language: str = "python"
    test_input: str = ""


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def section_path(section_id: str) -> Path:
    safe_id = re.sub(r"[^a-zA-Z0-9_-]", "", section_id)
    return SECTIONS_DIR / f"section_{safe_id}.json"


def load_section(section_id: str) -> dict[str, Any]:
    path = section_path(section_id)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Interview section was not found")
    return json.loads(path.read_text(encoding="utf-8"))


def save_section(section: dict[str, Any]) -> None:
    section_path(section["section_id"]).write_text(
        json.dumps(section, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def clean_json(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


async def ask_ai(prompt: str, temperature: float = 0.4) -> str:
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY is not configured")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "model": OPENROUTER_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=body,
        )

    if response.is_error:
        raise HTTPException(status_code=502, detail=f"OpenRouter error: {response.text[:500]}")

    data = response.json()
    text = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
    if not text:
        raise HTTPException(status_code=502, detail="OpenRouter returned an empty response")
    return text


def interview_history(section: dict[str, Any]) -> str:
    return "\n\n".join(
        f"Round {item['round']}\nQuestion: {item['question']}\nCandidate answer: {item.get('answer', '')}"
        for item in section["rounds"]
        if item.get("answer")
    )


async def generate_normal_question(section: dict[str, Any]) -> str:
    round_number = section["current_round"]
    latest = section["rounds"][-1] if section["rounds"] else None

    if round_number == 1:
        prompt = f"""
You are a professional technical interviewer.

Subject: {section['subject']}
Candidate level: {section['difficulty']}

Start the interview with one short introduction question. Ask the candidate to
introduce themselves and explain their experience, projects, or background related
to the selected subject.

Return only the question.
"""
    else:
        prompt = f"""
You are a professional technical interviewer.

Subject: {section['subject']}
Candidate level: {section['difficulty']}
Current round: {round_number} of 5

Generate the next spoken interview question.

Previous question:
{latest['question'] if latest else ''}

Previous answer:
{latest.get('answer', '') if latest else ''}

Earlier interview history:
{interview_history(section)}

Rules:
- Ask exactly one question.
- Build directly from the previous answer.
- Keep it related to the selected subject.
- Do not repeat an earlier question.
- Increase or decrease difficulty naturally based on the answer.
- Do not create a coding question until round 5.
- Return only the question.
"""

    return await ask_ai(prompt)


async def generate_coding_problem(section: dict[str, Any]) -> dict[str, Any]:
    prompt = f"""
You are creating the final practical coding question for a technical interview.

Subject: {section['subject']}
Candidate level: {section['difficulty']}

Interview history:
{interview_history(section)}

Create ONE practical coding problem that is relevant to the subject and suitable
for the candidate level. It should be solvable in about 15-20 minutes.

Return ONLY valid JSON in this exact shape:
{{
  "question": "problem statement",
  "language": "python",
  "starter_code": "starter code",
  "test_cases": [
    {{"input": "...", "expected_output": "..."}},
    {{"input": "...", "expected_output": "..."}},
    {{"input": "...", "expected_output": "..."}}
  ]
}}

Use Python unless another language is clearly more appropriate. The starter code
must read from standard input and print the answer so Wandbox can execute it.
Test cases must be deterministic and the expected output must exactly match stdout
after normal whitespace trimming.
"""

    raw = clean_json(await ask_ai(prompt, temperature=0.2))
    try:
        problem = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned an invalid coding problem")

    required = ["question", "language", "starter_code", "test_cases"]
    if not all(key in problem for key in required) or not problem["test_cases"]:
        raise HTTPException(status_code=502, detail="AI returned an incomplete coding problem")
    return problem


async def make_tts(text: str, section_id: str, round_number: int) -> str:
    if not DEEPGRAM_API_KEY:
        raise HTTPException(status_code=500, detail="DEEPGRAM_API_KEY is not configured")

    url = "https://api.deepgram.com/v1/speak?model=aura-2-thalia-en&encoding=linear16&container=wav"
    headers = {"Authorization": f"Token {DEEPGRAM_API_KEY}", "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, headers=headers, json={"text": text})
        response.raise_for_status()

    filename = f"{section_id}_{round_number}.wav"
    (AUDIO_DIR / filename).write_bytes(response.content)
    return f"/api/live-interview/audio/{filename}"


# Wandbox compiler selection.
WANDBOX_LANGUAGES = {
    "python": "Python",
    "py": "Python",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "java": "Java",
    "cpp": "C++",
    "c++": "C++",
    "c": "C",
}


async def get_wandbox_compilers() -> list[dict[str, Any]]:
    cached = WANDBOX_COMPILER_CACHE.get("list")
    if cached and time.time() - cached[0] < 600:
        return cached[1]

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(f"{WANDBOX_URL}/list.json")

    if response.is_error:
        raise HTTPException(status_code=502, detail=f"Wandbox compiler list error: {response.text[:500]}")

    compilers = response.json()
    WANDBOX_COMPILER_CACHE["list"] = (time.time(), compilers)
    return compilers


def compiler_score(compiler: dict[str, Any], language: str) -> int:
    name = compiler.get("name", "").lower()
    version = compiler.get("version", "").lower()
    score = 0

    # Prefer stable-looking, modern compilers over HEAD/nightly builds.
    if "head" not in name and "head" not in version:
        score += 20
    if "stable" in name or "stable" in version:
        score += 10

    preferred = {
        "Python": ["cpython-3", "cpython"],
        "JavaScript": ["nodejs-", "nodejs"],
        "TypeScript": ["typescript-", "typescript"],
        "Java": ["openjdk", "jdk"],
        "C++": ["gcc-", "clang++", "gcc"],
        "C": ["gcc-", "clang", "gcc"],
    }
    for index, word in enumerate(preferred.get(language, [])):
        if word in name:
            score += 50 - index * 5

    return score


async def get_wandbox_compiler(language: str) -> str:
    wandbox_language = WANDBOX_LANGUAGES.get(language.lower())
    if not wandbox_language:
        raise HTTPException(status_code=400, detail=f"Wandbox does not support language '{language}'")

    compilers = await get_wandbox_compilers()
    matches = [item for item in compilers if item.get("language") == wandbox_language]
    if not matches:
        raise HTTPException(status_code=400, detail=f"Wandbox has no compiler for '{language}'")

    matches.sort(key=lambda item: compiler_score(item, wandbox_language), reverse=True)
    return matches[0]["name"]


async def run_wandbox(code: str, language: str, test_input: str) -> dict[str, Any]:
    compiler = await get_wandbox_compiler(language)
    payload = {
        "compiler": compiler,
        "code": code,
        "stdin": test_input,
    }

    started = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{WANDBOX_URL}/compile.json",
                json=payload,
                headers={"Content-Type": "application/json"},
            )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Could not contact Wandbox: {exc}")

    if response.is_error:
        raise HTTPException(status_code=502, detail=f"Wandbox execution error: {response.text[:500]}")

    result = response.json()
    runtime_ms = int((time.perf_counter() - started) * 1000)
    status = str(result.get("status", ""))
    try:
        exit_code = int(status)
    except (TypeError, ValueError):
        exit_code = None

    compiler_output = result.get("compiler_error") or ""
    program_output = result.get("program_output") or result.get("program_message") or ""
    program_error = result.get("program_error") or ""
    compiler_warning = result.get("compiler_message") or ""
    if compiler_warning:
        program_error = (program_error + "\n" + compiler_warning).strip()
    signal = result.get("signal") or ""

    if compiler_output:
        final_status = "Compilation Error"
    elif signal:
        final_status = f"Runtime Error ({signal})"
    elif exit_code == 0:
        final_status = "Accepted"
    else:
        final_status = "Runtime Error"

    return {
        "status": final_status,
        "stdout": program_output,
        "stderr": program_error,
        "compile_output": compiler_output,
        "time": runtime_ms / 1000,
        "memory": None,
        "exit_code": exit_code,
        "compiler": compiler,
        "signal": signal,
    }


async def review_code(section: dict[str, Any], code: str, language: str, results: list[dict[str, Any]]) -> dict[str, Any]:
    problem = section.get("coding_problem", {})
    prompt = f"""
You are the code reviewer for a technical interview.

Subject: {section['subject']}
Problem:
{problem.get('question', '')}

Candidate language: {language}
Candidate code:
```text
{code}
```

Wandbox execution results:
{json.dumps(results, indent=2)}

Review both the actual execution results and the code itself.
Return ONLY valid JSON:
{{
  "verdict": "Accepted",
  "score": 0,
  "summary": "short review",
  "strengths": ["..."],
  "improvements": ["..."],
  "time_complexity": "O(?)",
  "space_complexity": "O(?)",
  "tests_passed": 0,
  "tests_total": 0
}}

Do not claim tests passed unless the Wandbox output matches the expected output.
Score correctness, code quality, and complexity from 0 to 100.
"""

    raw = clean_json(await ask_ai(prompt, temperature=0.2))
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned an invalid code review")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/live-interview/start")
async def start_interview(request: StartInterviewRequest):
    if section_path(request.section_id).exists():
        raise HTTPException(status_code=409, detail="This section ID already exists")

    section = {
        "section_id": request.section_id,
        "subject": request.subject,
        "difficulty": request.difficulty,
        "status": "in_progress",
        "total_rounds": 5,
        "current_round": 1,
        "started_at": now(),
        "completed_at": None,
        "final_result": None,
        "coding_problem": None,
        "code_submission": None,
        "code_execution": None,
        "code_review": None,
        "rounds": [],
    }

    question = await generate_normal_question(section)
    audio_url = await make_tts(question, request.section_id, 1)
    section["rounds"].append({
        "round": 1,
        "question": question,
        "answer": "",
        "question_generated_at": now(),
        "answer_received_at": None,
        "type": "interview",
    })
    save_section(section)

    return {
        "section_id": request.section_id,
        "round": 1,
        "total_rounds": 5,
        "question": question,
        "audio_url": audio_url,
        "round_type": "interview",
        "completed": False,
    }


@app.post("/api/live-interview/answer")
async def submit_answer(request: AnswerRequest):
    section = load_section(request.section_id)
    current = section["rounds"][-1]
    current["answer"] = request.answer.strip()
    current["answer_received_at"] = now()

    # Round 5 is the coding round. Spoken answers stop at round 4.
    if section["current_round"] >= 5:
        save_section(section)
        return {
            "section_id": request.section_id,
            "round": 5,
            "total_rounds": 5,
            "round_type": "coding",
            "completed": False,
        }

    section["current_round"] += 1

    if section["current_round"] == 5:
        problem = await generate_coding_problem(section)
        section["coding_problem"] = problem
        section["rounds"].append({
            "round": 5,
            "question": problem["question"],
            "answer": "",
            "question_generated_at": now(),
            "answer_received_at": None,
            "type": "coding",
        })
        save_section(section)
        return {
            "section_id": request.section_id,
            "round": 5,
            "total_rounds": 5,
            "question": problem["question"],
            "audio_url": "",
            "round_type": "coding",
            "coding_problem": problem,
            "completed": False,
        }

    question = await generate_normal_question(section)
    audio_url = await make_tts(question, request.section_id, section["current_round"])
    section["rounds"].append({
        "round": section["current_round"],
        "question": question,
        "answer": "",
        "question_generated_at": now(),
        "answer_received_at": None,
        "type": "interview",
    })
    save_section(section)

    return {
        "section_id": request.section_id,
        "round": section["current_round"],
        "total_rounds": 5,
        "question": question,
        "audio_url": audio_url,
        "round_type": "interview",
        "completed": False,
    }


@app.post("/api/live-interview/submit-code")
async def submit_code(request: CodeSubmitRequest):
    section = load_section(request.section_id)
    problem = section.get("coding_problem")
    if not problem:
        raise HTTPException(status_code=400, detail="No coding problem has been generated")

    tests = problem.get("test_cases", [])
    results = []
    for test in tests:
        result = await run_wandbox(request.code, request.language, test.get("input", ""))
        expected = str(test.get("expected_output", "")).strip()
        actual = str(result.get("stdout", "")).strip()
        result["input"] = test.get("input", "")
        result["expected_output"] = expected
        result["passed"] = result.get("status") == "Accepted" and actual == expected
        results.append(result)

    review = await review_code(section, request.code, request.language, results)

    section["code_submission"] = {"language": request.language, "code": request.code}
    section["code_execution"] = results
    section["code_review"] = review
    section["rounds"][-1]["answer"] = request.code
    section["rounds"][-1]["answer_received_at"] = now()
    save_section(section)

    return {
        "problem": problem,
        "results": results,
        "review": review,
    }


@app.post("/api/live-interview/complete")
async def complete_interview(request: CompleteInterviewRequest):
    section = load_section(request.section_id)
    history = interview_history(section)
    if not history:
        raise HTTPException(status_code=400, detail="There are no interview answers to evaluate")

    prompt = f"""
You are the final evaluator for a technical interview.

Subject: {section['subject']}
Candidate level: {section['difficulty']}

Evaluate the WHOLE interview below.

{history}

Coding problem:
{json.dumps(section.get('coding_problem'), indent=2)}

Code review:
{json.dumps(section.get('code_review'), indent=2)}

Return ONLY valid JSON:
{{
  "overall_score": 0,
  "technical_accuracy": 0,
  "communication": 0,
  "conciseness": 0,
  "summary": "short overall interview summary",
  "strengths": ["..."],
  "improvements": ["..."]
}}

Scores must be integers from 0 to 100. Base the result on the candidate's real
spoken answers and the actual code review. Do not invent evidence.
"""

    raw = clean_json(await ask_ai(prompt, temperature=0.2))
    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned an invalid final evaluation")

    section["status"] = "completed"
    section["completed_at"] = now()
    section["final_result"] = result
    save_section(section)

    return {
        **result,
        "coding_problem": section.get("coding_problem"),
        "code_submission": section.get("code_submission"),
        "code_execution": section.get("code_execution"),
        "code_review": section.get("code_review"),
    }


@app.post("/api/summarize-history")
async def summarize_history(request: SummaryRequest):
    """Generate a helpful summary for older saved attempts that have no summary."""
    conversation = []
    for index, item in enumerate(request.questions, start=1):
        question = str(item.get("question", "")).strip()
        answer = str(item.get("response", item.get("answer", ""))).strip()
        if question or answer:
            conversation.append(f"Round {index}\nQuestion: {question}\nCandidate answer: {answer}")

    prompt = f"""
You are a supportive, honest interview coach. Write a useful summary for the candidate,
not a generic compliment. Use the entire conversation and the code review if supplied.
Explain what the candidate demonstrated, what was strong, and what to improve next.
Keep it around 120-180 words, clear and encouraging, and do not invent details.

Subject: {request.subject}
Conversation:
{chr(10).join(conversation) or 'No interview answers were saved.'}

Coding problem:
{json.dumps(request.code_problem, ensure_ascii=False)}

Candidate code ({request.language}):
{request.code[:12000] or 'No code submission was saved.'}

Code review and execution results:
{json.dumps(request.code_review, ensure_ascii=False)}

Write one coherent summary that discusses spoken answers and coding performance separately
when coding information exists, then give the most useful next step. Do not return JSON.
"""
    summary = (await ask_ai(prompt, temperature=0.3)).strip()
    return {"summary": summary}


@app.get("/api/live-interview/{section_id}")
async def get_section(section_id: str):
    return load_section(section_id)


@app.get("/api/live-interview/audio/{filename}")
async def get_audio(filename: str):
    safe_name = Path(filename).name
    path = AUDIO_DIR / safe_name
    if not path.exists():
        raise HTTPException(status_code=404, detail="Audio file was not found")

    from fastapi.responses import FileResponse
    return FileResponse(path, media_type="audio/wav", filename=safe_name)


@app.post("/api/run-code")
async def run_code(request: RunCodeRequest):
    # Kept for the editor's Run Code button. Interview submissions use Wandbox.
    result = await run_wandbox(request.code, request.language, request.test_input)
    return {
        "stdout": result.get("stdout", ""),
        "stderr": result.get("stderr", "") or result.get("compile_output", ""),
        "exit_code": result.get("exit_code"),
        "runtime_ms": int(float(result.get("time") or 0) * 1000),
        "error": None if result.get("status") == "Accepted" else result.get("status"),
    }


@app.websocket("/ws/live-interview/{section_id}")
async def speech_to_text(websocket: WebSocket, section_id: str):
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
        "&punctuate=true"
        "&interim_results=true"
        "&vad_events=true"
        "&endpointing=1500"
        "&utterance_end_ms=3000"
    )

    try:
        async with websockets.connect(
            deepgram_url,
            additional_headers={"Authorization": f"Token {DEEPGRAM_API_KEY}"},
            ping_interval=20,
            ping_timeout=20,
        ) as deepgram:

            async def send_audio():
                try:
                    while True:
                        message = await websocket.receive()
                        if message.get("type") == "websocket.disconnect":
                            break
                        if message.get("bytes"):
                            await deepgram.send(message["bytes"])
                        elif message.get("text"):
                            data = json.loads(message["text"])
                            if data.get("type") == "stop":
                                await deepgram.send(json.dumps({"type": "CloseStream"}))
                                break
                except WebSocketDisconnect:
                    pass

            async def send_transcripts():
                try:
                    async for raw in deepgram:
                        if isinstance(raw, bytes):
                            continue
                        data = json.loads(raw)
                        if data.get("type") != "Results":
                            continue

                        alternatives = data.get("channel", {}).get("alternatives", [])
                        text = alternatives[0].get("transcript", "").strip() if alternatives else ""
                        if not text:
                            continue

                        await websocket.send_json({
                            "type": "transcript",
                            "transcript": text,
                            "is_final": bool(data.get("is_final")),
                            "speech_final": bool(data.get("speech_final")),
                        })
                except Exception:
                    pass

            await asyncio.gather(send_audio(), send_transcripts())
    except Exception as exc:
        try:
            await websocket.send_json({"type": "error", "message": f"Speech service error: {exc}"})
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
