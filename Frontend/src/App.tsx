import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { NavTab, HistoryFolder, PracticeTrack, QuestionResponse, AttemptReview, InterviewConfig } from './types';
import { INITIAL_FOLDERS, PRACTICE_TRACKS } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { PracticesView } from './views/PracticesView';
import { AttemptReviewView } from './views/AttemptReviewView';
import { LivePracticeView } from './views/LivePracticeView';
import { InterviewSetupView } from './views/InterviewSetupView';
import { AnalyticsView } from './views/AnalyticsView';
import { BestPracticesView } from './views/BestPracticesView';
import { HistoryView } from './views/HistoryView';
import { SettingsModal } from './components/SettingsModal';
import LoginPage, { UserAuthData } from './views/auth/LoginPage';
import { generateSessionId, extractSessionIdFromUrl } from './utils/session';
import type { InterviewEvaluation } from './services/liveInterview';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAuthData | null>(() => {
    const saved = localStorage.getItem('intertrain_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Track the active 19-digit Section/Session ID for backend integration (e.g. 2567837851963606030)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => extractSessionIdFromUrl());

  // Configuration selected in setup view (difficulty, camera & mic access)
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig | null>(null);

  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    const initialSession = extractSessionIdFromUrl();
    return initialSession ? 'practice-setup' : 'home';
  });
  const [folders, setFolders] = useState<HistoryFolder[]>(() => {
    const saved = localStorage.getItem('intertrain_folders');
    if (saved) {
      try {
        const parsed: HistoryFolder[] = JSON.parse(saved);
        return INITIAL_FOLDERS.map((initF) => {
          const found = parsed.find((p) => p.id === initF.id);
          if (!found) return initF;
          // If mock data has more attempts, prefer the richer mock data
          if (found.attempts.length < initF.attempts.length) {
            return initF;
          }
          return found;
        });
      } catch {
        return INITIAL_FOLDERS;
      }
    }
    return INITIAL_FOLDERS;
  });

  const [selectedFolderId, setSelectedFolderId] = useState<string>('devops');
  const [selectedAttemptNumber, setSelectedAttemptNumber] = useState<number | undefined>(undefined);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [activeTrack, setActiveTrack] = useState<PracticeTrack>(PRACTICE_TRACKS[0]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Adjustable sidebar width (persisted in localStorage, default 260px)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('intertrain_sidebar_width');
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num) && num >= 200 && num <= 480) {
        return num;
      }
    }
    return 260;
  });

  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarWidthChange = (newWidth: number) => {
    setSidebarWidth(newWidth);
    localStorage.setItem('intertrain_sidebar_width', newWidth.toString());
  };

  const handleRenameHistoryItem = (
    historyId: string,
    newTitle: string,
    folderId?: string,
    attemptNumber?: number
  ) => {
    // 1. Update folders state
    setFolders((prevFolders) =>
      prevFolders.map((folder) => {
        if (folderId && folder.id !== folderId) return folder;
        return {
          ...folder,
          attempts: folder.attempts.map((attempt) => {
            if (attemptNumber !== undefined && attempt.attemptNumber === attemptNumber) {
              return {
                ...attempt,
                title: newTitle,
                role: newTitle,
              };
            }
            return attempt;
          }),
        };
      })
    );

    // 2. Persist in custom history titles dictionary
    try {
      const currentOverrides = JSON.parse(
        localStorage.getItem('intertrain_custom_history_titles') || '{}'
      );
      currentOverrides[historyId] = newTitle;
      localStorage.setItem('intertrain_custom_history_titles', JSON.stringify(currentOverrides));
    } catch {}
  };

  const handleLogin = (userData: UserAuthData) => {
    setCurrentUser(userData);
    localStorage.setItem('intertrain_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('intertrain_user');
    setActiveSessionId(null);
    window.history.pushState(null, '', '/');
    setCurrentTab('home');
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('intertrain_folders', JSON.stringify(folders));
  }, [folders]);

  // Sync browser URL & popstate for /projects/:sessionId
  useEffect(() => {
    const handlePopState = () => {
      const poppedSessionId = extractSessionIdFromUrl();
      if (poppedSessionId) {
        setActiveSessionId(poppedSessionId);
        setCurrentTab((prev) => (prev === 'live-practice' ? 'live-practice' : 'practice-setup'));
      } else {
        setActiveSessionId(null);
        setCurrentTab((prev) => (prev === 'live-practice' || prev === 'practice-setup' ? 'home' : prev));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate to folder review or specific attempt
  const handleSelectFolder = (folderId: string, attemptNumber?: number, historyId?: string) => {
    setSelectedFolderId(folderId);
    setSelectedAttemptNumber(attemptNumber);
    setSelectedHistoryId(historyId || (attemptNumber !== undefined ? `attempt-${folderId}-${attemptNumber}` : `folder-${folderId}`));
    setCurrentTab('review');
  };

  // Launch interview setup stage before starting practice
  const handleStartPracticeTrack = (track: PracticeTrack) => {
    const newSessionId = generateSessionId();
    setActiveTrack(track);
    setActiveSessionId(newSessionId);
    window.history.pushState({ sessionId: newSessionId, trackId: track.id }, '', `/projects/${newSessionId}`);
    setCurrentTab('practice-setup');
  };

  // Start again from review screen with new unique 19-digit section ID in URL
  const handleStartAgain = (folderTitle: string) => {
    const matchedTrack =
      PRACTICE_TRACKS.find(
        (t) => t.title.toLowerCase().includes(folderTitle.toLowerCase()) ||
               folderTitle.toLowerCase().includes(t.title.toLowerCase())
      ) || PRACTICE_TRACKS[0];

    const newSessionId = generateSessionId();
    setActiveTrack(matchedTrack);
    setActiveSessionId(newSessionId);
    window.history.pushState({ sessionId: newSessionId, trackId: matchedTrack.id }, '', `/projects/${newSessionId}`);
    setCurrentTab('practice-setup');
  };

  // End live practice and generate attempt
  const handleEndLiveSession = (completedSession: {
    track: PracticeTrack;
    duration: string;
    questions: QuestionResponse[];
    code: string;
    language: string;
    sessionId?: string;
    evaluation?: InterviewEvaluation;
    codeProblem?: NonNullable<InterviewEvaluation['coding_problem']>;
    codeReview?: NonNullable<InterviewEvaluation['code_review']>;
  }) => {
    // Reset section URL when session concludes
    setActiveSessionId(null);
    window.history.pushState(null, '', '/');

    // Determine matching folder or create/update
    const folderId = completedSession.track.id.includes('devops')
      ? 'devops'
      : completedSession.track.id.includes('ai')
      ? 'devops' // or add new
      : completedSession.track.id.includes('data')
      ? 'data-manager'
      : completedSession.track.id.includes('backend')
      ? 'backend'
      : 'ui-ux';

    const targetFolder = folders.find((f) => f.id === folderId) || folders[0];
    const newAttemptNumber = targetFolder.attempts.length + 1;

    const newAttempt: AttemptReview = {
      attemptNumber: newAttemptNumber,
      date: 'Today',
      duration: completedSession.duration,
      role: completedSession.track.title,
      title: targetFolder.title,
      questions: completedSession.questions,
      finalSummary:
        completedSession.evaluation?.summary ||
        (newAttemptNumber > 1
          ? 'Strong technical agility demonstrated! Clear explanations on algorithmic trade-offs and code structure.'
          : 'Good foundation with room for improvement in verbal brevity and STAR method structuring.'),
      tips:
        completedSession.evaluation?.improvements?.length
          ? completedSession.evaluation.improvements
          : [
              'State concrete execution metrics before walking through architecture.',
              'Keep verbal cadence steady and confident when handling edge cases.',
              'Well done on the code syntax and test validation pass.',
            ],
      metrics: {
        confidence: completedSession.evaluation?.communication ?? Math.min(95, 75 + newAttemptNumber * 5),
        technicalAccuracy: completedSession.evaluation?.technical_accuracy ?? 88,
        conciseness: completedSession.evaluation?.conciseness ?? 82,
        overallScore: completedSession.evaluation?.overall_score ?? Math.min(96, 80 + newAttemptNumber * 4),
      },
      codeProblem: completedSession.codeProblem,
      codeReview: completedSession.codeReview,
      code: completedSession.code,
      language: completedSession.language,
    };

    setFolders((prevFolders) =>
      prevFolders.map((f) => {
        if (f.id === targetFolder.id) {
          return {
            ...f,
            count: f.count + 1,
            attempts: [newAttempt, ...f.attempts],
          };
        }
        return f;
      })
    );

    setSelectedFolderId(targetFolder.id);
    setCurrentTab('review');
  };

  // Reset demo data
  const handleResetData = () => {
    setFolders(INITIAL_FOLDERS);
    localStorage.removeItem('intertrain_folders');
  };

  const selectedFolder =
    folders.find((f) => f.id === selectedFolderId) || folders[0];

  // If not authenticated, render the Sign Up / Login page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} initialMode="signup" />;
  }

  // If in live practice session, render full screen as in Screenshot 5 & 6
  if (currentTab === 'live-practice') {
    return (
      <LivePracticeView
        track={activeTrack}
        sessionId={activeSessionId || undefined}
        difficulty={interviewConfig?.difficulty}
        initialCameraOn={interviewConfig?.isCameraEnabled}
        initialMicMuted={interviewConfig ? !interviewConfig.isMicEnabled : false}
        userName={currentUser?.name || 'Billu Badmash'}
        onEndSession={handleEndLiveSession}
        onExit={() => {
          setActiveSessionId(null);
          window.history.pushState(null, '', '/');
          setCurrentTab('home');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 flex flex-col font-sans">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0B0F19] border-b border-slate-800 sticky top-0 z-30 text-white">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <span className="text-lg font-bold text-white tracking-tight">
          InterTrain
        </span>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-8 h-8 rounded-full overflow-hidden border border-slate-700"
        >
          <div className="w-full h-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'B'}
          </div>
        </button>
      </header>

      <div className="flex-1 flex">
        {/* Desktop & Mobile Drawer Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab !== 'review') {
              setSelectedHistoryId(null);
              setSelectedAttemptNumber(undefined);
            }
            setCurrentTab(tab);
          }}
          folders={folders}
          selectedFolderId={currentTab === 'review' ? selectedFolderId : undefined}
          selectedHistoryId={currentTab === 'review' ? selectedHistoryId : null}
          onSelectFolder={handleSelectFolder}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          currentUser={currentUser}
          onLogout={handleLogout}
          width={sidebarWidth}
          onWidthChange={handleSidebarWidthChange}
          onRenameHistoryItem={handleRenameHistoryItem}
        />

        {/* Main Content View with adjustable margin offset for resizable sidebar */}
        <main
          style={{
            marginLeft: isDesktop ? `${sidebarWidth}px` : 0,
          }}
          className="flex-1 min-h-screen transition-[margin] duration-75"
        >
          {currentTab === 'home' && (
            <HomeView
              folders={folders}
              onSelectFolder={handleSelectFolder}
              onStartPractice={() => setCurrentTab('practices')}
              onStartMockInterview={() => {
                const targetTrack =
                  PRACTICE_TRACKS.find((t) => t.title.toLowerCase().includes('backend')) ||
                  PRACTICE_TRACKS[0];
                handleStartPracticeTrack(targetTrack);
              }}
              onViewProgress={() => setCurrentTab('analytics')}
              userName={currentUser?.name}
            />
          )}

          {currentTab === 'practices' && (
            <PracticesView
              tracks={PRACTICE_TRACKS}
              onSelectTrack={handleStartPracticeTrack}
              onViewProgress={() => setCurrentTab('analytics')}
              userName={currentUser?.name}
            />
          )}

          {currentTab === 'practice-setup' && (
            <InterviewSetupView
              track={activeTrack}
              sessionId={activeSessionId || generateSessionId()}
              onJoinInterview={(config) => {
                setInterviewConfig(config);
                setCurrentTab('live-practice');
              }}
              onBack={() => {
                setActiveSessionId(null);
                window.history.pushState(null, '', '/');
                setCurrentTab('practices');
              }}
            />
          )}

          {currentTab === 'review' && (
            <AttemptReviewView
              folder={selectedFolder}
              initialAttemptNumber={selectedAttemptNumber}
              onBack={() => setCurrentTab('home')}
              onStartAgain={handleStartAgain}
              onExploreTopics={() => setCurrentTab('practices')}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              folders={folders}
              onSelectFolder={handleSelectFolder}
              onStartPractice={() => setCurrentTab('practices')}
              onViewHistory={() => setCurrentTab('history')}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              folders={folders}
              onSelectFolder={handleSelectFolder}
              onStartPractice={() => setCurrentTab('practices')}
              onRenameHistoryItem={handleRenameHistoryItem}
            />
          )}

          {currentTab === 'best-practices' && (
            <BestPracticesView
              onStartPractice={() => setCurrentTab('practices')}
            />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetData={handleResetData}
      />
    </div>
  );
}
