'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { StatCard } from '@/components/ui/StatCard';
import { VolumeOverTimeChart } from '@/components/charts/VolumeOverTimeChart';
import { SentimentDonutChart } from '@/components/charts/SentimentDonutChart';
import { ThemeDistributionChart } from '@/components/charts/ThemeDistributionChart';
import { SpikeAlertBanner } from '@/components/charts/SpikeAlertBanner';
import { IngestionModal } from '@/components/inbox/IngestionModal';
import { FeedbackDetailModal } from '@/components/inbox/FeedbackDetailModal';
import { ChannelBadge, SentimentBadge, StatusBadge } from '@/components/ui/Badge';
import { Channel, Feedback } from '@/types';
import {
  MessageSquareText,
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  Filter,
  Layers,
  ArrowRight,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

export default function DashboardPage() {
  const { feedbacks, themes, setActiveThemeFilter, canIngest } = useApp();
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [channelFilter, setChannelFilter] = useState<Channel | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState<'7D' | '30D' | '90D' | 'ALL'>('30D');

  // Filtered dataset for charts
  const filteredFeedbacks = feedbacks.filter((f) => {
    if (channelFilter !== 'ALL' && f.channel !== channelFilter) return false;
    return true;
  });

  // Dynamic calculations
  const totalCount = filteredFeedbacks.length;
  const posCount = filteredFeedbacks.filter((f) => f.sentiment === 'POSITIVE').length;
  const neuCount = filteredFeedbacks.filter((f) => f.sentiment === 'NEUTRAL').length;
  const negCount = filteredFeedbacks.filter((f) => f.sentiment === 'NEGATIVE').length;
  const negPercentage = totalCount > 0 ? ((negCount / totalCount) * 100).toFixed(1) : '0';

  const negativeFeedbacks = filteredFeedbacks.filter((f) => f.sentiment === 'NEGATIVE');
  const revenueAtRisk = negativeFeedbacks.reduce((sum, f) => sum + (f.arr || 18000), 0);
  const highChurnAccounts = negativeFeedbacks.slice(0, 3);

  const newThisWeekCount = filteredFeedbacks.filter((f) => f.status === 'NEW').length;
  const actionedCount = filteredFeedbacks.filter((f) => f.status === 'ACTIONED').length;
  const actionedRate = totalCount > 0 ? ((actionedCount / totalCount) * 100).toFixed(0) : '0';

  // Recent 4 items
  const recentFeedbacks = [...filteredFeedbacks].slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Customer Feedback Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Live Overview
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time synthesis across 5 ingestion channels. AI-classified sentiment, recurring themes, and trend detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Ingest Feedback button with glowing indigo gradient & interactive micro-animation */}
          <button
            onClick={() => setIsIngestionOpen(true)}
            className="relative overflow-hidden group flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ring-1 ring-white/20"
          >
            {/* Shimmer sweep ray */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
            <PlusCircle className="w-4 h-4 text-white group-hover:rotate-90 group-hover:scale-110 transition-transform duration-300 relative z-10" />
            <span className="relative z-10 font-bold tracking-wide">Ingest Feedback</span>
          </button>
        </div>
      </div>

      {/* Emerging Spike Alert Banner */}
      <SpikeAlertBanner />

      {/* Global Filter Bar for Dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl glass-panel border border-[var(--card-border)] text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-slate-800/80 border border-[var(--card-border)] flex items-center justify-center">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <label htmlFor="scope-channel-select" className="font-semibold text-slate-300">Scope Channel:</label>
          <select
            id="scope-channel-select"
            name="channel"
            aria-label="Filter feedback by channel"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as any)}
            className="bg-slate-900/90 border border-[var(--card-border)] text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
          >
            <option value="ALL">All 5 Channels</option>
            <option value="SUPPORT_TICKET">Support Tickets</option>
            <option value="APP_STORE">App Store Reviews</option>
            <option value="NPS_SURVEY">NPS Surveys</option>
            <option value="SALES_NOTE">Sales Call Notes</option>
            <option value="COMMUNITY">Community Posts</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold mr-1.5">Time Horizon:</span>
          {(['7D', '30D', '90D', 'ALL'] as const).map((range) => (
            <button
              key={range}
              type="button"
              aria-label={`Filter by ${range === 'ALL' ? 'all time' : 'last ' + range}`}
              aria-pressed={dateRange === range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                dateRange === range
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/35 ring-1 ring-indigo-400/40'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white border border-[var(--card-border)] hover:bg-slate-800/80'
              }`}
            >
              {range === 'ALL' ? 'All Time' : `Last ${range}`}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Core Stat Cards including Executive Revenue at Risk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Ingested"
          value={totalCount}
          delta={{ value: '+18% WoW', isPositive: true }}
          subtitle="All channels unified"
          icon={MessageSquareText}
          accentColor="#6366f1"
        />

        <StatCard
          title="Revenue at Risk"
          value={`$${(revenueAtRisk / 1000).toFixed(0)}k`}
          delta={{ value: `${negativeFeedbacks.length} accounts at risk`, isPositive: false, isSpike: true }}
          subtitle="Negative sentiment ARR"
          icon={DollarSign}
          accentColor="#f43f5e"
        />

        <StatCard
          title="Negative Ratio"
          value={`${negPercentage}%`}
          delta={{ value: '+6.2% spike', isPositive: false, isSpike: true }}
          subtitle="Driven by billing timeouts"
          icon={AlertOctagon}
          accentColor="#f59e0b"
        />

        <StatCard
          title="Pending Triage"
          value={newThisWeekCount}
          delta={{ value: `${newThisWeekCount} awaiting action`, isPositive: true }}
          subtitle="Ready for review"
          icon={Sparkles}
          accentColor="#3b82f6"
        />

        <StatCard
          title="Triage Velocity"
          value={`${actionedRate}%`}
          delta={{ value: '+12% vs last mo', isPositive: true }}
          subtitle="Actioned resolution rate"
          icon={CheckCircle2}
          accentColor="#10b981"
        />
      </div>

      {/* 3 Interactive Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Volume Over Time */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-[var(--card-border)] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Feedback Volume Over Time</span>
                <span className="text-[10px] bg-slate-800/80 border border-[var(--card-border)] text-slate-300 px-2 py-0.5 rounded font-mono">
                  Daily Cadence
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-channel ingestion velocity with highlighted ticket spike
              </p>
            </div>
            <Link
              href="/inbox"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 min-h-[280px]">
            <VolumeOverTimeChart />
          </div>
        </div>

        {/* Chart 2: Sentiment Polarity Breakdown */}
        <div className="glass-panel rounded-2xl p-5 border border-[var(--card-border)] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Sentiment Polarity</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated classification calibrated -1.0 to +1.0
            </p>
          </div>

          <div className="py-2">
            <SentimentDonutChart
              positive={posCount}
              neutral={neuCount}
              negative={negCount}
            />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-[var(--card-border)] text-[11px] text-slate-400">
            💡 <strong className="text-slate-200">AI Insight:</strong> Positive sentiment dominates UX polish, while negative items concentrate heavily in billing.
          </div>
        </div>
      </div>

      {/* Enterprise Churn Risk Account Watchlist */}
      <div className="glass-panel rounded-2xl p-5 border border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-slate-900/40 to-slate-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Enterprise Churn Risk Watchlist</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                  ${(revenueAtRisk / 1000).toFixed(0)}k ARR Exposed
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                High-value customer accounts currently experiencing blockers or critical satisfaction drop.
              </p>
            </div>
          </div>
          <Link
            href="/inbox"
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
          >
            <span>Review All At-Risk Accounts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {highChurnAccounts.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedFeedback(item)}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-[var(--card-border)] hover:border-rose-500/60 hover:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between gap-2 group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-100 truncate max-w-[140px] group-hover:text-rose-300 transition-colors">
                  {item.customerLabel}
                </span>
                <span className="font-mono text-emerald-400 font-bold text-xs">
                  ${((item.arr || 18000) / 1000).toFixed(0)}k ARR
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                &ldquo;{item.content}&rdquo;
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-[var(--card-border)]">
                <span className="text-rose-400 font-semibold">{item.featureArea}</span>
                <span className="text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-900/80 font-mono font-bold">
                  HIGH CHURN RISK
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 3 & Recent Feedback Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Themes Distribution */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-5 border border-[var(--card-border)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Top Recurring Themes</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Clustered volume by business area. Click bar to drill down.
              </p>
            </div>
            <Link
              href="/trends"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Explore Trends</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ThemeDistributionChart
            themes={themes}
            onThemeClick={(themeName) => {
              setActiveThemeFilter(themeName);
            }}
          />
        </div>

        {/* Recent Ingested Feedback Triage Preview */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-5 border border-[var(--card-border)] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Recent Incoming Feedback</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Latest customer touchpoints queued for triage
              </p>
            </div>
            <Link
              href="/inbox"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Full Inbox ({feedbacks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[290px] pr-1">
            {recentFeedbacks.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedFeedback(item)}
                className="p-3 rounded-xl bg-slate-900/80 border border-[var(--card-border)] hover:border-indigo-500/50 hover:bg-slate-900/95 transition-all flex flex-col gap-1.5 cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 truncate max-w-[150px]">
                      {item.customerLabel}
                    </span>
                    <ChannelBadge channel={item.channel} size="sm" />
                  </div>
                  <SentimentBadge sentiment={item.sentiment} score={item.sentimentScore} showScore={false} />
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  &ldquo;{item.content}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-[var(--card-border)] text-[10px] text-slate-400">
                  <span className="font-mono">{item.sourceRef}</span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ingestion Modal */}
      <IngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
      />

      {/* Feedback Detail Modal */}
      <FeedbackDetailModal
        feedback={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
      />
    </div>
  );
}
