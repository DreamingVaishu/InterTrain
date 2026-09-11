# 💻 InterTrain - Frontend Web Application

The client-side single-page application (SPA) for **InterTrain**, built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**. It provides a real-time, multi-modal simulation environment featuring voice streaming, dual-mode workspace (2x2 video conference and Monaco-style code editor), pre-interview diagnostics, and post-session scorecards.

---

## 🚀 Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/) (fast HMR, optimized production chunks)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with tailored dark navy glassmorphism palette
- **Icons**: [Lucide React](https://lucide.dev/)
- **Media & Audio**:
  - `navigator.mediaDevices.getUserMedia` (Webcam & Microphone capture)
  - `AudioContext` & `AnalyserNode` (Real-time microphone decibel volume meter)
  - HTML5 Audio API (Dynamic TTS speech playback)
  - WebSocket Client (Raw audio PCM/WebM streaming to backend Deepgram relay)

---

## 📁 Directory Structure

```
Frontend/src/
├── assets/                  # Brand assets (InterTrain logo)
├── components/              # Reusable UI widgets and presentation elements
│   ├── Sidebar.tsx          # Navigation rail with flyout sub-menus & brand logo
│   ├── RobotAssistant.tsx   # Interactive animated mascot (waving, thinking, talking)
│   ├── FolderCard.tsx       # Practice & attempt history folder card
│   ├── SettingsModal.tsx    # User settings and local session cache controls
│   ├── UserAvatar.tsx       # Candidate avatar badge
│   └── GraduationWatermark.tsx # Subtle branding background watermark
├── views/                   # Full-page routed screens
│   ├── HomeView.tsx         # Dashboard overview, quick practice links, scheduled cards
│   ├── PracticesView.tsx    # Practice tracks (DevOps, Data, Backend, UI/UX)
│   ├── InterviewSetupView.tsx # Pre-interview hardware testing (mic meter, camera feed)
│   ├── LivePracticeView.tsx # Live interview room (Conference & VS Code workspace dual-modes)
│   ├── AttemptReviewView.tsx# Post-interview evaluation scorecard, audio review, tips
│   ├── HistoryView.tsx      # Comprehensive attempt history catalog
│   ├── AnalyticsView.tsx    # Metric progressions, radar charts, and confidence trends
│   ├── BestPracticesView.tsx# Behavioral interview frameworks (STAR method)
│   └── auth/LoginPage.tsx   # Authentication (Email/Password & 1-Click Guest Demo Mode)
├── data/
│   └── mockData.ts          # Seed practice tracks and initial attempt folders
├── types.ts                 # TypeScript interfaces and domain models
└── utils/
    └── session.ts           # 19-digit session ID generator and URL synchronization
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: `v18.x` or `v20.x`+ (LTS recommended)
- **npm**: `v9.x`+

### Installation & Setup

1. Navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at: **`http://localhost:3000`**

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview the production build locally:
   ```bash
   npm run preview
   ```

---

## 🔑 Key Views & Features

| View | Component | Description |
| :--- | :--- | :--- |
| **Authentication** | [`views/auth/LoginPage.tsx`](file:///src/views/auth/LoginPage.tsx) | Secure login & signup with instant **"Guest / Demo Mode"** bypass for rapid development testing. |
| **Dashboard** | [`views/HomeView.tsx`](file:///src/views/HomeView.tsx) | Personalized greeting, quick practice shortcuts, upcoming mock interview cards, and track cards. |
| **Hardware Setup** | [`views/InterviewSetupView.tsx`](file:///src/views/InterviewSetupView.tsx) | Live camera feed check, Web Audio API microphone volume meter, and difficulty level selector (**Junior**, **Intermediate**, **Senior**). |
| **Live Interview** | [`views/LivePracticeView.tsx`](file:///src/views/LivePracticeView.tsx) | Dual-mode interview workspace: **Conference 2x2 Screen** (3 AI services + candidate) and **VS Code IDE Workspace** (code editor, terminal, webcam, AI cards). |
| **Attempt Review** | [`views/AttemptReviewView.tsx`](file:///src/views/AttemptReviewView.tsx) | Comprehensive evaluation scorecard with score percentages, question-by-question audio replay, and AI recommendations. |
| **History** | [`views/HistoryView.tsx`](file:///src/views/HistoryView.tsx) | Historical records of completed interviews organized by track folders. |

---

## 🔗 Backend Connectivity

By default, the frontend interacts with the FastAPI backend running on `http://localhost:8000`:
- **REST Endpoints**: `http://localhost:8000/api/live-interview/*`
- **WebSocket Streaming**: `ws://localhost:8000/ws/live-interview/{section_id}`

Ensure the Backend server is running concurrently before initiating live interview sessions.
