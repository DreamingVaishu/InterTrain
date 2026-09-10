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
  Home,
  BookOpen,
  BarChart3,
  Video as VideoIcon,
  Cloud,
  Database,
  Code2,
  Palette,
  Settings,
  HelpCircle,
  Search,
  MonitorUp,
  Hand,
  MoreHorizontal,
  CheckCircle2,
  Sparkles,
  Play,
  Terminal,
  Send,
  GraduationCap,
  Volume2,
  Maximize2,
  Bot,
  History,
} from 'lucide-react';
import { PracticeTrack, LiveNote, QuestionResponse } from '../types';

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
  const [activeTab, setActiveTab] = useState<'question' | 'discussion' | 'notes'>('question');

  // Media States
  const [isMuted, setIsMuted] = useState(initialMicMuted);
  const [isVideoStopped, setIsVideoStopped] = useState(!initialCameraOn);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

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

  // Code editor state
  const [selectedLanguage, setSelectedLanguage] = useState(track.defaultCode.language || 'python');
  const [codeContent, setCodeContent] = useState(
    track.defaultCode.code ||
      `def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`
  );
  const [codeOutput, setCodeOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Live Notes
  const [notesList, setNotesList] = useState<LiveNote[]>([
    {
      id: 'n1',
      speaker: 'Moderator',
      text: 'Candidate greeted calmly and acknowledged the problem statement.',
      timestamp: '24:10',
      type: 'note',
    },
    {
      id: 'n2',
      speaker: 'Technical Interviewer',
      text: 'Recommended hash map approach with O(N) time and O(N) auxiliary space.',
      timestamp: '23:45',
      type: 'tip',
    },
    {
      id: 'n3',
      speaker: 'Observer',
      text: 'Good eye contact with camera, clear verbal pacing and problem breakdown.',
      timestamp: '22:15',
      type: 'question',
    },
  ]);

  // Request / Activate Webcam Stream
  const activateCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setMediaStream(stream);
        setCameraAvailable(true);
        setIsVideoStopped(false);
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

  // Mount-time camera activation
  useEffect(() => {
    if (initialCameraOn) {
      activateCamera();
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
    setIsMuted(!isMuted);
  };

  // Toggle Video
  const handleToggleVideo = () => {
    if (isVideoStopped || !cameraAvailable) {
      activateCamera();
    } else {
      deactivateCamera();
    }
  };

  // End Session
  const handleEndSession = () => {
    const recordedQA: QuestionResponse[] = [
      {
        id: 'qa-1',
        question: 'Two Sum - Algorithmic implementation & hash table complexity analysis',
        response:
          'Utilized single-pass hash map to achieve O(N) linear time complexity with O(N) space trade-off.',
        score: 92,
        feedback: 'Excellent structural clarity, clean corner case handling.',
      },
    ];

    onEndSession({
      track,
      duration: formatTime(1477 - secondsRemaining),
      questions: recordedQA,
      code: codeContent,
      language: selectedLanguage,
      sessionId,
    });
  };

  // Run Code simulation in sandbox
  const handleRunCode = () => {
    setIsExecuting(true);
    setCodeOutput('Compiling code in sandbox environment...');
    setTimeout(() => {
      setIsExecuting(false);
      setCodeOutput(
        `>>> python solution.py\n✓ Test Case 1: nums=[2,7,11,15], target=9 -> Output: [0, 1] (PASSED)\n✓ Test Case 2: nums=[3,2,4], target=6 -> Output: [1, 2] (PASSED)\n✓ Test Case 3: nums=[3,3], target=6 -> Output: [0, 1] (PASSED)\n\nRuntime: 44ms (Beats 95.8% of submissions)\nMemory: 17.1 MB`
      );
    }, 800);
  };

  const difficultyDisplay =
    difficulty === 'Beginner' ? 'Easy' : difficulty === 'Advanced' ? 'Hard' : 'Medium';

  return (
    <div className="h-screen w-screen bg-[#0B0F19] text-white flex flex-col overflow-hidden font-sans select-none">
      {/* Top macOS Style Window Bar with Search */}
      <div className="h-8 bg-[#0B0F19] border-b border-neutral-800/60 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 cursor-pointer hover:opacity-80"
            onClick={onExit}
            title="Exit"
          />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 cursor-pointer hover:opacity-80" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 cursor-pointer hover:opacity-80" />
        </div>
        <div className="text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors p-1">
          <Search className="w-4 h-4" />
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT SIDEBAR (Matching reference image) */}
        <aside className="w-56 bg-[#0B0F19] border-r border-neutral-800/80 flex flex-col justify-between py-4 px-3 shrink-0">
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                InterTrain
              </span>
            </div>

            {/* Navigation items */}
            <nav className="flex flex-col gap-1">
              <button
                type="button"
                onClick={onExit}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors w-full text-left"
              >
                <Home className="w-4 h-4 text-neutral-400" />
                <span>Home</span>
              </button>

              {/* Active Practice Tab */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-lg shadow-blue-600/20 w-full cursor-default">
                <BookOpen className="w-4 h-4 text-white" />
                <span>Practice</span>
              </div>

              <button
                type="button"
                onClick={onExit}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors w-full text-left"
              >
                <BarChart3 className="w-4 h-4 text-neutral-400" />
                <span>Analytics</span>
              </button>

              <button
                type="button"
                onClick={onExit}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors w-full text-left"
              >
                <History className="w-4 h-4 text-neutral-400" />
                <span>History</span>
              </button>
            </nav>
          </div>

          {/* Bottom Settings & User Card */}
          <div className="flex flex-col gap-2 pt-4 border-t border-neutral-800/60">
            <button
              type="button"
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors w-full text-left"
            >
              <Settings className="w-4 h-4 text-neutral-400" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors w-full text-left"
            >
              <HelpCircle className="w-4 h-4 text-neutral-400" />
              <span>Help</span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-800/40 transition-colors cursor-pointer mt-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 border border-blue-400/30">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">
                    {userName}
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate">
                    Student
                  </span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            </div>
          </div>
        </aside>

        {/* CENTER INTERVIEW STAGE + HEADER */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0E121A] overflow-hidden">
          {/* Top Bar */}
          <div className="h-14 px-6 flex items-center justify-between shrink-0 border-b border-neutral-800/40">
            <button
              type="button"
              onClick={onExit}
              className="flex items-center gap-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Exit Practice</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Layout Switcher (2x2 Camera View vs VS Code Editor) */}
              <button
                type="button"
                onClick={() => setLayoutMode(layoutMode === 'video' ? 'code' : 'video')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161B24] hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
                title="Toggle between Conference Camera View and VS Code Workspace"
              >
                {layoutMode === 'video' ? (
                  <>
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Open VS Code</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Camera View</span>
                  </>
                )}
              </button>

              {/* Countdown Pill: 24:37 Time Remaining */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161B24] border border-neutral-800 text-xs font-mono text-neutral-200 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold text-sm tracking-wide text-white">
                  {formatTime(secondsRemaining)}
                </span>
                <span className="text-neutral-400 text-[11px] font-sans font-normal ml-0.5">
                  Time Remaining
                </span>
              </div>

              {/* Red End Session Button */}
              <button
                type="button"
                onClick={handleEndSession}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EA384C] hover:bg-[#D32F42] active:scale-95 text-white text-xs font-semibold shadow-md shadow-red-500/20 transition-all cursor-pointer"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>End Session</span>
              </button>
            </div>
          </div>

          {/* ── MODE 1: 2x2 VIDEO CONFERENCE VIEW (When layoutMode === 'video') ── */}
          {layoutMode === 'video' && (
            <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden min-h-0">
              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3.5 min-h-0">
                {/* 1. TOP LEFT: MODERATOR */}
                <div
                  onClick={() => setActiveSpeaker('moderator')}
                  className={`relative rounded-2xl overflow-hidden bg-[#161B24] border cursor-pointer transition-all shadow-lg ${
                    activeSpeaker === 'moderator'
                      ? 'border-2 border-blue-500 shadow-blue-500/20 ring-2 ring-blue-500/20'
                      : 'border-neutral-800/80 hover:border-neutral-700'
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
                      <span className="text-[10px] text-neutral-400 leading-none">
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
                  className={`relative rounded-2xl overflow-hidden bg-[#161B24] border cursor-pointer transition-all shadow-lg ${
                    activeSpeaker === 'interviewer'
                      ? 'border-2 border-blue-500 shadow-blue-500/20 ring-2 ring-blue-500/20'
                      : 'border-neutral-800/80 hover:border-neutral-700'
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
                      <span className="text-[10px] text-neutral-400 leading-none">
                        InterTrain AI
                      </span>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[80%] px-3.5 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-[11px] text-neutral-100 text-center shadow-xl leading-snug">
                    {interviewerSubtitle}
                  </div>
                </div>

                {/* 3. BOTTOM LEFT: YOU (CANDIDATE LIVE WEBCAM) + PROMINENT VS CODE BUTTON DOWN AT RIGHT */}
                <div
                  onClick={() => setActiveSpeaker('candidate')}
                  className={`relative rounded-2xl overflow-hidden bg-[#161B24] border cursor-pointer transition-all shadow-lg ${
                    activeSpeaker === 'candidate'
                      ? 'border-2 border-blue-500 shadow-blue-500/20 ring-2 ring-blue-500/20'
                      : 'border-neutral-800/80 hover:border-neutral-700'
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
                    <div className="w-full h-full bg-[#121620] flex flex-col items-center justify-center gap-3 p-6 text-center select-none">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-xl shadow-blue-600/20 border border-blue-400/30">
                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-neutral-200">
                          {isVideoStopped ? 'Camera is Turned Off' : 'Camera Access Needed'}
                        </span>
                        <span className="text-[11px] text-neutral-400 max-w-[200px]">
                          Turn on camera to appear live
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={activateCamera}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold shadow-md cursor-pointer"
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
                      <span className="text-[10px] text-neutral-400 leading-none">
                        Candidate
                      </span>
                    </div>
                  </div>

                  {/* ── USER'S REQUESTED VS CODE OPENING BUTTON DOWN AT RIGHT OF CAMERA VIEW ── */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLayoutMode('code');
                    }}
                    className="absolute bottom-3 right-3 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-xl shadow-blue-500/30 border border-blue-400/40 transition-all cursor-pointer z-20 group"
                    title="Open full VS Code workspace"
                  >
                    <Code2 className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
                    <span>Open VS Code</span>
                  </button>
                </div>

                {/* 4. BOTTOM RIGHT: OBSERVER */}
                <div className="relative rounded-2xl overflow-hidden bg-[#161B24] border border-neutral-800/80 shadow-lg">
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
                      <span className="text-[10px] text-neutral-400 leading-none">
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
                    <span className="text-[11px] text-neutral-300">Observing...</span>
                  </div>
                </div>
              </div>

              {/* BOTTOM FLOATING MEDIA CONTROLS BAR */}
              <div className="pt-3 pb-1 flex justify-center shrink-0">
                <div className="flex items-center gap-8 px-6 py-2 rounded-2xl bg-[#12161F]/90 backdrop-blur-lg border border-neutral-800 shadow-2xl">
                  {/* Mute Button */}
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isMuted
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-200">
                      {isMuted ? 'Unmute' : 'Mute'}
                    </span>
                  </button>

                  {/* Stop Video Button */}
                  <button
                    type="button"
                    onClick={handleToggleVideo}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isVideoStopped
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                      }`}
                    >
                      {isVideoStopped ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-200">
                      {isVideoStopped ? 'Start Video' : 'Stop Video'}
                    </span>
                  </button>

                  {/* Share Screen */}
                  <button
                    type="button"
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isScreenSharing
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                      }`}
                    >
                      <MonitorUp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-200">
                      Share Screen
                    </span>
                  </button>

                  {/* Raise Hand */}
                  <button
                    type="button"
                    onClick={() => setIsHandRaised(!isHandRaised)}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isHandRaised
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                      }`}
                    >
                      <Hand className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-200">
                      {isHandRaised ? 'Hand Raised' : 'Raise Hand'}
                    </span>
                  </button>

                  {/* VS Code Editor Toggle */}
                  <button
                    type="button"
                    onClick={() => setLayoutMode('code')}
                    className="flex flex-col items-center gap-1 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-md shadow-blue-500/20">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 group-hover:text-blue-300">
                      VS Code
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── MODE 2: FULL VS CODE EDITOR WORKSPACE (With 3 AI Panels on Left & Camera beside Console) ── */}
          {layoutMode === 'code' && (
            <div className="flex-1 flex overflow-hidden min-h-0 bg-[#121212]">
              {/* 3 AI Panels on Left Side */}
              <div className="w-64 bg-[#121620] border-r border-neutral-800 p-3 flex flex-col gap-2.5 shrink-0 overflow-y-auto">
                <div className="flex items-center justify-between px-1 pb-1 border-b border-neutral-800/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    3 AI Services
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {AI_SERVICES.map((ai) => {
                  return (
                    <div
                      key={ai.id}
                      className={`rounded-xl bg-[#161B24] border border-neutral-800 p-3 flex flex-col justify-between shadow-sm`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                          style={{ backgroundColor: ai.color }}
                        >
                          {ai.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{ai.name}</p>
                          <p className="text-[10px] text-neutral-400 truncate">{ai.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1.5 border-t border-neutral-800/60">
                        <span className="font-mono">{ai.company}</span>
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Evaluating
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Return to Camera Conference Button */}
                <button
                  type="button"
                  onClick={() => setLayoutMode('video')}
                  className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold border border-neutral-700 transition-all cursor-pointer shadow-sm"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Return to Camera View</span>
                </button>
              </div>

              {/* Center VS Code Editor Workspace */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#1E1E1E] border-r border-neutral-800 overflow-hidden">
                {/* Editor File Tab Bar */}
                <div className="h-10 bg-[#252526] border-b border-neutral-800 px-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-t-lg bg-[#1E1E1E] border-t-2 border-blue-500 text-xs font-semibold text-white flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>solution.py</span>
                    </div>
                    <span className="text-xs text-neutral-500 font-mono">Python 3.10</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunCode}
                    disabled={isExecuting}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
                  </button>
                </div>

                {/* Code Textarea / Editor */}
                <div className="flex-1 relative overflow-hidden bg-[#1E1E1E]">
                  <textarea
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    className="w-full h-full bg-[#1E1E1E] text-neutral-200 font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                {/* Bottom Console / Terminal Area with USER'S CAMERA BESIDE THE CONSOLE */}
                <div className="h-48 bg-[#181818] border-t border-neutral-800 flex overflow-hidden shrink-0">
                  {/* Terminal Console Output */}
                  <div className="flex-1 flex flex-col border-r border-neutral-800 min-w-0">
                    <div className="h-8 bg-[#222222] px-3 flex items-center justify-between border-b border-neutral-800">
                      <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                        <Terminal className="w-3.5 h-3.5 text-blue-400" />
                        <span>Terminal Output</span>
                      </div>
                      <span className="text-[10px] text-neutral-500">Execution Sandbox</span>
                    </div>
                    <div className="flex-1 p-3 font-mono text-[11px] text-emerald-400 overflow-y-auto whitespace-pre-wrap bg-[#141414]">
                      {codeOutput || '>>> Sandbox initialized. Press "Run Code" above to execute.'}
                    </div>
                  </div>

                  {/* User's Camera beside Console */}
                  <div className="w-64 bg-[#121620] flex flex-col shrink-0">
                    <div className="h-8 bg-[#1A1F2C] px-3 flex items-center justify-between border-b border-neutral-800 text-xs">
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
                        {userName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: PROBLEM DESCRIPTION & TABS */}
        <div className="w-[390px] bg-[#10141E] border-l border-neutral-800/80 flex flex-col shrink-0 overflow-hidden">
          {/* Header section: Practice Session • Live + Title + Medium pill */}
          <div className="p-5 pb-3 border-b border-neutral-800/60 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-neutral-400">
                  Practice Session
                </span>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                {track.title || 'Data Structures & Algorithms'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FF9F1C]/20 text-[#FFB347] border border-[#FF9F1C]/30 shrink-0">
                {difficultyDisplay}
              </span>
            </div>
          </div>

          {/* Tab Navigation: Question | Discussion | Notes */}
          <div className="flex items-center border-b border-neutral-800/80 px-5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('question')}
              className={`py-2.5 px-3 text-xs font-semibold transition-all relative ${
                activeTab === 'question'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Question
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('discussion')}
              className={`py-2.5 px-3 text-xs font-semibold transition-all relative ${
                activeTab === 'discussion'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Discussion
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`py-2.5 px-3 text-xs font-semibold transition-all relative ${
                activeTab === 'notes'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Notes
            </button>
          </div>

          {/* Tab Contents: Scrollable */}
          <div className="flex-1 overflow-y-auto p-5 text-xs text-neutral-300 space-y-4 font-sans leading-relaxed">
            {activeTab === 'question' && (
              <>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Two Sum
                </h3>

                <p className="text-neutral-300 text-[13px] leading-relaxed">
                  Given an array of integers <code className="text-neutral-200 bg-neutral-800 px-1 py-0.5 rounded">nums</code> and an integer <code className="text-neutral-200 bg-neutral-800 px-1 py-0.5 rounded">target</code>, return the indices of the two numbers such that they add up to target.
                </p>
                <p className="text-neutral-300 text-[13px] leading-relaxed">
                  You may assume that each input would have exactly one solution, and you may not use the same element twice.
                </p>

                {/* Example 1 */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-white block">
                    Example 1:
                  </span>
                  <div className="p-3 rounded-xl bg-[#090C13] border border-neutral-800 font-mono text-[11px] text-neutral-300 leading-relaxed">
                    <div><span className="text-neutral-400">Input:</span> nums = [2, 7, 11, 15], target = 9</div>
                    <div><span className="text-neutral-400">Output:</span> [0, 1]</div>
                    <div><span className="text-neutral-400">Explanation:</span> Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1].</div>
                  </div>
                </div>

                {/* Example 2 */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-white block">
                    Example 2:
                  </span>
                  <div className="p-3 rounded-xl bg-[#090C13] border border-neutral-800 font-mono text-[11px] text-neutral-300 leading-relaxed">
                    <div><span className="text-neutral-400">Input:</span> nums = [3, 2, 4], target = 6</div>
                    <div><span className="text-neutral-400">Output:</span> [1, 2]</div>
                  </div>
                </div>

                {/* Collapsible Constraints */}
                <div className="pt-2 border-t border-neutral-800/80">
                  <button
                    type="button"
                    onClick={() => setConstraintsOpen(!constraintsOpen)}
                    className="flex items-center justify-between w-full text-xs font-bold text-white py-1 hover:text-blue-400 transition-colors"
                  >
                    <span>Constraints</span>
                    {constraintsOpen ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  {constraintsOpen && (
                    <ul className="mt-2 space-y-1.5 text-[11px] font-mono text-neutral-400 pl-1 list-disc list-inside">
                      <li>2 &le; nums.length &le; 10<sup>4</sup></li>
                      <li>-10<sup>9</sup> &le; nums[i] &le; 10<sup>9</sup></li>
                      <li>-10<sup>9</sup> &le; target &le; 10<sup>9</sup></li>
                      <li>Only one valid answer exists.</li>
                    </ul>
                  )}
                </div>

                {/* Quick Switch to VS Code Button */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => setLayoutMode(layoutMode === 'video' ? 'code' : 'video')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#161B24] hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all shadow-sm cursor-pointer"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>{layoutMode === 'video' ? 'Open VS Code Editor' : 'Back to Camera Conference'}</span>
                  </button>
                </div>
              </>
            )}

            {activeTab === 'discussion' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#090C13] border border-neutral-800 space-y-1">
                  <span className="text-xs font-bold text-white">Hint 1</span>
                  <p className="text-[11px] text-neutral-400">
                    A brute force way would search all pairs in O(N^2). Can we search for target - nums[i] in O(1) with a Hash Map?
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#090C13] border border-neutral-800 space-y-1">
                  <span className="text-xs font-bold text-white">Hint 2</span>
                  <p className="text-[11px] text-neutral-400">
                    Store value-to-index in a single pass. If the complement is already in the map, return indices immediately.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  AI Evaluator Notes
                </span>
                {notesList.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-[#090C13] border border-neutral-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400">
                        {note.speaker}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {note.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-snug">
                      {note.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
