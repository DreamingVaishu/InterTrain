import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  BarChart2,
  ArrowRight,
  Cloud,
  Database,
  Code2,
  Palette,
  CheckCircle2,
  Activity,
  Video,
  Star,
  Clock,
  Users,
  MoreVertical,
  BookOpen,
  Info,
  Sparkles,
} from 'lucide-react';
import { HistoryFolder } from '../types';
import { RobotAssistant } from './RobotAssistant';

interface HomeViewProps {
  folders: HistoryFolder[];
  onSelectFolder: (folderId: string) => void;
  onStartPractice: () => void;
  onStartMockInterview?: () => void;
  onViewProgress?: () => void;
  userName?: string;
}

export function HomeView({
  folders,
  onSelectFolder,
  onStartPractice,
  onStartMockInterview,
  onViewProgress,
  userName,
}: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNotifications, setHasNotifications] = useState(true);
  const displayName = userName || 'Billu Badmash';

  // Extract initials
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Black, White & Blue combo tracks for the Explore section with uniform styling
  const exploreTracks = [
    {
      id: 'devops',
      title: 'DevOps',
      description: 'Learn & practice modern DevOps tools',
      topicsCount: '12+ topics',
      icon: Cloud,
      cardTheme: 'from-[#0B1220] via-[#111A2E] to-[#1E293B]',
      borderTheme: 'border-slate-800/90 hover:border-blue-500/60',
      badgeBg: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
      arrowBg: 'bg-blue-600 text-white hover:bg-blue-500',
      iconGlow: 'text-blue-400',
    },
    {
      id: 'data-manager',
      title: 'Data Manager',
      description: 'Work with databases and data pipelines',
      topicsCount: '10+ topics',
      icon: Database,
      cardTheme: 'from-[#0B1220] via-[#111A2E] to-[#1E293B]',
      borderTheme: 'border-slate-800/90 hover:border-blue-500/60',
      badgeBg: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
      arrowBg: 'bg-blue-600 text-white hover:bg-blue-500',
      iconGlow: 'text-blue-400',
    },
    {
      id: 'backend',
      title: 'Backend',
      description: 'Build and test server-side applications',
      topicsCount: '14+ topics',
      icon: Code2,
      cardTheme: 'from-[#0B1220] via-[#111A2E] to-[#1E293B]',
      borderTheme: 'border-slate-800/90 hover:border-blue-500/60',
      badgeBg: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
      arrowBg: 'bg-blue-600 text-white hover:bg-blue-500',
      iconGlow: 'text-blue-400',
    },
    {
      id: 'ui-ux',
      title: 'UI/UX',
      description: 'Design intuitive user experiences',
      topicsCount: '8+ topics',
      icon: Palette,
      cardTheme: 'from-[#0B1220] via-[#111A2E] to-[#1E293B]',
      borderTheme: 'border-slate-800/90 hover:border-blue-500/60',
      badgeBg: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
      arrowBg: 'bg-blue-600 text-white hover:bg-blue-500',
      iconGlow: 'text-blue-400',
    },
  ];

  const handleTrackClick = (trackId: string) => {
    onSelectFolder(trackId);
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
            placeholder="Search for topics, tools, or practice sets..."
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-sm pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Bell */}
          <button
            onClick={() => setHasNotifications(false)}
            className="relative p-2.5 rounded-2xl bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
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

      {/* ── MAIN DASHBOARD CONTAINER ── */}
      <main className="px-6 lg:px-10 pt-6 space-y-7 max-w-7xl mx-auto">
        {/* ── 1. WELCOME HERO BANNER ── */}
        <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6 md:p-8 lg:p-10">
          {/* Subtle tech grid background styling */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Welcome Copy & CTAs */}
            {/* Left Welcome Copy */}
            <div className="max-w-xl text-left">
              <p className="text-slate-500 font-medium text-base mb-1">
                Welcome back!
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <span>{displayName}</span>
                <span className="inline-block animate-bounce text-3xl">👋</span>
              </h1>
              <p className="text-slate-600 text-base md:text-lg mt-3 mb-2 font-normal">
                Keep practicing. You're getting better every day!
              </p>
            </div>

            {/* Center Robot Mascot Illustration */}
            <div className="flex-shrink-0 flex items-center justify-center my-2 lg:my-0">
              <RobotAssistant size={230} className="transform hover:scale-105 transition-transform duration-300" />
            </div>

            {/* Right Quote Card Bubble */}
            <div className="w-full lg:w-72 bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-slate-800 font-semibold text-sm leading-relaxed italic">
                  “Discipline today creates opportunities tomorrow.”
                </p>
                <p className="text-xs text-slate-500 font-medium mt-2">
                  — InterTrain
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600">
                  Practice Perform Grow
                </span>
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. EXPLORE TRACKS SECTION (Black, White & Blue Combo) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Explore
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Choose a track and start learning with AI-powered practice, resources and interviews.
              </p>
            </div>
            <button
              onClick={onStartPractice}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 4 Cards in Black, White, and Blue theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {exploreTracks.map((track) => {
              const TrackIcon = track.icon;
              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track.id)}
                  className={`group relative rounded-2xl bg-gradient-to-br ${track.cardTheme} border ${track.borderTheme} p-5 text-white shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between h-52 overflow-hidden`}
                >
                  {/* Subtle Background Shape */}
                  <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/5 blur-xl group-hover:bg-blue-400/10 transition-all pointer-events-none" />

                  {/* Subtle Background Watermark Graphic matching screenshot */}
                  <div className="absolute right-2 top-8 w-24 h-24 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity">
                    {track.id === 'devops' && (
                      <svg viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="6" className="w-full h-full text-blue-300">
                        <path d="M30 30 C30 15, 10 15, 10 30 C10 45, 30 45, 50 30 C70 15, 90 15, 90 30 C90 45, 70 45, 50 30" />
                      </svg>
                    )}
                    {track.id === 'data-manager' && (
                      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="5" className="w-full h-full text-blue-300">
                        <ellipse cx="40" cy="20" rx="30" ry="10" />
                        <path d="M10 20 v20 c0 5.5 13.4 10 30 10 s30 -4.5 30 -10 v-20" />
                        <path d="M10 40 v20 c0 5.5 13.4 10 30 10 s30 -4.5 30 -10 v-20" />
                      </svg>
                    )}
                    {track.id === 'backend' && (
                      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="5" className="w-full h-full text-blue-300">
                        <path d="M25 25 L10 40 L25 55" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M55 25 L70 40 L55 55" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="45" y1="20" x2="35" y2="60" strokeLinecap="round" />
                      </svg>
                    )}
                    {track.id === 'ui-ux' && (
                      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="5" className="w-full h-full text-blue-300">
                        <rect x="10" y="15" width="60" height="50" rx="8" />
                        <line x1="10" y1="30" x2="70" y2="30" />
                        <circle cx="20" cy="22.5" r="2.5" fill="currentColor" />
                        <circle cx="28" cy="22.5" r="2.5" fill="currentColor" />
                      </svg>
                    )}
                  </div>

                  {/* Top Row: Icon & Graphic Accent */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/15">
                      <TrackIcon className={`w-5 h-5 ${track.iconGlow}`} />
                    </div>

                    {/* Subtle aesthetic icon / dots in background */}
                    <div className="text-white/20 text-xs font-mono font-bold tracking-widest select-none">
                      {track.id.toUpperCase().slice(0, 3)}
                    </div>
                  </div>

                  {/* Middle Copy */}
                  <div className="relative z-10 mt-4">
                    <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {track.description}
                    </p>
                  </div>

                  {/* Bottom Row */}
                  <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${track.badgeBg}`}>
                      {track.topicsCount}
                    </span>
                    <button
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${track.arrowBg} shadow-xs`}
                      aria-label={`Explore ${track.title}`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 3. UPCOMING MOCK INTERVIEW SECTION ── */}
        <div>
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Upcoming Mock Interview</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your next scheduled technical assessment round with multi-agent evaluators
                </p>
              </div>
              <button
                onClick={onStartPractice}
                className="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inner Interview Card Box */}
            <div className="my-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Overlapping Interviewer Avatars */}
                  <div className="flex -space-x-2 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] text-blue-400 font-bold">
                      AI 1
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                      AI 2
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center text-[10px] text-sky-300 font-bold">
                      AI 3
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      Full Stack Development
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Today, 7:00 PM
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        3 AI Interviewers
                      </span>
                    </div>
                  </div>
                </div>

                {/* Join Interview Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={onStartMockInterview || onStartPractice}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    Join Interview
                  </button>
                  <button
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
                    aria-label="Options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Alert Notice Pill */}
              <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium">
                  Be ready! The interview will start in 2 hours.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>Duration: ~45 mins</span>
              <span className="text-slate-400">Panel: Architect & Tech Leads</span>
            </div>
          </div>
        </div>

        {/* ── 4. BOTTOM SECTION: RECENT ACTIVITY & MOTIVATIONAL QUOTE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Recent Activity (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Recent Activity</span>
              </h3>
              <button
                onClick={onViewProgress}
                className="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Recent Activities */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    Completed: Docker Basics
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">2 hours ago</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    Practiced: SQL Joins
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">5 hours ago</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Video className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    Mock: System Design
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">1 day ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Motivational Quote Card (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-[#0F172A] text-white rounded-3xl border border-slate-800 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <span className="text-4xl font-serif text-blue-400 leading-none select-none block mb-2">
                “
              </span>
              <p className="text-slate-100 font-semibold text-sm sm:text-base leading-relaxed italic">
                A little progress each day adds up to big results.
              </p>
            </div>

            <div className="relative z-10 pt-4 mt-2 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium">— InterTrain</span>
              <span className="text-[11px] text-blue-400 font-mono tracking-wider">AI TUTOR</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
