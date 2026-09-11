# 🛠️ InterTrain Setup & Execution Instructions

This guide provides a comprehensive, step-by-step walkthrough for setting up, configuring, and running the **InterTrain** platform on Windows, macOS, or Linux.

---

## 1. Prerequisites

Before getting started, make sure your machine has the following tools installed:

| Tool | Recommended Version | Download Link |
| :--- | :--- | :--- |
| **Node.js & npm** | `v18.x` or `v20.x`+ (LTS) | [nodejs.org](https://nodejs.org/) |
| **Python** | `3.10` or higher | [python.org](https://www.python.org/downloads/) |
| **Git** | `2.x`+ | [git-scm.com](https://git-scm.com/) |
| **Modern Browser** | Chrome, Edge, Brave, or Firefox | WebRTC & MediaStream audio support required |

---

## 2. API Keys Acquisition

InterTrain utilizes two external cloud services for its conversational AI and voice capabilities:

### 2.1 OpenRouter API Key *(for LLM Question & Feedback Generation)*
1. Visit [openrouter.ai](https://openrouter.ai/).
2. Sign in with GitHub or Google.
3. Navigate to **Keys** and click **Create Key**.
4. Copy the generated key (`sk-or-v1-...`).

### 2.2 Deepgram API Key *(for Real-Time Speech-to-Text & Text-to-Speech)*
1. Visit [console.deepgram.com](https://console.deepgram.com/).
2. Sign in or create a free tier account (includes $200 free credit).
3. Navigate to **API Keys** and click **Create a New API Key**.
4. Grant standard permissions and copy the token.

---

## 3. Step-by-Step Installation

### Step 1: Clone the Repository
Open your terminal (PowerShell, Command Prompt, or Bash) and clone the repository:

```bash
git clone https://github.com/DreamingVaishu/InterTrain.git
cd InterTrain
```

---

### Step 2: Backend Setup (Python & FastAPI)

1. **Navigate to the Backend folder**:
   ```bash
   cd Backend
   ```

2. **Create a Python virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
     *(Note: If PowerShell displays a script execution policy error, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` then try activating again).*
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to create your active `.env` file:
   - **Windows**:
     ```powershell
     Copy-Item .env.example .env
     ```
   - **macOS / Linux**:
     ```bash
     cp .env.example .env
     ```

   Open `.env` in any text editor and fill in your API keys:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
   OPENROUTER_MODEL=openai/gpt-oss-120b
   DEEPGRAM_API_KEY=your-actual-deepgram-key-here
   ```

5. **Start the Backend Server**:
   ```bash
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   You should see:
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
   INFO:     Application startup complete.
   ```
   Verify by visiting `http://127.0.0.1:8000/health` in your browser. It should return `{"status": "ok"}`.

---

### Step 3: Frontend Setup (React, Vite & TypeScript)

1. **Open a new terminal window** and navigate to the `Frontend` folder:
   ```bash
   cd InterTrain/Frontend
   ```

2. **Install Node.js packages**:
   ```bash
   npm install
   ```

3. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   The terminal will output:
   ```
   VITE v6.4.3  ready in ~300 ms

   ➜  Local:   http://localhost:3000/
   ➜  Network: use --host to expose
   ```

---

## 4. How to Use the Platform

### 1. Launch & Sign In
- Open your browser and navigate to **`http://localhost:3000`**.
- Click **"Continue as Guest / Demo Mode"** to enter immediately, or create a new account using the Sign Up form.

### 2. Explore Practice Tracks
- On the **Dashboard / Home**, click **"Practice"** on the sidebar to view specialized tracks:
  - **DevOps**
  - **Data Manager**
  - **Backend**
  - **UI/UX**
- Click the arrow button on any track to start a dedicated session.

### 3. Complete the Pre-Interview Hardware Check
- The **Interview Setup View** will launch:
  - Select your desired difficulty level (**Junior**, **Intermediate**, or **Senior**).
  - Test your camera: Click the camera toggle and verify your video preview.
  - Test your microphone: Speak aloud; watch the volume meter animate in green to verify audio input.
- Click **"Join Interview"**.

### 4. Experience the Live Interview Room
- **Conference Mode**: You are seated in a 2x2 grid with **AI Moderator**, **AI Technical Interviewer**, **AI Observer**, and your own camera.
- **Voice Answering**: Listen as the AI asks you a spoken question. Click the microphone button to start answering; real-time transcription appears on your screen.
- **Switch to VS Code Workspace**: Click the **"Open VS Code Editor"** button at the bottom-right of the video box.
  - Write, test, and edit code in the central editor.
  - Watch your camera feed directly beside the output terminal.
  - Refer to the 3 AI service prompt cards on the left.
  - Click **"Conference View"** whenever you wish to return to 2x2 mode.
- Complete the 5 progressive rounds or click **"End Session"** when finished.

### 5. Review Analytics & Metrics
- The **Attempt Review** screen automatically opens:
  - Review your **Overall Score**, **Technical Accuracy**, **Confidence Rating**, and **Conciseness**.
  - Read personalized AI feedback and STAR-framework tips for each response.
  - Check historical trends in the **History** and **Analytics** tabs.

---

## 5. Troubleshooting & FAQ

### Issue: "Microphone or Camera Permission Denied"
- **Solution**: In your browser's address bar (near the padlock or settings icon), click **Site Settings** and set **Camera** and **Microphone** to **Allow**. Reload the page.

### Issue: "WebSocket Connection to 'ws://localhost:8000/ws/...' Failed"
- **Solution**: Ensure your backend server is running in your first terminal window on port `8000`. If your backend is running on a different port, verify the URL in `src/views/LivePracticeView.tsx`.

### Issue: "OPENROUTER_API_KEY is not configured" or Questions Not Loading
- **Solution**: Open `Backend/.env` and ensure `OPENROUTER_API_KEY` is not empty and has no quotes around it. Restart `uvicorn`.

### Issue: "Port 3000 or 8000 is Already in Use"
- **Solution**:
  - Check what is running:
    - Windows: `Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -in 3000, 8000}`
    - Linux/macOS: `lsof -i :3000` or `lsof -i :8000`
  - Terminate the conflicting process or change the port (`uvicorn main:app --port 8001`).

### Issue: PowerShell "Execution of scripts is disabled on this system"
- **Solution**: Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in your PowerShell window, then rerun `.\venv\Scripts\activate`.
