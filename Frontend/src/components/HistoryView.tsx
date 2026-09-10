import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  BarChart3,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { HistoryFolder, AttemptReview } from '../types';

interface HistoryViewProps {
  folders: HistoryFolder[];
  onSelectFolder: (folderId: string) => void;
  onStartPractice: () => void;
}

interface FlattenedAttempt {
  folderId: string;
  folderTitle: string;
  attempt: AttemptReview;
}

export function HistoryView({
  folders,
  onSelectFolder,
  onStartPractice,
}: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Gather all attempts across all folders
  const allAttempts: FlattenedAttempt[] = useMemo(() => {
    const list: FlattenedAttempt[] = [];
    folders.forEach((folder) => {
      folder.attempts.forEach((attempt) => {
        list.push({
          folderId: folder.id,
          folderTitle: folder.title,
          attempt,
        });
      });
    });
    // Sort by attempt number / date descending
    return list.sort((a, b) => b.attempt.attemptNumber - a.attempt.attemptNumber);
  }, [folders]);

  // Filtered attempts
  const filteredAttempts = useMemo(() => {
    return allAttempts.filter(({ folderId, folderTitle, attempt }) => {
      if (selectedFilter !== 'all' && folderId !== selectedFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          folderTitle.toLowerCase().includes(q) ||
          attempt.role.toLowerCase().includes(q) ||
          attempt.finalSummary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allAttempts, selectedFilter, searchQuery]);

  // Calculate high-level summary metrics
  const totalAttempts = allAttempts.length;
  const averageScore = totalAttempts > 0
    ? Math.round(
        allAttempts.reduce((acc, curr) => acc + curr.attempt.metrics.overallScore, 0) /
          totalAttempts
      )
    : 0;

  const highestScore = totalAttempts > 0
    ? Math.max(...allAttempts.map((a) => a.attempt.metrics.overallScore))
    : 0;

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 pb-16">
      {/* ── TOP HEADER BAR ── */}
      <header className="sticky top-0 z-20 bg-[#F4F6F9]/90 backdrop-blur-md px-6 lg:px-10 py-4 flex items-center justify-between gap-4 border-b border-slate-200/80">
        <div className="relative flex-1 max-w-2xl">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search interview history by role, topic, or feedback..."
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-sm pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
      </header>

      {/* ── MAIN HISTORY CONTAINER ── */}
      <main className="px-6 lg:px-10 pt-6 space-y-7 max-w-7xl mx-auto">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <History className="w-5 h-5" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Interview History
                </h1>
              </div>
              <p className="text-sm text-slate-500">
                Review past mock interviews, evaluation transcripts, and AI assessment metrics.
              </p>
            </div>

            {/* Quick Summary Badges */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center min-w-[100px]">
                <span className="text-xs font-semibold text-slate-500 block">
                  Total Sessions
                </span>
                <span className="text-xl font-black text-slate-900">
                  {totalAttempts}
                </span>
              </div>

              <div className="px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 text-center min-w-[100px]">
                <span className="text-xs font-semibold text-blue-600 block">
                  Avg. Score
                </span>
                <span className="text-xl font-black text-blue-700">
                  {averageScore}%
                </span>
              </div>

              <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center min-w-[100px]">
                <span className="text-xs font-semibold text-emerald-600 block">
                  Best Score
                </span>
                <span className="text-xl font-black text-emerald-700">
                  {highestScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Filter Pills Row */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Filter by Track:
            </span>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Tracks ({allAttempts.length})
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFilter(folder.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedFilter === folder.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {folder.title} ({folder.attempts.length})
              </button>
            ))}
          </div>
        </div>

        {/* List of Interview Attempts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-slate-800">
              Completed Interview Rounds ({filteredAttempts.length})
            </h2>
          </div>

          {filteredAttempts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <History className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">No interview history found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Complete a live interview or practice session to review your AI evaluations, scores, and performance feedback here.
                </p>
              </div>
              <button
                onClick={onStartPractice}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Start Your First Interview
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAttempts.map(({ folderId, folderTitle, attempt }) => {
                const score = attempt.metrics.overallScore;
                const scoreColor =
                  score >= 85
                    ? 'bg-emerald-500/15 text-emerald-700 border-emerald-300'
                    : score >= 70
                    ? 'bg-blue-500/15 text-blue-700 border-blue-300'
                    : 'bg-amber-500/15 text-amber-700 border-amber-300';

                return (
                  <div
                    key={`${folderId}-${attempt.attemptNumber}`}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                  >
                    {/* Left Info */}
                    <div className="space-y-2 min-w-0 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Attempt #{attempt.attemptNumber}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {attempt.date}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-semibold text-blue-600">
                          {folderTitle}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                        {attempt.role}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {attempt.finalSummary}
                      </p>

                      {/* Performance Indicators */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-slate-700">Confidence:</span> {attempt.metrics.confidence}%
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-slate-700">Tech Accuracy:</span> {attempt.metrics.technicalAccuracy}%
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-slate-700">Conciseness:</span> {attempt.metrics.conciseness}%
                        </span>
                      </div>
                    </div>

                    {/* Right Score & Action */}
                    <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      {/* Overall Score Badge */}
                      <div className="text-center px-4 py-2 rounded-xl border bg-slate-50 border-slate-200">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          Score
                        </span>
                        <span className="text-xl font-black text-slate-900">
                          {attempt.metrics.overallScore}%
                        </span>
                      </div>

                      {/* Review Action */}
                      <button
                        type="button"
                        onClick={() => onSelectFolder(folderId)}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer group-hover:bg-blue-600"
                      >
                        <span>View Review</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
