import { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ArrowLeft,
  Sparkles,
  Bot,
  CheckCircle2,
  Copy,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PracticeTrack, InterviewConfig } from '../types';

interface InterviewSetupViewProps {
  track: PracticeTrack;
  sessionId: string;
  onJoinInterview: (config: InterviewConfig) => void;
  onBack: () => void;
}

export function InterviewSetupView({
  track,
  sessionId,
  onJoinInterview,
  onBack,
}: InterviewSetupViewProps) {
  // Device stream state
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [copiedSessionId, setCopiedSessionId] = useState(false);

  // Difficulty level selection
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    track.difficulty || 'Intermediate'
  );

  const videoRef = useRef<HTMLVideoElement>(null);

  // Copy session id
  const handleCopySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
  };

  // Stop media tracks helper
  const stopTracks = (stream: MediaStream | null) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
  };

  // Request camera and microphone access
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initDevices() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          activeStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
          });
          setMediaStream(activeStream);
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = activeStream;
          }
        }
      } catch (err) {
        console.warn('Unable to acquire media stream during setup:', err);
        setHasCameraPermission(false);
      }
    }

    initDevices();

    return () => {
      stopTracks(activeStream);
    };
  }, []);

  // Toggle Camera
  const toggleCamera = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach((t) => {
        t.enabled = !isCameraOn;
      });
    }
    setIsCameraOn(!isCameraOn);
  };

  // Toggle Microphone
  const toggleMicrophone = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((t) => {
        t.enabled = !isMicOn;
      });
    }
    setIsMicOn(!isMicOn);
  };

  const handleStart = () => {
    // Clean up preview stream tracks so live room can acquire clean media handle
    stopTracks(mediaStream);
    onJoinInterview({
      difficulty: selectedDifficulty,
      isCameraEnabled: isCameraOn,
      isMicEnabled: isMicOn,
    });
  };

  const difficultyLevels = [
    {
      id: 'Beginner' as const,
      label: 'Beginner',
      tag: 'Junior / Entry',
      description: 'Fundamental syntax, core concepts, guided problem solving.',
      time: '20 min',
      color: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300',
      activeRing: 'ring-2 ring-emerald-500/80 border-emerald-500',
    },
    {
      id: 'Intermediate' as const,
      label: 'Intermediate',
      tag: 'Mid-Level',
      description: 'Practical architectural trade-offs, concurrency, real-world edge cases.',
      time: '35 min',
      color: 'border-blue-500/60 bg-blue-500/10 text-blue-300',
      activeRing: 'ring-2 ring-blue-500/80 border-blue-500',
    },
    {
      id: 'Advanced' as const,
      label: 'Advanced',
      tag: 'Senior / Staff',
      description: 'Distributed systems scaling, fault tolerance, microsecond latency.',
      time: '45 min',
      color: 'border-fuchsia-500/60 bg-fuchsia-500/10 text-fuchsia-300',
      activeRing: 'ring-2 ring-fuchsia-500/80 border-fuchsia-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-neutral-100 flex flex-col font-sans overflow-y-auto">
      {/* Top Navbar */}
      <header className="h-16 bg-[#161616] border-b border-neutral-800 px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-all border border-neutral-700 cursor-pointer shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Practices</span>
          </button>

          <span className="text-neutral-700 font-light">|</span>

          <span className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            InterTrain
          </span>
          <span className="text-neutral-500 font-light hidden sm:inline">·</span>
          <span className="text-xs text-neutral-400 font-medium hidden sm:inline">
            Interview Readiness & Setup
          </span>
        </div>

        {/* Section ID Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400 shadow-inner">
          <span className="text-neutral-500 font-sans text-[11px]">Section ID:</span>
          <span className="text-cyan-400 font-semibold tracking-wide">{sessionId}</span>
          <button
            type="button"
            onClick={handleCopySessionId}
            className="ml-1 text-neutral-400 hover:text-white transition-colors cursor-pointer p-0.5 rounded hover:bg-neutral-800"
            title="Copy Section ID"
          >
            {copiedSessionId ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Device Readiness & Camera Preview (Aiva Style) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-[#181818] rounded-3xl border border-neutral-800 p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Camera & Audio Check
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Preview
                </span>
              </div>

              {/* 16:9 Video Box */}
              <div className="aspect-video bg-[#0f0f0f] rounded-2xl border border-neutral-700/80 relative overflow-hidden flex items-center justify-center shadow-inner group">
                {hasCameraPermission && isCameraOn ? (
                  <video
                    ref={(el) => {
                      if (el && mediaStream && el.srcObject !== mediaStream) {
                        el.srcObject = mediaStream;
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 mb-2 shadow-md">
                      <VideoOff className="w-7 h-7" />
                    </div>
                    <p className="text-xs font-semibold text-neutral-300">
                      Camera Stream Off
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 max-w-[200px]">
                      Click camera toggle below to test your webcam feed
                    </p>
                  </div>
                )}

                {/* You Badge overlay */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-neutral-700/60">
                  <span className={`w-2 h-2 rounded-full ${isCameraOn ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
                  <span className="text-xs font-semibold text-white">You</span>
                </div>
              </div>

              {/* Interactive Device Controls Bar */}
              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {/* Mic Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleMicrophone}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                      isMicOn
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700'
                        : 'bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/60'
                    }`}
                    title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  {/* Camera Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                      isCameraOn
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700'
                        : 'bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/60'
                    }`}
                    title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                  >
                    {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>
                </div>

                {/* Audio soundwave indicator */}
                <div className="flex-1 bg-[#121212] px-3.5 py-2.5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {isMicOn ? 'Mic Audio Active' : 'Mic Muted'}
                  </span>
                  {isMicOn ? (
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="w-1 h-5 bg-emerald-400 rounded-full animate-pulse delay-75" />
                      <span className="w-1 h-3.5 bg-emerald-400 rounded-full animate-pulse delay-150" />
                      <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-100" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-red-400 font-medium">Muted</span>
                  )}
                </div>
              </div>

              {/* Status checklist */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 grid grid-cols-2 gap-2 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isCameraOn ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <span>Camera: {isCameraOn ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isMicOn ? 'text-emerald-400' : 'text-neutral-500'}`} />
                  <span>Mic: {isMicOn ? 'Active' : 'Muted'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interview Settings & Difficulty Choice */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0c3e74] text-cyan-300 text-xs font-bold border border-cyan-500/30">
                  {track.category || 'Engineering Practice'}
                </span>
                <span className="text-xs text-neutral-500 font-medium">· Active Interview Track</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-sans">
                {track.title}
              </h1>
              <p className="text-sm text-neutral-400 mt-2 leading-relaxed max-w-2xl">
                {track.description}
              </p>
            </div>

            {/* Difficulty Level Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Select Interview Difficulty Level
                </label>
                <span className="text-xs text-neutral-500">
                  Tailors questions and rubric depth
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {difficultyLevels.map((lvl) => {
                  const isSelected = selectedDifficulty === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSelectedDifficulty(lvl.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? `${lvl.activeRing} bg-[#1f1f1f] shadow-lg`
                          : 'border-neutral-800 bg-[#161616] hover:bg-[#1a1a1a] hover:border-neutral-700'
                      }`}
                    >
                      {/* Check indicator if selected */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm font-bold text-white">{lvl.label}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-medium block mb-2">
                          {lvl.tag}
                        </span>
                        <p className="text-xs text-neutral-300 leading-snug">
                          {lvl.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Duration</span>
                        <span className="font-mono text-neutral-200 font-semibold">{lvl.time}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3 AI Services Preview Panel */}
            <div className="bg-[#161616] p-4 rounded-2xl border border-neutral-800">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                AI Interviewer Panel (3 Services)
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#1a73e8] to-[#4285f4] flex items-center justify-center text-white shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">Gemini 1.5 Pro</span>
                    <span className="text-[10px] text-neutral-400 block truncate">Lead Evaluator</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#c2410c] to-[#ea580c] flex items-center justify-center text-white font-black text-xs shrink-0">
                    C
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">Claude 3.5</span>
                    <span className="text-[10px] text-neutral-400 block truncate">Architecture</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#059669] to-[#10b981] flex items-center justify-center text-white shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">GPT-4o Omni</span>
                    <span className="text-[10px] text-neutral-400 block truncate">Algorithms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                id="join-interview-btn"
                type="button"
                onClick={handleStart}
                className="w-full sm:flex-1 py-4 px-8 rounded-2xl bg-[#0c3e74] hover:bg-[#0a3563] active:scale-98 text-white font-bold text-base shadow-xl hover:shadow-blue-500/20 border border-cyan-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Join Live Interview</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-semibold text-sm border border-neutral-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
