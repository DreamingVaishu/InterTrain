import { useState } from 'react';
import { Search, Play, Clock, Sparkles, Code2, Users } from 'lucide-react';
import { PracticeTrack } from '../types';

interface PracticesViewProps {
  tracks: PracticeTrack[];
  onSelectTrack: (track: PracticeTrack) => void;
}

export function PracticesView({ tracks, onSelectTrack }: PracticesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredTracks = tracks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.topics.some((topic) => topic.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDifficulty =
      selectedDifficulty === 'all' || t.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-[#DCDFE2] text-neutral-900 p-6 md:p-10 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Welcome back header */}
        <header className="mb-8">
          <p className="text-xl md:text-2xl font-medium text-neutral-800">
            Welcome back!
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight mt-1 font-sans">
            Billu badmash
          </h1>
        </header>

        {/* Large Prominent Pill Search Bar from screenshot */}
        <div className="mb-10 max-w-xl">
          <div className="relative flex items-center shadow-xs">
            <Search className="w-5 h-5 absolute left-5 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              id="practices-search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search practices, roles, or topics..."
              className="w-full bg-white text-neutral-900 placeholder-neutral-500 text-base pl-14 pr-6 py-4 rounded-full border border-neutral-300/80 focus:outline-hidden focus:ring-2 focus:ring-[#0c3e74]/20 focus:border-[#0c3e74] transition-all"
            />
          </div>

          {/* Quick difficulty pills */}
          <div className="flex items-center gap-2 mt-4 px-2">
            <span className="text-xs font-semibold text-neutral-600 mr-1">Filter:</span>
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedDifficulty(lvl)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  selectedDifficulty === lvl
                    ? 'bg-[#0c3e74] text-white shadow-xs'
                    : 'bg-white/80 text-neutral-700 hover:bg-white border border-neutral-300/60'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Practice Cards matching Screenshot 2 & 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredTracks.map((track, idx) => (
            <div
              key={track.id}
              id={`practice-card-${track.id}`}
              onClick={() => onSelectTrack(track)}
              className="group bg-white rounded-3xl p-7 shadow-sm border border-neutral-200/80 hover:shadow-xl hover:border-blue-400/50 transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-2xl font-bold text-neutral-900 tracking-tight group-hover:text-[#0c3e74] transition-colors">
                    {track.title}
                  </h3>
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200/60">
                    {track.difficulty}
                  </span>
                </div>

                {/* Skeleton preview lines matching the screenshot visual design */}
                <div className="space-y-2 my-4">
                  <div className="h-3 bg-neutral-200/90 rounded-full w-4/5" />
                  <div className="h-3 bg-neutral-200/70 rounded-full w-full" />
                  <div className="h-3 bg-neutral-200/50 rounded-full w-2/3" />
                </div>

                <p className="text-sm text-neutral-600 mt-3 line-clamp-2">
                  {track.description}
                </p>

                {/* Topics pills */}
                <div className="flex flex-wrap gap-1.5 mt-5">
                  {track.topics.slice(0, 3).map((topic, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-700"
                    >
                      {topic}
                    </span>
                  ))}
                  {track.topics.length > 3 && (
                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-500">
                      +{track.topics.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-neutral-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    {track.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    Gemini & Claude
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTrack(track);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c3e74] group-hover:bg-[#082e56] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTracks.length === 0 && (
          <div className="text-center py-16 bg-white/60 rounded-3xl border border-neutral-200 mt-4">
            <Search className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <p className="text-lg font-bold text-neutral-800">No practice tracks found</p>
            <p className="text-sm text-neutral-600 mt-1">Try clearing your search query or difficulty filter.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDifficulty('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0c3e74] text-white text-xs font-semibold"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
