import { useState } from 'react';
import { X, Sliders, Mic, Video, Volume2, Sparkles, Check, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
}

export function SettingsModal({ isOpen, onClose, onResetData }: SettingsModalProps) {
  const [interviewerStyle, setInterviewerStyle] = useState<'rigorous' | 'balanced' | 'supportive'>('rigorous');
  const [enableVoiceSynth, setEnableVoiceSynth] = useState(true);
  const [autoStartTimer, setAutoStartTimer] = useState(true);
  const [didReset, setDidReset] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-[#1a1a1a] text-neutral-100 rounded-3xl border border-neutral-800 shadow-2xl p-6 md:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-bold text-white">InterTrain Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 py-6 text-sm">
          {/* Interviewer Rigor */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
              Interviewer Evaluation Rigor
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['supportive', 'balanced', 'rigorous'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setInterviewerStyle(style)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                    interviewerStyle === style
                      ? 'bg-[#0c3e74] border-blue-500 text-white'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-500 mt-2">
              Rigorous mode applies strict grading on filler words, technical depth, and metrics.
            </p>
          </div>

          {/* Audio & Timer Settings */}
          <div className="space-y-3 pt-4 border-t border-neutral-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-neutral-300">Speech Synthesis (Read questions aloud)</span>
              <input
                type="checkbox"
                checked={enableVoiceSynth}
                onChange={(e) => setEnableVoiceSynth(e.target.checked)}
                className="w-4 h-4 accent-[#0c3e74] rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-neutral-300">Auto-start 5:00 interview timer</span>
              <input
                type="checkbox"
                checked={autoStartTimer}
                onChange={(e) => setAutoStartTimer(e.target.checked)}
                className="w-4 h-4 accent-[#0c3e74] rounded"
              />
            </label>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-neutral-300 font-semibold text-xs">Reset Demo History</p>
              <p className="text-[11px] text-neutral-500">Restore default attempts and folders</p>
            </div>
            <button
              onClick={() => {
                onResetData();
                setDidReset(true);
                setTimeout(() => setDidReset(false), 2000);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 font-semibold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{didReset ? 'Restored!' : 'Reset'}</span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#0c3e74] hover:bg-[#0a3360] text-white text-xs font-bold"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
