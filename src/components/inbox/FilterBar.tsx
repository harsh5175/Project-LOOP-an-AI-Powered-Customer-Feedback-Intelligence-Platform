'use client';

import React from 'react';
import { Channel, Sentiment, Status, Theme } from '@/types';
import { Filter, X, Bookmark, Search, ChevronDown, SlidersHorizontal, Download } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedChannel: Channel | 'ALL';
  onChannelChange: (ch: Channel | 'ALL') => void;
  selectedSentiment: Sentiment | 'ALL';
  onSentimentChange: (s: Sentiment | 'ALL') => void;
  selectedTheme: string | 'ALL';
  onThemeChange: (t: string | 'ALL') => void;
  selectedStatus: Status | 'ALL';
  onStatusChange: (st: Status | 'ALL') => void;
  themes: Theme[];
  totalFilteredCount: number;
  onResetFilters: () => void;
  onApplySavedView: (view: 'NEG_ONBOARDING' | 'SSO_BLOCKERS' | 'BILLING' | 'PRAISE') => void;
  onExportCSV?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedChannel,
  onChannelChange,
  selectedSentiment,
  onSentimentChange,
  selectedTheme,
  onThemeChange,
  selectedStatus,
  onStatusChange,
  themes,
  totalFilteredCount,
  onResetFilters,
  onApplySavedView,
  onExportCSV,
}) => {
  const activeFilters = [
    searchQuery.trim().length > 0,
    selectedChannel !== 'ALL',
    selectedSentiment !== 'ALL',
    selectedTheme !== 'ALL',
    selectedStatus !== 'ALL',
  ];
  const activeFilterCount = activeFilters.filter(Boolean).length;

  return (
    <div className="space-y-3.5">
      {/* Top row: Search, selectors, reset, and export */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search input with sleek pill styling */}
        <div className="relative flex-1 min-w-[260px] group">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search feedback text, customer, or channel..."
            className="w-full pl-9 pr-9 py-2 bg-slate-900/90 text-slate-100 placeholder-slate-400 text-xs rounded-xl border border-[var(--card-border)] focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Channel filter pill */}
        <div
          className={`relative flex items-center rounded-xl border transition-all duration-200 ${
            selectedChannel !== 'ALL'
              ? 'bg-indigo-950/50 border-indigo-500/60 text-indigo-200 ring-1 ring-indigo-500/30 shadow-sm'
              : 'bg-slate-900/80 border-[var(--card-border)] text-slate-300 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <select
            value={selectedChannel}
            onChange={(e) => onChannelChange(e.target.value as any)}
            className="bg-transparent text-xs py-2 pl-3 pr-7 focus:outline-none appearance-none cursor-pointer font-medium"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">All Channels</option>
            <option value="SUPPORT_TICKET" className="bg-slate-900 text-slate-200">Support Ticket</option>
            <option value="APP_STORE" className="bg-slate-900 text-slate-200">App Store Review</option>
            <option value="NPS_SURVEY" className="bg-slate-900 text-slate-200">NPS Survey</option>
            <option value="SALES_NOTE" className="bg-slate-900 text-slate-200">Sales Note</option>
            <option value="COMMUNITY" className="bg-slate-900 text-slate-200">Community Post</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-slate-400" />
        </div>

        {/* Sentiment filter pill */}
        <div
          className={`relative flex items-center rounded-xl border transition-all duration-200 ${
            selectedSentiment !== 'ALL'
              ? 'bg-indigo-950/50 border-indigo-500/60 text-indigo-200 ring-1 ring-indigo-500/30 shadow-sm'
              : 'bg-slate-900/80 border-[var(--card-border)] text-slate-300 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <select
            value={selectedSentiment}
            onChange={(e) => onSentimentChange(e.target.value as any)}
            className="bg-transparent text-xs py-2 pl-3 pr-7 focus:outline-none appearance-none cursor-pointer font-medium"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">All Sentiments</option>
            <option value="POSITIVE" className="bg-slate-900 text-slate-200">Positive (Green)</option>
            <option value="NEUTRAL" className="bg-slate-900 text-slate-200">Neutral (Amber)</option>
            <option value="NEGATIVE" className="bg-slate-900 text-slate-200">Negative (Rose)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-slate-400" />
        </div>

        {/* Theme filter pill */}
        <div
          className={`relative flex items-center rounded-xl border transition-all duration-200 ${
            selectedTheme !== 'ALL'
              ? 'bg-indigo-950/50 border-indigo-500/60 text-indigo-200 ring-1 ring-indigo-500/30 shadow-sm'
              : 'bg-slate-900/80 border-[var(--card-border)] text-slate-300 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <select
            value={selectedTheme}
            onChange={(e) => onThemeChange(e.target.value)}
            className="bg-transparent text-xs py-2 pl-3 pr-7 focus:outline-none appearance-none cursor-pointer font-medium max-w-[175px] truncate"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">All Themes</option>
            {themes.map((th) => (
              <option key={th.id} value={th.name} className="bg-slate-900 text-slate-200">
                {th.name} ({th.count})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-slate-400" />
        </div>

        {/* Status filter pill */}
        <div
          className={`relative flex items-center rounded-xl border transition-all duration-200 ${
            selectedStatus !== 'ALL'
              ? 'bg-indigo-950/50 border-indigo-500/60 text-indigo-200 ring-1 ring-indigo-500/30 shadow-sm'
              : 'bg-slate-900/80 border-[var(--card-border)] text-slate-300 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as any)}
            className="bg-transparent text-xs py-2 pl-3 pr-7 focus:outline-none appearance-none cursor-pointer font-medium"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">All Statuses</option>
            <option value="NEW" className="bg-slate-900 text-slate-200">New (Inbox)</option>
            <option value="REVIEWED" className="bg-slate-900 text-slate-200">Reviewed</option>
            <option value="ACTIONED" className="bg-slate-900 text-slate-200">Actioned</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 pointer-events-none text-slate-400" />
        </div>

        {/* Reset button with active counter */}
        {activeFilterCount > 0 && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-950/60 border border-rose-800/50 hover:border-rose-700/70 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters ({activeFilterCount})</span>
          </button>
        )}

        {/* 1-Click Export CSV button */}
        {onExportCSV && (
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-[var(--card-border)] hover:border-slate-700 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95 ml-auto"
            title="Export filtered feedback rows to CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Second row: Quick Saved Segments / Modern Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shrink-0">
          <Bookmark className="w-3 h-3 text-indigo-400" />
          <span>Views:</span>
        </span>

        <button
          onClick={() => onApplySavedView('NEG_ONBOARDING')}
          className={`px-3 py-1 rounded-full border text-xs font-medium transition-all duration-200 shrink-0 flex items-center gap-1.5 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
            selectedSentiment === 'NEGATIVE' && selectedTheme === 'Team Onboarding & Invites'
              ? 'bg-rose-950/70 border-rose-500/60 text-rose-200 shadow-sm shadow-rose-500/20'
              : 'bg-slate-900/80 border-[var(--card-border)] text-slate-300 hover:text-white hover:border-indigo-500/40 hover:bg-slate-800/90'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" />
          <span>Negative Onboarding</span>
        </button>

        <button
          onClick={() => onApplySavedView('SSO_BLOCKERS')}
          className={`px-3 py-1 rounded-full border text-xs font-medium transition-all duration-200 shrink-0 flex items-center gap-1.5 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
            selectedTheme === 'Enterprise SSO & SAML' && searchQuery === 'SSO'
              ? 'bg-purple-950/70 border-purple-500/60 text-purple-200 shadow-sm shadow-purple-500/20'
              : 'bg-slate-900/80 border-[var(--card-border)] text-slate-300 hover:text-white hover:border-indigo-500/40 hover:bg-slate-800/90'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" />
          <span>Enterprise SSO Blockers</span>
        </button>

        <button
          onClick={() => onApplySavedView('BILLING')}
          className={`px-3 py-1 rounded-full border text-xs font-medium transition-all duration-200 shrink-0 flex items-center gap-1.5 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
            selectedTheme === 'Billing & Invoicing'
              ? 'bg-amber-950/70 border-amber-500/60 text-amber-200 shadow-sm shadow-amber-500/20'
              : 'bg-slate-900/80 border-[var(--card-border)] text-slate-300 hover:text-white hover:border-indigo-500/40 hover:bg-slate-800/90'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
          <span>Billing Surge</span>
        </button>

        <button
          onClick={() => onApplySavedView('PRAISE')}
          className={`px-3 py-1 rounded-full border text-xs font-medium transition-all duration-200 shrink-0 flex items-center gap-1.5 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
            selectedSentiment === 'POSITIVE'
              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200 shadow-sm shadow-emerald-500/20'
              : 'bg-slate-900/80 border-[var(--card-border)] text-slate-300 hover:text-white hover:border-indigo-500/40 hover:bg-slate-800/90'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          <span>Product Praise</span>
        </button>

        <div className="ml-auto text-xs text-slate-400 shrink-0 font-medium pl-2">
          Showing <span className="text-white font-mono font-bold">{totalFilteredCount}</span> items
        </div>
      </div>
    </div>
  );
};

