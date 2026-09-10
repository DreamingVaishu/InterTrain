import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { NavTab, HistoryFolder, PracticeTrack, QuestionResponse, AttemptReview } from './types';
import { INITIAL_FOLDERS, PRACTICE_TRACKS } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { PracticesView } from './components/PracticesView';
import { AttemptReviewView } from './components/AttemptReviewView';
import { LivePracticeView } from './components/LivePracticeView';
import { AnalyticsView } from './components/AnalyticsView';
import { BestPracticesView } from './components/BestPracticesView';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [folders, setFolders] = useState<HistoryFolder[]>(() => {
    const saved = localStorage.getItem('intertrain_folders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_FOLDERS;
      }
    }
    return INITIAL_FOLDERS;
  });

  const [selectedFolderId, setSelectedFolderId] = useState<string>('devops');
  const [activeTrack, setActiveTrack] = useState<PracticeTrack>(PRACTICE_TRACKS[0]);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('intertrain_folders', JSON.stringify(folders));
  }, [folders]);

  // Navigate to folder review
  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    setCurrentTab('review');
  };

  // Launch live practice session from a track
  const handleStartPracticeTrack = (track: PracticeTrack) => {
    setActiveTrack(track);
    setCurrentTab('live-practice');
  };

  // Start again from review screen
  const handleStartAgain = (folderTitle: string) => {
    const matchedTrack =
      PRACTICE_TRACKS.find(
        (t) => t.title.toLowerCase().includes(folderTitle.toLowerCase()) ||
               folderTitle.toLowerCase().includes(t.title.toLowerCase())
      ) || PRACTICE_TRACKS[0];

    setActiveTrack(matchedTrack);
    setCurrentTab('live-practice');
  };

  // End live practice and generate attempt
  const handleEndLiveSession = (completedSession: {
    track: PracticeTrack;
    duration: string;
    questions: QuestionResponse[];
    code: string;
    language: string;
  }) => {
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
      role: completedSession.track.title,
      title: targetFolder.title,
      questions: completedSession.questions,
      finalSummary:
        newAttemptNumber > 1
          ? 'Strong technical agility demonstrated! Clear explanations on algorithmic trade-offs and code structure.'
          : 'Good foundation with room for improvement in verbal brevity and STAR method structuring.',
      tips: [
        'State concrete execution metrics before walking through architecture.',
        'Keep verbal cadence steady and confident when handling edge cases.',
        'Well done on the code syntax and test validation pass.',
      ],
      metrics: {
        confidence: Math.min(95, 75 + newAttemptNumber * 5),
        technicalAccuracy: 88,
        conciseness: 82,
        overallScore: Math.min(96, 80 + newAttemptNumber * 4),
      },
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

  // If in live practice session, render full screen as in Screenshot 5 & 6
  if (currentTab === 'live-practice') {
    return (
      <LivePracticeView
        track={activeTrack}
        onEndSession={handleEndLiveSession}
        onExit={() => setCurrentTab('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-neutral-100 flex flex-col font-sans">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#141414] border-b border-neutral-800 sticky top-0 z-30">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <span className="text-lg font-bold text-white tracking-tight">
          InterTrain
        </span>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-8 h-8 rounded-full overflow-hidden border border-neutral-700"
        >
          <div className="w-full h-full bg-[#0c3e74] flex items-center justify-center text-xs font-bold text-white">
            B
          </div>
        </button>
      </header>

      <div className="flex-1 flex">
        {/* Desktop & Mobile Drawer Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
          }}
          folders={folders}
          selectedFolderId={currentTab === 'review' ? selectedFolderId : undefined}
          onSelectFolder={handleSelectFolder}
          onOpenSettings={() => setIsSettingsOpen(true)}
          sidebarSearch={sidebarSearch}
          setSidebarSearch={setSidebarSearch}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content View with margin offset for sidebar on lg screens */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          {currentTab === 'home' && (
            <HomeView
              folders={folders}
              onSelectFolder={handleSelectFolder}
              onStartPractice={() => setCurrentTab('practices')}
            />
          )}

          {currentTab === 'practices' && (
            <PracticesView
              tracks={PRACTICE_TRACKS}
              onSelectTrack={handleStartPracticeTrack}
            />
          )}

          {currentTab === 'review' && (
            <AttemptReviewView
              folder={selectedFolder}
              onBack={() => setCurrentTab('home')}
              onStartAgain={handleStartAgain}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              folders={folders}
              onSelectFolder={handleSelectFolder}
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
