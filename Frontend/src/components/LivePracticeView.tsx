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
  Volume2,
  Send,
  Sparkles,
  ChevronDown,
  Terminal,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { PracticeTrack, LiveNote, QuestionResponse } from '../types';

interface LivePracticeViewProps {
  track: PracticeTrack;
  onEndSession: (completedSession: {
    track: PracticeTrack;
    duration: string;
    questions: QuestionResponse[];
    code: string;
    language: string;
  }) => void;
  onExit: () => void;
}

export function LivePracticeView({
  track,
  onEndSession,
  onExit,
}: LivePracticeViewProps) {
  // Session layout mode: 'code' matches Screenshot 5 (Group 104), 'video' matches Screenshot 6 (Group 74)
  const [layoutMode, setLayoutMode] = useState<'code' | 'video'>('code');

  // Media streams
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  // Timer: starts at 5 minutes 12 seconds as in screenshot (312 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(312);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Active speaker simulation ('You' | 'Gemini' | 'Claude' | null)
  const [speakingParticipant, setSpeakingParticipant] = useState<string>('Gemini');

  // Code editor state
  const [selectedLanguage, setSelectedLanguage] = useState(track.defaultCode.language || 'python');
  const [codeContent, setCodeContent] = useState(track.defaultCode.code || '');
  const [codeOutput, setCodeOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Interview Questions & Responses
  const [currentQIndex, setCurrentQIndex] = useState(0);
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
      speaker: 'System',
      text: 'Code workspace initialized. Python 3.11 environment ready with NumPy runtime.',
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
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasCameraPermission(true);
          }
        }
      } catch {
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
          `>>> Execution output:\nOperation completed successfully.\nMemory usage: 14.2 MB | Execution time: 42ms`
        );
      }

      // Add a note from Claude reacting to the code execution
      setLiveNotes((prev) => [
        ...prev,
        {
          id: `note-${Date.now()}`,
          speaker: 'Claude',
          text: 'Code executed cleanly. The attention weights correctly sum to 1.0 along the key sequence dimension.',
          timestamp: formatTimer(secondsRemaining),
          type: 'note',
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
      setCurrentQIndex((prev) => prev + 1);
      setSpeakingParticipant(currentQIndex % 2 === 0 ? 'Claude' : 'Gemini');

      setLiveNotes((prev) => [
        ...prev,
        {
          id: `note-${Date.now()}`,
          speaker: currentQIndex % 2 === 0 ? 'Claude' : 'Gemini',
          text: `Follow-up question presented: "${track.questions[currentQIndex + 1]?.slice(0, 60)}..."`,
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
          text: 'All rounds completed! Ready to finalize attempt evaluation.',
          timestamp: formatTimer(secondsRemaining),
          type: 'tip',
        },
      ]);
    }
  };

  // End Session Handler
  const handleEnd = () => {
    // Collect questions
    const finalQuestions: QuestionResponse[] =
      recordedQA.length > 0
        ? recordedQA
        : [
            {
              id: 'live-q1',
              question: track.questions[0] || 'Introduce yourself and past experience',
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
    });
  };

  const currentQuestionText =
    track.questions[currentQIndex] || track.questions[0];

  return (
    <div className="min-h-screen bg-[#121212] text-neutral-100 flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Top Header Bar from screenshot */}
      <header className="h-14 bg-[#141414] border-b border-neutral-800 flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-3">
          {/* InterTrain Brand */}
          <span className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            InterTrain
          </span>
          <span className="text-neutral-500 font-light">|</span>
          <span className="text-sm font-medium text-neutral-300 truncate max-w-xs md:max-w-xl">
            {track.title}
          </span>
        </div>

        {/* View Layout Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLayoutMode(layoutMode === 'code' ? 'video' : 'code')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700/50"
            title="Toggle between Code Workspace & Full Video"
          >
            {layoutMode === 'code' ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Video Stage View</span>
              </>
            ) : (
              <>
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Code Editor View</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Grid: Left Column (Participants) + Center Area (Editor or Video) + Right Column (Summary) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Stacked Participant Boxes from Screenshot 5 */}
        <div className="lg:col-span-2 bg-[#121212] p-3 flex flex-col gap-3 border-r border-neutral-800 shrink-0">
          {/* Participant 1: "You" */}
          <div className="relative flex-1 min-h-[140px] rounded-xl bg-[#616161] border border-neutral-700 overflow-hidden flex flex-col justify-end p-3 shadow-inner group">
            {hasCameraPermission && !isCameraOff ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-600">
                <div className="w-12 h-12 rounded-full bg-neutral-500/80 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                  You
                </div>
                {isCameraOff && (
                  <span className="text-[10px] text-neutral-300 mt-1">Camera Off</span>
                )}
              </div>
            )}

            {/* Speaking audio wave indicator if user active */}
            {!isMicMuted && (
              <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse delay-75" />
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-150" />
              </div>
            )}

            {/* Label in bottom-left */}
            <span className="relative z-10 text-xs font-semibold text-white/90 drop-shadow-md">
              You
            </span>
          </div>

          {/* Participant 2: "Gemini" */}
          <div
            className={`relative flex-1 min-h-[140px] rounded-xl bg-[#616161] border overflow-hidden flex flex-col justify-end p-3 transition-all ${
              speakingParticipant === 'Gemini'
                ? 'border-blue-400/80 ring-2 ring-blue-500/30'
                : 'border-neutral-700'
            }`}
          >
            {/* Ambient animated avatar inside Gemini tile */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#4a4a4a] to-[#3a3a3a]">
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1a73e8] to-[#4285f4] flex items-center justify-center shadow-lg transition-transform ${
                    speakingParticipant === 'Gemini' ? 'scale-105' : 'scale-95 opacity-85'
                  }`}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                {speakingParticipant === 'Gemini' && (
                  <span className="absolute -inset-1 rounded-2xl border-2 border-blue-400 animate-ping opacity-30" />
                )}
              </div>

              {speakingParticipant === 'Gemini' && (
                <span className="text-[11px] text-blue-200 mt-2 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Speaking...
                </span>
              )}
            </div>

            {/* Label */}
            <span className="relative z-10 text-xs font-semibold text-white/90 drop-shadow-md">
              Gemini
            </span>
          </div>

          {/* Participant 3: "Claude" */}
          <div
            className={`relative flex-1 min-h-[140px] rounded-xl bg-[#616161] border overflow-hidden flex flex-col justify-end p-3 transition-all ${
              speakingParticipant === 'Claude'
                ? 'border-amber-400/80 ring-2 ring-amber-500/30'
                : 'border-neutral-700'
            }`}
          >
            {/* Ambient avatar inside Claude tile */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#4a4a4a] to-[#3a3a3a]">
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c2410c] to-[#ea580c] flex items-center justify-center shadow-lg transition-transform ${
                    speakingParticipant === 'Claude' ? 'scale-105' : 'scale-95 opacity-85'
                  }`}
                >
                  <span className="text-white text-base font-black">C</span>
                </div>
                {speakingParticipant === 'Claude' && (
                  <span className="absolute -inset-1 rounded-2xl border-2 border-amber-400 animate-ping opacity-30" />
                )}
              </div>

              {speakingParticipant === 'Claude' && (
                <span className="text-[11px] text-amber-200 mt-2 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Speaking...
                </span>
              )}
            </div>

            {/* Label */}
            <span className="relative z-10 text-xs font-semibold text-white/90 drop-shadow-md">
              Claude
            </span>
          </div>
        </div>

        {/* Center Area: Code Editor & Console (Screenshot 5) OR Full Video (Screenshot 6) */}
        <div className="lg:col-span-7 bg-[#1c1c1c] flex flex-col overflow-hidden border-r border-neutral-800">
          {layoutMode === 'code' ? (
            <>
              {/* Question Banner */}
              <div className="bg-[#242424] px-5 py-3.5 border-b border-neutral-800 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0c3e74] text-white text-[11px] font-bold mt-0.5">
                    Q{currentQIndex + 1}/{track.questions.length}
                  </span>
                  <p className="text-sm font-semibold text-neutral-200 leading-snug">
                    {currentQuestionText}
                  </p>
                </div>
              </div>

              {/* Code Editor Top Bar matching Screenshot 5 */}
              <div className="bg-[#181818] px-4 py-2 border-b border-neutral-800/80 flex items-center justify-between">
                {/* Language Dropdown (e.g. "Python v") */}
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

                {/* Run Button with magenta/purple pill badge from screenshot */}
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

              {/* Code Editor Workspace with Line Numbers */}
              <div className="flex-1 flex overflow-hidden bg-[#161616] font-mono text-xs md:text-sm">
                {/* Line numbers column */}
                <div className="w-12 py-3 px-2 select-none text-neutral-600 bg-[#161616] border-r border-neutral-800/60 text-right leading-6 font-medium">
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
                  className="flex-1 p-3 bg-transparent text-neutral-200 resize-none focus:outline-hidden leading-6 font-mono selection:bg-blue-900/60 scrollbar-thin scrollbar-thumb-neutral-700"
                />
              </div>

              {/* Output Console / Interactive Verbal Response Section */}
              <div className="h-44 bg-[#1a1a1a] border-t border-neutral-800 flex flex-col shrink-0">
                <div className="px-4 py-1.5 bg-[#141414] border-b border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Terminal className="w-3.5 h-3.5 text-neutral-500" />
                    Console & Your Spoken Answer
                  </span>
                  {codeOutput && (
                    <button
                      onClick={() => setCodeOutput('')}
                      className="text-[11px] text-neutral-500 hover:text-neutral-300"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-emerald-400/90 whitespace-pre-wrap">
                  {codeOutput || (
                    <span className="text-neutral-600 italic">
                      Click 'Run' to execute code against unit tests, or speak/type your answer below.
                    </span>
                  )}
                </div>

                {/* Answer prompt input */}
                <div className="p-2.5 bg-[#161616] border-t border-neutral-800 flex items-center gap-2">
                  <input
                    type="text"
                    id="user-answer-input"
                    value={userSpeechInput}
                    onChange={(e) => setUserSpeechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubmitResponse();
                    }}
                    placeholder="Type your response to Gemini & Claude..."
                    className="flex-1 bg-[#222] text-neutral-200 text-xs px-3.5 py-2 rounded-xl border border-neutral-700/60 focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    onClick={handleSubmitResponse}
                    disabled={!userSpeechInput.trim()}
                    className="px-3 py-2 rounded-xl bg-[#0c3e74] hover:bg-[#0a3360] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <span>Reply</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Screenshot 6 (Group 74) Full Video Stage */
            <div className="flex-1 bg-[#1a1a1a] p-6 flex flex-col justify-between items-center relative overflow-hidden">
              <div className="w-full max-w-2xl flex-1 rounded-2xl bg-[#595959] border border-neutral-700 flex flex-col justify-end p-6 relative overflow-hidden shadow-2xl">
                {hasCameraPermission && !isCameraOff ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#444] to-[#2c2c2c]">
                    <div className="w-20 h-20 rounded-full bg-neutral-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      Billu
                    </div>
                    <p className="text-sm text-neutral-300 mt-2 font-medium">
                      Camera Stream Active
                    </p>
                  </div>
                )}
                <span className="relative z-10 text-sm font-bold text-white drop-shadow-md">
                  You
                </span>
              </div>

              {/* Active question banner in video mode */}
              <div className="w-full max-w-2xl mt-4 bg-neutral-900/90 backdrop-blur-md rounded-2xl p-4 border border-neutral-800 text-center">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                  Current Question from {speakingParticipant}
                </p>
                <p className="text-sm font-medium text-neutral-200">
                  {currentQuestionText}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Warm Cream "Summary" Sidebar (Screenshot 5 & 6) */}
        <div className="lg:col-span-3 bg-[#F6F4EB] text-neutral-900 p-6 flex flex-col justify-between overflow-y-auto border-l border-neutral-300">
          <div>
            {/* Header: Summary */}
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight mb-6 font-sans">
              Summary
            </h2>

            {/* Note Cards Stack matching Screenshot 5 & 6 */}
            <div className="space-y-4">
              {liveNotes.map((note, index) => {
                const isPrimary = index === 0;

                return (
                  <div
                    key={note.id}
                    className={`rounded-2xl p-4.5 transition-all shadow-xs ${
                      isPrimary
                        ? 'bg-[#566c7b] text-white shadow-sm'
                        : 'bg-[#cfd4d8] text-neutral-800'
                    }`}
                  >
                    {/* Circle marker on top left matching screenshot */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-4 h-4 rounded-full ${
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
          <div className="mt-8 pt-4 border-t border-neutral-300/80">
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

      {/* Bottom Bar matching Screenshot 5 & 6 */}
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
            className="text-xs text-neutral-500 hover:text-neutral-300 underline"
          >
            {isTimerRunning ? 'Pause' : 'Resume'}
          </button>
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-2">
          {/* Mute Button */}
          <button
            onClick={() => setIsMicMuted(!isMicMuted)}
            className={`p-3 rounded-full transition-all ${
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
            onClick={() => setIsCameraOff(!isCameraOff)}
            className={`p-3 rounded-full transition-all ${
              isCameraOff
                ? 'bg-red-600/80 text-white hover:bg-red-700'
                : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
            }`}
            title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>
        </div>

        {/* Coral/Red Pill 'End' Button from screenshot */}
        <div>
          <button
            id="end-session-btn"
            onClick={handleEnd}
            className="px-8 py-2.5 rounded-full bg-[#f84949] hover:bg-[#e03838] active:scale-98 text-white font-bold text-base shadow-lg transition-all cursor-pointer"
          >
            End
          </button>
        </div>
      </footer>
    </div>
  );
}
