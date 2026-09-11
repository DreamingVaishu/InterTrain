# 📖 InterTrain Technical Documentation

This document provides a comprehensive technical breakdown of the **InterTrain** platform, including system architecture, data models, AI/voice workflows, API specifications, and frontend design patterns.

---

## 1. System Architecture

InterTrain follows a decoupled, client-server architecture with an asynchronous, event-driven streaming audio pipeline:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          REACT 19 FRONTEND                             │
│                                                                        │
│  [Auth & Guest Mode]  ──>  [Dashboard & Tracks]  ──>  [Setup & Tests]  │
│                                                                        │
│                  ┌──────────────────────────────────┐                  │
│                  │        LIVE INTERVIEW ROOM       │                  │
│                  │  ┌──────────────┬──────────────┐ │                  │
│                  │  │  Conference  │   VS Code    │ │                  │
│                  │  │   2x2 Mode   │   IDE Mode   │ │                  │
│                  │  └──────────────┴──────────────┘ │                  │
│                  └──────────────────────────────────┘                  │
│                        │                      ▲                        │
└────────────────────────┼──────────────────────┼────────────────────────┘
                         │ PCM Audio Stream     │ Transcripts / Audio WAV
                         ▼                      │
┌────────────────────────────────────────────────────────────────────────┐
│                          FASTAPI BACKEND                               │
│                                                                        │
│  • WebSocket Audio Relay (/ws/live-interview/{id})                     │
│  • REST API Controllers (/api/live-interview/*)                        │
│  • Session State Engine (/sections/section_{id}.json)                  │
│  • Local Audio Cache (/audio/{id}_{round}.wav)                         │
└────────────┬──────────────────────────────────────────────┬────────────┘
             │                                              │
             ▼                                              ▼
┌───────────────────────────┐                  ┌─────────────────────────┐
│     DEEPGRAM CLOUD        │                  │     OPENROUTER CLOUD    │
│                           │                  │                         │
│ • Nova-3 Speech-to-Text   │                  │ • Adaptive LLM Engine   │
│   (Streaming WebSocket)   │                  │   (gpt-oss-120b / user) │
│ • Aura-2 Text-to-Speech   │                  │ • 5-Round Progressive   │
│   (Conversational Voice)  │                  │   Contextual Interviews │
└───────────────────────────┘                  └─────────────────────────┘
```

---

## 2. Core Workflows & Functional Concepts

### 2.1 Authentication & Profile State
- Supports full signup/signin with email and password.
- Provides a frictionless **Guest / Developer Mode** that immediately populates a test profile (`Guest (Developer)`) with pre-seeded assessment folders to accelerate local testing.
- State is synchronized with `localStorage` (`intertrain_user`).

### 2.2 Practice Tracks & Topic Exploration
Candidates select specialized domains:
1. **DevOps**: Kubernetes, Docker, CI/CD pipelines, Infrastructure as Code, and observability.
2. **Data Manager**: SQL optimization, database sharding, caching strategies, and ETL flows.
3. **Backend Engineering**: Concurrency, distributed systems, REST/gRPC API design, microservices.
4. **UI/UX & Frontend**: Modern JavaScript, React patterns, performance optimization, CSS layouts.

### 2.3 Pre-Interview Hardware & Readiness Check (`InterviewSetupView`)
Before entering high-pressure interviews, candidates pass through a diagnostics screen:
- **Webcam preview**: Live hardware feed with toggle control.
- **Microphone test**: Real-time Web Audio API `AnalyserNode` rendering an interactive volume meter to confirm input levels.
- **Difficulty calibration**: Choice of **Junior**, **Intermediate**, or **Senior**.
- **19-Digit Section Generation**: Generates a persistent, URL-safe section ID (e.g., `2567837851963606030`) and synchronizes the browser address to `/projects/:sessionId`.

### 2.4 The Live Practice Room (`LivePracticeView`)
The live interview room supports two complementary viewing experiences:

#### Mode A: Multi-Agent 2x2 Conference Room
- Four live participant boxes:
  1. **AI Moderator**: Introduces questions, regulates time, and manages round transitions.
  2. **AI Technical Interviewer**: Digs deep into algorithms, architecture, and code correctness.
  3. **AI Observer / Behavioral Analyst**: Measures communication poise, clarity, and STAR-method adherence.
  4. **Candidate Webcam**: Live candidate stream with camera and microphone controls.
- Displays question prompt overlays and real-time transcription status.
- Bottom toolbar contains the **"Open VS Code Editor"** trigger button.

#### Mode B: Integrated VS Code Workspace
- **AI Services Panel (Left)**: Real-time cards for Moderator, Technical Interviewer, and Observer with active status indicators.
- **Code Editor & Prompt (Center)**: Monaco-style code workspace with syntax highlighting, language selector, and execution sandbox.
- **Webcam & Output Console (Bottom-Right)**: The candidate's camera feed sits directly beside the interactive execution terminal, enabling coding while keeping eye contact.
- Seamless toggle button (**"Conference View"**) to return to 2x2 mode at any time.

### 2.5 5-Round Progressive Evaluation
1. **Round 1 (Introduction & Baseline)**: Conceptual or background inquiry based on the track and difficulty.
2. **Rounds 2 to 4 (Adaptive Probing)**: The LLM analyzes previous questions and candidate answers, identifying weak areas or diving deeper into edge cases.
3. **Round 5 (Final Challenge & Wrap-Up)**: Climax architectural scenario or algorithmic optimization.

### 2.6 Post-Interview Attempt Review & Analytics
- Calculates scoring metrics:
  - **Overall Score** (0-100%)
  - **Technical Accuracy** (0-100%)
  - **Confidence Rating** (0-100%)
  - **Conciseness** (0-100%)
- Question-by-question breakdown featuring full question text, candidate's transcribed answer, and AI feedback.
- Actionable tips and STAR-framework suggestions.
- Results saved to historical folders for longitudinal tracking over multiple attempts.

---

## 3. Voice & AI Streaming Pipeline

### 3.1 Deepgram Speech-to-Text (STT)
The platform streams raw candidate audio through a WebSocket relay in FastAPI:
- **Audio Capture**: Browser records audio at 16kHz PCM / WebM Opus via `navigator.mediaDevices.getUserMedia`.
- **WebSocket Route**: `ws://localhost:8000/ws/live-interview/{section_id}`
- **Upstream Connection**: FastAPI maintains a persistent connection to `wss://api.deepgram.com/v1/listen` configured with:
  - `model=nova-3`
  - `smart_format=true`
  - `interim_results=true`
  - `vad_events=true`
  - `endpointing=300`
  - `utterance_end_ms=1500`
- **Output to Client**:
  - `transcript_partial`: Real-time words as the user speaks.
  - `transcript_final`: High-confidence segment emitted when speech pauses.

### 3.2 Deepgram Text-to-Speech (TTS)
When an AI interviewer generates a question:
- Request is dispatched to `https://api.deepgram.com/v1/speak?model=aura-2-thalia-en&encoding=linear16&container=wav`.
- The synthesized audio is cached on disk under `Backend/audio/{section_id}_{round}.wav`.
- Delivered to the frontend through `GET /api/live-interview/audio/{filename}` for automatic playback with custom visual audio waves.

### 3.3 OpenRouter LLM Engine
- Integrates through the `AsyncOpenAI` client pointing to `https://openrouter.ai/api/v1`.
- Default model: `openai/gpt-oss-120b` (configurable via `OPENROUTER_MODEL`).
- Strict JSON/Text instructions guarantee clean, single-question responses tailored to the candidate's level without preamble.

---

## 4. API Specification

### Base URL: `http://localhost:8000`

### 4.1 Health Check
```http
GET /health
```
**Response (200 OK):**
```json
{
  "status": "ok"
}
```

### 4.2 Start Interview Session
```http
POST /api/live-interview/start
Content-Type: application/json
```
**Request Body:**
```json
{
  "section_id": "2567837851963606030",
  "subject": "Backend Development",
  "difficulty": "Intermediate"
}
```
**Response (200 OK):**
```json
{
  "section_id": "2567837851963606030",
  "round": 1,
  "total_rounds": 5,
  "question": "Can you explain how connection pooling works in a high-traffic microservices backend?",
  "audio_url": "/api/live-interview/audio/2567837851963606030_1.wav",
  "completed": false
}
```

### 4.3 Submit Answer & Fetch Next Question
```http
POST /api/live-interview/answer
Content-Type: application/json
```
**Request Body:**
```json
{
  "section_id": "2567837851963606030",
  "answer": "Connection pooling maintains a cache of active database connections to avoid TCP handshake overhead on every request."
}
```
**Response (200 OK):**
```json
{
  "section_id": "2567837851963606030",
  "round": 2,
  "total_rounds": 5,
  "question": "How would you handle pool exhaustion when incoming queries spike?",
  "audio_url": "/api/live-interview/audio/2567837851963606030_2.wav",
  "completed": false
}
```

### 4.4 Retrieve Section State
```http
GET /api/live-interview/{section_id}
```
**Response (200 OK):**
```json
{
  "section_id": "2567837851963606030",
  "subject": "Backend Development",
  "difficulty": "Intermediate",
  "status": "in_progress",
  "total_rounds": 5,
  "current_round": 2,
  "started_at": "2026-09-11T12:00:00Z",
  "completed_at": null,
  "rounds": [
    {
      "round": 1,
      "question": "...",
      "answer": "...",
      "question_generated_at": "2026-09-11T12:00:01Z",
      "answer_received_at": "2026-09-11T12:01:30Z"
    }
  ]
}
```

### 4.5 Fetch Audio File
```http
GET /api/live-interview/audio/{filename}
```
**Response (200 OK):**
Returns `audio/wav` binary stream.

### 4.6 WebSocket Speech-to-Text Relay
```http
WS /ws/live-interview/{section_id}
```
- **Client to Server**: Binary audio chunks (PCM / WebM) or JSON `{"type": "stop"}`.
- **Server to Client**:
  ```json
  {
    "type": "transcript_partial",
    "transcript": "I would configure the max..."
  }
  ```
  ```json
  {
    "type": "transcript_final",
    "transcript": "I would configure the max pool size and a timeout policy."
  }
  ```

---

## 5. Frontend Structure & Routing

```
Frontend/src/
├── assets/                  # Brand assets, logos, static illustrations
├── components/              # Reusable modular UI widgets
│   ├── Sidebar.tsx          # Rail navigation with flyout sub-menus & InterTrain logo
│   ├── RobotAssistant.tsx   # SVG animated robot mascot (waving, thinking, talking)
│   ├── FolderCard.tsx       # Assessment history track cards
│   ├── SettingsModal.tsx    # Preferences & data reset modal
│   └── UserAvatar.tsx       # Profile badge component
├── views/                   # Full-page application screens
│   ├── HomeView.tsx         # User dashboard, quick stats, scheduled rounds
│   ├── PracticesView.tsx    # Track browser (DevOps, Data, Backend, UI/UX)
│   ├── InterviewSetupView.tsx # Hardware test (mic level meter, camera feed)
│   ├── LivePracticeView.tsx # Live interview room (Conference & VS Code modes)
│   ├── AttemptReviewView.tsx# Post-session scorecard & metrics review
│   ├── HistoryView.tsx      # All past attempts categorized by domain
│   ├── AnalyticsView.tsx    # Performance progression & charts
│   ├── BestPracticesView.tsx# Behavioral framework guides (STAR method)
│   └── auth/LoginPage.tsx   # Login, registration, and guest mode bypass
├── data/                    # Seed mock data for tracks and initial folders
├── types.ts                 # TypeScript interfaces and domain types
└── utils/session.ts         # 19-digit session generator & URL routing helpers
```

---

## 6. Security & Storage Guidelines

1. **API Keys**: Stored exclusively in server-side `.env` files. The frontend communicates with OpenRouter and Deepgram solely via backend proxies.
2. **CORS Security**: Backend configures `CORSMiddleware` restricted to the frontend origins (`http://localhost:3000` and `http://127.0.0.1:3000`).
3. **Data Privacy**: No audio or camera recordings leave the local system without candidate interaction; session JSON files and audio WAV files are stored in `Backend/sections/` and `Backend/audio/`.
