'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  Sparkles, 
  Home, 
  LogIn, 
  Search, 
  Inbox, 
  BarChart3, 
  MessageSquare,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Live3DBackground } from '@/components/ui/Live3DBackground';

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    if (query.includes('dash') || query.includes('home')) {
      router.push('/dashboard');
    } else if (query.includes('inbox') || query.includes('feed')) {
      router.push('/inbox');
    } else if (query.includes('trend') || query.includes('spike')) {
      router.push('/trends');
    } else if (query.includes('ask') || query.includes('ai') || query.includes('chat')) {
      router.push('/ask');
    } else if (query.includes('report') || query.includes('voc') || query.includes('digest')) {
      router.push('/reports');
    } else if (query.includes('priv') || query.includes('term')) {
      router.push('/privacy');
    } else if (query.includes('log') || query.includes('sign')) {
      router.push('/login');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main
      role="main"
      aria-label="404 Page Not Found"
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[var(--background)] text-white"
    >
      {/* 3D Living Background */}
      <Live3DBackground initialScene="cosmic" showControls={false} />

      <div className="max-w-lg w-full glass-panel p-8 sm:p-10 rounded-3xl border border-white/15 text-center relative z-10 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-8 h-8 animate-pulse text-indigo-400" />
        </div>

        <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 mb-2">
          HTTP 404 • ROUTE UNRESOLVED
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 tracking-tight mb-2">
          Lost in the Feedback Loop?
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed max-w-sm mx-auto">
          The page you requested does not exist or may have moved. Use the quick search or popular destination links below.
        </p>

        {/* Quick Route Search */}
        <form onSubmit={handleSearchSubmit} className="mb-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination (e.g. dashboard, inbox, trends)..."
            aria-label="Search destination"
            className="w-full pl-10 pr-24 py-2.5 bg-slate-950/80 text-xs text-white placeholder-slate-400 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] rounded-lg transition-colors"
          >
            Jump
          </button>
        </form>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
          <Link
            href="/dashboard"
            className="btn-glow-indigo py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>

          <Link
            href="/"
            className="py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4 text-purple-400" />
            <span>Home Showcase</span>
          </Link>
        </div>

        {/* Quick Links Matrix */}
        <div className="pt-4 border-t border-white/10">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Popular Workspace Pages
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link
              href="/inbox"
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors flex items-center gap-1.5"
            >
              <Inbox className="w-3 h-3 text-indigo-400" />
              <span>Inbox</span>
            </Link>
            <Link
              href="/trends"
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors flex items-center gap-1.5"
            >
              <BarChart3 className="w-3 h-3 text-purple-400" />
              <span>Trends</span>
            </Link>
            <Link
              href="/ask"
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span>Ask LOOP</span>
            </Link>
            <Link
              href="/privacy"
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3 h-3 text-sky-400" />
              <span>Privacy</span>
            </Link>
            <Link
              href="/login"
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3 h-3 text-pink-400" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
