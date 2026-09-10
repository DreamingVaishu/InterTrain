import { useState } from 'react';
import { Folder, RotateCcw, Award, CheckCircle2, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { HistoryFolder } from '../types';

interface AttemptReviewViewProps {
  folder: HistoryFolder;
  onBack: () => void;
  onStartAgain: (folderTitle: string) => void;
}

export function AttemptReviewView({
  folder,
  onBack,
  onStartAgain,
}: AttemptReviewViewProps) {
  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState(0);

  const currentAttempt =
    folder.attempts[selectedAttemptIndex] || folder.attempts[0];

  return (
    <div className="min-h-screen bg-[#DCDFE2] text-neutral-900 p-6 md:p-10 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-neutral-300/80 transition-colors text-neutral-700"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Blue folder icon from screenshot */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1d4f80] to-[#2c6da8] flex items-center justify-center text-white shadow-sm">
              <Folder className="w-5 h-5 fill-current" />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight font-sans">
              {folder.title}
            </h1>
          </div>

          {/* Red Pill 'Start again' button from screenshot */}
          <button
            id="start-again-btn"
            onClick={() => onStartAgain(folder.title)}
            className="flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] active:scale-98 text-white font-bold text-base shadow-md transition-all cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start again</span>
          </button>
        </div>

        {/* Attempt Selector Pills */}
        <div className="flex items-center gap-2 mb-6 pl-14">
          <span className="text-sm font-semibold text-neutral-600">
            #{folder.attempts.length > 1 ? 'Select Attempt:' : 'Attempt 1'}
          </span>
          {folder.attempts.map((att, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedAttemptIndex(idx)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedAttemptIndex === idx
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-200/80 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              #Attempt {att.attemptNumber}
            </button>
          ))}
          <span className="text-xs text-neutral-500 ml-2">
            ({currentAttempt.date})
          </span>
        </div>

        {/* Main Review Card matching Screenshot 3 */}
        <div className="bg-white rounded-3xl p-6 md:p-8 lg:p-10 shadow-sm border border-neutral-200/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Questions & Responses Timeline */}
            <div className="lg:col-span-7 space-y-8">
              {currentAttempt.questions.map((item, index) => (
                <div key={item.id || index} className="flex items-start gap-4">
                  {/* Circular placeholder/avatar marker from screenshot */}
                  <div className="w-10 h-10 rounded-full bg-neutral-300 shrink-0 mt-1 flex items-center justify-center text-neutral-600 font-bold text-sm shadow-inner">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Question text */}
                    <h3 className="text-base md:text-lg font-bold text-neutral-900 leading-snug">
                      {item.question}
                    </h3>

                    {/* User Response Section */}
                    <div className="mt-2.5 bg-neutral-50/80 rounded-2xl p-4 border border-neutral-200/60">
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                        Your Response
                      </p>
                      <p className="text-sm md:text-[15px] text-neutral-800 leading-relaxed font-sans whitespace-pre-wrap">
                        {item.response}
                      </p>

                      {item.feedback && (
                        <div className="mt-3 pt-2.5 border-t border-neutral-200/60 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-neutral-600">
                            <span className="font-semibold text-neutral-800">Evaluator Note: </span>
                            {item.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: InterTrain Final Summery + Results */}
            <div className="lg:col-span-5 space-y-6">
              {/* Dark Slate Blue Final Summary Card from screenshot */}
              <div className="bg-[#26445e] text-white rounded-2xl p-6 shadow-md border border-[#3b6387]/40">
                {/* Header with graduation cap icon */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      className="w-4 h-4 text-blue-200"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-white">
                    InterTrain Final Summery
                  </h3>
                </div>

                {/* Main verdict paragraph from screenshot */}
                <p className="text-sm text-neutral-200 leading-relaxed mb-6 font-sans">
                  {currentAttempt.finalSummary}
                </p>

                {/* Tips to improve */}
                <div className="pt-4 border-t border-white/15">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                    <span>Here are Tips to improve</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {currentAttempt.tips.map((tip, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-blue-100/90 leading-normal"
                      >
                        <span className="text-blue-300 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Results Breakdown Section */}
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-bold text-neutral-900">
                    Results
                  </h4>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    Overall {currentAttempt.metrics.overallScore}%
                  </span>
                </div>

                {/* Metric bars */}
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                      <span>Confidence Level</span>
                      <span>{currentAttempt.metrics.confidence}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${currentAttempt.metrics.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                      <span>Technical Precision</span>
                      <span>{currentAttempt.metrics.technicalAccuracy}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${currentAttempt.metrics.technicalAccuracy}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                      <span>Answer Structure & STAR</span>
                      <span>{currentAttempt.metrics.conciseness}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${currentAttempt.metrics.conciseness}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Ready to beat your score?</span>
                  <button
                    onClick={() => onStartAgain(folder.title)}
                    className="text-xs font-bold text-[#0c3e74] hover:underline flex items-center gap-1"
                  >
                    Retake interview <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
