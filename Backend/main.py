import json
import os
import re
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
