import { TrendingUp, Award, CheckCircle, BarChart3, Target, Calendar } from 'lucide-react';
import { HistoryFolder } from '../types';

interface AnalyticsViewProps {
  folders: HistoryFolder[];
  onSelectFolder: (folderId: string) => void;
}

export function AnalyticsView({ folders, onSelectFolder }: AnalyticsViewProps) {
  const allAttempts = folders.flatMap((f) => f.attempts);
  const totalRounds = folders.reduce((acc, f) => acc + f.count, 0);

  const avgConfidence = Math.round(
    allAttempts.reduce((acc, a) => acc + a.metrics.confidence, 0) / (allAttempts.length || 1)
  );
  const avgTechnical = Math.round(
    allAttempts.reduce((acc, a) => acc + a.metrics.technicalAccuracy, 0) / (allAttempts.length || 1)
  );
  const avgOverall = Math.round(
    allAttempts.reduce((acc, a) => acc + a.metrics.overallScore, 0) / (allAttempts.length || 1)
  );

  return (
    <div className="min-h-screen bg-[#DCDFE2] text-neutral-900 p-6 md:p-10 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <p className="text-xl md:text-2xl font-medium text-neutral-800">
            Performance & Insights
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight mt-1 font-sans">
            Analytics Overview
          </h1>
        </header>

        {/* Top Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200/80">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Practice Rounds</span>
            <p className="text-4xl font-extrabold text-[#0c3e74] mt-2">{totalRounds}</p>
            <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +4 this week
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200/80">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Avg. Overall Score</span>
            <p className="text-4xl font-extrabold text-neutral-900 mt-2">{avgOverall}%</p>
            <p className="text-xs text-emerald-600 mt-2 font-medium">Rank: Top 15%</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200/80">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Avg. Technical Precision</span>
            <p className="text-4xl font-extrabold text-neutral-900 mt-2">{avgTechnical}%</p>
            <p className="text-xs text-blue-600 mt-2 font-medium">Strongest in Backend</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200/80">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Verbal Confidence</span>
            <p className="text-4xl font-extrabold text-neutral-900 mt-2">{avgConfidence}%</p>
            <p className="text-xs text-amber-600 mt-2 font-medium">Focus area for growth</p>
          </div>
        </div>

        {/* Breakdown by Domain / Folder */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-200/80 mb-10">
          <h3 className="text-xl font-bold text-neutral-900 mb-6">
            Readiness by Role Domain
          </h3>

          <div className="space-y-6">
            {folders.map((folder) => {
              const latestAttempt = folder.attempts[folder.attempts.length - 1];
              const score = latestAttempt?.metrics.overallScore || 70;

              return (
                <div
                  key={folder.id}
                  onClick={() => onSelectFolder(folder.id)}
                  className="group p-4 rounded-2xl bg-neutral-50 hover:bg-blue-50/50 border border-neutral-200/60 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-bold text-neutral-900 group-hover:text-[#0c3e74]">
                        {folder.title}
                      </h4>
                      <span className="text-xs text-neutral-500 font-medium">
                        ({folder.count} sessions completed)
                      </span>
                    </div>
                    <span className="text-sm font-bold text-neutral-900">
                      {score}% Score
                    </span>
                  </div>

                  <div className="w-full bg-neutral-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${
                        score >= 80
                          ? 'bg-emerald-600'
                          : score >= 65
                          ? 'bg-[#0c3e74]'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <p className="text-xs text-neutral-500 mt-2 line-clamp-1">
                    {latestAttempt?.finalSummary || folder.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
