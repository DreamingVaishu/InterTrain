import React from 'react';
import {
  Home,
  BookOpen,
  BarChart3,
  Video,
  Cloud,
  Database,
  Code2,
  Palette,
  Settings,
  HelpCircle,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { NavTab, HistoryFolder } from '../types';

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
  onSelectFolder,
  onOpenSettings,
  isMobileOpen = false,
  onCloseMobile,
  currentUser,
  onLogout,
}: SidebarProps) {
  const mainNavItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'practices' as NavTab, label: 'Practice', icon: BookOpen },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'practices' as NavTab, label: 'Mock Interviews', icon: Video, customFilter: 'mock' },
  ];

  const toolsItems = [
    { id: 'devops', label: 'DevOps', icon: Cloud },
    { id: 'data-manager', label: 'Data Manager', icon: Database },
    { id: 'backend', label: 'Backend', icon: Code2 },
    { id: 'ui-ux', label: 'UI/UX', icon: Palette },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B0F19] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto px-4 py-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Top Brand Header */}
          <div className="flex items-center justify-between mb-7 px-2">
            <button
              onClick={() => {
                onSelectTab('home');
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              {/* Mortarboard Brand Icon */}
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-600/30 transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-white"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                InterTrain
              </span>
            </button>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Main Navigation Items */}
          <nav className="space-y-1 mb-8">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.customFilter === 'mock'
                  ? false
                  : currentTab === item.id;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Tools Section */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 px-3">
              Tools
            </h4>
            <div className="space-y-1">
              {toolsItems.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onSelectFolder(tool.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className="w-full flex items-center gap-3.5 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all text-left"
                  >
                    <ToolIcon className="w-4 h-4 text-slate-400" />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Utility Nav: Settings & Help */}
          <div className="mt-auto pt-4 space-y-1 border-t border-slate-800/60">
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-3.5 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all text-left"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                window.alert('InterTrain Help Center\n\nNeed assistance? Access documentation or practice guidelines anytime.');
              }}
              className="w-full flex items-center gap-3.5 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all text-left"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help</span>
            </button>
          </div>
        </div>

        {/* User Profile Pill at Bottom */}
        <div className="p-3 border-t border-slate-800/80 bg-[#090D16]">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/40 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              {/* User Avatar Circle */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-slate-600/80 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden shrink-0">
                {currentUser?.name ? (
                  currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                ) : (
                  'BB'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate leading-tight">
                  {currentUser?.name || 'Billu Badmash'}
                </p>
                <p className="text-xs text-slate-400 truncate">Student</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
