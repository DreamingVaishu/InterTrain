import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  ArrowRight,
  Bookmark,
  Flame,
  Clock,
  BarChart3,
  Database,
  Code2,
  Boxes,
  Network,
  Atom,
  HelpCircle,
} from 'lucide-react';
import { PracticeTrack } from '../types';
import { RobotAssistant } from '../components/RobotAssistant';

interface PracticesViewProps {
  tracks: PracticeTrack[];
  onSelectTrack: (track: PracticeTrack) => void;
  onViewProgress?: () => void;
  userName?: string;
}

interface PracticeCardItem {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionType: 'MCQ' | 'Coding' | 'Short Answer' | 'System Design' | 'Scenario Based';
  questionsCount: number;
  durationMinutes: number;
  description: string;
  iconType: 'docker' | 'sql' | 'api' | 'react' | 'system-design' | 'dsa';
  iconBg: string;
  iconColor: string;
}

const DEFAULT_PRACTICE_SETS: PracticeCardItem[] = [
  {
    id: 'docker-basics',
    title: 'Docker Basics',
    category: 'DevOps',
    difficulty: 'Beginner',
    questionType: 'Scenario Based',
    questionsCount: 12,
    durationMinutes: 25,
    description: 'Learn core Docker concepts with hands-on questions.',
    iconType: 'docker',
    iconBg: 'bg-blue-50 border-blue-200/80',
    iconColor: 'text-blue-600',
  },
  {
    id: 'sql-joins',
    title: 'SQL Joins',
    category: 'Data Manager',
    difficulty: 'Intermediate',
    questionType: 'Coding',
    questionsCount: 15,
    durationMinutes: 30,
    description: 'Practice different types of joins with real scenarios.',
    iconType: 'sql',
    iconBg: 'bg-slate-100 border-slate-200',
    iconColor: 'text-blue-700',
  },
  {
    id: 'rest-api-dev',
    title: 'REST API Development',
    category: 'Backend',
    difficulty: 'Intermediate',
    questionType: 'Coding',
    questionsCount: 10,
    durationMinutes: 30,
    description: 'Build and test APIs with practical problems.',
    iconType: 'api',
    iconBg: 'bg-slate-100 border-slate-200',
    iconColor: 'text-slate-800',
  },
  {
    id: 'react-components',
    title: 'React Components',
    category: 'UI/UX',
    difficulty: 'Beginner',
    questionType: 'Coding',
    questionsCount: 12,
    durationMinutes: 25,
    description: 'Build modern UI components with hands-on exercises.',
    iconType: 'react',
    iconBg: 'bg-sky-50 border-sky-200/80',
    iconColor: 'text-sky-600',
  },
  {
    id: 'system-design-basics',
    title: 'System Design Basics',
    category: 'System Design',
    difficulty: 'Advanced',
    questionType: 'System Design',
    questionsCount: 8,
    durationMinutes: 45,
    description: 'Learn to design scalable systems step by step.',
    iconType: 'system-design',
    iconBg: 'bg-slate-100 border-slate-200',
    iconColor: 'text-blue-900',
  },
  {
    id: 'dsa-arrays-strings',
    title: 'DSA - Arrays & Strings',
    category: 'DSA',
    difficulty: 'Intermediate',
    questionType: 'Coding',
    questionsCount: 20,
    durationMinutes: 40,
    description: 'Solve common DSA problems with detailed solutions.',
    iconType: 'dsa',
    iconBg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
  },
];

export function PracticesView({
  tracks,
  onSelectTrack,
  onViewProgress,
}: PracticesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'Popular' | 'Duration'>('Popular');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const [bookmarkedSetIds, setBookmarkedSetIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('intertrain_practice_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const categories = [
    'All',
    'DevOps',
    'Data Manager',
    'Backend',
    'UI/UX',
    'DSA',
    'System Design',
  ];

  const trendingTopics = [
    { name: 'Docker', rank: '#1 this week', icon: Boxes, category: 'DevOps' },
    { name: 'SQL Joins', rank: '#2 this week', icon: Database, category: 'Data Manager' },
    { name: 'REST APIs', rank: '#3 this week', icon: Code2, category: 'Backend' },
    { name: 'System Design', rank: '#4 this week', icon: Network, category: 'System Design' },
    { name: 'React Basics', rank: '#5 this week', icon: Atom, category: 'UI/UX' },
  ];

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedSetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('intertrain_practice_bookmarks', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Filter and sort practice sets
  const filteredSets = useMemo(() => {
    return DEFAULT_PRACTICE_SETS.filter((set) => {
      // Category filter
      if (selectedCategory !== 'All' && set.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Bookmarked only filter
      if (showBookmarkedOnly && !bookmarkedSetIds.has(set.id)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'Duration') return a.durationMinutes - b.durationMinutes;
      return 0; // Default Popular
    });
  }, [selectedCategory, showBookmarkedOnly, bookmarkedSetIds, sortBy]);

  // Click on a practice set to start
  const handleLaunchPracticeSet = (set: PracticeCardItem) => {
    const matchedTrack =
      tracks.find(
        (t) =>
          t.title.toLowerCase().includes(set.category.toLowerCase()) ||
          t.category.toLowerCase().includes(set.category.toLowerCase()) ||
          t.topics.some((top) => top.toLowerCase().includes(set.title.toLowerCase()))
      ) || tracks[0];

    onSelectTrack(matchedTrack);
  };

  // Render set card icon
  const renderCardIcon = (type: PracticeCardItem['iconType']) => {
    switch (type) {
      case 'docker':
        return <Boxes className="w-5 h-5 text-blue-600" />;
      case 'sql':
        return <Database className="w-5 h-5 text-blue-700" />;
      case 'api':
        return <Code2 className="w-5 h-5 text-slate-800" />;
      case 'react':
        return <Atom className="w-5 h-5 text-sky-600" />;
      case 'system-design':
        return <Network className="w-5 h-5 text-blue-900" />;
      case 'dsa':
        return <Network className="w-5 h-5 text-blue-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 pb-16">
      {/* ── MAIN PRACTICE CONTAINER ── */}
      <main className="px-6 lg:px-10 py-8 lg:py-10 space-y-8 max-w-7xl mx-auto">
        {/* ── 1. HERO BANNER: Practice. Improve. Ace It. ── */}
        <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 md:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Content */}
            <div className="max-w-xl text-left">
              <div className="flex items-center gap-2 text-slate-600 mb-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold tracking-wide">Practice</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Practice. Improve. Ace It.
              </h1>

              <p className="text-slate-600 text-base md:text-lg mt-3 font-normal leading-relaxed">
                Sharpen your skills with AI-curated questions, real-world scenarios and instant feedback.
              </p>

              {/* Category Pills Row */}
              <div className="flex flex-wrap items-center gap-2 mt-7">
                {categories.map((cat) => {
                  const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center / Right Robot with Laptop & Motivational Badges */}
            <div className="relative flex items-center justify-center my-2 lg:my-0">
              <RobotAssistant
                size={240}
                withLaptop={true}
                className="transform hover:scale-105 transition-transform duration-300"
              />

              {/* Top Quote Pill on Robot */}
              <div className="absolute -top-3 -left-4 sm:-left-8 bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-2 text-left z-20">
                <p className="text-xs font-semibold text-slate-900 italic">
                  “Practice like you interview.”
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  — InterTrain AI
                </p>
              </div>

              {/* Right Stylized Slogan */}
              <div className="hidden sm:block absolute -bottom-2 -right-8 z-20 select-none">
                <p className="text-sm font-serif italic text-blue-900 leading-tight">
                  Small Steps
                </p>
                <p className="text-base font-bold text-blue-600 leading-tight">
                  Big Progress
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. FULL-WIDTH WORKSPACE: TRENDING & PRACTICE SETS ── */}
        <div className="space-y-8">
          {/* ── Trending Topics Row (Full Width) ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>Trending Topics</span>
              </h3>
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 5-Column Grid spanning full width */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {trendingTopics.map((topic) => {
                const TopicIcon = topic.icon;
                const isTopicActive = selectedCategory.toLowerCase() === topic.category.toLowerCase();

                return (
                  <button
                    key={topic.name}
                    onClick={() => {
                      setSelectedCategory(topic.category);
                    }}
                    className={`p-4 rounded-2xl bg-white border text-left flex items-center gap-3.5 transition-all cursor-pointer group shadow-2xs hover:shadow-sm ${
                      isTopicActive
                        ? 'border-blue-500 ring-2 ring-blue-500/10'
                        : 'border-slate-200/90 hover:border-blue-400'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 flex items-center justify-center shrink-0 border border-slate-200/60 transition-colors">
                      <TopicIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {topic.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {topic.rank}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Practice Sets Section (Full Width, 3-Column Grid) ── */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 text-lg">Practice Sets</h3>
                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                  {filteredSets.length} available
                </span>
              </div>

              {/* Right controls: Saved filter + Sort dropdown */}
              <div className="flex items-center gap-3">
                {/* Saved button */}
                <button
                  onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                    showBookmarkedOnly
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${showBookmarkedOnly ? 'fill-current' : ''}`} />
                  <span>Saved ({bookmarkedSetIds.size})</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label="Sort practice sets"
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="Popular">Popular</option>
                    <option value="Duration">Duration</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3-Column Grid filling the whole workspace cleanly */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSets.map((set) => {
                const isBookmarked = bookmarkedSetIds.has(set.id);

                return (
                  <div
                    key={set.id}
                    onClick={() => handleLaunchPracticeSet(set)}
                    className="group bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Header: Icon + Bookmark */}
                      <div className="flex items-start justify-between">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${set.iconBg}`}
                        >
                          {renderCardIcon(set.iconType)}
                        </div>

                        <button
                          onClick={(e) => toggleBookmark(set.id, e)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
                          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                          aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              isBookmarked
                                ? 'fill-blue-600 text-blue-600'
                                : 'text-slate-400'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Title & Description */}
                      <div className="mt-4">
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {set.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {set.description}
                        </p>
                      </div>

                      {/* Category & Type Badges */}
                      <div className="flex flex-wrap items-center gap-2 mt-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/70">
                          {set.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {set.questionType}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer: Metadata & Action CTA Button */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          {set.questionsCount} Questions
                        </span>
                        <span className="text-slate-200">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          ~ {set.durationMinutes} mins
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700">
                        <span>Start Set</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredSets.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-base">No matching practice sets</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {showBookmarkedOnly
                    ? "You haven't bookmarked any practice sets yet. Click the bookmark icon on any card to save it."
                    : 'No practice sets found for the selected category.'}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setShowBookmarkedOnly(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold mt-2 cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  Show All Practice Sets
                </button>
              </div>
            )}
          </div>

          {/* ── 3. BOTTOM BANNER: Keep a streak. Build your future. ── */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Keep a streak. Build your future.
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  Practice daily and track your improvement in Analytics.
                </p>
              </div>
            </div>

            <button
              onClick={onViewProgress}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>View Progress</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
