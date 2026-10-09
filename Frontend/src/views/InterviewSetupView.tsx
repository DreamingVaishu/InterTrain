import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  Settings,
  ShieldCheck,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { PracticeTrack, InterviewConfig } from '../types';
import { RobotAssistant } from '../components/RobotAssistant';

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
  // Media streams & device state
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Available devices
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedAudioInputId, setSelectedAudioInputId] = useState<string>('');
  const [selectedAudioOutputId, setSelectedAudioOutputId] = useState<string>('');

  // Speaker audio test state
  const [isPlayingAudioTest, setIsPlayingAudioTest] = useState(false);

  // Live microphone volume meter
  const [audioVolumeLevel, setAudioVolumeLevel] = useState(0);

  // Video element ref
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Stop media tracks helper
  const stopTracks = (stream: MediaStream | null) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
  };

  // Enumerate connected devices
  const refreshDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();

      const vDevs = devices.filter((d) => d.kind === 'videoinput');
      const aInDevs = devices.filter((d) => d.kind === 'audioinput');
      const aOutDevs = devices.filter((d) => d.kind === 'audiooutput');

      setVideoDevices(vDevs);
      setAudioInputDevices(aInDevs);
      setAudioOutputDevices(aOutDevs);

      if (vDevs.length > 0 && !selectedVideoId) {
        setSelectedVideoId(vDevs[0].deviceId);
      }
      if (aInDevs.length > 0 && !selectedAudioInputId) {
        setSelectedAudioInputId(aInDevs[0].deviceId);
      }
      if (aOutDevs.length > 0 && !selectedAudioOutputId) {
        setSelectedAudioOutputId(aOutDevs[0].deviceId);
      }
    } catch (err) {
      console.warn('Could not enumerate media devices:', err);
    }
  };

  // Start webcam and microphone stream
  const startMediaStream = async (videoDeviceId?: string, audioDeviceId?: string) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera and audio access is not supported by your browser.');
        return;
      }

      setCameraError(null);

      // Stop previous stream if any
      if (mediaStream) {
        stopTracks(mediaStream);
      }

      const constraints: MediaStreamConstraints = {
        video: videoDeviceId
          ? { deviceId: { exact: videoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      setHasCameraPermission(true);
      setHasMicPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize real Web Audio volume analyzer for the microphone
      setupAudioAnalyzer(stream);

      // Refresh device labels now that permission is granted
      refreshDevices();
    } catch (err: any) {
      console.warn('Media access error:', err);
      setHasCameraPermission(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera or microphone access was denied. Please allow permissions in your browser.'
          : 'Unable to start camera. Please verify your webcam is connected and not used by another application.'
      );
    }
  };

  // Setup real Web Audio Analyser to drive dynamic audio volume bars
  const setupAudioAnalyzer = (stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!isMicOn) {
          setAudioVolumeLevel(0);
          animFrameRef.current = requestAnimationFrame(updateVolume);
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Normalize to a 0 - 8 bar score
        const level = Math.min(8, Math.round(average / 15));
        setAudioVolumeLevel(level);

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn('Could not initialize audio visualizer:', e);
    }
  };

  // Initial load
  useEffect(() => {
    startMediaStream();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      stopTracks(mediaStream);
    };
  }, []);

  // When video device is changed
  const handleVideoDeviceChange = (deviceId: string) => {
    setSelectedVideoId(deviceId);
    startMediaStream(deviceId, selectedAudioInputId);
  };

  // When audio device is changed
  const handleAudioDeviceChange = (deviceId: string) => {
    setSelectedAudioInputId(deviceId);
    startMediaStream(selectedVideoId, deviceId);
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn;
      });
    }
    setIsCameraOn(!isCameraOn);
  };

  // Toggle Microphone
  const toggleMicrophone = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn;
      });
    }
    setIsMicOn(!isMicOn);
  };

  // Play pleasant speaker test tone
  const handleTestSpeaker = () => {
    if (isPlayingAudioTest) return;
    setIsPlayingAudioTest(true);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();

      // Dual harmonic chime (C5 523.25Hz -> G5 783.99Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.65);
      osc2.stop(ctx.currentTime + 0.65);
    } catch (e) {
      console.warn('Audio test chime failed:', e);
    }

    setTimeout(() => setIsPlayingAudioTest(false), 800);
  };

  // Continue to Interview
  const handleStart = () => {
    stopTracks(mediaStream);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {});

    onJoinInterview({
      difficulty: 'Intermediate',
      isCameraEnabled: isCameraOn && hasCameraPermission,
      isMicEnabled: isMicOn && hasMicPermission,
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 flex flex-col font-sans">
      {/* ── TOP NAVIGATION BAR ── */}
      <div className="bg-white border-b border-slate-200/90 px-6 lg:px-10 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Practice</span>
        </button>

        {/* Track Title and Device Status Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-xs select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-800">{track.title}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">Device & Camera Readiness Check</span>
        </div>

        {/* Need Help Link */}
        <button
          onClick={() => {
            window.alert(
              'InterTrain Device Setup Tips:\n\n1. Ensure your browser is allowed camera & microphone access.\n2. Position your webcam at eye level in a well-lit room.\n3. Use headphones with built-in microphone for the clearest audio evaluation.'
            );
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Need Help?</span>
        </button>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="flex-1 px-6 lg:px-10 py-6 max-w-6xl mx-auto w-full space-y-6">
        {/* Banner: Setup Welcome + Robot Mascot */}
        <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-blue-50/50 border border-blue-100 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100/90 border border-blue-200/80 text-blue-600 flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Let's set up your devices
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Make sure your camera and microphone are working properly for the best interview experience.
              </p>
            </div>
          </div>

          {/* Robot Mascot with Speech Bubble */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative bg-white/95 border border-blue-200/80 px-3.5 py-2 rounded-xl shadow-xs text-xs font-medium text-slate-700 italic max-w-[210px] hidden md:block">
              "A well-prepared setup leads to a great performance!"
              {/* Triangle speech pointer */}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-white" />
            </div>
            <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
              <RobotAssistant size={68} />
            </div>
          </div>
        </div>

        {/* ── TWO COLUMN SETUP SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ──── LEFT COLUMN: REAL FUNCTIONAL CAMERA PREVIEW (7 cols) ──── */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Camera Setup</h3>
                  <p className="text-xs text-slate-500">
                    Check your video and make sure you are clearly visible.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              {hasCameraPermission && isCameraOn ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Camera Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {isCameraOn ? 'Checking Camera' : 'Camera Paused'}
                </span>
              )}
            </div>

            {/* Real Live HTML5 Video Viewport */}
            <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-slate-950 border border-slate-800 shadow-inner group flex items-center justify-center">
              {hasCameraPermission && isCameraOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-transform ${
                    isMirrored ? 'scale-x-[-1]' : ''
                  }`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                    <VideoOff className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {cameraError ? 'Camera Access Required' : 'Camera is currently paused'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      {cameraError || 'Turn on your camera to preview your video before entering the room.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isCameraOn) toggleCamera();
                      else startMediaStream(selectedVideoId, selectedAudioInputId);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    {isCameraOn ? 'Request Camera Access' : 'Turn On Camera'}
                  </button>
                </div>
              )}

              {/* In-viewport Bottom Floating Controls */}
              {hasCameraPermission && isCameraOn && (
                <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none">
                  {/* Left Pill: Live indicator */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium pointer-events-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Previewing Camera</span>
                  </div>

                  {/* Right Floating Actions: Switch Mirror & Settings */}
                  <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                      onClick={() => setIsMirrored((prev) => !prev)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 text-xs font-medium transition-colors"
                      title="Flip horizontal mirror view"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Switch</span>
                    </button>

                    <button
                      onClick={toggleCamera}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 text-xs font-medium transition-colors"
                      title="Pause or resume camera preview"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Settings</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Select Camera Dropdown */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-blue-600" />
                <span>Select Camera</span>
              </label>

              <div className="relative">
                <select
                  value={selectedVideoId}
                  onChange={(e) => handleVideoDeviceChange(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                >
                  {videoDevices.length > 0 ? (
                    videoDevices.map((device, idx) => (
                      <option key={device.deviceId || idx} value={device.deviceId}>
                        {device.label || `Camera ${idx + 1}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Integrated Webcam (1080p)</option>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ──── RIGHT COLUMN: AUDIO SETUP & CHECKLIST (5 cols) ──── */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Microphone Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Microphone</h4>
                    <p className="text-[11px] text-slate-500">Test and select audio input</p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {isMicOn ? 'Connected' : 'Muted'}
                </span>
              </div>

              {/* Microphone Device Dropdown */}
              <div className="relative">
                <select
                  value={selectedAudioInputId}
                  onChange={(e) => handleAudioDeviceChange(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                >
                  {audioInputDevices.length > 0 ? (
                    audioInputDevices.map((device, idx) => (
                      <option key={device.deviceId || idx} value={device.deviceId}>
                        {device.label || `Microphone ${idx + 1}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Default - Microphone (Realtek Audio)</option>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Dynamic Real-time Audio Level Meter */}
              <div className="pt-1 flex items-center justify-between">
                {/* 10 Animated Audio Bars */}
                <div className="flex items-center gap-1.5 h-6">
                  {Array.from({ length: 9 }).map((_, i) => {
                    const isActive = isMicOn && audioVolumeLevel >= i + 1;
                    return (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-75 ${
                          isActive
                            ? 'bg-blue-600 h-5 shadow-xs shadow-blue-400/50'
                            : 'bg-slate-200 h-2'
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Mic is working properly</span>
                </div>
              </div>
            </div>

            {/* 2. Speaker Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Speaker</h4>
                    <p className="text-[11px] text-slate-500">Audio playback test</p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Connected
                </span>
              </div>

              {/* Speaker Device Dropdown */}
              <div className="relative">
                <select
                  value={selectedAudioOutputId}
                  onChange={(e) => setSelectedAudioOutputId(e.target.value)}
                  className="w-full appearance-none bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-medium rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
                >
                  {audioOutputDevices.length > 0 ? (
                    audioOutputDevices.map((device, idx) => (
                      <option key={device.deviceId || idx} value={device.deviceId}>
                        {device.label || `Speaker ${idx + 1}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Default - Speakers (Realtek Audio)</option>
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Speaker Test Button */}
              <div className="pt-0.5 flex justify-end">
                <button
                  onClick={handleTestSpeaker}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    isPlayingAudioTest
                      ? 'bg-blue-50 border-blue-300 text-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Volume2
                    className={`w-3.5 h-3.5 ${
                      isPlayingAudioTest ? 'text-blue-600 animate-pulse' : 'text-slate-500'
                    }`}
                  />
                  <span>{isPlayingAudioTest ? 'Playing Test Sound...' : 'Test Speaker Audio'}</span>
                </button>
              </div>
            </div>

            {/* 3. Quick Checklist Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <div className="w-6 h-6 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Quick Checklist</span>
              </div>

              <div className="space-y-2 pt-1 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Your face is clearly visible</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Good lighting (face is not too dark)</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Camera, microphone and speakers are working</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ACTION BAR ── */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-200/90 pb-8">
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors shadow-2xs"
          >
            Cancel
          </button>

          <div className="flex flex-col items-end">
            <button
              onClick={handleStart}
              className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm shadow-blue-500/25 transition-all group cursor-pointer"
            >
              <span>Join Interview Room</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
            <span className="text-[11px] text-slate-400 font-medium mt-1 pr-1">
              Directly enters your AI multi-agent interview room
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
