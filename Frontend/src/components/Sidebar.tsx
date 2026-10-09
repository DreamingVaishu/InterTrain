import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  BookOpen,
  BarChart3,
  History,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Search,
  ChevronRight,
  Pencil,
  Check,
} from 'lucide-react';
import { NavTab, HistoryFolder } from '../types';
import intertrainLogo from '../assets/logo.jpg';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  folders: HistoryFolder[];
  selectedFolderId?: string;
  selectedHistoryId?: string | null;
  onSelectFolder: (folderId: string, attemptNumber?: number, historyId?: string) => void;
  onOpenSettings: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  currentUser?: { name: string; email: string; isGuest?: boolean } | null;
  onLogout?: () => void;
  width?: number;
  onWidthChange?: (width: number) => void;
  onRenameHistoryItem?: (
    id: string,
    newTitle: string,
    folderId?: string,
    attemptNumber?: number
  ) => void;
}

interface BackendSession {
  section_id: string;
  subject: string;
  difficulty: string;
  status: string;
  current_round: number;
  started_at: string;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  folders,
  selectedFolderId,
  selectedHistoryId,
  onSelectFolder,
  onOpenSettings,
  isMobileOpen = false,
  onCloseMobile,
  currentUser,
  onLogout,
  width = 260,
  onWidthChange,
  onRenameHistoryItem,
}: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [backendSessions, setBackendSessions] = useState<BackendSession[]>([]);

  // Inline editing state for history titles
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [customTitlesVersion, setCustomTitlesVersion] = useState(0);

  // Resizing state
  const [isResizing, setIsResizing] = useState(false);

  // Fetch real backend sessions from disk on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/live-interview/sessions')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setBackendSessions(data);
        }
      })
      .catch(() => {});
  }, []);

  // Resizing event listeners (drag right border to adjust width, ChatGPT style)
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Clamped between 200px and 480px
      const newWidth = Math.max(200, Math.min(480, e.clientX));
      if (onWidthChange) {
        onWidthChange(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onWidthChange]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  const resetWidth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWidthChange) {
      onWidthChange(260);
    }
  };

  // Main navigation buttons matching existing platform options
  const navButtons = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'practices' as NavTab, label: 'Practice', icon: BookOpen },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'history' as NavTab, label: 'History', icon: History },
  ];

  // Compile real history list from user attempts and backend recorded sessions
  const realHistory = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      folderId: string;
      attemptNumber?: number;
    }> = [];

    // Read custom titles from localStorage
    let customTitles: Record<string, string> = {};
    try {
      customTitles = JSON.parse(
        localStorage.getItem('intertrain_custom_history_titles') || '{}'
      );
    } catch {}

    // 1. Real user attempts stored in folders
    folders.forEach((folder) => {
      folder.attempts.forEach((attempt) => {
        const id = `attempt-${folder.id}-${attempt.attemptNumber}`;
        const defaultTitle =
          attempt.title ||
          (attempt.role
            ? `${attempt.role} - Attempt ${attempt.attemptNumber}`
            : `${folder.title} - Attempt ${attempt.attemptNumber}`);

        list.push({
          id,
          title: customTitles[id] || defaultTitle,
          folderId: folder.id,
          attemptNumber: attempt.attemptNumber,
        });
      });
    });

    // 2. Real backend live interview sessions recorded on disk
    backendSessions.forEach((sess) => {
      const alreadyListed = list.some((item) =>
        item.title.toLowerCase().startsWith(sess.subject.toLowerCase())
      );
      if (!alreadyListed && sess.subject) {
        const folderId = sess.subject.toLowerCase().includes('devops')
          ? 'devops'
          : sess.subject.toLowerCase().includes('backend')
          ? 'backend'
          : sess.subject.toLowerCase().includes('data')
          ? 'data-manager'
          : sess.subject.toLowerCase().includes('ai')
          ? 'devops'
          : 'ui-ux';

        const id = `sess-${sess.section_id}`;
        list.push({
          id,
          title: customTitles[id] || sess.subject,
          folderId,
        });
      }
    });

    return list;
  }, [folders, backendSessions, customTitlesVersion]);

  // Filter real history when search is used
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return realHistory;
    const q = searchQuery.toLowerCase();
    return realHistory.filter((item) => item.title.toLowerCase().includes(q));
  }, [realHistory, searchQuery]);

  // Start editing a history title
  const startEditing = (id: string, currentTitle: string) => {
    setEditingHistoryId(id);
    setEditingTitle(currentTitle);
  };

  const cancelEditing = () => {
    setEditingHistoryId(null);
    setEditingTitle('');
  };

  const saveEditing = (
    id: string,
    folderId?: string,
    attemptNumber?: number
  ) => {
    const trimmed = editingTitle.trim();
    if (trimmed) {
      if (onRenameHistoryItem) {
        onRenameHistoryItem(id, trimmed, folderId, attemptNumber);
      }
      setCustomTitlesVersion((v) => v + 1);
    }
    setEditingHistoryId(null);
    setEditingTitle('');
  };

  // Initials for avatar
  const initials = useMemo(() => {
    const rawName = currentUser?.name?.trim() || 'Aman Kanojiya';
    const cleanWords = rawName
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
    if (cleanWords.length >= 2) {
      return (cleanWords[0][0] + cleanWords[1][0]).toUpperCase();
    }
    if (cleanWords.length === 1) {
      return cleanWords[0].slice(0, 2).toUpperCase();
    }
    return 'AK';
  }, [currentUser]);

  const userName = currentUser?.name || 'Aman Kanojiya';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* InterTrain Resizable Navy Blue Sidebar with ChatGPT-Style History Layout */}
      <aside
        style={{
          width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${width}px` : undefined,
        }}
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0B0F19] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 transition-transform duration-300 ease-in-out select-none lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full'
        }`}
      >
        {/* ChatGPT-Style Resizer Handle on Right Edge */}
        <div
          onMouseDown={startResizing}
          onDoubleClick={resetWidth}
          className={`hidden lg:block absolute top-0 -right-1 bottom-0 w-2.5 cursor-col-resize z-50 group/resizer transition-colors ${
            isResizing ? 'bg-blue-500/80 shadow-md shadow-blue-500/50' : 'hover:bg-blue-500/40 bg-transparent'
          }`}
          title="Drag to resize sidebar • Double-click to reset"
        >
          {/* Subtle grab bar indicator */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 right-[3px] w-[3px] rounded-full transition-all duration-150 ${
              isResizing
                ? 'h-14 bg-white opacity-100'
                : 'h-8 bg-slate-500 opacity-0 group-hover/resizer:opacity-100 group-hover/resizer:bg-blue-400'
            }`}
          />
        </div>

        <div className="flex flex-col min-h-0 flex-1 px-3.5 py-4">
          {/* Header Row: InterTrain Logo & Controls */}
          <div className="flex items-center justify-between mb-5 px-1">
            <button
              onClick={() => {
                onSelectTab('home');
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <img
                src={intertrainLogo}
                alt="InterTrain"
                className="w-8 h-8 rounded-lg object-cover border border-blue-500/30 group-hover:border-blue-400/60 transition-colors"
              />
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                InterTrain
              </span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors ${
                  searchOpen ? 'bg-slate-800 text-white' : ''
                }`}
                title="Search history"
              >
                <Search className="w-4 h-4" />
              </button>

              {onCloseMobile ? (
                <button
                  onClick={onCloseMobile}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Quick Search Box */}
          {searchOpen && (
            <div className="mb-3 px-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search interviews..."
                autoFocus
                className="w-full bg-[#111827] text-sm text-slate-100 placeholder-slate-500 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Primary Navigation Buttons (Home, Practice, Analytics, History) */}
          <nav className="space-y-1 mb-4">
            {navButtons.map((btn) => {
              const Icon = btn.icon;
              const isActive = currentTab === btn.id;

              return (
                <button
                  key={btn.id}
                  onClick={() => {
                    onSelectTab(btn.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left group ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Recents Section Header */}
          <div className="flex items-center justify-between px-2 pt-3 pb-2 border-t border-slate-800/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recents
            </h4>
            <button
              onClick={() => {
                onSelectTab('history');
                if (onCloseMobile) onCloseMobile();
              }}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              View all
            </button>
          </div>

          {/* Real History Items List (ChatGPT-style scrollable list with inline renaming) */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {filteredHistory.map((item) => {
              const isSelected =
                currentTab === 'review' &&
                (selectedHistoryId
                  ? selectedHistoryId === item.id
                  : selectedFolderId === item.folderId && item.attemptNumber === 1);
              const isEditing = editingHistoryId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isEditing) return;
                    onSelectFolder(item.folderId, item.attemptNumber, item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all group cursor-pointer text-left ${
                    isSelected
                      ? 'bg-slate-800/90 text-white font-medium border border-blue-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                  title={isEditing ? undefined : item.title}
                >
                  {isEditing ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        saveEditing(item.id, item.folderId, item.attemptNumber);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 w-full"
                    >
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.stopPropagation();
                            cancelEditing();
                          }
                        }}
                        autoFocus
                        className="flex-1 min-w-0 bg-[#111827] text-[13px] text-white px-2 py-1 rounded-lg border border-blue-500 focus:outline-none ring-1 ring-blue-500/50"
                      />
                      <button
                        type="submit"
                        className="p-1 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-colors shrink-0"
                        title="Save (Enter)"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditing();
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors shrink-0"
                        title="Cancel (Esc)"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="text-[13px] font-medium text-slate-200 group-hover:text-white truncate leading-normal flex-1 mr-2">
                        {item.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(item.id, item.title);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all shrink-0"
                        title="Rename interview"
                        aria-label="Rename interview"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              );
            })}

            {filteredHistory.length === 0 && (
              <p className="text-xs text-slate-500 px-3 py-4 italic text-center">
                No recent interviews found
              </p>
            )}
          </div>
        </div>

        {/* User Profile Pill at Bottom (Navy Blue) */}
        <div className="p-3 border-t border-slate-800/80 bg-[#090D16] relative">
          {showProfileMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#121C33] rounded-xl border border-slate-700/80 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  window.alert(
                    'InterTrain Platform Guide\n\nAI-powered mock interviews, real-time code execution, voice interaction and performance metrics.'
                  );
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Help & Guides</span>
              </button>

              {onLogout && (
                <div className="mt-1 pt-1 border-t border-slate-700/60">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Navy/Blue Gradient Avatar with User Initials */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden shrink-0">
                {initials}
              </div>

              <div className="min-w-0 text-left">
                <p className="text-sm font-medium text-white truncate leading-tight">
                  {userName}
                </p>
                <p className="text-xs text-slate-400 truncate">Student</p>
              </div>
            </div>

            <div className="text-slate-500 group-hover:text-slate-300 transition-colors p-1">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
