'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { FilterBar } from '@/components/inbox/FilterBar';
import { FeedbackTable } from '@/components/inbox/FeedbackTable';
import { IngestionModal } from '@/components/inbox/IngestionModal';
import { Channel, Sentiment, Status } from '@/types';
import { PlusCircle, RefreshCw, Upload, Sparkles, Inbox as InboxIcon } from 'lucide-react';

export default function InboxPage() {
  const { 
    feedbacks, 
    themes, 
    activeThemeFilter, 
    setActiveThemeFilter,
    globalSearchQuery,
    setGlobalSearchQuery,
    canIngest 
  } = useApp();

  const [isIngestionOpen, setIsIngestionOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery);
  const [selectedChannel, setSelectedChannel] = useState<Channel | 'ALL'>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<Sentiment | 'ALL'>('ALL');
  const [selectedTheme, setSelectedTheme] = useState<string | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<Status | 'ALL'>('ALL');

  // Sync global search or drilldown theme filter
  useEffect(() => {
    if (activeThemeFilter) {
      setSelectedTheme(activeThemeFilter);
    }
  }, [activeThemeFilter]);

  useEffect(() => {
    if (globalSearchQuery) {
      setSearchQuery(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // Handle saved view shortcuts
  const handleApplySavedView = (view: 'NEG_ONBOARDING' | 'SSO_BLOCKERS' | 'BILLING' | 'PRAISE') => {
    if (view === 'NEG_ONBOARDING') {
      setSelectedSentiment('NEGATIVE');
      setSelectedTheme('Team Onboarding & Invites');
      setSelectedChannel('ALL');
      setSelectedStatus('ALL');
      setSearchQuery('');
    } else if (view === 'SSO_BLOCKERS') {
      setSelectedTheme('Enterprise SSO & SAML');
      setSelectedSentiment('ALL');
      setSelectedChannel('ALL');
      setSelectedStatus('ALL');
      setSearchQuery('SSO');
    } else if (view === 'BILLING') {
      setSelectedTheme('Billing & Invoicing');
      setSelectedSentiment('ALL');
      setSelectedChannel('ALL');
      setSelectedStatus('ALL');
      setSearchQuery('');
    } else if (view === 'PRAISE') {
      setSelectedSentiment('POSITIVE');
      setSelectedTheme('ALL');
      setSelectedChannel('ALL');
      setSelectedStatus('ALL');
      setSearchQuery('');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setGlobalSearchQuery('');
    setSelectedChannel('ALL');
    setSelectedSentiment('ALL');
    setSelectedTheme('ALL');
    setSelectedStatus('ALL');
    setActiveThemeFilter(null);
  };

  // Filtered dataset
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      // Channel match
      if (selectedChannel !== 'ALL' && item.channel !== selectedChannel) return false;

      // Sentiment match
      if (selectedSentiment !== 'ALL' && item.sentiment !== selectedSentiment) return false;

      // Theme match
      if (selectedTheme !== 'ALL' && !item.themes.includes(selectedTheme)) return false;

      // Status match
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const contentMatch = item.content.toLowerCase().includes(q);
        const labelMatch = item.customerLabel.toLowerCase().includes(q);
        const refMatch = item.sourceRef.toLowerCase().includes(q);
        const themeMatch = item.featureArea.toLowerCase().includes(q);
        if (!contentMatch && !labelMatch && !refMatch && !themeMatch) return false;
      }

      return true;
    });
  }, [feedbacks, selectedChannel, selectedSentiment, selectedTheme, selectedStatus, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <InboxIcon className="w-6 h-6 text-indigo-400" />
              <span>Feedback Inbox &amp; Triage</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {feedbacks.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Search, filter, and triage multi-channel feedback. Change status inline or trigger Claude AI re-classification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsIngestionOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-indigo-200" />
            <span>Ingest / Import</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <FilterBar
          searchQuery={searchQuery}

          onSearchChange={(q) => {
            setSearchQuery(q);
            setGlobalSearchQuery(q);
          }}
          selectedChannel={selectedChannel}
          onChannelChange={setSelectedChannel}
          selectedSentiment={selectedSentiment}
          onSentimentChange={setSelectedSentiment}
          selectedTheme={selectedTheme}
          onThemeChange={setSelectedTheme}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          themes={themes}
          totalFilteredCount={filteredFeedbacks.length}
          onResetFilters={handleResetFilters}
          onApplySavedView={handleApplySavedView}
        />
      </div>

      {/* Feedback Data Table with inline status and pagination */}
      <FeedbackTable feedbacks={filteredFeedbacks} />

      {/* Ingestion Modal */}
      <IngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
      />
    </div>
  );
}
