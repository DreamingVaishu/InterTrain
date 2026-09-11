import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ArrowLeft,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Code2,
  Settings,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Play,
  Terminal,
  Send,
  Volume2,
  Maximize2,
  Bot,
  X,
  ShieldCheck,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react';
import { PracticeTrack, QuestionResponse } from '../types';
import { startLiveInterview, submitLiveAnswer } from '../services/liveInterview';
import { runCode as apiRunCode, evaluateCode as apiEvaluateCode, type EvaluateCodeResult } from '../services/codeExecution';

interface LivePracticeViewProps {
  track: PracticeTrack;
  sessionId?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  initialCameraOn?: boolean;
  initialMicMuted?: boolean;
  userName?: string;
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
    name: 'Gemini 1.5 Pro',
    company: 'Google AI',
    role: 'Lead Evaluator',
    model: 'Gemini 1.5 Pro',
    color: '#1a73e8',
    ringColor: 'border-blue-500 shadow-blue-500/20 ring-1 ring-blue-500/30',
  },
  {
    id: 'claude',
    name: 'Claude 3.5 Sonnet',
    company: 'Anthropic',
    role: 'System Architect',
    model: 'Claude 3.5 Sonnet',
    color: '#ea580c',
    ringColor: 'border-amber-500 shadow-amber-500/20 ring-1 ring-amber-500/30',
  },
  {
    id: 'openai',
    name: 'GPT-4o Omni',
    company: 'OpenAI',
    role: 'Algorithms Specialist',
    model: 'GPT-4o',
    color: '#10b981',
    ringColor: 'border-emerald-500 shadow-emerald-500/20 ring-1 ring-emerald-500/30',
  },
];

export function LivePracticeView({
  track,
  sessionId,
  difficulty = 'Intermediate',
  initialCameraOn = true,
  initialMicMuted = false,
  userName = 'Billu Badmash',
  onEndSession,
  onExit,
}: LivePracticeViewProps) {
  // Layout mode: 'video' (2x2 camera conference) or 'code' (VS Code IDE workspace)
  const [layoutMode, setLayoutMode] = useState<'video' | 'code'>('video');

  // Navigation Tabs in Right Panel
  const [activeTab, setActiveTab] = useState<'problem' | 'submissions' | 'hints' | 'notes'>('problem');

  // Media States
  const [isMuted, setIsMuted] = useState(initialMicMuted);
  const [isVideoStopped, setIsVideoStopped] = useState(!initialCameraOn);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Custom Input and Console Tabs for Code Editor
  const [customInputEnabled, setCustomInputEnabled] = useState(false);
  const [customInputText, setCustomInputText] = useState('nums = [2, 7, 11, 15]\ntarget = 9');
  const [consoleTab, setConsoleTab] = useState<'console' | 'testcases'>('console');
  // Track code evaluation results
  const [lastEvaluation, setLastEvaluation] = useState<EvaluateCodeResult | null>(null);

  const [submissions, setSubmissions] = useState<
    Array<{ id: string; status: string; runtime: string; memory: string; timestamp: string; score?: number }>
  >([]);

  // Constraints accordion
  const [constraintsOpen, setConstraintsOpen] = useState(true);

  // Webcam stream state
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const videoConferenceRef = useRef<HTMLVideoElement>(null);
  const videoConsoleRef = useRef<HTMLVideoElement>(null);

  // Countdown Timer: 24:37 (1477 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(1477);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Active AI Speaker simulation
  const [activeSpeaker, setActiveSpeaker] = useState<'moderator' | 'interviewer' | 'candidate'>('moderator');

  // Dialogue subtitles
  const [moderatorSubtitle, setModeratorSubtitle] = useState(
    "Let's move to the next question. Take your time and think out loud."
  );
  const [interviewerSubtitle, setInterviewerSubtitle] = useState(
    "This is a medium difficulty problem. Feel free to ask clarifying questions."
  );

  // Live AI interview state
  const [liveQuestion, setLiveQuestion] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interviewRound, setInterviewRound] = useState(0);
  const [interviewStatus, setInterviewStatus] = useState<'starting' | 'speaking' | 'listening' | 'processing' | 'completed' | 'error'>('starting');
  const [interviewError, setInterviewError] = useState('');
  const [aiAudioUrl, setAiAudioUrl] = useState('');
  const [completedQuestions, setCompletedQuestions] = useState<QuestionResponse[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sttSocketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const sttStreamRef = useRef<MediaStream | null>(null);
  const answerBufferRef = useRef('');
  const interviewStartedRef = useRef(false);
  const processingAnswerRef = useRef(false);

  // Code editor state
  const [selectedLanguage, setSelectedLanguage] = useState(track.defaultCode.language || 'python');
  const [codeContent, setCodeContent] = useState(
    track.defaultCode.code ||
      `def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`
  );
  const [codeOutput, setCodeOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);

  // User scratch pad notes
  const [userNotes, setUserNotes] = useState('');

  // Video devices state
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Enumerate video devices
  const loadVideoDevices = async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const vInputs = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(vInputs);
        if (vInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(vInputs[0].deviceId);
        }
      }
    } catch (e) {
      console.warn('Unable to enumerate devices:', e);
    }
  };

  // Request / Activate Webcam Stream
  const activateCamera = async (targetDeviceId?: string) => {
    try {
      if (mediaStream) {
        mediaStream.getVideoTracks().forEach((track) => track.stop());
      }

      const deviceId = targetDeviceId || selectedDeviceId;
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      };

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setMediaStream(stream);
        setCameraAvailable(true);
        setIsVideoStopped(false);
        await loadVideoDevices();
      }
    } catch (err) {
      console.warn('Camera access unavailable or denied:', err);
      setCameraAvailable(false);
      setIsVideoStopped(true);
    }
  };

  const deactivateCamera = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setIsVideoStopped(true);
    setCameraAvailable(false);
  };

  // Mount-time camera activation & device check
  useEffect(() => {
    void loadVideoDevices();
    if (initialCameraOn) {
      void activateCamera();
    }
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Attach stream to video elements
  useEffect(() => {
    if (videoConferenceRef.current && mediaStream && !isVideoStopped) {
      videoConferenceRef.current.srcObject = mediaStream;
    }
    if (videoConsoleRef.current && mediaStream && !isVideoStopped) {
      videoConsoleRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, isVideoStopped, layoutMode]);

  // Countdown Interval
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

  // Format MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopSTT();
    } else if (interviewStatus === 'listening') {
      void startListening();
    }
  };

  // Toggle Video
  const handleToggleVideo = () => {
    if (isVideoStopped || !cameraAvailable) {
      activateCamera();
    } else {
      deactivateCamera();
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const stopSTT = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    recorderRef.current = null;
    if (sttStreamRef.current) {
      sttStreamRef.current.getTracks().forEach((track) => track.stop());
      sttStreamRef.current = null;
    }
    if (sttSocketRef.current) {
      try { sttSocketRef.current.send(JSON.stringify({ type: 'stop' })); } catch {}
      sttSocketRef.current.close();
      sttSocketRef.current = null;
    }
  };

  const startListening = async () => {
    if (!sessionId || isMuted || interviewStatus === 'completed' || processingAnswerRef.current) return;
    try {
      stopSTT();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      sttStreamRef.current = stream;
      const wsProtocol = API_BASE.startsWith('https') ? 'wss' : 'ws';
      const wsHost = API_BASE.replace(/^https?:\/\//, '');
      const socket = new WebSocket(`${wsProtocol}://${wsHost}/ws/live-interview/${sessionId}`);
      sttSocketRef.current = socket;
      answerBufferRef.current = '';
      setLiveTranscript('');

      socket.onopen = () => {
        setInterviewStatus('listening');
        const preferred = 'audio/webm;codecs=opus';
        const mimeType = MediaRecorder.isTypeSupported(preferred) ? preferred : 'audio/webm';
        const recorder = new MediaRecorder(stream, { mimeType });
        recorderRef.current = recorder;
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            event.data.arrayBuffer().then((buffer) => socket.send(buffer));
          }
        };
        recorder.start(250);
      };

      socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'transcript_partial') {
          answerBufferRef.current = data.transcript || '';
          setLiveTranscript(answerBufferRef.current);
        } else if (data.type === 'transcript_final') {
          const text = (data.transcript || answerBufferRef.current).trim();
          if (!text || processingAnswerRef.current) return;
          answerBufferRef.current = text;
          setLiveTranscript(text);
          processingAnswerRef.current = true;
          setInterviewStatus('processing');
          stopSTT();
          try {
            const result = await submitLiveAnswer(sessionId, text);
            const newQA: QuestionResponse = {
              id: `${sessionId}-${interviewRound}`,
              question: liveQuestion,
              response: text,
            };
            const allQuestions = [...completedQuestions, newQA];
            setCompletedQuestions(allQuestions);
            if (result.completed) {
              setInterviewRound(5);
              setInterviewStatus('completed');
              setInterviewerSubtitle('Interview completed. Thank you for your time.');
              onEndSession({
                track,
                duration: formatTime(1477 - secondsRemaining),
                questions: allQuestions,
                code: codeContent,
                language: selectedLanguage,
                sessionId,
              });
            } else {
              setInterviewRound(result.round);
              setLiveQuestion(result.question || '');
              setInterviewerSubtitle(result.question || '');
              setAiAudioUrl(`${API_BASE}${result.audio_url || ''}`);
              setLiveTranscript('');
              answerBufferRef.current = '';
            }
          } catch (error) {
            console.error(error);
            setInterviewError(error instanceof Error ? error.message : 'Unable to process your answer.');
            setInterviewStatus('error');
          } finally {
            processingAnswerRef.current = false;
          }
        } else if (data.type === 'error') {
          setInterviewError(data.message || 'Deepgram STT error.');
          setInterviewStatus('error');
          stopSTT();
        }
      };

      socket.onerror = () => {
        setInterviewError('Unable to connect to Deepgram STT.');
        setInterviewStatus('error');
        stopSTT();
      };
    } catch (error) {
      console.error(error);
      setInterviewError('Microphone permission is required for the interview.');
      setInterviewStatus('error');
    }
  };

  const playQuestionAudio = async (url: string) => {
    if (!audioRef.current || !url) return;
    audioRef.current.src = url;
    audioRef.current.load();
    setInterviewStatus('speaking');
    setActiveSpeaker('interviewer');
    try {
      await audioRef.current.play();
      setInterviewError('');
    } catch (error) {
      console.warn('Browser blocked autoplay:', error);
      setInterviewError('Browser blocked AI audio. Use Play AI question once to continue.');
    }
  };

  useEffect(() => {
    if (!sessionId || interviewStartedRef.current) return;
    interviewStartedRef.current = true;
    const start = async () => {
      try {
        setInterviewStatus('starting');
        const result = await startLiveInterview(sessionId, track.title, difficulty);
        setInterviewRound(result.round);
        setLiveQuestion(result.question || '');
        setInterviewerSubtitle(result.question || '');
        const url = `${API_BASE}${result.audio_url || ''}`;
        setAiAudioUrl(url);
      } catch (error) {
        console.error(error);
        setInterviewError(error instanceof Error ? error.message : 'Unable to start the AI interview.');
        setInterviewStatus('error');
      }
    };
    void start();
    return () => {
      stopSTT();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    };
  }, [sessionId]);

  useEffect(() => {
    if (!aiAudioUrl || interviewStatus === 'completed') return;
    void playQuestionAudio(aiAudioUrl);
  }, [aiAudioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      if (interviewStatus === 'speaking') {
        setActiveSpeaker('candidate');
        void startListening();
      }
    };
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [interviewStatus, aiAudioUrl]);

  // End Session
  const handleEndSession = () => {
    stopSTT();
    const recordedQA: QuestionResponse[] = completedQuestions;

    onEndSession({
      track,
      duration: formatTime(1477 - secondsRemaining),
      questions: recordedQA,
      code: codeContent,
      language: selectedLanguage,
      sessionId,
    });
  };

  // Run Code — real backend sandbox execution
  const handleRunCode = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    const customInput = customInputEnabled ? customInputText : '';
    setCodeOutput('Running in sandbox...');
    try {
      const result = await apiRunCode(codeContent, selectedLanguage, customInput);
      const exitIcon = result.exit_code === 0 ? '✓' : '✗';
      let output = '';
      if (result.stdout) output += result.stdout;
      if (result.stderr) output += (output ? '\n\nSTDERR:\n' : 'STDERR:\n') + result.stderr;
      if (!output) output = exitIcon + ' (no output)';
      if (result.error === 'timeout') output = '⏱ Execution timed out after 5 seconds.';
      setCodeOutput(
        output.trimEnd() +
        `\n\n[Exit: ${result.exit_code} | Runtime: ${result.runtime_ms}ms]`
      );
    } catch (err) {
      setCodeOutput('Error contacting execution sandbox: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExecuting(false);
    }
  };

  // Submit Code — real AI code evaluation via backend
  const handleSubmitCode = async () => {
    if (isExecuting || !sessionId) return;
    setIsExecuting(true);
    setCodeOutput('Submitting to AI evaluator...');
    try {
      const evaluation = await apiEvaluateCode(
        sessionId,
        codeContent,
        selectedLanguage,
        liveQuestion,
      );
      setLastEvaluation(evaluation);
      const verdictIcon = evaluation.verdict === 'Accepted' ? '✓' : evaluation.verdict === 'Rejected' ? '✗' : '△';
      const lines: string[] = [
        `${verdictIcon} Verdict: ${evaluation.verdict} (Score: ${evaluation.score}/100)`,
        ``,
        `${evaluation.summary}`,
        ``,
        `Time Complexity:  ${evaluation.time_complexity}`,
        `Space Complexity: ${evaluation.space_complexity}`,
        `Estimated Runtime: ${evaluation.runtime_estimate}`,
        `Estimated Memory:  ${evaluation.memory_estimate}`,
      ];
      if (evaluation.strengths.length > 0) {
        lines.push('', 'Strengths:');
        evaluation.strengths.forEach((s) => lines.push('  ✓ ' + s));
      }
      if (evaluation.improvements.length > 0) {
        lines.push('', 'Suggestions:');
        evaluation.improvements.forEach((s) => lines.push('  → ' + s));
      }
      setCodeOutput(lines.join('\n'));
      setSubmissions((prev) => [
        {
          id: 'sub-' + Date.now(),
          status: evaluation.verdict,
          runtime: evaluation.runtime_estimate,
          memory: evaluation.memory_estimate,
          timestamp: 'Just now',
          score: evaluation.score,
        },
        ...prev,
      ]);
      setActiveTab('submissions');
    } catch (err) {
      setCodeOutput('Error during AI evaluation: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExecuting(false);
    }
  };

  const difficultyDisplay =
    difficulty === 'Beginner' ? 'Easy' : difficulty === 'Advanced' ? 'Hard' : 'Medium';

  return (
    <>
      <audio ref={audioRef} preload="auto" className="hidden" />
      <div className="h-screen w-screen bg-[#F4F6F9] text-slate-900 flex flex-col overflow-hidden font-sans select-none">
        {/* Top Header - Matches InterTrain Dashboard & Practices Header */}
        <header className="h-14 px-6 lg:px-8 flex items-center justify-between shrink-0 border-b border-slate-200/90 bg-white z-10 shadow-2xs">
          {/* Left: Exit button & Session Details */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onExit}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all cursor-pointer group"
              title="Exit interview and return to practices"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>Exit Interview</span>
            </button>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                {track.title} Mock Interview
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                {difficultyDisplay}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Multi-Agent Live Session • Round {interviewRound || 1} of 5</span>
            </div>
          </div>

          {/* Right: Camera status badge */}
          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${
                cameraAvailable && !isVideoStopped
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {cameraAvailable && !isVideoStopped ? (
                <>
                  <Video className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Camera On</span>
                </>
              ) : (
                <>
                  <VideoOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Camera Off</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Stage (Edge-to-Edge, No Left Sidebar) */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* CENTER INTERVIEW STAGE */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F4F6F9] overflow-hidden">
            {/* ── MODE 1: 2x2 VIDEO CONFERENCE VIEW ── */}
            {layoutMode === 'video' && (
              <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden min-h-0">
                <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3.5 min-h-0">
                  {/* 1. TOP LEFT: MODERATOR */}
                  <div
                    onClick={() => setActiveSpeaker('moderator')}
                    className={`relative rounded-2xl overflow-hidden bg-slate-900 border cursor-pointer transition-all shadow-xs ${
                      activeSpeaker === 'moderator'
                        ? 'border-2 border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src="/avatars/moderator.jpg"
                      alt="Moderator Robot"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-md">
                      <div className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Mic className="w-3 h-3" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-white leading-none">
                          Moderator
                        </span>
                        <span className="text-[10px] text-neutral-300 leading-none">
                          InterTrain AI
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[80%] px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-neutral-100 text-center shadow-xl leading-snug">
                      {moderatorSubtitle}
                    </div>
                  </div>

                  {/* 2. TOP RIGHT: TECHNICAL INTERVIEWER */}
                  <div
                    onClick={() => setActiveSpeaker('interviewer')}
                    className={`relative rounded-2xl overflow-hidden bg-slate-900 border cursor-pointer transition-all shadow-xs ${
                      activeSpeaker === 'interviewer'
                        ? 'border-2 border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src="/avatars/interviewer.jpg"
                      alt="Technical Interviewer Robot"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-md">
                      <div className="w-5 h-5 rounded-md bg-neutral-800 flex items-center justify-center text-white">
                        <Mic className="w-3 h-3" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-white leading-none">
                          Technical Interviewer
                        </span>
                        <span className="text-[10px] text-neutral-300 leading-none">
                          InterTrain AI
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[80%] px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-neutral-100 text-center shadow-xl leading-snug">
                      {interviewerSubtitle}
                    </div>
                  </div>

                  {/* 3. BOTTOM LEFT: CANDIDATE WEBCAM + THE ONLY OPEN VS CODE BUTTON */}
                  <div
                    onClick={() => setActiveSpeaker('candidate')}
                    className={`relative rounded-2xl overflow-hidden bg-slate-900 border cursor-pointer transition-all shadow-xs ${
                      activeSpeaker === 'candidate'
                        ? 'border-2 border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    {/* Real Live Webcam Feed OR Standby State */}
                    {cameraAvailable && !isVideoStopped && mediaStream ? (
                      <video
                        ref={videoConferenceRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover -scale-x-100"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#121620] flex flex-col items-center justify-center gap-2.5 p-6 text-center select-none">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                          {userName ? userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs font-semibold text-slate-200">
                            {isVideoStopped ? 'Camera is Turned Off' : 'Camera Standby'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Turn on camera to appear live in the session
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => void activateCamera()}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Turn On Camera</span>
                        </button>
                      </div>
                    )}

                    {/* Candidate Identity Pill (Bottom Left) */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-md">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          isMuted
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-white leading-none">
                          You
                        </span>
                        <span className="text-[10px] text-neutral-300 leading-none">
                          Candidate
                        </span>
                      </div>
                    </div>

                    {/* ── THE ONLY VS CODE BUTTON (Bottom Right of Candidate Tile) ── */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLayoutMode('code');
                      }}
                      className="absolute bottom-3 right-3 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-md border border-blue-400/40 transition-all cursor-pointer z-20 group"
                      title="Open full VS Code workspace"
                    >
                      <Code2 className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
                      <span>Open VS Code</span>
                    </button>
                  </div>

                  {/* 4. BOTTOM RIGHT: OBSERVER */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/90 shadow-xs">
                    <img
                      src="/avatars/observer.jpg"
                      alt="Observer Robot"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-md">
                      <div className="w-5 h-5 rounded-md bg-red-500/20 flex items-center justify-center text-red-400">
                        <MicOff className="w-3 h-3" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-white leading-none">
                          Observer
                        </span>
                        <span className="text-[10px] text-neutral-300 leading-none">
                          InterTrain AI
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-md text-xs font-medium text-neutral-200">
                      <div className="flex items-center gap-0.5 h-3">
                        <span className="w-0.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                        <span className="w-0.5 h-3 bg-blue-400 rounded-full animate-pulse delay-75" />
                        <span className="w-0.5 h-2 bg-blue-300 rounded-full animate-pulse delay-150" />
                      </div>
                      <span className="text-[11px] text-neutral-200">Observing...</span>
                    </div>
                  </div>
                </div>

                {/* ── BOTTOM FLOATING MEETING CONTROLS DOCK (BELOW CAMERAS) ── */}
                <div className="pt-3 pb-1 flex justify-center shrink-0">
                  <div className="flex items-center gap-6 px-6 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-md">
                    {/* Time Remaining Countdown Pill */}
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-mono text-xs font-bold">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-bold text-sm tracking-wide text-slate-900">
                        {formatTime(secondsRemaining)}
                      </span>
                      <span className="text-slate-500 text-[11px] font-sans font-normal ml-0.5">
                        Remaining
                      </span>
                    </div>

                    {/* Mute / Unmute Button */}
                    <button
                      type="button"
                      onClick={handleToggleMute}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                      title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xs ${
                          isMuted
                            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 group-hover:text-slate-800">
                        {isMuted ? 'Unmute' : 'Mute'}
                      </span>
                    </button>

                    {/* Start / Stop Video Button */}
                    <button
                      type="button"
                      onClick={handleToggleVideo}
                      className="flex flex-col items-center gap-1 group cursor-pointer"
                      title={isVideoStopped ? 'Start video' : 'Stop video'}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xs ${
                          isVideoStopped
                            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isVideoStopped ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 group-hover:text-slate-800">
                        {isVideoStopped ? 'Start Video' : 'Stop Video'}
                      </span>
                    </button>

                    {/* Camera Device Switcher (Clean Dropdown) */}
                    {videoDevices.length > 1 && (
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-10 px-2 rounded-xl bg-slate-100 border border-slate-200 flex items-center">
                          <select
                            value={selectedDeviceId}
                            onChange={(e) => {
                              setSelectedDeviceId(e.target.value);
                              void activateCamera(e.target.value);
                            }}
                            className="bg-transparent text-slate-700 text-[11px] font-medium focus:outline-none cursor-pointer"
                            title="Switch camera device"
                          >
                            {videoDevices.map((dev, idx) => (
                              <option key={dev.deviceId || idx} value={dev.deviceId}>
                                {dev.label || `Camera ${idx + 1}`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500">Camera</span>
                      </div>
                    )}

                    {/* Red End Session Button */}
                    <button
                      type="button"
                      onClick={handleEndSession}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
                      title="End interview session"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>End Session</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── MODE 2: FULL VS CODE EDITOR WORKSPACE ── */}
            {layoutMode === 'code' && (
              <div className="flex-1 flex overflow-hidden min-h-0 bg-[#0B0F19]">
                {/* 3 AI Video Cameras on Left Side (Filling height with zero gaps, as shown in template) */}
                <div className="w-56 sm:w-60 md:w-64 bg-[#0B0F19] p-2 flex flex-col gap-2 shrink-0 h-full border-r border-slate-800/80">
                  {/* 1. MODERATOR AI CAMERA */}
                  <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md min-h-0 group">
                    <img
                      src="/avatars/moderator.jpg"
                      alt="Moderator AI"
                      className="w-full h-full object-cover"
                    />

                    {/* Badge Bottom Left: Animated Waveform + Name + Organization */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 shadow-md">
                      <div className="flex items-center gap-0.5 h-3.5 text-cyan-400">
                        <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        <span className="w-0.5 h-3.5 bg-cyan-400 rounded-full animate-pulse delay-75" />
                        <span className="w-0.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-150" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[11px] font-bold text-white leading-none">
                          Moderator
                        </span>
                        <span className="text-[9px] text-slate-300 leading-none mt-0.5">
                          InterTrain AI
                        </span>
                      </div>
                    </div>

                    {/* Badge Bottom Right: 3 Dots Menu */}
                    <button
                      type="button"
                      className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="AI settings"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  </div>

                  {/* 2. TECHNICAL INTERVIEWER AI CAMERA */}
                  <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md min-h-0 group">
                    <img
                      src="/avatars/interviewer.jpg"
                      alt="Technical Interviewer AI"
                      className="w-full h-full object-cover"
                    />

                    {/* Badge Bottom Left: Mic + Name + Organization */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 shadow-md">
                      <div className="w-4 h-4 rounded-md bg-neutral-800 flex items-center justify-center text-white">
                        <Mic className="w-2.5 h-2.5" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[11px] font-bold text-white leading-none">
                          Technical Interviewer
                        </span>
                        <span className="text-[9px] text-slate-300 leading-none mt-0.5">
                          InterTrain AI
                        </span>
                      </div>
                    </div>

                    {/* Badge Bottom Right: 3 Dots Menu */}
                    <button
                      type="button"
                      className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="AI settings"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  </div>

                  {/* 3. OBSERVER AI CAMERA */}
                  <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md min-h-0 group">
                    <img
                      src="/avatars/observer.jpg"
                      alt="Observer AI"
                      className="w-full h-full object-cover"
                    />

                    {/* Badge Bottom Left: MicOff + Name + Organization */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 shadow-md">
                      <div className="w-4 h-4 rounded-md bg-red-500/20 flex items-center justify-center text-red-400">
                        <MicOff className="w-2.5 h-2.5" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[11px] font-bold text-white leading-none">
                          Observer
                        </span>
                        <span className="text-[9px] text-slate-300 leading-none mt-0.5">
                          InterTrain AI
                        </span>
                      </div>
                    </div>

                    {/* Badge Bottom Right: 3 Dots Menu */}
                    <button
                      type="button"
                      className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="AI settings"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  </div>

                  {/* Return to Camera Conference View Button */}
                  <button
                    type="button"
                    onClick={() => setLayoutMode('video')}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#161B24] hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 transition-all shadow-xs cursor-pointer shrink-0"
                    title="Switch back to 2x2 Conference View"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Return to Conference</span>
                  </button>
                </div>

                {/* Center VS Code Editor & Console Workspace (Black, Blue, White Theme) */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0B0F19] border-r border-slate-800 overflow-hidden">
                  {/* Editor Top Bar matching Template: main.py x + | Python 3 ▾ Settings Expand */}
                  <div className="h-10 bg-[#0E131F] border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className="px-3 py-1 rounded-md bg-[#161F30] border border-blue-500/40 text-xs font-semibold text-white flex items-center gap-2 shadow-xs">
                        <Code2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>main.py</span>
                        <span className="text-slate-400 hover:text-white cursor-pointer ml-1">×</span>
                      </div>
                      <button
                        type="button"
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="New file"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Language Selector */}
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="bg-[#161B24] text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="python">Python 3</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>

                      <button
                        type="button"
                        className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Editor Settings"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setLayoutMode('video')}
                        className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Expand View"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Code Editor Body with Line Numbers */}
                  <div className="flex-1 flex bg-[#0B0F19] overflow-hidden relative">
                    {/* Line numbers gutter */}
                    <div className="w-11 py-3 select-none text-right pr-3 font-mono text-[11px] text-slate-600 bg-[#070A10] border-r border-slate-800/80 shrink-0 leading-relaxed">
                      {Array.from({ length: Math.max(codeContent.split('\n').length, 16) }, (_, i) => (
                        <div key={i + 1} className="h-5 leading-5">{i + 1}</div>
                      ))}
                    </div>

                    {/* Editable textarea */}
                    <textarea
                      value={codeContent}
                      onChange={(e) => setCodeContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          const target = e.currentTarget;
                          const start = target.selectionStart;
                          const end = target.selectionEnd;
                          setCodeContent(codeContent.substring(0, start) + '    ' + codeContent.substring(end));
                          setTimeout(() => {
                            target.selectionStart = target.selectionEnd = start + 4;
                          }, 0);
                        }
                      }}
                      className="flex-1 bg-transparent text-slate-100 font-mono text-xs p-3 focus:outline-none resize-none leading-5 overflow-y-auto whitespace-pre selection:bg-blue-600/40"
                      spellCheck={false}
                    />
                  </div>

                  {/* Action Bar between Editor and Console: Run Code | Submit | Custom Input toggle */}
                  <div className="h-12 bg-[#0E131F] border-t border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleRunCode}
                        disabled={isExecuting}
                        className="flex items-center gap-2 px-5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmitCode}
                        disabled={isExecuting}
                        className="flex items-center gap-2 px-5 py-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-semibold text-xs border border-slate-600/40 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
                        <span>Submit</span>
                      </button>
                    </div>

                    {/* Custom Input Toggle */}
                    <div
                      onClick={() => setCustomInputEnabled(!customInputEnabled)}
                      className="flex items-center gap-2.5 text-xs text-slate-400 cursor-pointer select-none group"
                    >
                      <span className="text-[11px] group-hover:text-slate-200 transition-colors">Custom Input</span>
                      <div className={`w-8 h-4.5 rounded-full transition-colors relative ${customInputEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${customInputEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Console / Terminal Area with Candidate Camera beside Console */}
                  <div className="h-52 bg-[#0B0F19] flex overflow-hidden shrink-0">
                    {/* Console Tab & Output */}
                    <div className="flex-1 flex flex-col border-r border-slate-800 min-w-0">
                      <div className="h-8 bg-[#0E131F] px-4 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-5">
                          <button
                            type="button"
                            onClick={() => setConsoleTab('console')}
                            className={`h-8 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                              consoleTab === 'console'
                                ? 'text-white border-blue-500'
                                : 'text-slate-400 hover:text-slate-200 border-transparent'
                            }`}
                          >
                            <Terminal className="w-3 h-3 text-blue-400" />
                            <span>Console</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConsoleTab('testcases')}
                            className={`h-8 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                              consoleTab === 'testcases'
                                ? 'text-white border-blue-500'
                                : 'text-slate-400 hover:text-slate-200 border-transparent'
                            }`}
                          >
                            <span>Test Cases</span>
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Execution Sandbox</span>
                      </div>

                      {/* Custom Input Field (If Toggled) */}
                      {customInputEnabled && (
                        <div className="p-2.5 bg-[#070A10] border-b border-slate-800">
                          <span className="text-[10px] text-slate-400 block mb-1 font-mono">Test Input:</span>
                          <textarea
                            value={customInputText}
                            onChange={(e) => setCustomInputText(e.target.value)}
                            rows={2}
                            className="w-full bg-[#0E131F] text-slate-200 font-mono text-xs p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Enter custom input arguments..."
                          />
                        </div>
                      )}

                      {/* Console Output Body */}
                      <div className="flex-1 p-3.5 font-mono text-[11px] text-emerald-400 overflow-y-auto whitespace-pre-wrap bg-[#070A10] leading-relaxed">
                        {codeOutput || '> Click "Run Code" to execute your code'}
                      </div>
                    </div>

                    {/* User's Camera beside Console (Kept exactly here as instructed) */}
                    <div className="w-64 bg-[#0E131F] flex flex-col shrink-0">
                      <div className="h-8 bg-[#161B24] px-3 flex items-center justify-between border-b border-slate-800 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-semibold text-white">Your Camera</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLayoutMode('video')}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                          title="Expand camera view"
                        >
                          Expand ⤢
                        </button>
                      </div>

                      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                        {cameraAvailable && !isVideoStopped && mediaStream ? (
                          <video
                            ref={videoConsoleRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover -scale-x-100"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-3 text-center">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-1">
                              <VideoOff className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] text-neutral-400">Camera Off</span>
                          </div>
                        )}

                        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white">
                          {userName || 'Candidate'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: PROBLEM DESCRIPTION & TABS (Template styled in current UI colors) */}
          <div className="w-[390px] lg:w-[420px] bg-white border-l border-slate-200/90 flex flex-col shrink-0 overflow-hidden shadow-xs">
            {/* Tab Navigation: Problem | Submissions | Hints | Notes */}
            <div className="flex items-center border-b border-slate-200 px-5 shrink-0 bg-white">
              <button
                type="button"
                onClick={() => setActiveTab('problem')}
                className={`py-3 px-3 text-xs font-bold transition-all relative ${
                  activeTab === 'problem'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Problem
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('submissions')}
                className={`py-3 px-3 text-xs font-bold transition-all relative ${
                  activeTab === 'submissions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Submissions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('hints')}
                className={`py-3 px-3 text-xs font-bold transition-all relative ${
                  activeTab === 'hints'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Hints
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`py-3 px-3 text-xs font-bold transition-all relative ${
                  activeTab === 'notes'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Notes
              </button>
            </div>

            {/* Tab Contents: Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-700 space-y-4 font-sans leading-relaxed">
              {activeTab === 'problem' && (
                <>
                  {/* Track Title & Metadata */}
                  <div className="space-y-2.5">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {track.title}
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        difficultyDisplay === 'Easy'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : difficultyDisplay === 'Hard'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {difficultyDisplay}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {track.category}
                      </span>
                      {track.topics.slice(0, 2).map((topic) => (
                        <span key={topic} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Track Description */}
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <p>{track.description}</p>
                  </div>

                  {/* Live AI Audio Prompt */}
                  {liveQuestion ? (
                    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                          Interviewer Question
                        </span>
                        <span className="text-[10px] text-blue-600 font-medium">Round {interviewRound || 1} of 5</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {liveQuestion}
                      </p>
                      {aiAudioUrl && interviewStatus !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => void playQuestionAudio(aiAudioUrl)}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{interviewStatus === 'speaking' ? 'AI is speaking...' : 'Replay AI question'}</span>
                        </button>
                      )}
                      {liveTranscript && (
                        <div className="pt-2 border-t border-blue-200/60 text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-700">Your response: </span>
                          {liveTranscript}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                      {interviewStatus === 'starting' ? 'Connecting to AI interviewer...' : 'Waiting for next question...'}
                    </div>
                  )}

                  {/* Completed Rounds Q&A History */}
                  {completedQuestions.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-900 block">Interview History</span>
                      {completedQuestions.map((qa, idx) => (
                        <div key={qa.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Round {idx + 1}</span>
                          <p className="text-[11px] font-semibold text-slate-800 leading-snug">{qa.question}</p>
                          <p className="text-[11px] text-slate-600 leading-snug border-t border-slate-200 pt-1.5">{qa.response}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Track Topics */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold text-slate-900 block">Topics Covered</span>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                      {track.topics.map((topic) => (
                        <li key={topic}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {activeTab === 'submissions' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-900">Submission History</span>
                    <span className="text-[11px] text-slate-500">{submissions.length} Total</span>
                  </div>

                  {submissions.length > 0 ? (
                    submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className={`w-4 h-4 shrink-0 ${
                              sub.status === 'Accepted' ? 'text-emerald-600'
                              : sub.status === 'Rejected' ? 'text-red-500'
                              : 'text-amber-500'
                            }`} />
                            <div>
                              <span className={`text-xs font-bold block leading-tight ${
                                sub.status === 'Accepted' ? 'text-emerald-700'
                                : sub.status === 'Rejected' ? 'text-red-700'
                                : 'text-amber-700'
                              }`}>
                                {sub.status}
                              </span>
                              <span className="text-[10px] text-slate-500">{sub.timestamp}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {sub.score !== undefined && (
                              <span className="text-xs font-bold text-blue-700 block leading-tight">{sub.score}/100</span>
                            )}
                            <span className="text-[10px] text-slate-500 font-mono">{sub.runtime} • {sub.memory}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6">
                      No submissions yet. Write your code and click "Submit" for AI evaluation.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'hints' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500 pb-1 border-b border-slate-200">
                    Sample questions from this track to guide your thinking:
                  </p>
                  {track.questions.map((q, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-xs font-bold text-slate-900">Hint {idx + 1}</span>
                      <p className="text-[11px] text-slate-600 leading-snug">{q}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="h-full flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Your Scratch Pad
                  </span>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Write your thoughts, formulas, or approach notes here..."
                    className="flex-1 w-full min-h-[280px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
