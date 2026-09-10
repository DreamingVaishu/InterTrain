import { Plus } from 'lucide-react';
import { HistoryFolder } from '../types';
import { FolderCard } from './FolderCard';
import { GraduationWatermark } from './GraduationWatermark';

interface HomeViewProps {
  folders: HistoryFolder[];
  onSelectFolder: (folderId: string) => void;
  onStartPractice: () => void;
}

export function HomeView({ folders, onSelectFolder, onStartPractice }: HomeViewProps) {
  return (
    <div className="relative min-h-screen bg-[#DCDFE2] text-neutral-900 p-6 md:p-10 lg:p-12 overflow-hidden flex flex-col justify-between">
      {/* Background Watermark silhouette from screenshot */}
      <GraduationWatermark />

      <div className="relative z-10 max-w-7xl w-full">
        {/* Top Greeting Header */}
        <header className="mb-10">
          <p className="text-xl md:text-2xl font-medium text-neutral-800">
            Welcome back!
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight mt-1 font-sans">
            Billu badmash
          </h1>
        </header>

        {/* Primary Action Button */}
        <div className="mb-14">
          <button
            id="start-practice-hero-btn"
            onClick={onStartPractice}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl md:rounded-3xl bg-[#0c3e74] hover:bg-[#09325e] active:scale-98 text-white font-bold text-xl md:text-2xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
            <span>Start Practice</span>
          </button>
        </div>

        {/* History Folders Section */}
        <section className="mt-8">
          <h2 className="text-xl md:text-2xl font-bold text-neutral-800 mb-6 tracking-tight">
            History
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onClick={() => onSelectFolder(folder.id)}
              />
            ))}
          </div>
        </section>

        {/* Stats highlight ribbon */}
        <section className="mt-14 pt-8 border-t border-neutral-300/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/60 backdrop-blur-xs rounded-2xl p-4 border border-white/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Total Practice Rounds</span>
            <p className="text-2xl font-black text-[#0c3e74] mt-1">29 Sessions</p>
          </div>
          <div className="bg-white/60 backdrop-blur-xs rounded-2xl p-4 border border-white/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Avg. Confidence</span>
            <p className="text-2xl font-black text-neutral-900 mt-1">79%</p>
          </div>
          <div className="bg-white/60 backdrop-blur-xs rounded-2xl p-4 border border-white/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">Primary Focus</span>
            <p className="text-2xl font-black text-neutral-900 mt-1">DevOps & AI</p>
          </div>
          <div className="bg-white/60 backdrop-blur-xs rounded-2xl p-4 border border-white/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">AI Interviewers</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">Gemini & Claude</p>
          </div>
        </section>
      </div>

      <footer className="relative z-10 pt-10 text-xs text-neutral-500 font-medium">
        InterTrain AI Mock Interview System • Personalized for Billu badmash
      </footer>
    </div>
  );
}
