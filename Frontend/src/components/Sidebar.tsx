import { useState } from 'react';
import {
  Home,
  GraduationCap,
  TrendingUp,
  BookmarkCheck,
  Search,
  Settings,
  X,
  LogOut,
} from 'lucide-react';
import { NavTab, HistoryFolder } from '../types';
import { UserAvatar } from './UserAvatar';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  folders: HistoryFolder[];
  selectedFolderId?: string;
  onSelectFolder: (folderId: string) => void;
  onOpenSettings: () => void;
  sidebarSearch: string;
  setSidebarSearch: (q: string) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  currentUser?: { name: string; email: string; isGuest?: boolean } | null;
  onLogout?: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  folders,
  selectedFolderId,
  onSelectFolder,
  onOpenSettings,
  sidebarSearch,
  setSidebarSearch,
  isMobileOpen = false,
  onCloseMobile,
  currentUser,
  onLogout,
}: SidebarProps) {
  const filteredFolders = folders.filter((f) =>
    f.title.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  const navItems: Array<{ id: NavTab; label: string; icon: typeof Home }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'practices', label: 'Practices', icon: GraduationCap },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'best-practices', label: 'Best parctices', icon: BookmarkCheck },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#141414] text-neutral-200 flex flex-col justify-between border-r border-neutral-800/80 transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-neutral-800">
          {/* Top Brand Logo */}
          <div className="flex items-center justify-between mb-8 px-2">
            <button
              onClick={() => {
                onSelectTab('home');
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex items-center gap-3 text-left group focus:outline-hidden"
            >
              {/* InterTrain Mortarboard Icon */}
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/20 group-hover:bg-white/15 transition-all">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-sans">
                InterTrain
              </span>
            </button>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden text-neutral-400 hover:text-white p-1"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Main Navigation Menu */}
          <nav className="space-y-1.5 mb-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentTab === item.id &&
                (item.id !== 'home' || !selectedFolderId);

              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-full text-[15px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#0e447f] text-white shadow-sm font-semibold'
                      : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Search Bar in Sidebar */}
          <div className="mb-6 px-1">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-neutral-500 pointer-events-none" />
              <input
                type="text"
                id="sidebar-search-input"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Search"
                className="w-full bg-[#242424] text-neutral-200 placeholder-neutral-500 text-sm pl-9 pr-3 py-2 rounded-full border border-neutral-700/40 focus:outline-hidden focus:border-neutral-500 transition-colors"
              />
              {sidebarSearch && (
                <button
                  onClick={() => setSidebarSearch('')}
                  className="absolute right-3 text-neutral-500 hover:text-neutral-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* History Section */}
          <div className="flex-1 px-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3 px-3">
              History
            </h4>

            <div className="space-y-1">
              {filteredFolders.map((folder) => {
                const isSelected =
                  currentTab === 'review' && selectedFolderId === folder.id;

                return (
                  <button
                    key={folder.id}
                    id={`sidebar-folder-${folder.id}`}
                    onClick={() => {
                      onSelectFolder(folder.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-sm transition-all text-left ${
                      isSelected
                        ? 'bg-neutral-800 text-white font-semibold'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
                    }`}
                  >
                    <span className="truncate">{folder.title}</span>
                    <span className="text-xs text-neutral-500 font-medium">
                      {folder.count}
                    </span>
                  </button>
                );
              })}

              {filteredFolders.length === 0 && (
                <p className="text-xs text-neutral-500 px-3 py-2 italic">
                  No match found
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom User Profile */}
        <div className="p-4 border-t border-neutral-800/80 bg-[#121212] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="text-sm font-semibold text-neutral-200 truncate leading-tight">
                  {currentUser?.name || 'Billu badmash'}
                </p>
                {currentUser?.isGuest && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                    DEV
                  </span>
                )}
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {currentUser?.isGuest ? 'Guest Bypass' : 'Online'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-neutral-400 hover:text-red-400 p-2 rounded-full hover:bg-neutral-800/70 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button
              id="settings-trigger-btn"
              onClick={onOpenSettings}
              className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800/70 transition-colors"
              title="Settings & Audio/Video Config"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
