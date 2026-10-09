import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  Layers,
  BarChart3,
  BarChart2,
  Code2,
  User,
  Clock,
  Play,
  Calendar,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Target,
  Lightbulb,
  Boxes,
  Database,
  Palette,
  Sparkles,
} from 'lucide-react';
import { HistoryFolder, AttemptReview } from '../types';
import { RobotAssistant } from '../components/RobotAssistant';

interface AnalyticsViewProps {
  folders: HistoryFolder[];
  onSelectFolder: (folderId: string, attemptNumber?: number) => void;
  onStartPractice?: () => void;
  onViewHistory?: () => void;
}

type MetricType = 'overallScore' | 'technicalAccuracy' | 'confidence' | 'conciseness';
type TimeRange = '7days' | '4weeks' | '3months' | 'all';

interface FlattenedSession {
  folderId: string;
  folderTitle: string;
  attemptNumber: number;
  date: string;
  duration: string;
  overallScore: number;
  technicalAccuracy: number;
  confidence: number;
  conciseness: number;
}

export function AnalyticsView({
  folders,
  onSelectFolder,
  onStartPractice,
  onViewHistory,
}: AnalyticsViewProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('overallScore');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('4weeks');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // 1. Gather all chronological sessions across all folders
  const allSessions: FlattenedSession[] = useMemo(() => {
    const list: FlattenedSession[] = [];

    folders.forEach((folder) => {
      folder.attempts.forEach((attempt) => {
        list.push({
          folderId: folder.id,
          folderTitle: attempt.role || folder.title,
          attemptNumber: attempt.attemptNumber,
          date: attempt.date,
          duration: attempt.duration || '20 mins',
          overallScore: attempt.metrics?.overallScore ?? 75,
          technicalAccuracy: attempt.metrics?.technicalAccuracy ?? 80,
          confidence: attempt.metrics?.confidence ?? 78,
          conciseness: attempt.metrics?.conciseness ?? 75,
        });
      });
    });

    // Approximate chronological order (earliest to latest for graph plotting)
    const dateScores: Record<string, number> = {
      '8 Sep 2026': 1,
      '12 Sep 2026': 2,
      '14 Sep 2026': 3,
      '16 Sep 2026': 4,
      '20 Sep 2026': 5,
      '22 Sep 2026': 6,
      '24 Sep 2026': 7,
      '25 Sep 2026': 8,
      '28 Sep 2026': 9,
      '30 Sep 2026': 10,
      '2 Oct 2026': 11,
      'Today': 12,
    };

    return list.sort((a, b) => {
      const valA = dateScores[a.date] ?? 5;
      const valB = dateScores[b.date] ?? 5;
      return valA - valB;
    });
  }, [folders]);

  // 2. Filter sessions according to selected time range
  const filteredSessions = useMemo(() => {
    if (selectedTimeRange === '7days') {
      return allSessions.slice(-4);
    }
    if (selectedTimeRange === '4weeks') {
      return allSessions.slice(-7);
    }
    if (selectedTimeRange === '3months') {
      return allSessions.slice(-10);
    }
    return allSessions;
  }, [allSessions, selectedTimeRange]);

  // 3. Compute High-Level Metrics
  const totalRounds = useMemo(() => {
    return folders.reduce((acc, f) => acc + (f.count || f.attempts.length), 0);
  }, [folders]);

  const avgOverallScore = useMemo(() => {
    if (!allSessions.length) return 85;
    return Math.round(
      allSessions.reduce((acc, s) => acc + s.overallScore, 0) / allSessions.length
    );
  }, [allSessions]);

  const avgTechnical = useMemo(() => {
    if (!allSessions.length) return 85;
    return Math.round(
      allSessions.reduce((acc, s) => acc + s.technicalAccuracy, 0) / allSessions.length
    );
  }, [allSessions]);

  const avgConfidence = useMemo(() => {
    if (!allSessions.length) return 82;
    return Math.round(
      allSessions.reduce((acc, s) => acc + s.confidence, 0) / allSessions.length
    );
  }, [allSessions]);

  const avgConciseness = useMemo(() => {
    if (!allSessions.length) return 80;
    return Math.round(
      allSessions.reduce((acc, s) => acc + s.conciseness, 0) / allSessions.length
    );
  }, [allSessions]);

  // Derived Skills
  const avgProblemSolving = Math.min(99, Math.round(avgTechnical * 0.7 + avgOverallScore * 0.3 - 1));
  const avgCommunication = Math.min(99, Math.round(avgConfidence * 0.6 + avgConciseness * 0.4 - 3));

  // Determine Strongest Domain
  const strongestDomain = useMemo(() => {
    let topScore = -1;
    let topName = 'Backend';
    folders.forEach((f) => {
      const avg =
        f.attempts.reduce((acc, a) => acc + a.metrics.overallScore, 0) /
        (f.attempts.length || 1);
      if (avg > topScore) {
        topScore = avg;
        topName = f.title.split('&')[0].trim();
      }
    });
    return topName;
  }, [folders]);

  // 4. Role Domain Readiness Items
  const domainReadiness = useMemo(() => {
    return folders.map((folder) => {
      const attempts = folder.attempts;
      const latestScore =
        attempts.length > 0
          ? Math.round(
              attempts.reduce((acc, a) => acc + a.metrics.overallScore, 0) / attempts.length
            )
          : 80;

      let icon = Boxes;
      const id = folder.id.toLowerCase();

      if (id.includes('devops')) {
        icon = Boxes;
      } else if (id.includes('data')) {
        icon = Database;
      } else if (id.includes('backend')) {
        icon = Code2;
      } else if (id.includes('ui')) {
        icon = Palette;
      }

      return {
        id: folder.id,
        title: folder.title,
        sessionsCount: folder.count || folder.attempts.length,
        score: latestScore,
        icon,
        barColor: 'bg-blue-600',
      };
    });
  }, [folders]);

  // 5. Recent Performance (Last 5 attempts reversed - latest first)
  const recentSessions = useMemo(() => {
    return [...allSessions].reverse().slice(0, 5);
  }, [allSessions]);

  // 6. SVG Spline Chart Computation
  // Chart dimensions
  const chartW = 580;
  const chartH = 160;
  const padX = 35;
  const padY = 20;

  const chartPoints = useMemo(() => {
    if (!filteredSessions.length) return [];
    const n = filteredSessions.length;
    const stepX = (chartW - padX * 2) / Math.max(1, n - 1);

    return filteredSessions.map((s, idx) => {
      const val = s[selectedMetric];
      // Y: 100 is at padY, 0 is at chartH - padY
      const x = padX + idx * stepX;
      const y = padY + ((100 - val) / 100) * (chartH - padY * 2);
      return {
        x,
        y,
        val,
        date: s.date.replace(' 2026', ''),
        fullDate: s.date,
        session: s,
      };
    });
  }, [filteredSessions, selectedMetric]);

  // Construct smooth bezier curve path for SVG
  const linePath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    if (chartPoints.length === 1) return `M ${chartPoints[0].x} ${chartPoints[0].y}`;

    let path = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const p0 = chartPoints[i];
      const p1 = chartPoints[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [chartPoints]);

  const areaPath = useMemo(() => {
    if (!linePath || chartPoints.length === 0) return '';
    const lastP = chartPoints[chartPoints.length - 1];
    const firstP = chartPoints[0];
    const bottomY = chartH - padY;
    return `${linePath} L ${lastP.x} ${bottomY} L ${firstP.x} ${bottomY} Z`;
  }, [linePath, chartPoints]);

  // Default active tooltip on the last point if none hovered
  const activeTooltipIndex =
    hoveredPointIndex !== null
      ? hoveredPointIndex
      : chartPoints.length > 0
      ? chartPoints.length - 1
      : null;

  const activePoint =
    activeTooltipIndex !== null && chartPoints[activeTooltipIndex]
      ? chartPoints[activeTooltipIndex]
      : null;

  const timeRangeLabels: Record<TimeRange, string> = {
    '7days': 'Last 7 Days',
    '4weeks': 'Last 4 Weeks',
    '3months': 'Last 3 Months',
    all: 'All Time',
  };

  const metricLabels: Record<MetricType, string> = {
    overallScore: 'Overall Score',
    technicalAccuracy: 'Technical Precision',
    confidence: 'Confidence Level',
    conciseness: 'Answer Structure',
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10 space-y-7">
        {/* ── 1. TOP HEADER: TITLE & CONTROLS ───────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0B1528] tracking-tight">
              Analytics Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Track your progress, identify strengths, and get personalized recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time range selector dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{timeRangeLabels[selectedTimeRange]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {isTimeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                  {(['7days', '4weeks', '3months', 'all'] as TimeRange[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setSelectedTimeRange(r);
                        setIsTimeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                        selectedTimeRange === r
                          ? 'bg-blue-50 text-blue-600 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{timeRangeLabels[r]}</span>
                      {selectedTimeRange === r && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Start Practice Button */}
            <button
              onClick={onStartPractice}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Practice</span>
            </button>
          </div>
        </div>

        {/* ── 2. TOP 4 METRIC KPI CARDS ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: TOTAL PRACTICE ROUNDS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/70 shrink-0">
                <Layers className="w-5 h-5" />
              </div>

              {/* Sparkline Visual (Vertical Bars) - Uniform Navy Blue */}
              <div className="flex items-end gap-1 h-9 pt-1 opacity-80">
                <div className="w-1.5 h-3 bg-blue-200 rounded-full" />
                <div className="w-1.5 h-5 bg-blue-300 rounded-full" />
                <div className="w-1.5 h-4 bg-blue-300 rounded-full" />
                <div className="w-1.5 h-6 bg-blue-400 rounded-full" />
                <div className="w-1.5 h-7 bg-blue-500 rounded-full" />
                <div className="w-1.5 h-9 bg-blue-600 rounded-full" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Practice Rounds
              </span>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                {totalRounds}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+4 this week</span>
              </div>
            </div>
          </div>

          {/* Card 2: AVG. OVERALL SCORE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/70 shrink-0">
                <Award className="w-5 h-5" />
              </div>

              {/* Sparkline Visual (Vertical Bars) - Uniform Navy Blue */}
              <div className="flex items-end gap-1 h-9 pt-1 opacity-80">
                <div className="w-1.5 h-3 bg-blue-200 rounded-full" />
                <div className="w-1.5 h-4 bg-blue-300 rounded-full" />
                <div className="w-1.5 h-6 bg-blue-400 rounded-full" />
                <div className="w-1.5 h-5 bg-blue-400 rounded-full" />
                <div className="w-1.5 h-7 bg-blue-500 rounded-full" />
                <div className="w-1.5 h-9 bg-blue-600 rounded-full" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Avg. Overall Score
              </span>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                {avgOverallScore}%
              </p>
              <p className="text-xs font-medium text-slate-500 mt-2">
                Rank: <span className="font-bold text-slate-700">Top 15%</span>
              </p>
            </div>
          </div>

          {/* Card 3: AVG. TECHNICAL PRECISION */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/70 shrink-0">
                <Code2 className="w-5 h-5" />
              </div>

              {/* Sparkline Visual (Vertical Bars) - Uniform Navy Blue */}
              <div className="flex items-end gap-1 h-9 pt-1 opacity-80">
                <div className="w-1.5 h-3 bg-blue-200 rounded-full" />
                <div className="w-1.5 h-5 bg-blue-300 rounded-full" />
                <div className="w-1.5 h-6 bg-blue-400 rounded-full" />
                <div className="w-1.5 h-5 bg-blue-400 rounded-full" />
                <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                <div className="w-1.5 h-9 bg-blue-600 rounded-full" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Avg. Technical Precision
              </span>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                {avgTechnical}%
              </p>
              <p className="text-xs font-medium text-blue-600 mt-2">
                Strongest in <span className="font-bold">{strongestDomain}</span>
              </p>
            </div>
          </div>

          {/* Card 4: VERBAL CONFIDENCE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/70 shrink-0">
                <User className="w-5 h-5" />
              </div>

              {/* Sparkline Visual (Vertical Bars) - Uniform Navy Blue */}
              <div className="flex items-end gap-1 h-9 pt-1 opacity-80">
                <div className="w-1.5 h-4 bg-blue-200 rounded-full" />
                <div className="w-1.5 h-5 bg-blue-300 rounded-full" />
                <div className="w-1.5 h-4 bg-blue-300 rounded-full" />
                <div className="w-1.5 h-7 bg-blue-400 rounded-full" />
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Verbal Confidence
              </span>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                {avgConfidence}%
              </p>
              <p className="text-xs font-medium text-blue-600 mt-2">
                Focus area for growth
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. MIDDLE SECTION: PERFORMANCE TREND & AI INSIGHTS ────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ── Left Column (lg:col-span-7): Charts Stack ────────────── */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            {/* Upper: Performance Trend Chart */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/70 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Performance Trend
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Your overall score across practice rounds
                    </p>
                  </div>
                </div>

                {/* Metric Selector Dropdown */}
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
                  aria-label="Select metric to display in chart"
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="overallScore">Overall Score</option>
                  <option value="technicalAccuracy">Technical Precision</option>
                  <option value="confidence">Confidence Level</option>
                  <option value="conciseness">Answer Structure</option>
                </select>
              </div>

              {/* Interactive SVG Spline Line Chart with Hover Tooltip */}
              <div className="relative w-full pt-2">
                <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  className="w-full h-44 sm:h-52 overflow-visible select-none"
                >
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                      <stop offset="85%" stopColor="#2563EB" stopOpacity="0.02" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid Lines & Y-Labels */}
                  {[
                    { label: '100', y: padY },
                    { label: '75', y: padY + (chartH - padY * 2) * 0.25 },
                    { label: '50', y: padY + (chartH - padY * 2) * 0.5 },
                    { label: '25', y: padY + (chartH - padY * 2) * 0.75 },
                    { label: '0', y: chartH - padY },
                  ].map((grid, i) => (
                    <g key={i}>
                      <text
                        x={padX - 8}
                        y={grid.y + 3.5}
                        fill="#94A3B8"
                        fontSize="9"
                        textAnchor="end"
                        fontFamily="sans-serif"
                      >
                        {grid.label}
                      </text>
                      <line
                        x1={padX}
                        y1={grid.y}
                        x2={chartW - padX}
                        y2={grid.y}
                        stroke="#F1F5F9"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                    </g>
                  ))}

                  {/* Area fill under curve */}
                  {areaPath && (
                    <path
                      d={areaPath}
                      fill="url(#trendGradient)"
                      className="transition-all duration-500"
                    />
                  )}

                  {/* Glowing Stroke Curve */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-500 drop-shadow-xs"
                    />
                  )}

                  {/* Points on the curve */}
                  {chartPoints.map((pt, idx) => {
                    const isHovered = activeTooltipIndex === idx;
                    return (
                      <g
                        key={idx}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPointIndex(idx)}
                      >
                        {/* Invisible larger hover hitbox */}
                        <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                        {/* Outer Glow Ring when hovered */}
                        {isHovered && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="8"
                            fill="#93C5FD"
                            opacity="0.5"
                          />
                        )}

                        {/* Point Circle */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 5 : 3.5}
                          fill="#2563EB"
                          stroke="#FFFFFF"
                          strokeWidth="2.5"
                          className="transition-all duration-150"
                        />

                        {/* X-Axis Date Label */}
                        <text
                          x={pt.x}
                          y={chartH - 2}
                          fill="#94A3B8"
                          fontSize="9.5"
                          textAnchor="middle"
                          fontFamily="sans-serif"
                          fontWeight="500"
                        >
                          {pt.date}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip matching Screenshot reference */}
                {activePoint && (
                  <div
                    className="absolute pointer-events-none z-20 transform -translate-x-1/2 -translate-y-full transition-all duration-150"
                    style={{
                      left: `${(activePoint.x / chartW) * 100}%`,
                      top: `${(activePoint.y / chartH) * 100}%`,
                      marginTop: '-10px',
                    }}
                  >
                    <div className="bg-white rounded-xl px-3 py-1.5 shadow-lg border border-slate-200/90 text-center whitespace-nowrap">
                      <p className="text-[11px] font-bold text-slate-800 leading-tight">
                        {activePoint.fullDate}
                      </p>
                      <p className="text-[11px] font-extrabold text-blue-600 leading-tight mt-0.5">
                        {metricLabels[selectedMetric].replace(' Level', '')}: {activePoint.val}%
                      </p>
                    </div>
                    {/* Tooltip pointer triangle */}
                    <div className="w-2.5 h-2.5 bg-white border-r border-b border-slate-200/90 transform rotate-45 mx-auto -mt-1.5 shadow-xs" />
                  </div>
                )}
              </div>
            </div>

            {/* Lower: Readiness by Role Domain */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/70 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Readiness by Role Domain
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Your preparation level across different domains
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                {domainReadiness.map((dom) => {
                  const DomIcon = dom.icon;
                  return (
                    <div
                      key={dom.id}
                      onClick={() => onSelectFolder(dom.id)}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer p-2 -mx-2 rounded-2xl hover:bg-slate-50 transition-colors"
                    >
                      {/* Left: Icon & Title */}
                      <div className="flex items-center gap-3 sm:w-1/3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 flex items-center justify-center shrink-0 border border-slate-200/60 transition-colors">
                          <DomIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {dom.title}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium truncate">
                            ({dom.sessionsCount} sessions completed)
                          </p>
                        </div>
                      </div>

                      {/* Middle: Progress Bar */}
                      <div className="flex-1 mx-0 sm:mx-4">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`${dom.barColor} h-2 rounded-full transition-all duration-700 ease-out`}
                            style={{ width: `${dom.score}%` }}
                          />
                        </div>
                      </div>

                      {/* Right: Score */}
                      <span className="text-xs sm:text-sm font-black text-slate-900 shrink-0 self-end sm:self-auto">
                        {dom.score}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right Column (lg:col-span-5): AI Insights Card ─────────── */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">AI Insights</h3>
              </div>

              {/* Graphic + Motivational Paragraph */}
              <div className="flex items-center justify-between gap-4 bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/60 mb-5">
                <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                  You're showing strong technical growth! Keep practicing to improve your consistency and verbal communication.
                </p>

                {/* Friendly Robot Avatar with Thumbs Up */}
                <div className="shrink-0 flex items-center justify-center">
                  <RobotAssistant size={105} thumbsUp={true} className="drop-shadow-xs" />
                </div>
              </div>

              {/* Insights Checklist */}
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-xs text-slate-700 leading-snug">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0 mt-0.5" />
                  <span className="font-medium">Strong understanding of core concepts</span>
                </li>

                <li className="flex items-start gap-2.5 text-xs text-slate-700 leading-snug">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0 mt-0.5" />
                  <span className="font-medium">Good problem-solving approach</span>
                </li>

                <li className="flex items-start gap-2.5 text-xs text-slate-700 leading-snug">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0 mt-0.5" />
                  <span className="font-medium">Consistent improvement in recent attempts</span>
                </li>

                <li className="flex items-start gap-2.5 text-xs text-slate-700 leading-snug">
                  <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    !
                  </div>
                  <span className="font-medium text-slate-800">
                    Focus more on real-world examples and communication
                  </span>
                </li>
              </ul>
            </div>

            {/* Bottom Action Pill/Button */}
            <button
              onClick={onStartPractice}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-100/90 text-blue-700 text-xs font-bold transition-all cursor-pointer group shadow-2xs active:scale-98"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <span>Get Personalized Practice Plan</span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* ── 4. BOTTOM 2-COLUMN GRID: SKILLS BREAKDOWN & RECENT TABLE ──── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ── Left Column (lg:col-span-6): Skills Breakdown ─────────── */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/70 shrink-0">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Skills Breakdown
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Performance across key skill areas
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* 1. Technical Precision */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">Technical Precision</span>
                    <span className="font-extrabold text-slate-900">{avgTechnical}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${avgTechnical}%` }}
                    />
                  </div>
                </div>

                {/* 2. Problem Solving */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">Problem Solving</span>
                    <span className="font-extrabold text-slate-900">{avgProblemSolving}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${avgProblemSolving}%` }}
                    />
                  </div>
                </div>

                {/* 3. Communication */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">Communication</span>
                    <span className="font-extrabold text-slate-900">{avgCommunication}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${avgCommunication}%` }}
                    />
                  </div>
                </div>

                {/* 4. Confidence */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">Confidence</span>
                    <span className="font-extrabold text-slate-900">{avgConfidence}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${avgConfidence}%` }}
                    />
                  </div>
                </div>

                {/* 5. Answer Structure */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">Answer Structure</span>
                    <span className="font-extrabold text-slate-900">{avgConciseness}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${avgConciseness}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column (lg:col-span-6): Recent Performance Table ── */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/70 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Recent Performance
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Your latest practice sessions
                    </p>
                  </div>
                </div>

                <button
                  onClick={onViewHistory}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  View All
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                      <th className="py-2.5 pl-1 font-semibold">#</th>
                      <th className="py-2.5 font-semibold">Date</th>
                      <th className="py-2.5 font-semibold">Topic</th>
                      <th className="py-2.5 font-semibold">Duration</th>
                      <th className="py-2.5 pr-1 font-semibold text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {recentSessions.map((session, idx) => {
                      const isHigh = session.overallScore >= 80;
                      return (
                        <tr
                          key={idx}
                          onClick={() => onSelectFolder(session.folderId, session.attemptNumber)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 pl-1 font-semibold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 text-slate-700 font-medium whitespace-nowrap">
                            {session.date}
                          </td>
                          <td className="py-3 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {session.folderTitle}
                          </td>
                          <td className="py-3 text-slate-500 font-medium whitespace-nowrap">
                            {session.duration}
                          </td>
                          <td className="py-3 pr-1 text-right">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                isHigh
                                  ? 'bg-blue-50 text-blue-700 border-blue-200/80'
                                  : 'bg-slate-100 text-slate-700 border-slate-200/80'
                              }`}
                            >
                              {session.overallScore}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
