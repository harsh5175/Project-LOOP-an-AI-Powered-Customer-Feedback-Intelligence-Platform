'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Role, AppTheme } from '@/types';
import { 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  Radio, 
  Check, 
  Palette,
  Sparkles,
  LogOut,
  Settings,
  Database,
} from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();
  const { 
    currentUser, 
    currentRole, 
    setCurrentRole, 
    globalSearchQuery, 
    setGlobalSearchQuery,
    appTheme,
    setAppTheme,
    showToast,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent));
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const roleConfigs: Record<Role, { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
    ADMIN: {
      label: 'Admin',
      badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
      icon: ShieldCheck,
      description: 'Full workspace access: ingest, triage, AI re-classify, reports, and team management.',
    },
    ANALYST: {
      label: 'Analyst',
      badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
      icon: UserCheck,
      description: 'Feedback ingestion, triage status management, theme exploration, Ask LOOP, and report generation.',
    },
    VIEWER: {
      label: 'Viewer (Read-Only)',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      icon: Eye,
      description: 'Read-only access to dashboards, feedback inbox, trends, and reports. Ingestion & triage restricted.',
    },
  };

  const themesList: Array<{ id: AppTheme; label: string; iconEmoji: string; previewColor: string; description: string }> = [
    {
      id: 'midnight',
      label: 'Midnight Indigo',
      iconEmoji: '🌌',
      previewColor: '#6366f1',
      description: 'Cosmic deep dark with indigo glow',
    },
    {
      id: 'obsidian',
      label: 'Obsidian Slate',
      iconEmoji: '🖤',
      previewColor: '#38bdf8',
      description: 'Linear & Vercel minimal carbon style',
    },
    {
      id: 'emerald',
      label: 'Cyber Emerald',
      iconEmoji: '🌲',
      previewColor: '#10b981',
      description: 'High-contrast FinTech & matrix palette',
    },
    {
      id: 'royal',
      label: 'Royal Amethyst',
      iconEmoji: '🔮',
      previewColor: '#a855f7',
      description: 'Luxury violet with velvet glow',
    },
  ];

  const activeConf = roleConfigs[currentRole];
  const ActiveIcon = activeConf.icon;
  const activeThemeObj = themesList.find((t) => t.id === appTheme) || themesList[0];

  return (
    <header className="h-16 border-b border-[var(--card-border)] bg-[var(--header-bg)] backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      {/* Search Input */}
      <div className="relative w-80 group">
        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
        <input
          ref={searchInputRef}
          id="global-feedback-search"
          name="search"
          aria-label="Search all feedback and themes"
          type="text"
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
          placeholder="Search all feedback & themes..."
          className="w-full pl-9 pr-14 py-2 text-xs bg-slate-900/90 text-slate-100 placeholder-slate-400 rounded-xl border border-[var(--card-border)] focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/25 transition-all font-medium shadow-inner"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/80 pointer-events-none select-none shadow-sm">
          <span>{isMac ? '⌘K' : 'Ctrl+K'}</span>
        </div>
        {globalSearchQuery && (
          <button
            onClick={() => setGlobalSearchQuery('')}
            aria-label="Clear search query"
            className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Right Controls: Theme Switcher, Role Switcher & User Profile */}
      <div className="flex items-center gap-3">
        {/* MongoDB Indicator */}
        <Link
          href="/settings"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-[var(--card-border)] text-xs text-slate-300 font-medium transition group"
          title="MongoDB Database Status (Click to manage)"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="font-mono text-[11px] text-emerald-300 font-semibold">MongoDB</span>
        </Link>

        {/* Simulated Sync Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-[var(--card-border)] text-xs text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
          <span>5 Channels Synced</span>
        </div>

        {/* Dynamic Theme Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowThemeMenu(!showThemeMenu);
              setShowRoleMenu(false);
            }}
            aria-label="Change Theme Palette"
            aria-expanded={showThemeMenu}
            aria-haspopup="true"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-xs font-semibold text-slate-200 shadow-sm transition-all"
            title="Change Theme Palette"
          >
            <span className="text-sm">{activeThemeObj.iconEmoji}</span>
            <span className="hidden sm:inline">{activeThemeObj.label}</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </button>

          {showThemeMenu && (
            <div 
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setShowThemeMenu(false)}
            >
              <div className="px-3 py-2 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Choose Theme</span>
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  Live
                </span>
              </div>

              <div className="mt-1 space-y-1">
                {themesList.map((t) => {
                  const isSelected = appTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setAppTheme(t.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-800 border border-indigo-500/50 text-white shadow-sm'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: t.previewColor }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-100">{t.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block leading-tight">{t.description}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Live RBAC Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowThemeMenu(false);
            }}
            aria-label="Test role permissions (RBAC)"
            aria-expanded={showRoleMenu}
            aria-haspopup="true"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all ${activeConf.badgeClass} hover:brightness-110`}
            title="Click to test role permissions (RBAC)"
          >
            <ActiveIcon className="w-3.5 h-3.5" />
            <span>Role: {activeConf.label}</span>
            <span className="text-[10px] text-slate-400 ml-0.5">▼</span>
          </button>

          {/* Role selection dropdown */}
          {showRoleMenu && (
            <div 
              className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setShowRoleMenu(false)}
            >
              <div className="px-3 py-2 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span className="font-semibold uppercase tracking-wider text-slate-300">Test RBAC Roles</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">Live Simulation</span>
              </div>

              {(['ADMIN', 'ANALYST', 'VIEWER'] as Role[]).map((r) => {
                const conf = roleConfigs[r];
                const Icon = conf.icon;
                const isSelected = currentRole === r;

                return (
                  <button
                    key={r}
                    onClick={() => {
                      setCurrentRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl mt-1 transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-slate-800 border border-indigo-500/40 text-white'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{conf.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {conf.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Avatar & Info with Popover Menu */}
        <div className="relative pl-3 border-l border-slate-800">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowRoleMenu(false);
              setShowThemeMenu(false);
            }}
            aria-label="User Profile and Account Menu"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer group text-left"
            title="User Profile & Sign Out"
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-xl border border-slate-700 object-cover shadow-sm group-hover:border-indigo-500/50 transition-colors shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs border border-slate-700 shadow-sm shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-tight flex items-center gap-1">
                <span>{currentUser.name}</span>
                <span className="text-[10px] text-slate-400">▼</span>
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {currentUser.title}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="p-3 border-b border-slate-800">
                <div className="text-xs font-bold text-white">{currentUser.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${activeConf.badgeClass}`}>
                    <ActiveIcon className="w-3 h-3" />
                    <span>Active: {activeConf.label}</span>
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors text-left"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Workspace Settings</span>
                </button>

                <button
                  onClick={async () => {
                    setShowUserMenu(false);
                    try {
                      await fetch('/api/auth/logout', { method: 'POST' });
                    } catch {}
                    document.cookie = 'loop_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                    showToast('Signed out of Project LOOP.', 'info');
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-xl transition-colors text-left font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out to Login</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
