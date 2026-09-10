import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Code2,
  Maximize2,
  Send,
  Sparkles,
  ChevronDown,
  Terminal,
  CheckCircle2,
  Copy,
  ArrowLeft,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { PracticeTrack, LiveNote, QuestionResponse } from '../types';

interface LivePracticeViewProps {
  track: PracticeTrack;
  sessionId?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  initialCameraOn?: boolean;
  initialMicMuted?: boolean;
  onEndSession: (completedSession: {
    track: PracticeTrack;
    duration: string;
    questions: QuestionResponse[];
    code: string;
    language: string;
    sessionId?: string;
  }) => void;
  onExit: () => void;
}

interface AIService {
  id: string;
  name: string;
  company: string;
  role: string;
  model: string;
  color: string;
  ringColor: string;
}

const AI_SERVICES: AIService[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    company: 'Google AI',
    role: 'Lead Evaluator',
    model: 'Gemini 1.5 Pro',
    color: '#1a73e8',
    ringColor: 'border-blue-400/90 ring-2 ring-blue-500/40 shadow-blue-500/10',
  },
  {
    id: 'claude',
    name: 'Claude',
    company: 'Anthropic',
    role: 'System Architect',
    model: 'Claude 3.5 Sonnet',
    color: '#ea580c',
    ringColor: 'border-amber-400/90 ring-2 ring-amber-500/40 shadow-amber-500/10',
  },
  {
    id: 'openai',
    name: 'GPT-4o',
    company: 'OpenAI',
    role: 'Algorithms Specialist',
    model: 'GPT-4o Omni',
    color: '#10b981',
    ringColor: 'border-emerald-400/90 ring-2 ring-emerald-500/40 shadow-emerald-500/10',
  },
];

export function LivePracticeView({
  track,
  sessionId,
  difficulty,
  initialCameraOn = true,
  initialMicMuted = false,
  onEndSession,
  onExit,
}: LivePracticeViewProps) {
  // Session layout mode starts in 'video' view showing user's camera view when interview starts
  const [layoutMode, setLayoutMode] = useState<'code' | 'video'>('video');

  // Media streams
  const [isMicMuted, setIsMicMuted] = useState(initialMicMuted);
  const [isCameraOff, setIsCameraOff] = useState(!initialCameraOn);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  // Timer: starts at 5 minutes 12 seconds as in design (312 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(312);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Active speaker simulation ('Gemini' | 'Claude' | 'GPT-4o')
  const [speakingParticipant, setSpeakingParticipant] = useState<string>('Gemini');

  // Code editor state
  const [selectedLanguage, setSelectedLanguage] = useState(track.defaultCode.language || 'python');
  const [codeContent, setCodeContent] = useState(track.defaultCode.code || '');
  const [codeOutput, setCodeOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Interview Questions & Responses
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Session ID copy indicator
  const [copiedSessionId, setCopiedSessionId] = useState(false);

  const handleCopySessionId = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
  };

  const [userSpeechInput, setUserSpeechInput] = useState('');
  const [recordedQA, setRecordedQA] = useState<QuestionResponse[]>([]);

  // Right sidebar notes
  const [liveNotes, setLiveNotes] = useState<LiveNote[]>([
    {
      id: 'note-1',
      speaker: 'Gemini',
      text: 'Evaluating mathematical derivation of Scaled Dot-Product Attention & variance normalization.',
      timestamp: '00:45',
      type: 'question',
    },
    {
      id: 'note-2',
      speaker: 'Claude',
      text: 'Checkpoint: Candidate should clarify why sqrt(d_k) prevents vanishing gradients in softmax.',
      timestamp: '02:18',
      type: 'note',
    },
    {
      id: 'note-3',
      speaker: 'GPT-4o',
      text: 'Analyzing computational complexity: O(N^2) memory footprint and potential FlashAttention optimizations.',
      timestamp: '03:10',
      type: 'tip',
    },
  ]);

  // Request webcam stream with fallback
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          setMediaStream(stream);
          setHasCameraPermission(true);
        }
      } catch (err) {
        console.warn('Camera permission denied or unavailable:', err);
        setHasCameraPermission(false);
      }
    }
    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Helper to bind video element whenever mounted in either view
  const bindVideoRef = (el: HTMLVideoElement | null) => {
    if (el && mediaStream && el.srcObject !== mediaStream) {
      el.srcObject = mediaStream;
    }
  };

  // Toggle Camera
  const handleToggleCamera = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => {
        track.enabled = isCameraOff;
      });
    }
    setIsCameraOff(!isCameraOff);
  };

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Format timer as MM:SS (e.g. 5:12)
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Run code simulation
  const handleRunCode = () => {
    setIsExecuting(true);
    setCodeOutput('Compiling code in sandbox environment...');

    setTimeout(() => {
      setIsExecuting(false);
      if (selectedLanguage.toLowerCase().includes('python')) {
        setCodeOutput(
          `>>> python main.py\nAttention output shape: (1, 4, 64)\nAttention weights shape: (1, 4, 4)\nMatrix normalized across axis=-1 with temperature sqrt(64)=8.0\n[Process completed successfully with exit code 0]`
        );
      } else if (selectedLanguage.toLowerCase().includes('yaml')) {
        setCodeOutput(
          `>>> kubectl apply --dry-run=client -f deployment.yaml\ndeployment.apps/intertrain-service validated.\nRollingUpdate maxSurge=1, maxUnavailable=0 confirmed.`
        );
      } else {
        setCodeOutput(
          `>>> test suite executed\n✓ Unit tests passed: 4/4\nExecution time: 42ms\nMemory consumed: 14.8 MB`
        );
      }

      setLiveNotes((prev) => [
        ...prev,
        {
          id: `note-${Date.now()}`,
          speaker: 'System',
          text: `Code execution completed: All assertions passed for ${selectedLanguage.toUpperCase()}.`,
          timestamp: formatTimer(secondsRemaining),
          type: 'tip',
        },
      ]);
    }, 900);
  };

  // Submit response to current question
  const handleSubmitResponse = () => {
    if (!userSpeechInput.trim()) return;

    const currentQuestion =
      track.questions[currentQIndex] ||
      'Explain your technical architecture and trade-offs.';

    const newQA: QuestionResponse = {
      id: `qa-${Date.now()}`,
      question: currentQuestion,
      response: userSpeechInput,
      score: Math.floor(Math.random() * 25) + 70,
      feedback: 'Good technical intuition. Make sure to back up assertions with concrete metrics.',
    };

    setRecordedQA((prev) => [...prev, newQA]);
    setUserSpeechInput('');

    // Advance question if available
    if (currentQIndex < track.questions.length - 1) {
      const nextIndex = currentQIndex + 1;
      setCurrentQIndex(nextIndex);
      const nextSpeaker = ['Claude', 'GPT-4o', 'Gemini'][nextIndex % 3];
      setSpeakingParticipant(nextSpeaker);

      setLiveNotes((prev) => [
        ...prev,
        {
          id: `note-${Date.now()}`,
          speaker: nextSpeaker,
          text: `Follow-up question presented: "${track.questions[nextIndex]?.slice(0, 65)}..."`,
          timestamp: formatTimer(secondsRemaining),
          type: 'question',
        },
      ]);
    } else {
      setSpeakingParticipant('Gemini');
      setLiveNotes((prev) => [
        ...prev,
        {
          id: `note-${Date.now()}`,
          speaker: 'Gemini',
          text: 'All interview rounds completed! Ready to finalize attempt evaluation.',
          timestamp: formatTimer(secondsRemaining),
          type: 'tip',
        },
      ]);
    }
  };

  // End Session Handler
  const handleEnd = () => {
    const finalQuestions =
      recordedQA.length > 0
        ? recordedQA
        : [
            {
              id: 'live-q1',
              question: track.questions[0] || 'Explain your technical implementation.',
              response:
                userSpeechInput ||
                'I implemented multi-head attention using scaled dot-product and tested numerical stability with synthetic Gaussian noise.',
              score: 82,
              feedback: 'Clear explanation of matrix dimensionality and attention scaling factor.',
            },
            {
              id: 'live-q2',
              question: track.questions[1] || 'How do you handle production trade-offs?',
              response:
                'We profile memory with CUDA event timers and apply flash attention kernels to avoid quadratic memory bottlenecks.',
              score: 89,
              feedback: 'Strong understanding of memory bandwidth bottlenecks.',
            },
          ];

    onEndSession({
      track,
      duration: formatTimer(312 - secondsRemaining),
      questions: finalQuestions,
      code: codeContent,
      language: selectedLanguage,
      sessionId,
    });
  };

  const currentQuestionText =
    track.questions[currentQIndex] || track.questions[0];

  return (
    <div className="h-screen max-h-screen bg-[#121212] text-neutral-100 flex flex-col overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="h-14 bg-[#141414] border-b border-neutral-800 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back to Dashboard Button */}
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-all border border-neutral-700 cursor-pointer shadow-sm group shrink-0"
            title="Exit interview and return to dashboard"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <span className="text-neutral-700 font-light hidden sm:inline">|</span>

          {/* InterTrain Brand */}
          <span className="text-lg font-black tracking-tight text-white flex items-center gap-2 shrink-0">
            InterTrain
          </span>
          <span className="text-neutral-500 font-light hidden md:inline">|</span>
          <span className="text-sm font-medium text-neutral-300 truncate max-w-[150px] sm:max-w-xs md:max-w-md">
            {track.title}
          </span>
          {difficulty && (
            <span className="hidden sm:inline px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-cyan-300 border border-neutral-700 shrink-0">
              {difficulty}
            </span>
          )}
          {sessionId && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400 shadow-inner">
              <span className="text-neutral-500 font-sans text-[11px]">Section ID:</span>
              <span className="text-cyan-400 font-semibold tracking-wide">{sessionId}</span>
              <button
                type="button"
                onClick={handleCopySessionId}
                className="ml-1 text-neutral-400 hover:text-white transition-colors cursor-pointer p-0.5 rounded hover:bg-neutral-800"
                title="Copy Section ID for backend API testing"
              >
                {copiedSessionId ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* View Layout Mode Switcher & Exit */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setLayoutMode(layoutMode === 'code' ? 'video' : 'code')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700/50 cursor-pointer"
            title="Toggle between Camera View & VS Code Workspace"
          >
            {layoutMode === 'code' ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Camera View</span>
              </>
            ) : (
              <>
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Open VS Code</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 transition-colors border border-red-800/50 cursor-pointer"
            title="Leave this interview session"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* Main Grid: Left Column (3 AI Services) + Center Area (Camera or VS Code Editor) + Right Column (Summary) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">
        {/* Left Column: 3 AI Services (Gemini, Claude, GPT-4o) */}
        <div className="lg:col-span-2 bg-[#121212] p-2.5 flex flex-col gap-2.5 border-r border-neutral-800 min-h-0 overflow-y-auto shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-1 pt-0.5 flex items-center justify-between">
            <span>AI Panel (3 Services)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {AI_SERVICES.map((ai) => {
            const isSpeaking = speakingParticipant === ai.name;
            return (
              <div
                key={ai.id}
                onClick={() => setSpeakingParticipant(ai.name)}
                className={`relative flex-1 min-h-[105px] max-h-[185px] rounded-xl bg-[#1e1e1e] border overflow-hidden flex flex-col justify-between p-3 transition-all cursor-pointer shadow-md group ${
                  isSpeaking ? ai.ringColor : 'border-neutral-800 hover:border-neutral-700'
                }`}
                title={`Click to focus on ${ai.name}`}
              >
                {/* Background Subtle Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a]/60 to-[#181818]/90 pointer-events-none" />

                {/* Top row: Avatar + Service Name */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ai.id === 'gemini' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1a73e8] to-[#4285f4] flex items-center justify-center text-white shadow-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {ai.id === 'claude' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#c2410c] to-[#ea580c] flex items-center justify-center text-white font-black text-xs shadow-sm">
                        C
                      </div>
                    )}
                    {ai.id === 'openai' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#059669] to-[#10b981] flex items-center justify-center text-white shadow-sm">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-white leading-none block">
                        {ai.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 leading-none">
                        {ai.company}
                      </span>
                    </div>
                  </div>

                  {/* Status pill */}
                  {isSpeaking ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-[9px] font-semibold text-blue-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                      Speaking
                    </span>
                  ) : (
                    <span className="text-[9px] text-neutral-500 font-mono">
                      Ready
                    </span>
                  )}
                </div>

                {/* Center: Speaking Waveform or Listening State */}
                <div className="relative z-10 my-auto flex items-center justify-center py-1">
                  {isSpeaking ? (
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-3.5 bg-blue-400 rounded-full animate-pulse" />
                      <span className="w-1 h-5 bg-blue-400 rounded-full animate-pulse delay-75" />
                      <span className="w-1 h-7 bg-blue-300 rounded-full animate-pulse delay-150" />
                      <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse delay-100" />
                      <span className="w-1 h-2 bg-blue-400 rounded-full animate-pulse delay-200" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-neutral-400 italic">
                      Evaluating candidate...
                    </span>
                  )}
                </div>

                {/* Bottom row: Role & Model name */}
                <div className="relative z-10 flex items-center justify-between pt-1.5 border-t border-neutral-800/80 text-[10px]">
                  <span className="text-neutral-300 font-medium truncate max-w-[100px]">
                    {ai.role}
                  </span>
                  <span className="text-neutral-400 font-mono text-[9px]">
                    {ai.model}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Area: User's Camera View (Default) OR VS Code Editor with User Camera beside Console */}
        <div className="lg:col-span-7 bg-[#1c1c1c] flex flex-col min-h-0 overflow-hidden border-r border-neutral-800">
          {layoutMode === 'video' ? (
            /* 1. Full Camera View Stage (Default when interview starts) */
            <div className="flex-1 min-h-0 bg-[#141414] p-3 sm:p-4 flex flex-col justify-between items-center relative overflow-hidden">
              {/* Large User Camera Container */}
              <div className="w-full flex-1 rounded-2xl bg-[#202020] border border-neutral-700/80 flex flex-col justify-between p-4 relative overflow-hidden shadow-2xl min-h-0">
                {/* Video stream or camera off fallback */}
                {hasCameraPermission && !isCameraOff ? (
                  <video
                    ref={bindVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#2a2a2a] to-[#181818]">
                    <div className="w-24 h-24 rounded-full bg-neutral-700 border-2 border-neutral-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                      You
                    </div>
                    <p className="text-sm text-neutral-300 mt-3 font-medium">
                      {isCameraOff ? 'Camera Turned Off' : 'Live Camera Active'}
                    </p>
                    <span className="text-xs text-neutral-400 mt-1">
                      Webcam stream feed ready for evaluation
                    </span>
                  </div>
                )}

                {/* Top overlay inside camera: Question banner + active AI interviewer */}
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-neutral-700/60 max-w-xl shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#0c3e74] text-white text-[10px] font-bold">
                        Q{currentQIndex + 1}/{track.questions.length}
                      </span>
                      <span className="text-[11px] text-neutral-300 font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Interviewer: {speakingParticipant}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-white leading-relaxed">
                      {currentQuestionText}
                    </p>
                  </div>

                  {/* User indicator & audio wave */}
                  <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-neutral-700/60 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-white">You</span>
                    {!isMicMuted && (
                      <div className="flex items-center gap-0.5 ml-1">
                        <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse delay-75" />
                        <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-150" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom overlay: Reply input on left, and THE VS CODE BUTTON on the right */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mt-auto pt-4">
                  {/* Quick spoken/typed answer input */}
                  <div className="flex-1 min-w-[260px] max-w-lg bg-black/80 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-700/60 flex items-center gap-2 shadow-xl">
                    <input
                      type="text"
                      value={userSpeechInput}
                      onChange={(e) => setUserSpeechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSubmitResponse();
                      }}
                      placeholder="Speak or type your answer to the 3 AI services..."
                      className="flex-1 bg-transparent text-white text-xs px-3 py-1.5 focus:outline-hidden placeholder-neutral-400"
                    />
                    <button
                      onClick={handleSubmitResponse}
                      disabled={!userSpeechInput.trim()}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0c3e74] hover:bg-[#0a3360] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                    >
                      <span>Submit</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>

                  {/* VS CODE EDITOR OPENING BUTTON (Bottom right side of the camera view) */}
                  <button
                    id="open-vscode-btn"
                    onClick={() => setLayoutMode('code')}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#007acc] hover:bg-[#0062a3] text-white font-bold text-xs md:text-sm shadow-2xl hover:shadow-blue-500/30 border border-blue-400/50 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer z-20 group shrink-0"
                    title="Open VS Code Editor & Console Workspace"
                  >
                    <div className="w-6 h-6 rounded-lg bg-black/25 flex items-center justify-center">
                      <Code2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-blue-100 uppercase tracking-wider font-semibold">
                        Workspace
                      </span>
                      <span className="text-xs md:text-sm font-bold leading-none">
                        Open VS Code Editor
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-100 group-hover:translate-x-1 transition-transform ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 2. VS Code Editor View with User's Camera beside Console */
            <>
              {/* Question Banner */}
              <div className="bg-[#242424] px-5 py-3.5 border-b border-neutral-800 flex items-start justify-between gap-4 shrink-0">
                <div className="flex items-start gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0c3e74] text-white text-[11px] font-bold mt-0.5">
                    Q{currentQIndex + 1}/{track.questions.length}
                  </span>
                  <p className="text-sm font-semibold text-neutral-200 leading-snug">
                    {currentQuestionText}
                  </p>
                </div>
              </div>

              {/* Code Editor Top Bar */}
              <div className="bg-[#181818] px-4 py-2 border-b border-neutral-800/80 flex items-center justify-between shrink-0">
                {/* Language Dropdown */}
                <div className="relative flex items-center gap-2">
                  <select
                    id="language-select"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-transparent text-neutral-300 font-medium text-xs rounded-lg px-2 py-1 pr-6 border border-neutral-700/60 focus:outline-hidden focus:border-neutral-500 cursor-pointer appearance-none"
                  >
                    <option value="python" className="bg-neutral-800 text-white">Python</option>
                    <option value="javascript" className="bg-neutral-800 text-white">JavaScript</option>
                    <option value="typescript" className="bg-neutral-800 text-white">TypeScript</option>
                    <option value="yaml" className="bg-neutral-800 text-white">YAML (K8s)</option>
                    <option value="sql" className="bg-neutral-800 text-white">SQL</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 pointer-events-none" />
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Switch back to full camera stage */}
                  <button
                    onClick={() => setLayoutMode('video')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold border border-neutral-700 transition-colors cursor-pointer"
                    title="Switch back to Full Camera View"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Camera View</span>
                  </button>

                  {/* Run Button */}
                  <button
                    id="run-code-btn"
                    onClick={handleRunCode}
                    disabled={isExecuting}
                    className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3b1263] hover:bg-[#581c87] active:scale-95 text-fuchsia-200 text-xs font-bold border border-fuchsia-700/40 transition-all cursor-pointer shadow-xs"
                  >
                    <span>{isExecuting ? 'Running...' : 'Run'}</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>

              {/* Code Editor Workspace with Line Numbers */}
              <div className="flex-1 min-h-0 flex overflow-hidden bg-[#161616] font-mono text-xs md:text-sm">
                {/* Line numbers column */}
                <div className="w-12 py-3 px-2 select-none text-neutral-600 bg-[#161616] border-r border-neutral-800/60 text-right leading-6 font-medium overflow-hidden">
                  {codeContent.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                {/* Editable Code Area */}
                <textarea
                  id="live-code-editor"
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  spellCheck={false}
                  className="flex-1 min-h-0 p-3 bg-transparent text-neutral-200 resize-none focus:outline-hidden leading-6 font-mono selection:bg-blue-900/60 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700"
                />
              </div>

              {/* Bottom Area: User Camera beside Console */}
              <div className="h-44 bg-[#181818] border-t border-neutral-800 flex shrink-0 min-h-0 overflow-hidden">
                {/* User's Camera Box beside the Console */}
                <div className="w-52 sm:w-60 md:w-68 bg-[#121212] border-r border-neutral-800 flex flex-col relative shrink-0 overflow-hidden group">
                  {/* Top camera bar with "You" & expand button */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md border border-neutral-700/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-semibold text-white">You</span>
                    </div>

                    <button
                      onClick={() => setLayoutMode('video')}
                      className="bg-black/70 hover:bg-black/90 text-neutral-300 hover:text-white px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 border border-neutral-700/50 transition-colors cursor-pointer"
                      title="Expand to Full Camera View"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Expand</span>
                    </button>
                  </div>

                  {/* Video stream or avatar */}
                  <div className="flex-1 relative flex items-center justify-center bg-neutral-900 overflow-hidden">
                    {hasCameraPermission && !isCameraOff ? (
                      <video
                        ref={bindVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm font-bold shadow-md">
                          You
                        </div>
                        <span className="text-[10px] text-neutral-400 mt-1">
                          {isCameraOff ? 'Camera Off' : 'Camera Ready'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom mic status bar */}
                  <div className="bg-[#141414] px-2.5 py-1 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isMicMuted ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      {isMicMuted ? 'Mic Muted' : 'Live Audio'}
                    </span>
                    {!isMicMuted && (
                      <div className="flex items-center gap-0.5">
                        <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse delay-75" />
                        <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse delay-150" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Console & Spoken Response beside Camera */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#161616]">
                  {/* Console Header Bar */}
                  <div className="px-3.5 py-1.5 bg-[#141414] border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400 shrink-0">
                    <span className="flex items-center gap-1.5 font-semibold text-neutral-300">
                      <Terminal className="w-3.5 h-3.5 text-neutral-500" />
                      Console & Your Spoken Answer
                    </span>
                    {codeOutput && (
                      <button
                        onClick={() => setCodeOutput('')}
                        className="text-[11px] text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Output Console Log */}
                  <div className="flex-1 p-2.5 overflow-y-auto font-mono text-xs text-emerald-400/90 whitespace-pre-wrap">
                    {codeOutput || (
                      <span className="text-neutral-600 italic">
                        Click 'Run' to compile & test code, or type/speak your answer to the 3 AI interviewers below.
                      </span>
                    )}
                  </div>

                  {/* Spoken / Quick Text input bar */}
                  <div className="p-2 bg-[#121212] border-t border-neutral-800 flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      id="user-answer-input"
                      value={userSpeechInput}
                      onChange={(e) => setUserSpeechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSubmitResponse();
                      }}
                      placeholder="Type your response to the 3 AI services (Gemini, Claude, GPT-4o)..."
                      className="flex-1 bg-[#222] text-neutral-200 text-xs px-3 py-1.5 rounded-xl border border-neutral-700/60 focus:outline-hidden focus:border-blue-500"
                    />
                    <button
                      onClick={handleSubmitResponse}
                      disabled={!userSpeechInput.trim()}
                      className="px-3 py-1.5 rounded-xl bg-[#0c3e74] hover:bg-[#0a3360] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                    >
                      <span>Reply</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Warm Cream "Summary" Sidebar */}
        <div className="lg:col-span-3 bg-[#F6F4EB] text-neutral-900 p-4 flex flex-col min-h-0 overflow-hidden border-l border-neutral-300">
          <div className="flex flex-col min-h-0 flex-1">
            {/* Header: Summary */}
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-3 font-sans shrink-0">
              Summary
            </h2>

            {/* Note Cards Stack */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-neutral-400">
              {liveNotes.map((note, index) => {
                const isPrimary = index === 0;

                return (
                  <div
                    key={note.id}
                    className={`rounded-2xl p-3.5 transition-all shadow-xs ${
                      isPrimary
                        ? 'bg-[#566c7b] text-white shadow-sm'
                        : 'bg-[#cfd4d8] text-neutral-800'
                    }`}
                  >
                    {/* Circle marker on top left matching design */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-3.5 h-3.5 rounded-full ${
                          isPrimary ? 'bg-white/40' : 'bg-neutral-500/40'
                        }`}
                      />
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isPrimary ? 'text-blue-100' : 'text-neutral-700'
                        }`}
                      >
                        {note.speaker}
                      </span>
                      <span
                        className={`text-[10px] ml-auto font-mono ${
                          isPrimary ? 'text-blue-200' : 'text-neutral-600'
                        }`}
                      >
                        {note.timestamp}
                      </span>
                    </div>

                    <p
                      className={`text-xs leading-relaxed font-sans ${
                        isPrimary ? 'text-neutral-100' : 'text-neutral-800 font-medium'
                      }`}
                    >
                      {note.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick round progress indicator */}
          <div className="shrink-0 mt-3 pt-3 border-t border-neutral-300/80">
            <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1.5">
              <span>Interview Coverage</span>
              <span>{Math.round(((currentQIndex + 1) / track.questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-neutral-300 rounded-full h-2">
              <div
                className="bg-[#0c3e74] h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQIndex + 1) / track.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <footer className="h-16 bg-[#141414] border-t border-neutral-800 px-6 flex items-center justify-between z-20 shrink-0">
        {/* Live Timer "5:12" */}
        <div className="flex items-center gap-3">
          <span
            id="session-timer"
            className="text-2xl md:text-3xl font-extrabold text-white tracking-wider font-mono select-none"
          >
            {formatTimer(secondsRemaining)}
          </span>
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="text-xs text-neutral-500 hover:text-neutral-300 underline cursor-pointer"
          >
            {isTimerRunning ? 'Pause' : 'Resume'}
          </button>
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-2">
          {/* Mute Button */}
          <button
            onClick={() => setIsMicMuted(!isMicMuted)}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              isMicMuted
                ? 'bg-red-600/80 text-white hover:bg-red-700'
                : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
            }`}
            title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Camera Button */}
          <button
            onClick={handleToggleCamera}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              isCameraOff
                ? 'bg-red-600/80 text-white hover:bg-red-700'
                : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
            }`}
            title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>
        </div>

        {/* Actions: Leave and End */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExit}
            className="px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-medium text-xs border border-neutral-700 transition-all cursor-pointer"
            title="Leave interview and return to dashboard"
          >
            Leave
          </button>
          <button
            id="end-session-btn"
            onClick={handleEnd}
            className="px-6 sm:px-8 py-2.5 rounded-full bg-[#f84949] hover:bg-[#e03838] active:scale-98 text-white font-bold text-base shadow-lg transition-all cursor-pointer"
          >
            End
          </button>
        </div>
      </footer>
    </div>
  );
}
