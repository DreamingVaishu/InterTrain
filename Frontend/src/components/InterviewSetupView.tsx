import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldCheck,
  Clock,
  Volume2,
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
  const [isPlayingAudioTest, setIsPlayingAudioTest] = useState(false);

  // Copy session id
  const handleCopySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
  };

  // Stop media tracks helper
  const stopTracks = (stream: MediaStream | null) => {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
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

  // Speaker audio test beep
  const handleTestAudio = () => {
    setIsPlayingAudioTest(true);
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }
    setTimeout(() => setIsPlayingAudioTest(false), 600);
  };

  const handleStart = () => {
    stopTracks(mediaStream);
    onJoinInterview({
      difficulty: 'Intermediate',
      isCameraEnabled: isCameraOn,
      isMicEnabled: isMicOn,
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 flex flex-col font-sans pb-16">
      {/* ── TOP STICKY HEADER ── */}
      <header className="sticky top-0 z-20 bg-[#F4F6F9]/90 backdrop-blur-md px-6 lg:px-10 py-4 flex items-center justify-between gap-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-all text-xs font-semibold cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-500" />
            <span>Back to Practices</span>
          </button>

          <span className="text-slate-300 font-light hidden sm:inline">|</span>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">InterTrain</span>
            <span className="text-slate-400">·</span>
            <span className="text-sm font-medium text-slate-600">{track.title}</span>
          </div>
        </div>

        {/* Section ID pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs font-mono text-slate-600">
          <span className="text-slate-400 font-sans font-medium text-[11px]">Section ID:</span>
          <span className="text-blue-600 font-bold">{sessionId}</span>
          <button
            type="button"
            onClick={handleCopySessionId}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Copy Section ID"
          >
            {copiedSessionId ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER (Clean, Centered Device Readiness Layout) ── */}
      <main className="px-6 lg:px-10 pt-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Device Readiness Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  Device Readiness Check
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ensure your webcam, microphone, and audio are configured for the live interview session.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Camera Test
              </span>
            </div>
          </div>

          {/* 16:9 Video Preview Screen */}
          <div className="w-full aspect-video bg-[#0B1220] rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-inner group">
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
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-white">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-3 shadow-md">
                  <VideoOff className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-slate-200">
                  Camera Preview is Off
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Click the "Turn On Camera" button below to enable your webcam feed.
                </p>
              </div>
            )}

            {/* Live Status Pill Overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white shadow-md">
              <span className={`w-2 h-2 rounded-full ${isCameraOn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              <span className="text-xs font-semibold">Webcam Preview</span>
            </div>
          </div>

          {/* Device Control Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Camera Toggle */}
            <button
              type="button"
              onClick={toggleCamera}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
                isCameraOn
                  ? 'bg-blue-50/50 border-blue-200 text-blue-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isCameraOn ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">Camera</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{isCameraOn ? 'Connected' : 'Disabled'}</p>
                </div>
              </div>
              <span className={`text-xs font-bold ${isCameraOn ? 'text-blue-600' : 'text-slate-400'}`}>
                {isCameraOn ? 'Active' : 'Off'}
              </span>
            </button>

            {/* Microphone Toggle */}
            <button
              type="button"
              onClick={toggleMicrophone}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
                isMicOn
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isMicOn ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">Microphone</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{isMicOn ? 'Live Audio' : 'Muted'}</p>
                </div>
              </div>

              {/* Waveform indicator */}
              <div className="flex items-center gap-0.5">
                {isMicOn ? (
                  <>
                    <span className="w-1 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-2.5 bg-emerald-500 rounded-full animate-pulse delay-150" />
                  </>
                ) : (
                  <span className="text-[11px] text-slate-400 font-semibold">Off</span>
                )}
              </div>
            </button>

            {/* Speaker Sound Test */}
            <button
              type="button"
              onClick={handleTestAudio}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
                isPlayingAudioTest
                  ? 'bg-blue-50/50 border-blue-200 text-blue-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPlayingAudioTest ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">Speaker Check</p>
                  <p className="text-[11px] text-slate-500 leading-tight">Test Audio</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600">
                {isPlayingAudioTest ? 'Playing...' : 'Test'}
              </span>
            </button>
          </div>

          {/* Device Checklist Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 ${isCameraOn ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Camera: {isCameraOn ? 'Webcam Ready' : 'Turned Off'}</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 ${isMicOn ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Microphone: {isMicOn ? 'Live Stream' : 'Muted'}</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Est. Duration: ~25 mins</span>
            </span>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleStart}
              className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Join Live Interview Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
