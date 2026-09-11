# ⚙️ InterTrain - Backend API & Streaming Services

The asynchronous backend service for **InterTrain**, built with **Python 3.10+**, **FastAPI**, and **Uvicorn**. It orchestrates real-time bidirectional speech streaming via **Deepgram**, contextual multi-round interview questioning via **OpenRouter**, session persistence, and synthesized audio caching.

---

## 🚀 Key Capabilities

- **🎙️ Real-Time Speech-to-Text (STT)**: Relays live microphone PCM audio chunks over WebSockets to Deepgram Nova-3, delivering low-latency interim and final transcripts directly to the candidate UI.
- **🔊 Conversational Text-to-Speech (TTS)**: Synthesizes realistic vocal questions using Deepgram Aura-2 (`aura-2-thalia-en`) and caches the resulting WAV audio on disk.
- **🤖 Context-Aware Interview LLM**: Drives an adaptive 5-round technical interview using OpenRouter (`openai/gpt-oss-120b` or custom models), dynamically pivoting questions based on candidate answers and difficulty.
- **💾 Session Persistence**: Stores complete section transcripts, timestamps, and question rounds in JSON-backed storage (`sections/section_{id}.json`).

---

## 📁 Directory Structure

```
Backend/
├── audio/                   # Generated WAV voice files for interview questions
├── sections/                # JSON session logs for each interview attempt
├── main.py                  # FastAPI application, WebSocket relay, and REST endpoints
├── requirements.txt         # Python package dependencies
├── .env.example             # Example environment variables template
└── .env                     # Local active environment variables (excluded from git)
```

---

## 🛠️ Getting Started

### Prerequisites
- **Python**: `3.10` or higher
- **pip**: Python package manager
- **API Keys**:
  - [OpenRouter API Key](https://openrouter.ai/)
  - [Deepgram API Key](https://console.deepgram.com/)

### Installation Steps

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env`:
   - **Windows**:
     ```powershell
     Copy-Item .env.example .env
     ```
   - **macOS / Linux**:
     ```bash
     cp .env.example .env
     ```

   Edit `.env` and fill in your credentials:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key-here
   OPENROUTER_MODEL=openai/gpt-oss-120b
   DEEPGRAM_API_KEY=your-deepgram-api-key-here
   ```

5. Run the server:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

6. Verify the server is running:
   - Access `http://127.0.0.1:8000/health` in your browser.
   - Expected response: `{"status": "ok"}`
   - Interactive OpenAPI documentation: `http://127.0.0.1:8000/docs`

---

## 📡 API Endpoints

### 1. REST Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check endpoint. |
| `POST` | `/api/live-interview/start` | Initializes a new interview section, generates Round 1 question via LLM, and synthesizes audio. |
| `POST` | `/api/live-interview/answer` | Submits candidate answer for current round, updates section history, and generates next question. |
| `GET` | `/api/live-interview/{section_id}` | Retrieves current session status, question history, and round progress. |
| `GET` | `/api/live-interview/audio/{filename}` | Serves cached WAV audio for question voice playback. |

### 2. WebSocket Endpoint

```
WS /ws/live-interview/{section_id}
```
- **Description**: Two-way streaming proxy connecting the browser microphone to Deepgram Nova-3.
- **Client Sending**: Raw PCM audio binary chunks or `{"type": "stop"}`.
- **Server Emitting**:
  - `{"type": "transcript_partial", "transcript": "..."}`: Interim live speech recognition.
  - `{"type": "transcript_final", "transcript": "..."}`: Endpointed final speech phrase.

---

## 🔒 CORS Configuration

CORS middleware is enabled in `main.py` allowing origins:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

If your frontend is hosted on a different domain or port, update the `allow_origins` array in `main.py`.
