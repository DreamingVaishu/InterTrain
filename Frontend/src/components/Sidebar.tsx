import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Home,
  BookOpen,
  BarChart3,
  History,
  Settings,
  HelpCircle,
  LogOut,
  X,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { NavTab, HistoryFolder } from '../types';
import intertrainLogo from '../assets/logo.jpg';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  folders: HistoryFolder[];
  selectedFolderId?: string;
  onSelectFolder: (folderId: string) => void;
  onOpenSettings: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  currentUser?: { name: string; email: string; isGuest?: boolean } | null;
  onLogout?: () => void;
}

const HEADER_HEIGHT = 76;
const SIDEBAR_WIDTH = 80;
const ACTIVE_MERGE_BG = '#121C33'; // Seamless dark navy matching InterTrain palette

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [iconOffsets, setIconOffsets] = useState<Record<string, number>>({});
  const navRef = useRef<HTMLElement>(null);
  const iconRefs = useRef<Record<string, HTMLDivElement | null>>({});

interface NavSubItem {
  id: string;
  label: string;
  tab?: NavTab;
  folderId?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tab: NavTab;
  subItems?: NavSubItem[];
}

// Navigation Items with Sub-items for Aiva-style Flyout
const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    tab: 'home' as NavTab,
    subItems: [
      { id: 'sub-home-dash', label: 'Dashboard', tab: 'home' as NavTab },
      { id: 'sub-home-practice', label: 'Practice Sets', tab: 'practices' as NavTab },
    ],
  },
  {
    id: 'practices',
    label: 'Practice',
    icon: BookOpen,
    tab: 'practices' as NavTab,
    subItems: [
      { id: 'sub-all-tracks', label: 'All Practice Tracks', tab: 'practices' as NavTab },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    tab: 'analytics' as NavTab,
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
    tab: 'history' as NavTab,
  },
];

  // Measure icon vertical offsets for flyout alignment
  const measureOffsets = useCallback(() => {
    if (!navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const offsets: Record<string, number> = {};
    for (const [id, el] of Object.entries(iconRefs.current)) {
      const elNode = el as HTMLElement | null;
      if (elNode) {
        const elRect = elNode.getBoundingClientRect();
        offsets[id] = elRect.top - navRect.top;
      }
    }
    setIconOffsets(offsets);
  }, []);

  useEffect(() => {
    measureOffsets();
    window.addEventListener('resize', measureOffsets);
    return () => window.removeEventListener('resize', measureOffsets);
  }, [measureOffsets]);

  const hoveredItem = navItems.find((i) => i.id === hoveredId);
  const hasSubItems = hoveredItem && hoveredItem.subItems && hoveredItem.subItems.length > 0;
  const displayId = hasSubItems ? hoveredId : null;
  const displaySubItems = hasSubItems ? hoveredItem?.subItems : null;
  const panelTop = displayId ? iconOffsets[displayId] ?? 0 : 0;

  // Active item logic
  const isItemActive = (id: string) => {
    if (id === 'home' && currentTab === 'home') return true;
    if (id === 'practices' && (currentTab === 'practices' || currentTab === 'best-practices')) return true;
    if (id === 'analytics' && currentTab === 'analytics') return true;
    if (id === 'history' && (currentTab === 'history' || currentTab === 'review')) return true;
    return false;
  };

  /* ── Desktop Aiva-Style Rail ────────────────────────────────────────── */
  const desktopSidebar = (
    <div
      className="fixed left-0 top-0 bottom-0 z-40 hidden lg:flex"
      onMouseLeave={() => {
        setHoveredId(null);
        setShowProfileCard(false);
      }}
    >
      {/* Vertical Icon Rail (80px wide) */}
      <div
        className="relative z-20 h-full flex flex-col justify-between items-center shadow-2xl border-r border-slate-800/90"
        style={{
          width: SIDEBAR_WIDTH,
          background: 'linear-gradient(180deg, #0B0F19 0%, #0E1424 50%, #0B0F19 100%)',
        }}
      >
        {/* Top Logo Section matching Aiva */}
        <div className="w-full flex flex-col items-center">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="flex-shrink-0 flex items-center justify-center w-full group cursor-pointer focus:outline-hidden"
            style={{ height: HEADER_HEIGHT }}
            title="InterTrain Home"
          >
            <div className="w-[52px] h-[52px] rounded-2xl bg-[#0B0F19] border border-blue-500/40 flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:border-blue-400 transition-all overflow-hidden p-0.5">
              <img
                src={intertrainLogo}
                alt="InterTrain Logo"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
          </button>

          {/* Navigation Items (Icon on top, label below) */}
          <nav ref={navRef} className="flex flex-col items-center gap-4 w-full pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.id);
              const isMerged = displayId === item.id;

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    iconRefs.current[item.id] = el;
                  }}
                  className="relative w-full flex justify-end"
                  onMouseEnter={() => setHoveredId(item.id)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (item.tab) {
                        onSelectTab(item.tab);
                      }
                    }}
                    className={`
                      flex flex-col items-center justify-center
                      w-[72px] py-2.5
                      text-[11px] font-medium tracking-wide
                      transition-all duration-200 cursor-pointer
                      ${isMerged ? 'rounded-l-2xl rounded-r-none' : 'rounded-xl w-[64px] mr-2'}
                      ${
                        isMerged
                          ? 'text-white shadow-[-4px_0_12px_rgba(0,0,0,0.35)]'
                          : active
                          ? 'bg-blue-600/25 text-white font-semibold shadow-inner'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                    style={{
                      backgroundColor: isMerged ? ACTIVE_MERGE_BG : undefined,
                      paddingRight: isMerged ? '8px' : '0',
                    }}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${active || isMerged ? 'text-white' : 'text-slate-400'}`} />
                    <span className="leading-none text-[10px] select-none">{item.label}</span>
                  </button>

                  {/* Left edge active indicator bar (Aiva style) */}
                  {active && !isMerged && (
                    <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-[3.5px] h-7 rounded-r-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)] transition-all" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: Settings & User Profile Avatar */}
        <div className="w-full flex flex-col items-center gap-3 pb-5 pt-3 border-t border-slate-800/80">
          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Open Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User Profile Avatar Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileCard(!showProfileCard)}
              className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0c3e74] to-[#1e40af] border border-blue-400/40 flex items-center justify-center text-xs font-bold text-white shadow-md hover:scale-105 transition-all cursor-pointer overflow-hidden"
              title={currentUser?.name || 'User Profile'}
            >
              {currentUser?.name
                ? currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'BB'}
            </button>

            {/* Profile Popover on hover or click */}
            {showProfileCard && (
              <div className="absolute left-16 bottom-0 w-64 bg-[#121C33] border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-50 text-left animate-in fade-in slide-in-from-left-2 duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'B'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {currentUser?.name || 'Billu Badmash'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {currentUser?.email || 'student@intertrain.edu'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Candidate Mode
                  </span>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium hover:underline cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Expand Flyout Panel (Aiva Contiguous Shape on Hover) ──── */}
      {displaySubItems && (
        <div
          className="absolute z-10 overflow-hidden rounded-r-2xl rounded-bl-2xl shadow-2xl border-y border-r border-slate-700/60 transition-all animate-in fade-in slide-in-from-left-2 duration-150"
          style={{
            left: SIDEBAR_WIDTH - 1,
            top: HEADER_HEIGHT + 14 + panelTop,
            minWidth: 175,
            backgroundColor: ACTIVE_MERGE_BG,
          }}
        >
          <div className="flex flex-col gap-1 p-2.5">
            {displaySubItems.map((sub) => {
              const isSubActive =
                sub.tab ? currentTab === sub.tab : false;

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    if (sub.tab) {
                      onSelectTab(sub.tab);
                    } else if (sub.folderId) {
                      onSelectFolder(sub.folderId);
                    }
                    setHoveredId(null);
                  }}
                  className={`
                    w-full text-left px-3.5 py-2 rounded-xl
                    text-xs font-medium tracking-wide flex items-center justify-between
                    transition-all duration-150 cursor-pointer
                    ${
                      isSubActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {sub.icon && React.createElement(sub.icon, { className: 'w-3.5 h-3.5 text-slate-400' })}
                    <span>{sub.label}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-500 opacity-60" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  /* ── Mobile Drawer (Slide in for small screens) ─────────────────────── */
  const mobileDrawer = isMobileOpen && (
    <>
      <div
        onClick={onCloseMobile}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
      />

      <aside
        className="fixed left-0 top-0 bottom-0 z-50 w-72 shadow-2xl lg:hidden flex flex-col justify-between border-r border-slate-800"
        style={{
          background: 'linear-gradient(180deg, #0B0F19 0%, #0E1424 50%, #0B0F19 100%)',
        }}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5" style={{ height: HEADER_HEIGHT }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B0F19] border border-blue-500/40 flex items-center justify-center overflow-hidden p-0.5 shadow-sm">
                <img
                  src={intertrainLogo}
                  alt="InterTrain Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="text-base font-bold text-white leading-none">InterTrain</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Practice Platform</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseMobile}
              className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="px-3 py-4 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.id);

              return (
                <div key={item.id} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.tab) {
                        onSelectTab(item.tab);
                      }
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors text-left ${
                      active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>

                  {/* Sub-items in mobile */}
                  {item.subItems && (
                    <div className="pl-10 pr-2 py-1 space-y-1">
                      {item.subItems.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            if (sub.tab) {
                              onSelectTab(sub.tab);
                            } else if (sub.folderId) {
                              onSelectFolder(sub.folderId);
                            }
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom Settings & User in Mobile */}
          <div className="mt-auto p-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {currentUser?.name || 'Billu Badmash'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">Candidate</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                if (onCloseMobile) onCloseMobile();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );

  return (
    <>
      {desktopSidebar}
      {mobileDrawer}
    </>
  );
}
