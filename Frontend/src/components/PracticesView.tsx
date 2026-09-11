import React, { useState, useMemo } from 'react';
import {
  Search,
  Bell,
  BookOpen,
  ArrowRight,
  Bookmark,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Flame,
  Clock,
  CheckSquare,
  Square,
  BarChart3,
  Sparkles,
  Database,
  Code2,
  Boxes,
  Network,
  Atom,
  HelpCircle,
} from 'lucide-react';
import { PracticeTrack } from '../types';
import { RobotAssistant } from './RobotAssistant';

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
  timeBracket: '< 10 mins' | '10 - 30 mins' | '30 - 60 mins' | '> 60 mins';
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
    timeBracket: '10 - 30 mins',
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
    timeBracket: '10 - 30 mins',
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
    timeBracket: '10 - 30 mins',
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
    timeBracket: '10 - 30 mins',
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
    timeBracket: '30 - 60 mins',
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
    timeBracket: '30 - 60 mins',
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
  userName,
}: PracticesViewProps) {
  const displayName = userName || 'Billu Badmash';

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>([]);
  const [selectedTimeBracket, setSelectedTimeBracket] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'Popular' | 'Newest' | 'Difficulty' | 'Duration'>('Popular');
  const [bookmarkedSetIds, setBookmarkedSetIds] = useState<Set<string>>(new Set());

  // Collapsible filter sections
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(true);
  const [isQuestionTypeOpen, setIsQuestionTypeOpen] = useState(true);
  const [isTimeOpen, setIsTimeOpen] = useState(true);

  // Initials
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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
      return next;
    });
  };

  const toggleDifficulty = (diff: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(diff) ? prev.filter((d) => d !== diff) : [...prev, diff]
    );
  };

  const toggleQuestionType = (type: string) => {
    setSelectedQuestionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSelectedDifficulties([]);
    setSelectedQuestionTypes([]);
    setSelectedTimeBracket(null);
    setSearchQuery('');
  };

  // Filter and sort practice sets
  const filteredSets = useMemo(() => {
    return DEFAULT_PRACTICE_SETS.filter((set) => {
      // Category filter
      if (selectedCategory !== 'All' && set.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(set.difficulty)) {
        return false;
      }
      // Question type filter
      if (selectedQuestionTypes.length > 0 && !selectedQuestionTypes.includes(set.questionType)) {
        return false;
      }
      // Time bracket filter
      if (selectedTimeBracket && set.timeBracket !== selectedTimeBracket) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = set.title.toLowerCase().includes(query);
        const matchesDesc = set.description.toLowerCase().includes(query);
        const matchesCategory = set.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCategory) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'Duration') return a.durationMinutes - b.durationMinutes;
      if (sortBy === 'Difficulty') {
        const order = { Beginner: 1, Intermediate: 2, Advanced: 3 };
        return order[a.difficulty] - order[b.difficulty];
      }
      return 0; // Default Popular / Newest
    });
  }, [
    selectedCategory,
    selectedDifficulties,
    selectedQuestionTypes,
    selectedTimeBracket,
    searchQuery,
    sortBy,
  ]);

  // Click on a practice set to start
  const handleLaunchPracticeSet = (set: PracticeCardItem) => {
    // Match with existing track or fallback to first track
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
      {/* ── TOP SEARCH & HEADER BAR ── */}
      <header className="sticky top-0 z-20 bg-[#F4F6F9]/90 backdrop-blur-md px-6 lg:px-10 py-4 flex items-center justify-between gap-4 border-b border-slate-200/80">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-2xl">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for topics, questions, or skills..."
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-sm pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Bell */}
          <button
            className="relative p-2.5 rounded-2xl bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* User Avatar Circle */}
          <button
            onClick={onViewProgress}
            className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs tracking-wider shadow-xs hover:bg-blue-600 transition-colors border border-slate-800"
            title={displayName}
          >
            {initials}
          </button>
        </div>
      </header>

      {/* ── MAIN PRACTICE CONTAINER ── */}
      <main className="px-6 lg:px-10 pt-6 space-y-7 max-w-7xl mx-auto">
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
              {/* Mascot typing on laptop */}
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

        {/* ── 2. TWO-COLUMN WORKSPACE: FILTERS SIDEBAR + CONTENT AREA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* ── LEFT FILTERS PANEL (3 COLS) ── */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-6">
              {/* Filter Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">Filters</h3>
                <span className="text-xs text-slate-400 font-medium">Refine</span>
              </div>

              {/* Group 1: Difficulty */}
              <div className="space-y-3">
                <button
                  onClick={() => setIsDifficultyOpen(!isDifficultyOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  <span>Difficulty</span>
                  {isDifficultyOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isDifficultyOpen && (
                  <div className="space-y-2.5 pt-1">
                    {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
                      const checked = selectedDifficulties.includes(lvl);
                      return (
                        <label
                          key={lvl}
                          onClick={() => toggleDifficulty(lvl)}
                          className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              checked
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {checked && <CheckSquare className="w-3.5 h-3.5 fill-current" />}
                          </div>
                          <span className="text-sm font-medium">{lvl}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Group 2: Question Type */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setIsQuestionTypeOpen(!isQuestionTypeOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  <span>Question Type</span>
                  {isQuestionTypeOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isQuestionTypeOpen && (
                  <div className="space-y-2.5 pt-1">
                    {[
                      'MCQ',
                      'Coding',
                      'Short Answer',
                      'System Design',
                      'Scenario Based',
                    ].map((type) => {
                      const checked = selectedQuestionTypes.includes(type);
                      return (
                        <label
                          key={type}
                          onClick={() => toggleQuestionType(type)}
                          className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              checked
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {checked && <CheckSquare className="w-3.5 h-3.5 fill-current" />}
                          </div>
                          <span className="text-sm font-medium">{type}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Group 3: Time Required */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setIsTimeOpen(!isTimeOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  <span>Time Required</span>
                  {isTimeOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isTimeOpen && (
                  <div className="space-y-2.5 pt-1">
                    {[
                      '< 10 mins',
                      '10 - 30 mins',
                      '30 - 60 mins',
                      '> 60 mins',
                    ].map((timeOption) => {
                      const isSelected = selectedTimeBracket === timeOption;
                      return (
                        <label
                          key={timeOption}
                          onClick={() =>
                            setSelectedTimeBracket(isSelected ? null : timeOption)
                          }
                          className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-sm font-medium">{timeOption}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              <div className="pt-2">
                <button
                  onClick={handleClearFilters}
                  className="w-full py-2.5 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              </div>
            </div>
          </aside>

          {/* ── RIGHT MAIN CONTENT AREA (9 COLS) ── */}
          <section className="lg:col-span-9 space-y-7">
            {/* ── Trending Topics Row ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span>Trending Topics</span>
                </h3>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Horizontal Scrollable Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {trendingTopics.map((topic) => {
                  const TopicIcon = topic.icon;
                  return (
                    <button
                      key={topic.name}
                      onClick={() => {
                        setSelectedCategory(topic.category);
                        setSearchQuery(topic.name);
                      }}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-sm text-left flex items-center gap-3 transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 flex items-center justify-center shrink-0 border border-slate-200/60 transition-colors">
                        <TopicIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {topic.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {topic.rank}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Practice Sets Section ── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Practice Sets</h3>
                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label="Sort practice sets"
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Popular">Popular</option>
                    <option value="Difficulty">Difficulty</option>
                    <option value="Duration">Duration</option>
                  </select>
                </div>
              </div>

              {/* 2-Column Grid of Practice Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSets.map((set) => {
                  const isBookmarked = bookmarkedSetIds.has(set.id);

                  return (
                    <div
                      key={set.id}
                      onClick={() => handleLaunchPracticeSet(set)}
                      className="group bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        {/* Header: Icon + Bookmark */}
                        <div className="flex items-start justify-between">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${set.iconBg}`}
                          >
                            {renderCardIcon(set.iconType)}
                          </div>

                          <button
                            onClick={(e) => toggleBookmark(set.id, e)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-blue-600 transition-colors"
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
                        <div className="mt-3.5">
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {set.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {set.description}
                          </p>
                        </div>

                        {/* Category & Difficulty Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {set.category}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {set.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer: Metadata & Action Arrow Button */}
                      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {set.questionsCount} Questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            ~ {set.durationMinutes} mins
                          </span>
                        </div>

                        <button
                          className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all shadow-2xs group-hover:scale-105 cursor-pointer"
                          aria-label={`Start ${set.title}`}
                        >
                          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSets.length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-3">
                  <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-base">No matching practice sets</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try clearing or adjusting your search filters to explore available topics.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold mt-2"
                  >
                    Reset All Filters
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
          </section>
        </div>
      </main>
    </div>
  );
}
