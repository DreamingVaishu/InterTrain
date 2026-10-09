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
  LayoutGrid,
  User,
} from 'lucide-react';
import { PracticeTrack, QuestionResponse } from '../types';
import { startLiveInterview, submitLiveAnswer, skipLiveQuestion, completeLiveInterview, type InterviewEvaluation } from '../services/liveInterview';
import { runCode as apiRunCode, submitCode as apiSubmitCode, type EvaluateCodeResult } from '../services/codeExecution';
import { MonacoEditor } from '../components/MonacoEditor';

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
    evaluation?: InterviewEvaluation;
    codeProblem?: InterviewEvaluation['coding_problem'];
    codeReview?: InterviewEvaluation['code_review'];
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

  // Zoom & Discord Voice Activity Detection & Speaking States
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micAnimFrameRef = useRef<number | null>(null);
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown Timer: 24:37 (1477 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(1477);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Active AI Speaker simulation
  const [activeSpeaker, setActiveSpeaker] = useState<'moderator' | 'interviewer' | 'candidate' | 'observer'>('moderator');
  const [conferenceViewMode, setConferenceViewMode] = useState<'grid' | 'speaker'>('grid');

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
  const [codeSubmitted, setCodeSubmitted] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const manualMuteRef = useRef(initialMicMuted);
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
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioInputId, setSelectedAudioInputId] = useState('');
  const [selectedAudioOutputId, setSelectedAudioOutputId] = useState('');
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);

  // Enumerate video devices
  const loadVideoDevices = async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const vInputs = devices.filter((d) => d.kind === 'videoinput');
        const aInputs = devices.filter((d) => d.kind === 'audioinput');
        const aOutputs = devices.filter((d) => d.kind === 'audiooutput');
        setVideoDevices(vInputs);
        setAudioInputDevices(aInputs);
        setAudioOutputDevices(aOutputs);
        if (aInputs.length && !selectedAudioInputId) setSelectedAudioInputId(aInputs[0].deviceId);
        if (aOutputs.length && !selectedAudioOutputId) setSelectedAudioOutputId(aOutputs[0].deviceId);
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

  // Real-time Candidate Microphone Activity Detection (Web Audio API)
  useEffect(() => {
    if (isMuted) {
      setIsCandidateSpeaking(false);
      return;
    }

    let localAudioStream: MediaStream | null = null;
    let cancelled = false;

    const setupMicMonitor = async () => {
      try {
        const stream =
          sttStreamRef.current || (await navigator.mediaDevices.getUserMedia({ audio: true }));
        if (!sttStreamRef.current) {
          localAudioStream = stream;
        }
        if (cancelled) {
          if (localAudioStream) localAudioStream.getTracks().forEach((t) => t.stop());
          return;
        }

        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;
        micAnalyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          if (cancelled || !micAnalyserRef.current) return;
          micAnalyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;

          // Threshold for speech detection
          if (avg > 13) {
            setIsCandidateSpeaking(true);
            setActiveSpeaker('candidate');
            if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
            speakingTimerRef.current = setTimeout(() => {
              setIsCandidateSpeaking(false);
            }, 750);
          }

          micAnimFrameRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();
      } catch (e) {
        console.warn('Microphone volume monitor error:', e);
      }
    };

    void setupMicMonitor();

    return () => {
      cancelled = true;
      if (micAnimFrameRef.current) cancelAnimationFrame(micAnimFrameRef.current);
      if (speakingTimerRef.current) clearTimeout(speakingTimerRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        void audioContextRef.current.close().catch(() => {});
      }
      if (localAudioStream) {
        localAudioStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isMuted, interviewStatus]);

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
    manualMuteRef.current = nextMuted;
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
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
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
    if (!sessionId || manualMuteRef.current || interviewStatus === 'completed' || processingAnswerRef.current) return;
    try {
      stopSTT();
      setIsMuted(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedAudioInputId ? { deviceId: { exact: selectedAudioInputId } } : true,
      });
      sttStreamRef.current = stream;
      const wsProtocol = API_BASE.startsWith('https') ? 'wss' : 'ws';
      const wsHost = API_BASE.replace(/^https?:\/\//, '');
      const socket = new WebSocket(`${wsProtocol}://${wsHost}/ws/live-interview/${sessionId}`);
      sttSocketRef.current = socket;
      answerBufferRef.current = '';
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      setLiveTranscript('');

      socket.onopen = () => {
        setInterviewStatus('listening');
        const mimeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
        const mimeType = mimeCandidates.find((type) => MediaRecorder.isTypeSupported(type));
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recorderRef.current = recorder;
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            event.data.arrayBuffer().then((buffer) => socket.send(buffer));
          }
        };
        recorder.start(250);
      };

      socket.onmessage = (event) => {
        let data: any;
        try { data = JSON.parse(event.data); } catch { return; }
        if (data.type === 'transcript' || data.type === 'transcript_partial' || data.type === 'transcript_final' || data.type === 'utterance_end' || data.type === 'UtteranceEnd') {
          const text = String(data.transcript || '').trim();
          if (text) {
            if (data.is_final || data.type === 'transcript_final') {
              // Deepgram final results are discrete segments. Add each segment once;
              // interim results are displayed separately and never appended twice.
              const current = finalTranscriptRef.current;
              if (!current.endsWith(text)) finalTranscriptRef.current = `${current} ${text}`.trim();
              interimTranscriptRef.current = '';
            } else {
              interimTranscriptRef.current = text;
            }
            answerBufferRef.current = [finalTranscriptRef.current, interimTranscriptRef.current].filter(Boolean).join(' ').trim();
            setLiveTranscript(answerBufferRef.current);
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            // Deepgram speech_final is the best endpoint signal; endpointing also
            // catches pauses when speech_final is delayed or omitted.
            silenceTimerRef.current = setTimeout(() => {
              const answer = (finalTranscriptRef.current || answerBufferRef.current).trim();
              if (answer && !processingAnswerRef.current) void finalizeSpokenAnswer(answer);
            }, data.speech_final ? 1200 : 3200);
          } else if ((data.speech_final || data.type === 'utterance_end' || data.type === 'UtteranceEnd') && answerBufferRef.current.trim()) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              const answer = (finalTranscriptRef.current || answerBufferRef.current).trim();
              if (answer && !processingAnswerRef.current) void finalizeSpokenAnswer(answer);
            }, 800);
          }
        } else if (data.type === 'error') {
          setInterviewError(data.message || 'Deepgram STT error.');
          setInterviewStatus('error');
          setIsMuted(true);
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

  const finalizeSpokenAnswer = async (text: string) => {
    if (!sessionId || processingAnswerRef.current || !text.trim()) return;
    processingAnswerRef.current = true;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setInterviewStatus('processing');
    setIsMuted(true);
    stopSTT();
    try {
      const result = await submitLiveAnswer(sessionId, text.trim());
      if (interviewRound === 5 && codeSubmitted) {
        const evaluation = await completeLiveInterview(sessionId);
        setLastEvaluation({
          verdict: evaluation.overall_score >= 70 ? 'Accepted' : evaluation.overall_score >= 45 ? 'Needs Improvement' : 'Rejected',
          score: evaluation.overall_score,
          summary: evaluation.summary,
          strengths: evaluation.strengths || [],
          improvements: evaluation.improvements || [],
          time_complexity: 'See code review',
          space_complexity: 'See code review',
        });
        setInterviewStatus('completed');
        setInterviewerSubtitle('Interview completed. Your full review is ready.');
        onEndSession({
          track,
          duration: formatTime(1477 - secondsRemaining),
          questions: [...completedQuestions, { id: `${sessionId}-5-code`, question: liveQuestion, response: `Submitted ${selectedLanguage} code for review. See the code review section for execution results.` }, { id: `${sessionId}-5-explanation`, question: 'Explain your submitted code and approach', response: text.trim() }],
          code: codeContent,
          language: selectedLanguage,
          sessionId,
          evaluation,
          codeProblem: evaluation.coding_problem,
          codeReview: evaluation.code_review,
        });
        return;
      }
      const newQA: QuestionResponse = { id: `${sessionId}-${interviewRound}`, question: liveQuestion, response: text.trim() };
      const allQuestions = [...completedQuestions, newQA];
      setCompletedQuestions(allQuestions);
      setInterviewRound(result.round);
      setLiveQuestion(result.question || '');
      setInterviewerSubtitle(result.question || '');
      setLiveTranscript('');
      answerBufferRef.current = '';
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      if (result.round_type === 'coding' && result.coding_problem) {
        setLayoutMode('code');
        setSelectedLanguage(result.coding_problem.language || 'python');
        setCodeContent(result.coding_problem.starter_code || '# Write your solution here\n');
        setLiveQuestion(result.coding_problem.question);
        setInterviewerSubtitle(result.coding_problem.question);
        setAiAudioUrl(result.audio_url ? `${API_BASE}${result.audio_url}` : '');
      } else {
        setAiAudioUrl(`${API_BASE}${result.audio_url || ''}`);
      }
    } catch (error) {
      setInterviewError(error instanceof Error ? error.message : 'Unable to process your answer.');
      setInterviewStatus('error');
    } finally {
      processingAnswerRef.current = false;
    }
  };

  const handleSkipQuestion = async () => {
    if (!sessionId || isSkipping || processingAnswerRef.current || interviewRound >= 5) return;
    setIsSkipping(true);
    stopSTT();
    if (audioRef.current) audioRef.current.pause();
    try {
      const result = await skipLiveQuestion(sessionId);
      setCompletedQuestions((prev) => [...prev, { id: `${sessionId}-${interviewRound}-skip`, question: liveQuestion, response: '[Skipped]' }]);
      setInterviewRound(result.round);
      setLiveQuestion(result.question || '');
      setInterviewerSubtitle(result.question || '');
      if (result.round_type === 'coding' && result.coding_problem) {
        setLayoutMode('code');
        setSelectedLanguage(result.coding_problem.language || 'python');
        setCodeContent(result.coding_problem.starter_code || '# Write your solution here\n');
        setLiveQuestion(result.coding_problem.question);
        setAiAudioUrl(result.audio_url ? `${API_BASE}${result.audio_url}` : '');
      } else {
        setAiAudioUrl(`${API_BASE}${result.audio_url || ''}`);
      }
      setLiveTranscript(''); answerBufferRef.current = ''; finalTranscriptRef.current = '';
    } catch (error) {
      setInterviewError(error instanceof Error ? error.message : 'Could not skip this question.');
    } finally { setIsSkipping(false); }
  };

  const playQuestionAudio = async (url: string) => {
    if (!audioRef.current || !url) return;
    // Never capture the interviewer through the candidate microphone.
    stopSTT();
    setIsMuted(true);
    audioRef.current.src = url;
    audioRef.current.load();
    setInterviewStatus('speaking');
    const speaker = interviewRound === 0 ? 'moderator' : 'interviewer';
    setActiveSpeaker(speaker);
    setIsAiSpeaking(true);
    try {
      await audioRef.current.play();
      setInterviewError('');
    } catch (error) {
      console.warn('Browser blocked autoplay:', error);
      setInterviewError('Browser blocked AI audio. Use Play AI question once to continue.');
      setIsAiSpeaking(false);
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
    const onPlay = () => {
      setIsAiSpeaking(true);
      if (interviewRound === 0) {
        setActiveSpeaker('moderator');
      } else {
        setActiveSpeaker('interviewer');
      }
    };
    const onPause = () => {
      setIsAiSpeaking(false);
    };
    const onEnded = () => {
      setIsAiSpeaking(false);
      if (interviewStatus === 'speaking') {
        setActiveSpeaker('candidate');
        if (!manualMuteRef.current) {
          setIsMuted(false);
          setInterviewStatus('listening');
          window.setTimeout(() => { void startListening(); }, 150);
        } else {
          setIsMuted(true);
          setInterviewStatus('listening');
        }
      }
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [interviewStatus, aiAudioUrl, interviewRound]);

  // End Session
  const handleEndSession = async () => {
    stopSTT();
    if (audioRef.current) audioRef.current.pause();
    let evaluation: InterviewEvaluation | undefined;
    if (sessionId) {
      try {
        evaluation = await completeLiveInterview(sessionId);
      } catch (error) {
        setInterviewError(`Could not generate the full review: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    setInterviewStatus('completed');
    onEndSession({
      track,
      duration: formatTime(1477 - secondsRemaining),
      questions: completedQuestions,
      code: codeContent,
      language: selectedLanguage,
      sessionId,
      evaluation,
      codeProblem: evaluation?.coding_problem,
      codeReview: evaluation?.code_review,
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
      const submission = await apiSubmitCode(sessionId, codeContent, selectedLanguage);
      const review = submission.review;
      const evaluation: EvaluateCodeResult = {
        verdict: review.verdict === 'Accepted' ? 'Accepted' : review.score >= 50 ? 'Needs Improvement' : 'Rejected',
        score: review.score,
        summary: review.summary,
        strengths: review.strengths || [],
        improvements: review.improvements || [],
        time_complexity: review.time_complexity || 'Not estimated',
        space_complexity: review.space_complexity || 'Not estimated',
      };
      setLastEvaluation(evaluation);
      setCodeSubmitted(true);
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
          runtime: evaluation.runtime_estimate || '—',
          memory: evaluation.memory_estimate || '—',
          timestamp: 'Just now',
          score: evaluation.score,
        },
        ...prev,
      ]);
      setActiveTab('submissions');
      setLiveQuestion('Now explain your solution, why you chose this approach, and its time and space complexity.');
      setInterviewerSubtitle('Please explain your submitted code aloud.');
      setAiAudioUrl('');
      setInterviewStatus('listening');
      setLiveTranscript(''); answerBufferRef.current = ''; finalTranscriptRef.current = '';
      setLayoutMode('video');
      if (!isMuted) void startListening();
    } catch (err) {
      setCodeOutput('Error during AI evaluation: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExecuting(false);
    }
  };

  const difficultyDisplay =
    difficulty === 'Beginner' ? 'Easy' : difficulty === 'Advanced' ? 'Hard' : 'Medium';

  const isUserSpeaking = isCandidateSpeaking && !isMuted;
  const isModeratorSpeaking = isAiSpeaking && activeSpeaker === 'moderator';
  const isInterviewerSpeaking =
    isAiSpeaking && (activeSpeaker === 'interviewer' || (interviewRound > 0 && isAiSpeaking));

  // Helper for Zoom & Discord style speaking aura and glowing halo
  const getSpeakingBorder = (isSpeaking: boolean, isSelected: boolean) => {
    if (isSpeaking) {
      return 'border-2 border-emerald-400 ring-4 ring-emerald-500/80 shadow-[0_0_28px_rgba(16,185,129,0.7)]';
    }
    if (isSelected) {
      return 'border-2 border-blue-500 ring-2 ring-blue-500/20';
    }
    return 'border-slate-200/90 hover:border-slate-300';
  };

  const renderSpeakingEqualizer = () => (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/25 border border-emerald-400/50 text-emerald-400 shadow-xs">
      <div className="flex items-end gap-[2px] h-3">
        <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1 h-3.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce" />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">Speaking</span>
    </div>
  );

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

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
              Round {interviewRound || 1} of 5
            </div>
          </div>

          <div className="flex items-center gap-2" aria-label={cameraAvailable && !isVideoStopped ? 'Camera on' : 'Camera off'}>
            {cameraAvailable && !isVideoStopped ? <Video className="w-4 h-4 text-emerald-600" /> : <VideoOff className="w-4 h-4 text-slate-400" />}
          </div>
        </header>

        {/* Main Stage (Edge-to-Edge, No Left Sidebar) */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* CENTER INTERVIEW STAGE */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F4F6F9] overflow-hidden">
            {/* ── MODE 1: VIDEO CONFERENCE VIEW (GRID & SPEAKER MODES) ── */}
            {layoutMode === 'video' && (
              <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden min-h-0">
                {conferenceViewMode === 'grid' ? (
                  <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3.5 min-h-0">
                    {/* 1. TOP LEFT: MODERATOR */}
                    <div
                      onClick={() => setActiveSpeaker('moderator')}
                      className={`relative rounded-2xl overflow-hidden bg-slate-900 border cursor-pointer transition-all duration-200 shadow-xs ${getSpeakingBorder(
                        isModeratorSpeaking,
                        activeSpeaker === 'moderator'
                      )}`}
                      title="Click to spotlight Moderator"
                    >
                      {isModeratorSpeaking && (
                        <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none z-10" />
                      )}
                      <img
                        src="/avatars/moderator.jpg"
                        alt="Moderator Robot"
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-md z-20">
                        <div className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <Mic className="w-3 h-3" />
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-bold text-white leading-none">
                            Moderator
                          </span>
                        </div>
                      </div>

                      {/* Speaking Equalizer Badge Top Right */}
                      {isModeratorSpeaking && (
                        <div className="absolute top-3 right-3 z-20">
                          {renderSpeakingEqualizer()}
                        </div>
                      )}

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[80%] px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-neutral-100 text-center shadow-xl leading-snug z-20">
                        {moderatorSubtitle}
                      </div>
                    </div>

                    {/* 2. TOP RIGHT: TECHNICAL INTERVIEWER */}
                    <div
                      onClick={() => setActiveSpeaker('interviewer')}
                      className={`relative rounded-2xl overflow-hidden bg-slate-900 border cursor-pointer transition-all duration-200 shadow-xs ${getSpeakingBorder(
                        isInterviewerSpeaking,
                        activeSpeaker === 'interviewer'
                      )}`}
                      title="Click to spotlight Technical Interviewer"
                    >
                      {isInterviewerSpeaking && (
                        <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none z-10" />
                      )}
                      <img
                        src="/avatars/interviewer.jpg"
                        alt="Technical Interviewer Robot"
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-md z-20">
                        <div className="w-5 h-5 rounded-md bg-neutral-800 flex items-center justify-center text-white">
                          <Mic className="w-3 h-3" />
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-bold text-white leading-none">
                            Technical Interviewer
                          </span>
                        </div>
                      </div>

                      {/* Speaking Equalizer Badge Top Right */}
                      {isInterviewerSpeaking && (
                        <div className="absolute top-3 right-3 z-20">
                          {renderSpeakingEqualizer()}
                        </div>
                      )}

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[80%] px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-neutral-100 text-center shadow-xl leading-snug z-20">
                        {interviewerSubtitle}
                      </div>
                    </div>

                    {/* 3. BOTTOM LEFT: CANDIDATE WEBCAM + THE ONLY OPEN VS CODE BUTTON */}
                    <div
                      onClick={() => setActiveSpeaker('candidate')}
                      className={`relative rounded-2xl overflow-hidden bg-slate-900 border cursor-pointer transition-all duration-200 shadow-xs ${getSpeakingBorder(
                        isUserSpeaking,
                        activeSpeaker === 'candidate'
                      )}`}
                      title="Click to spotlight Candidate"
                    >
                      {isUserSpeaking && (
                        <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none z-10" />
                      )}

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
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-md z-20">
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

                      {/* Speaking Equalizer Badge Top Right */}
                      {isUserSpeaking && (
                        <div className="absolute top-3 right-3 z-20">
                          {renderSpeakingEqualizer()}
                        </div>
                      )}

                      {/* Live Transcript / Speech Subtitle */}
                      {liveTranscript && (
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-[80%] px-3.5 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-emerald-400/50 text-[11px] text-emerald-200 text-center shadow-xl leading-snug z-20">
                          "{liveTranscript}"
                        </div>
                      )}


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
                ) : (
                  /* ── ACTIVE SPEAKER SPOTLIGHT VIEW (Zoom / Discord style single active camera on stage) ── */
                  <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
                    {/* Top Participants Strip */}
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 shrink-0">
                      {/* Moderator Pill */}
                      <button
                        type="button"
                        onClick={() => setActiveSpeaker('moderator')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                          activeSpeaker === 'moderator'
                            ? 'bg-slate-900 border-blue-500 text-white shadow-xs'
                            : isModeratorSpeaking
                            ? 'bg-slate-900 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/50'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <img src="/avatars/moderator.jpg" alt="Moderator" className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-xs font-bold">Moderator</span>
                        {isModeratorSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                      </button>

                      {/* Interviewer Pill */}
                      <button
                        type="button"
                        onClick={() => setActiveSpeaker('interviewer')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                          activeSpeaker === 'interviewer'
                            ? 'bg-slate-900 border-blue-500 text-white shadow-xs'
                            : isInterviewerSpeaking
                            ? 'bg-slate-900 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/50'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <img src="/avatars/interviewer.jpg" alt="Interviewer" className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-xs font-bold">Technical Interviewer</span>
                        {isInterviewerSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                      </button>

                      {/* Candidate Pill */}
                      <button
                        type="button"
                        onClick={() => setActiveSpeaker('candidate')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                          activeSpeaker === 'candidate'
                            ? 'bg-slate-900 border-blue-500 text-white shadow-xs'
                            : isUserSpeaking
                            ? 'bg-slate-900 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/50'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                          {userName ? userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="text-xs font-bold">You (Candidate)</span>
                        {isUserSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                      </button>

                      {/* Observer Pill */}
                      <button
                        type="button"
                        onClick={() => setActiveSpeaker('observer')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                          activeSpeaker === 'observer'
                            ? 'bg-slate-900 border-blue-500 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <img src="/avatars/observer.jpg" alt="Observer" className="w-5 h-5 rounded-full object-cover" />
                        <span className="text-xs font-bold">Observer</span>
                      </button>
                    </div>

                    {/* Main Active Speaker Stage */}
                    <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-900 border min-h-0 shadow-sm">
                      {activeSpeaker === 'candidate' && (
                        <div className={`w-full h-full relative ${getSpeakingBorder(isUserSpeaking, true)}`}>
                          {isUserSpeaking && (
                            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none z-10" />
                          )}
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
                              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                {userName ? userName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <span className="text-xs font-semibold text-slate-200">
                                {isVideoStopped ? 'Camera is Turned Off' : 'Camera Standby'}
                              </span>
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

                          {/* Identity Pill */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-md z-20">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {isMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                            </div>
                            <span className="text-xs font-bold text-white">You (Candidate)</span>
                          </div>

                          {/* Equalizer */}
                          {isUserSpeaking && (
                            <div className="absolute top-3 right-3 z-20">
                              {renderSpeakingEqualizer()}
                            </div>
                          )}

                          {/* Transcript */}
                          {liveTranscript && (
                            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-[80%] px-3.5 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-emerald-400/50 text-[11px] text-emerald-200 text-center shadow-xl leading-snug z-20">
                              "{liveTranscript}"
                            </div>
                          )}
                        </div>
                      )}

                      {activeSpeaker === 'interviewer' && (
                        <div className={`w-full h-full relative ${getSpeakingBorder(isInterviewerSpeaking, true)}`}>
                          {isInterviewerSpeaking && (
                            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none z-10" />
                          )}
                          <img src="/avatars/interviewer.jpg" alt="Technical Interviewer" className="w-full h-full object-cover" />
                          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-md z-20">
                            <div className="w-5 h-5 rounded-md bg-neutral-800 flex items-center justify-center text-white">
                              <Mic className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-bold text-white">Technical Interviewer</span>
                          </div>
                          {isInterviewerSpeaking && (
                            <div className="absolute top-3 right-3 z-20">
                              {renderSpeakingEqualizer()}
                            </div>
                          )}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[80%] px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-neutral-100 text-center shadow-xl leading-snug z-20">
                            {interviewerSubtitle}
                          </div>
                        </div>
                      )}

                      {activeSpeaker === 'moderator' && (
                        <div className={`w-full h-full relative ${getSpeakingBorder(isModeratorSpeaking, true)}`}>
                          {isModeratorSpeaking && (
                            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none z-10" />
                          )}
                          <img src="/avatars/moderator.jpg" alt="Moderator" className="w-full h-full object-cover" />
                          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-md z-20">
                            <div className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                              <Mic className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-bold text-white">Moderator</span>
                          </div>
                          {isModeratorSpeaking && (
                            <div className="absolute top-3 right-3 z-20">
                              {renderSpeakingEqualizer()}
                            </div>
                          )}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[80%] px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-neutral-100 text-center shadow-xl leading-snug z-20">
                            {moderatorSubtitle}
                          </div>
                        </div>
                      )}

                      {activeSpeaker === 'observer' && (
                        <div className="w-full h-full relative">
                          <img src="/avatars/observer.jpg" alt="Observer" className="w-full h-full object-cover" />
                          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 shadow-md">
                            <div className="w-5 h-5 rounded-md bg-red-500/20 flex items-center justify-center text-red-400">
                              <MicOff className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-bold text-white">Observer</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}

                {/* ── BOTTOM FLOATING MEETING CONTROLS DOCK (BELOW CAMERAS) ── */}
                <div className="pt-3 pb-1 flex justify-center shrink-0">
                  <div className="flex items-center gap-5 px-6 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-md">
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

                    {/* View Switcher: Grid vs Speaker */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setConferenceViewMode('grid')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          conferenceViewMode === 'grid'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                        title="2x2 Grid View"
                      >
                        <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
                        <span>Grid</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConferenceViewMode('speaker')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          conferenceViewMode === 'speaker'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                        title="Active Speaker Spotlight View"
                      >
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Speaker</span>
                      </button>
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

                    </button>

                    {/* Device settings arrow: microphone, speaker, and camera */}
                    <div className="relative">
                      <button type="button" onClick={() => { setDeviceMenuOpen((open) => !open); void loadVideoDevices(); }}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Choose microphone, speaker, or camera" aria-label="Device settings">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {deviceMenuOpen && <div className="absolute bottom-11 left-1/2 -translate-x-1/2 z-50 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-left space-y-3">
                        <label className="block text-xs font-semibold text-slate-600">Microphone input
                          <select value={selectedAudioInputId} onChange={(e) => { setSelectedAudioInputId(e.target.value); if (!isMuted && interviewStatus === 'listening') { stopSTT(); window.setTimeout(() => void startListening(), 150); } }} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs">
                            {audioInputDevices.map((dev, idx) => <option key={dev.deviceId || idx} value={dev.deviceId}>{dev.label || `Microphone ${idx + 1}`}</option>)}
                          </select>
                        </label>
                        <label className="block text-xs font-semibold text-slate-600">Audio output
                          <select value={selectedAudioOutputId} onChange={async (e) => { setSelectedAudioOutputId(e.target.value); const audio = audioRef.current as (HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> }) | null; if (audio?.setSinkId) { try { await audio.setSinkId(e.target.value); } catch (err) { console.warn('Unable to change audio output', err); } } }} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs">
                            {audioOutputDevices.map((dev, idx) => <option key={dev.deviceId || idx} value={dev.deviceId}>{dev.label || `Speaker ${idx + 1}`}</option>)}
                          </select>
                        </label>
                        <label className="block text-xs font-semibold text-slate-600">Camera
                          <select value={selectedDeviceId} onChange={(e) => { setSelectedDeviceId(e.target.value); void activateCamera(e.target.value); }} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs">
                            {videoDevices.map((dev, idx) => <option key={dev.deviceId || idx} value={dev.deviceId}>{dev.label || `Camera ${idx + 1}`}</option>)}
                          </select>
                        </label>
                      </div>}
                    </div>

                    {/* Icon-only editor control in the bottom dock */}
                    <button
                      type="button"
                      onClick={() => setLayoutMode(layoutMode === 'code' ? 'video' : 'code')}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 transition-colors"
                      title={layoutMode === 'code' ? 'Return to interview' : 'Open code editor'}
                      aria-label={layoutMode === 'code' ? 'Return to interview' : 'Open code editor'}
                    >
                      <Code2 className="w-4 h-4" />
                    </button>

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
                  <div className={`flex-1 relative rounded-xl overflow-hidden bg-slate-900 shadow-md min-h-0 group transition-all duration-200 ${
                    isModeratorSpeaking
                      ? 'border-2 border-emerald-400 ring-2 ring-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.6)]'
                      : 'border border-slate-800'
                  }`}>
                    {isModeratorSpeaking && (
                      <div className="absolute inset-0 rounded-xl border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none z-10" />
                    )}
                    <img
                      src="/avatars/moderator.jpg"
                      alt="Moderator AI"
                      className="w-full h-full object-cover"
                    />

                    {/* Speaking Equalizer Badge Top Right */}
                    {isModeratorSpeaking && (
                      <div className="absolute top-2 right-2 z-20">
                        {renderSpeakingEqualizer()}
                      </div>
                    )}

                    {/* Badge Bottom Left: Animated Waveform + Name + Organization */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 shadow-md z-20">
                      <div className="flex items-center gap-0.5 h-3.5 text-cyan-400">
                        <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        <span className="w-0.5 h-3.5 bg-cyan-400 rounded-full animate-pulse delay-75" />
                        <span className="w-0.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-150" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[11px] font-bold text-white leading-none">
                          Moderator
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. TECHNICAL INTERVIEWER AI CAMERA */}
                  <div className={`flex-1 relative rounded-xl overflow-hidden bg-slate-900 shadow-md min-h-0 group transition-all duration-200 ${
                    isInterviewerSpeaking
                      ? 'border-2 border-emerald-400 ring-2 ring-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.6)]'
                      : 'border border-slate-800'
                  }`}>
                    {isInterviewerSpeaking && (
                      <div className="absolute inset-0 rounded-xl border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none z-10" />
                    )}
                    <img
                      src="/avatars/interviewer.jpg"
                      alt="Technical Interviewer AI"
                      className="w-full h-full object-cover"
                    />

                    {/* Speaking Equalizer Badge Top Right */}
                    {isInterviewerSpeaking && (
                      <div className="absolute top-2 right-2 z-20">
                        {renderSpeakingEqualizer()}
                      </div>
                    )}

                    {/* Badge Bottom Left: Mic + Name + Organization */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 shadow-md z-20">
                      <div className="w-4 h-4 rounded-md bg-neutral-800 flex items-center justify-center text-white">
                        <Mic className="w-2.5 h-2.5" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[11px] font-bold text-white leading-none">
                          Technical Interviewer
                        </span>
                      </div>
                    </div>
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
                      </div>
                    </div>
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
                    <div className="flex-1 min-w-0 h-full"><MonacoEditor value={codeContent} language={selectedLanguage} onChange={setCodeContent} /></div>
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

                      <div className={`flex-1 relative bg-black flex items-center justify-center overflow-hidden transition-all duration-200 ${
                        isUserSpeaking
                          ? 'border-2 border-emerald-400 ring-2 ring-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.6)]'
                          : ''
                      }`}>
                        {isUserSpeaking && (
                          <div className="absolute inset-0 border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none z-10" />
                        )}
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

                        {isUserSpeaking && (
                          <div className="absolute top-2 right-2 z-20">
                            {renderSpeakingEqualizer()}
                          </div>
                        )}

                        <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white z-20">
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
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-blue-600 font-medium">Round {interviewRound || 1} of 5</span>
                          {interviewRound > 0 && interviewRound < 5 && interviewStatus !== 'completed' && (
                            <button type="button" onClick={() => void handleSkipQuestion()} disabled={isSkipping || interviewStatus === 'processing'} className="px-2.5 py-1 rounded-lg border border-blue-200 bg-white text-blue-700 hover:bg-blue-100 text-[10px] font-semibold disabled:opacity-50">{isSkipping ? 'Skipping…' : 'Skip question'}</button>
                          )}
                        </div>
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
                      <div className="pt-2 border-t border-blue-200/60 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-700">
                          <span>Live transcription</span>
                          <span className={interviewStatus === 'listening' && !isMuted ? 'text-emerald-600' : 'text-slate-500'}>
                            {interviewStatus === 'speaking' || isAiSpeaking ? 'Mic off · interviewer speaking' : interviewStatus === 'listening' && !isMuted ? 'Mic on · listening' : interviewStatus === 'processing' ? 'Submitting answer…' : isMuted ? 'Mic off' : 'Waiting for speech'}
                          </span>
                        </div>
                        <div className="max-h-36 min-h-16 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-blue-100 bg-white/90 p-2.5 text-[11px] leading-relaxed text-slate-700" aria-live="polite">
                          {liveTranscript || (interviewStatus === 'listening' && !isMuted ? 'Listening… your recognized answer will appear here.' : 'Your answer will appear here while you speak.')}
                        </div>
                      </div>
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
