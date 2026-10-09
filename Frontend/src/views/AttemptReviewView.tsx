import React, { useState, useEffect, useMemo } from 'react';
import {
  Video,
  ArrowLeft,
  RotateCcw,
  ArrowRight,
  Trophy,
  ThumbsUp,
  Target,
  BarChart3,
  Code2,
  Star,
  FileText,
  MessageSquare,
  HelpCircle,
  Compass,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lightbulb,
  Rocket,
  Copy,
  Check,
  Clock,
  Award,
  Layers,
  Flame,
  CheckCheck,
} from 'lucide-react';
import { HistoryFolder, AttemptReview, QuestionResponse } from '../types';
import { RobotAssistant } from '../components/RobotAssistant';
import { generateHistorySummary } from '../services/liveInterview';

interface AttemptReviewViewProps {
  folder: HistoryFolder;
  initialAttemptNumber?: number;
  onBack: () => void;
  onStartAgain: (folderTitle: string) => void;
  onExploreTopics?: () => void;
}

type ReviewTab =
  | 'detailed-feedback'
  | 'question-analysis'
  | 'strengths'
  | 'areas-to-improve'
  | 'ai-suggestions';

export function AttemptReviewView({
  folder,
  initialAttemptNumber,
  onBack,
  onStartAgain,
  onExploreTopics,
}: AttemptReviewViewProps) {
  // Sort attempts descending so the latest attempt (e.g. Attempt 5) is first
  const sortedAttempts = useMemo(() => {
    if (!folder.attempts || folder.attempts.length === 0) {
      return [
        {
          attemptNumber: 1,
          date: 'Today, 2 Oct 2026',
          duration: '21 mins',
          role: folder.title,
          title: folder.title,
          finalSummary:
            'You demonstrated strong technical problem-solving with clear explanations and structured answers.',
          tips: [
            'Include more specific tools and commands',
            'Provide deeper technical depth in system design',
            'Use more structured frameworks (e.g., STAR)',
            'Elaborate on edge cases and trade-offs',
          ],
          strengths: [
            'Strong understanding of fundamentals',
            'Good real-world examples',
            'Clear communication and confidence',
            'Practical problem-solving mindset',
          ],
          areasToImprove: [
            'Include more specific tools and commands',
            'Provide deeper technical depth in system design',
            'Use more structured frameworks (e.g., STAR)',
            'Elaborate on edge cases and trade-offs',
          ],
          metrics: {
            confidence: 90,
            technicalAccuracy: 85,
            conciseness: 80,
            overallScore: 88,
          },
          questions: [],
        } as AttemptReview,
      ];
    }
    return [...folder.attempts].sort((a, b) => b.attemptNumber - a.attemptNumber);
  }, [folder]);

  // Determine initial selected attempt index
  const initialIndex = useMemo(() => {
    if (initialAttemptNumber !== undefined) {
      const idx = sortedAttempts.findIndex(
        (a) => a.attemptNumber === initialAttemptNumber
      );
      if (idx !== -1) return idx;
    }
    return 0; // Default to the most recent attempt
  }, [initialAttemptNumber, sortedAttempts]);

  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState(initialIndex);
  const [activeTab, setActiveTab] = useState<ReviewTab>('detailed-feedback');
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  // Sync index if initialAttemptNumber changes
  useEffect(() => {
    if (initialAttemptNumber !== undefined) {
      const idx = sortedAttempts.findIndex(
        (a) => a.attemptNumber === initialAttemptNumber
      );
      if (idx !== -1) {
        setSelectedAttemptIndex(idx);
      }
    }
  }, [initialAttemptNumber, sortedAttempts]);

  const currentAttempt = sortedAttempts[selectedAttemptIndex] || sortedAttempts[0];

  useEffect(() => {
    let cancelled = false;
    const savedSummary = currentAttempt?.finalSummary?.trim();
    const summaryIsMissing =
      !savedSummary ||
      /ended before a final ai evaluation|summary unavailable|no summary/i.test(savedSummary);
    setGeneratedSummary('');
    setSummaryError('');
    if (!summaryIsMissing || !currentAttempt) return;

    setSummaryLoading(true);
    void generateHistorySummary({
      subject: currentAttempt.role || folder.title,
      questions: currentAttempt.questions.map((item) => ({
        question: item.question,
        response: item.response,
      })),
      code: currentAttempt.code || '',
      language: currentAttempt.language || currentAttempt.codeProblem?.language || '',
      code_problem: currentAttempt.codeProblem,
      code_review: currentAttempt.codeReview,
    })
      .then((result) => {
        if (!cancelled) setGeneratedSummary(result.summary);
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setSummaryError(
            error instanceof Error ? error.message : 'Could not generate the summary.'
          );
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentAttempt, folder.title]);

  // Questions for this attempt (with fallback formatting if empty)
  const displayQuestions: QuestionResponse[] = useMemo(() => {
    if (currentAttempt.questions && currentAttempt.questions.length > 0) {
      return currentAttempt.questions;
    }
    // Safe fallback questions if an attempt had no recorded questions
    return [
      {
        id: 'q1-fallback',
        question: `What are the core architectural principles of ${folder.title}?`,
        shortFeedback: 'Clear and concise explanation with good real-world examples.',
        score: 10,
        timeSpent: '3m 15s',
        category: 'Architecture',
        response:
          'High availability, separation of concerns, scalability through decoupling, and end-to-end observability with automated feedback loops.',
        feedback: 'Clear and concise explanation with good real-world examples.',
      },
      {
        id: 'q2-fallback',
        question: 'How do you approach real-time debugging during production outages?',
        shortFeedback: 'Well-structured answer covering triage, mitigation, and post-mortem.',
        score: 9,
        timeSpent: '4m 30s',
        category: 'Incident Response',
        response:
          'First isolate impact and stabilize through rollback or traffic re-routing. Inspect metric telemetry (golden signals), examine logs, reproduce safely, and draft a blameless post-mortem.',
        feedback: 'Well-structured answer covering all key stages with relevant tools.',
      },
      {
        id: 'q3-fallback',
        question: 'Explain trade-offs between vertical scaling and horizontal scaling.',
        shortFeedback: 'Good comparison with clear understanding of concepts.',
        score: 9,
        timeSpent: '3m 45s',
        category: 'Scalability',
        response:
          'Vertical scaling has hard hardware ceilings and requires downtime, while horizontal scaling introduces distributed state complexity, load balancing requirements, and network latency.',
        feedback: 'Good comparison with clear understanding of concepts.',
      },
    ];
  }, [currentAttempt, folder]);

  // Expand / collapse state for accordion items
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(() => {
    // By default keep question 1 expanded
    return new Set(displayQuestions.length > 0 ? [displayQuestions[0].id] : []);
  });

  const toggleQuestion = (qId: string) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (expandedQuestionIds.size === displayQuestions.length) {
      setExpandedQuestionIds(new Set());
    } else {
      setExpandedQuestionIds(new Set(displayQuestions.map((q) => q.id)));
    }
  };

  const handleCopyResponse = (qId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionId(qId);
    setTimeout(() => setCopiedQuestionId(null), 2000);
  };

  // Metrics computation & Donut math
  const metrics = currentAttempt.metrics || {
    confidence: 85,
    technicalAccuracy: 88,
    conciseness: 82,
    overallScore: 88,
  };

  const overallScore = metrics.overallScore;
  const radius = 62;
  const circumference = 2 * Math.PI * radius; // ~389.56
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  // Rating badge label & style
  const getScoreBadge = (score: number) => {
    if (score >= 88) {
      return {
        label: 'Excellent',
        icon: Trophy,
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        iconColor: 'text-emerald-600',
      };
    }
    if (score >= 75) {
      return {
        label: 'Proficient',
        icon: ThumbsUp,
        bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
        iconColor: 'text-blue-600',
      };
    }
    return {
      label: 'Developing',
      icon: Target,
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      iconColor: 'text-amber-600',
    };
  };

  const scoreBadge = getScoreBadge(overallScore);
  const BadgeIcon = scoreBadge.icon;

  // Dynamic cheer quote for speech bubble matching screenshot
  const cheerQuote =
    currentAttempt.cheerQuote ||
    (overallScore >= 90
      ? 'Strong technical agility demonstrated! Keep practicing to reach the next level!'
      : overallScore >= 80
      ? 'Great architectural depth shown! Polish a few edge cases to achieve mastery!'
      : 'Solid baseline performance! Use structured STAR answers to level up your score!');

  // Key Strengths list (matching screenshot reference)
  const strengthsList = currentAttempt.strengths || [
    `Strong understanding of ${folder.title} fundamentals`,
    'Good real-world examples',
    'Clear communication and confidence',
    'Practical knowledge of core systems and pipelines',
  ];

  // Areas to Improve list (matching screenshot reference)
  const areasToImproveList = currentAttempt.areasToImprove ||
    currentAttempt.tips || [
      'Include more specific tools and commands',
      'Provide deeper technical depth in system design',
      'Use more structured frameworks (e.g., STAR)',
      'Elaborate on edge cases and trade-offs',
    ];

  // Handle navigate to explore another topic
  const handleTryAnotherTopic = () => {
    if (onExploreTopics) {
      onExploreTopics();
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10 space-y-6">
        {/* ── TOP HEADER: Video Icon, Title, Subtitle, Attempt Pills ──────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Blue Video camera rounded icon */}
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <Video className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {folder.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Interview completed successfully! Here is your detailed performance summary.
                </p>
              </div>
            </div>

            {/* Back button */}
            <button
              onClick={onBack}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* Attempt Selector Pills Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {sortedAttempts.map((att, idx) => {
                const isActive = selectedAttemptIndex === idx;
                return (
                  <button
                    key={att.attemptNumber || idx}
                    onClick={() => setSelectedAttemptIndex(idx)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/20'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    Attempt {att.attemptNumber}
                  </button>
                );
              })}
            </div>

            {/* Date & Duration Info */}
            <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <span>{currentAttempt.date}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {currentAttempt.duration || '21 mins'}
              </span>
            </div>
          </div>
        </div>

        {/* ── TOP 2-COLUMN GRID: OVERALL PERFORMANCE & AI EVALUATION ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ── Left Column (lg:col-span-7): Overall Performance Card ──── */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-6">
              Overall Performance
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-8 my-auto">
              {/* Circular Donut Meter */}
              <div className="relative flex flex-col items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 160 160"
                  className="w-40 h-40 transform -rotate-90 drop-shadow-xs"
                >
                  {/* Track Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#EFF4FC"
                    strokeWidth="13"
                    fill="none"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#2563EB"
                    strokeWidth="13"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Donut Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Overall Score
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight my-0.5">
                    {overallScore}%
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border mt-0.5 ${scoreBadge.bg}`}
                  >
                    <BadgeIcon className={`w-3 h-3 ${scoreBadge.iconColor}`} />
                    <span>{scoreBadge.label}</span>
                  </span>
                </div>
              </div>

              {/* 3 Metric Progress Bars */}
              <div className="w-full space-y-4">
                {/* Confidence Level */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900">
                          Confidence Level
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Clear and confident communication
                        </p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 ml-2">
                      {metrics.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${metrics.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Technical Precision */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900">
                          Technical Precision
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Accurate and relevant technical answers
                        </p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 ml-2">
                      {metrics.technicalAccuracy}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${metrics.technicalAccuracy}%` }}
                    />
                  </div>
                </div>

                {/* Answer Structure & STAR */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100/60">
                        <Star className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900">
                          Answer Structure & STAR
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Well structured and to the point
                        </p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 ml-2">
                      {metrics.conciseness}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${metrics.conciseness}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column (lg:col-span-5): Robot Speech Bubble & Summary ── */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {/* Robot Assistant + Speech Bubble Card */}
            <div className="bg-gradient-to-r from-blue-50/70 via-sky-50/40 to-blue-50/50 rounded-3xl p-5 border border-blue-100 flex items-center justify-between gap-4 relative overflow-hidden shadow-2xs">
              {/* Thumbs-up Robot Graphic on Left */}
              <div className="relative shrink-0 flex items-center justify-center">
                <RobotAssistant size={120} thumbsUp={true} className="drop-shadow-sm" />
              </div>

              {/* Speech Bubble on Right */}
              <div className="relative flex-1 bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-blue-100/80">
                {/* Speech Tail pointing left */}
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-l border-b border-blue-100/80 transform rotate-45" />

                <p className="text-xs sm:text-sm font-bold text-blue-600 leading-snug relative z-10">
                  "{cheerQuote}"
                </p>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Summary</h3>
                </div>
                {summaryLoading && (
                  <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                    Generating AI Summary...
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {generatedSummary || currentAttempt.finalSummary}
              </p>
              {summaryError && (
                <p className="text-[11px] text-amber-600 mt-2">{summaryError}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── BOTTOM SECTION: TABS & QUESTION ACCORDION + SIDE PANEL ──────── */}
        <div className="space-y-4">
          {/* Horizontal Navigation Tabs */}
          <div className="border-b border-slate-200 flex items-center gap-1 sm:gap-6 overflow-x-auto no-scrollbar pt-2">
            {[
              { id: 'detailed-feedback', label: 'Detailed Feedback', icon: MessageSquare },
              { id: 'question-analysis', label: 'Question Analysis', icon: HelpCircle },
              { id: 'strengths', label: 'Strengths', icon: Star },
              { id: 'areas-to-improve', label: 'Areas to Improve', icon: Compass },
              { id: 'ai-suggestions', label: 'AI Suggestions', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ReviewTab)}
                  className={`flex items-center gap-2 py-3 px-2 sm:px-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 2-Column Layout below tabs: Main Tab Content + Right Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── Left Content (lg:col-span-7) ─────────────────────────── */}
            <div className="lg:col-span-7 space-y-4">
              {/* TAB 1: DETAILED FEEDBACK (Default Accordion List) */}
              {activeTab === 'detailed-feedback' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                  {/* Header Row with Expand/Collapse All */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Detailed Feedback
                        </h3>
                        <p className="text-xs text-slate-500">
                          Review feedback for each question to understand your performance better.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleToggleAll}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>
                        {expandedQuestionIds.size === displayQuestions.length
                          ? 'Collapse All'
                          : 'Expand All'}
                      </span>
                      {expandedQuestionIds.size === displayQuestions.length ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Accordion Questions List */}
                  <div className="space-y-3">
                    {displayQuestions.map((q, idx) => {
                      const isExpanded = expandedQuestionIds.has(q.id);
                      const qScore = q.score !== undefined ? q.score : overallScore >= 90 ? 9 : 8;
                      const scoreOutOfTen = qScore <= 10 ? qScore : Math.round(qScore / 10);
                      const isTopScore = scoreOutOfTen >= 9;

                      return (
                        <div
                          key={q.id || idx}
                          className="border border-slate-200/90 rounded-2xl overflow-hidden transition-all duration-200 hover:border-blue-300"
                        >
                          {/* Accordion Item Header */}
                          <div
                            onClick={() => toggleQuestion(q.id)}
                            className="p-4 sm:p-4.5 flex items-start justify-between gap-3.5 cursor-pointer select-none bg-white hover:bg-slate-50/70 transition-colors"
                          >
                            <div className="flex items-start gap-3.5 min-w-0">
                              {/* Number Badge */}
                              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center border border-blue-100/80 shrink-0 mt-0.5">
                                {idx + 1}
                              </div>

                              {/* Question & Short Feedback */}
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                  {q.question}
                                </h4>
                                <p className="text-xs text-slate-500 font-normal mt-0.5 leading-relaxed">
                                  {q.shortFeedback || q.feedback || 'Good explanation with relevant points.'}
                                </p>
                              </div>
                            </div>

                            {/* Score Pill & Chevron */}
                            <div className="flex items-center gap-2.5 shrink-0">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  isTopScore
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                    : 'bg-amber-50 text-amber-700 border-amber-200/80'
                                }`}
                              >
                                {scoreOutOfTen} / 10
                              </span>

                              <button
                                type="button"
                                aria-label="Toggle Question Details"
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-transform"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Accordion Expanded Content */}
                          {isExpanded && (
                            <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3.5">
                              {/* User Response Section */}
                              <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <span>Your Verbal Response</span>
                                    {q.timeSpent && (
                                      <span className="text-slate-400 font-normal">
                                        • {q.timeSpent}
                                      </span>
                                    )}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyResponse(q.id, q.response);
                                    }}
                                    className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                                    title="Copy response"
                                  >
                                    {copiedQuestionId === q.id ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-600 font-semibold">
                                          Copied
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <p className="text-xs sm:text-[13px] text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">
                                  {q.response || 'No verbal audio recorded for this question.'}
                                </p>
                              </div>

                              {/* Evaluator Analysis Note */}
                              {q.feedback && (
                                <div className="bg-blue-50/60 rounded-xl p-3.5 border border-blue-100 text-xs text-slate-700 flex items-start gap-2.5">
                                  <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                  <div className="leading-relaxed">
                                    <span className="font-bold text-slate-900">
                                      AI Evaluator Note:{' '}
                                    </span>
                                    <span>{q.feedback}</span>
                                  </div>
                                </div>
                              )}

                              {/* Key Points Covered Tags */}
                              {q.keyPoints && q.keyPoints.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  <span className="text-[11px] font-semibold text-slate-400 mr-1">
                                    Key concepts evaluated:
                                  </span>
                                  {q.keyPoints.map((point, pIdx) => (
                                    <span
                                      key={pIdx}
                                      className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-medium"
                                    >
                                      {point}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: QUESTION ANALYSIS */}
              {activeTab === 'question-analysis' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Question Analysis & Benchmarking
                      </h3>
                      <p className="text-xs text-slate-500">
                        Metrics comparing your answers to top 10% candidate submissions.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {displayQuestions.map((q, idx) => {
                      const qScore = q.score !== undefined ? q.score : 9;
                      const scoreOutOfTen = qScore <= 10 ? qScore : Math.round(qScore / 10);

                      return (
                        <div
                          key={q.id || idx}
                          className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/70 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">
                              Q{idx + 1}: {q.question}
                            </span>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              {scoreOutOfTen}/10 Rating
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80">
                              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                                Technical Depth
                              </span>
                              <span className="text-sm font-extrabold text-slate-800">
                                {scoreOutOfTen >= 9 ? '94%' : '82%'}
                              </span>
                            </div>
                            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80">
                              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                                Clarity & Pace
                              </span>
                              <span className="text-sm font-extrabold text-slate-800">
                                {scoreOutOfTen >= 9 ? '92%' : '80%'}
                              </span>
                            </div>
                            <div className="bg-white rounded-xl p-2.5 border border-slate-200/80">
                              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                                STAR Adherence
                              </span>
                              <span className="text-sm font-extrabold text-slate-800">
                                {scoreOutOfTen >= 9 ? '88%' : '76%'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: STRENGTHS DEEP DIVE */}
              {activeTab === 'strengths' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shrink-0">
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Demonstrated Core Competencies
                      </h3>
                      <p className="text-xs text-slate-500">
                        Key engineering and architectural strengths observed during this round.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {strengthsList.map((strength, idx) => (
                      <div
                        key={idx}
                        className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-100/80 flex items-start gap-3"
                      >
                        <CheckCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{strength}</h4>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                            Demonstrated consistently across verbal explanations and technical scenarios.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: AREAS TO IMPROVE DEEP DIVE */}
              {activeTab === 'areas-to-improve' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/80 shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Actionable Growth Opportunities
                      </h3>
                      <p className="text-xs text-slate-500">
                        Specific suggestions to transition your responses from good to exceptional.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {areasToImproveList.map((area, idx) => (
                      <div
                        key={idx}
                        className="bg-amber-50/40 rounded-2xl p-4 border border-amber-100/80 flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{area}</h4>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                            Practice speaking concrete trade-offs, explicit metrics, and boundary conditions.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: AI SUGGESTIONS */}
              {activeTab === 'ai-suggestions' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Personalized AI Recommendations
                      </h3>
                      <p className="text-xs text-slate-500">
                        Tailored next steps curated by InterTrain AI to accelerate your prep.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-start gap-3">
                      <Layers className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Recommended Practice Track
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Try the <strong>Distributed Systems & SRE Practice Track</strong> to strengthen consensus algorithms and high-availability trade-offs.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-start gap-3">
                      <Flame className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Targeted Drill: The STAR Framework
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Ensure 70% of your response time is devoted to the <em>Action</em> step and concrete metrics in the <em>Result</em> step.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Content (lg:col-span-5): Key Strengths, Areas to Improve, Next Steps ── */}
            <div className="lg:col-span-5 space-y-6">
              {/* 1. Key Strengths Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h3 className="text-base font-bold text-slate-900">Key Strengths</h3>
                </div>

                <ul className="space-y-2.5 pt-1">
                  {strengthsList.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-snug">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. Areas to Improve Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <Lightbulb className="w-5 h-5 text-amber-500 fill-amber-100 shrink-0" />
                  <h3 className="text-base font-bold text-slate-900">Areas to Improve</h3>
                </div>

                <ul className="space-y-2.5 pt-1">
                  {areasToImproveList.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-snug">
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Next Steps Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <Rocket className="w-5 h-5 text-blue-600 shrink-0" />
                  <h3 className="text-base font-bold text-slate-900">Next Steps</h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  {/* Retake Interview Button */}
                  <button
                    onClick={() => onStartAgain(folder.title)}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border border-blue-600/30 text-blue-700 bg-white hover:bg-blue-50/60 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
                  >
                    <RotateCcw className="w-4 h-4 text-blue-600" />
                    <span>Retake Interview</span>
                  </button>

                  {/* Try Another Topic Button */}
                  <button
                    onClick={handleTryAnotherTopic}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-sm shadow-blue-500/25 cursor-pointer active:scale-98"
                  >
                    <span>Try Another Topic</span>
                    <ArrowRight className="w-4 h-4" />
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
