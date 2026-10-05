'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Inbox,
  TrendingUp,
  Sparkles,
  FileText,
  Settings,
  ShieldCheck,
  Zap,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { feedbacks, themes, workspace, showToast } = useApp();

  const newItemsCount = feedbacks.filter((f) => f.status === 'NEW').length;
  const hasSpikingTheme = themes.some((t) => t.isSpike);

  const navItems = [
    {
      label: 'UI Showcase',
      href: '/',
      icon: Sparkles,
      badge: 'VengeanceUI',
      badgeColor: 'bg-purple-500/25 text-purple-200 border-purple-500/40',
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Feedback Inbox',
      href: '/inbox',
      icon: Inbox,
      badge: newItemsCount > 0 ? `${newItemsCount} new` : undefined,
      badgeColor: 'bg-amber-500/25 text-amber-200 border-amber-500/40 font-semibold',
    },
    {
      label: 'Theme Trends',
      href: '/trends',
      icon: TrendingUp,
      badge: hasSpikingTheme ? 'Surge' : undefined,
      badgeColor: 'bg-rose-500/25 text-rose-200 border-rose-500/40 font-bold',
    },
    {
      label: 'Ask LOOP',
      href: '/ask',
      icon: Sparkles,
      badge: 'AI Grounded',
      badgeColor: 'bg-indigo-500/25 text-indigo-200 border-indigo-500/40 font-semibold',
    },
    {
      label: 'VoC Reports',
      href: '/reports',
      icon: FileText,
    },
    {
      label: 'Workspace Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    document.cookie = 'loop_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    showToast('Signed out of Project LOOP.', 'info');
    router.push('/login');
  };

  return (
    <aside
      className="w-64 flex flex-col h-screen shrink-0 select-none transition-colors duration-200 relative z-20 shadow-2xl border-r border-slate-800/90 backdrop-blur-2xl"
      style={{ backgroundColor: 'rgba(7, 11, 22, 0.97)' }}
    >
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/90 bg-slate-950/60">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform ring-1 ring-white/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                LOOP
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                SaaS
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium truncate max-w-[140px]">
              Customer Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3.5 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Main Navigation</span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
        </div>

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/30 via-indigo-600/20 to-purple-600/20 text-white font-bold border border-indigo-500/50 shadow-md shadow-indigo-600/20'
                  : 'text-slate-200 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,1)]" />
                )}
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-indigo-400'
                      : 'text-slate-300 group-hover:text-indigo-400'
                  }`}
                />
                <span className={isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}>
                  {item.label}
                </span>
              </div>

              {item.badge ? (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded border shadow-sm ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              ) : (
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive
                      ? 'text-indigo-400 translate-x-0.5'
                      : 'text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-slate-300'
                  }`}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Workspace Isolation & Tenant Footer */}
      <div className="p-3.5 m-3 rounded-2xl bg-slate-900/95 border border-slate-800/90 shadow-xl ring-1 ring-white/5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white truncate max-w-[130px]">
            {workspace.name}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Isolated
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="font-mono text-[11px] truncate text-slate-300">{workspace.tenantId}</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sign out of workspace and return to Login"
          className="w-full mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 transition-colors py-1.5 rounded-lg cursor-pointer font-semibold"
          title="Sign out of workspace and return to Login"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>Sign Out / Lock</span>
        </button>
      </div>
    </aside>
  );
};
