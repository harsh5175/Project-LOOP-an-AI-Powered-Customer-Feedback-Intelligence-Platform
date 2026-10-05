'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Theme, Feedback } from '@/types';
import { ChannelBadge, SentimentBadge, StatusBadge } from '@/components/ui/Badge';
import { FeedbackDetailModal } from '@/components/inbox/FeedbackDetailModal';
import { EngineeringBriefModal } from '@/components/trends/EngineeringBriefModal';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Layers,
  ArrowRight,
  Sparkles,
  BarChart3,
  X,
  Calendar,
  Search,
  Bell,
  FileCode,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const mockThemeTimeline = [
  { week: 'Wk 32', billing: 14, onboarding: 32, sso: 15, mobile: 18, analytics: 20 },
  { week: 'Wk 33', billing: 16, onboarding: 30, sso: 18, mobile: 17, analytics: 19 },
  { week: 'Wk 34', billing: 18, onboarding: 31, sso: 19, mobile: 19, analytics: 18 },
  { week: 'Wk 35', billing: 21, onboarding: 30, sso: 20, mobile: 18, analytics: 19 },
  { week: 'Wk 36 (Current)', billing: 34, onboarding: 29, sso: 24, mobile: 21, analytics: 18 },
];

export default function TrendsPage() {
  const { themes, feedbacks, triggerSlackSpikeAlert } = useApp();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [briefTheme, setBriefTheme] = useState<Theme | null>(null);
  const [drilldownModalFeedback, setDrilldownModalFeedback] = useState<Feedback | null>(null);

  // Drilldown items for the currently selected theme
  const drilldownFeedbacks = selectedTheme
    ? feedbacks.filter((f) => f.themes.includes(selectedTheme.name))
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            <span>Theme Clustering &amp; Trend Detection</span>
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            AI Clustered
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Unsupervised clustering of incoming feedback into business topics. Automatically flags anomalies and week-over-week surges.
        </p>
      </div>

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => {
          const isSpike = theme.isSpike;
          const isPositiveChange = theme.changePercentage > 0;

          return (
            <div
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className={`glass-panel rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden group ${
                selectedTheme?.id === theme.id
                  ? 'border-indigo-500 ring-1 ring-indigo-500/50 bg-[var(--card-bg)]'
                  : 'border-[var(--card-border)] hover:border-[var(--card-border-hover)] hover:bg-white/[0.03]'
              }`}
            >
              {/* Top Accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: theme.color }}
              />

              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.color }}
                  />
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {theme.name}
                  </h3>
                </div>

                {isSpike ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80 animate-pulse-soft">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    Spike ⚠️
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded ${
                      isPositiveChange
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                    }`}
                  >
                    {isPositiveChange ? '+' : ''}
                    {theme.changePercentage}% WoW
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                {theme.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--card-border)] text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold font-mono text-white">
                    {theme.count}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">feedbacks</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Drill down</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Action Buttons: AI PRD Spec & Slack Webhook simulator */}
              <div className="flex items-center gap-1.5 pt-2.5 border-t border-[var(--card-border)]/60 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setBriefTheme(theme);
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer hover:shadow-sm"
                  title="Generate AI PRD & Engineering Fix Spec"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>AI Fix Spec</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerSlackSpikeAlert(theme.name);
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1 border border-[var(--card-border)] transition-all cursor-pointer"
                  title="Simulate Slack Webhook Alert"
                >
                  <Bell className="w-3 h-3 text-amber-400" />
                  <span>Slack</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Week Theme Trajectory Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-[var(--card-border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Theme Volume Trajectory (Last 5 Sprints)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Notice the abrupt +62.5% volume surge in Billing &amp; Invoicing starting Week 35
            </p>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockThemeTimeline} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis dataKey="week" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="billing"
                name="Billing & Invoicing (Spike)"
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="onboarding"
                name="Onboarding & Invites"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="sso"
                name="Enterprise SSO & SAML"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="mobile"
                name="Mobile Experience"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="analytics"
                name="Dashboard Speed"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drill-down Drawer / List for Selected Theme */}
      {selectedTheme && (
        <div className="glass-panel rounded-2xl p-6 border border-indigo-500/40 bg-[var(--card-bg)] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-[var(--card-border)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTheme.color }} />
                <h3 className="text-base font-bold text-white">
                  Theme Drill-Down: {selectedTheme.name}
                </h3>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 rounded">
                  {drilldownFeedbacks.length} Items
                </span>
              </div>
              <p className="text-xs text-slate-300">{selectedTheme.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBriefTheme(selectedTheme)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Engineering PRD</span>
              </button>

              <button
                onClick={() => setSelectedTheme(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 max-h-[420px] overflow-y-auto pr-1">
            {drilldownFeedbacks.map((item) => (
              <div
                key={item.id}
                onClick={() => setDrilldownModalFeedback(item)}
                className="p-4 rounded-xl bg-slate-900/70 border border-[var(--card-border)] hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{item.customerLabel}</span>
                    <ChannelBadge channel={item.channel} size="sm" />
                  </div>
                  <SentimentBadge sentiment={item.sentiment} score={item.sentimentScore} />
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  &ldquo;{item.content}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border)] text-[10px] text-slate-400">
                  <span className="font-mono">{item.sourceRef}</span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Drilldown Item */}
      <FeedbackDetailModal
        feedback={drilldownModalFeedback}
        onClose={() => setDrilldownModalFeedback(null)}
      />

      {/* AI Engineering PRD & Fix Spec Modal */}
      <EngineeringBriefModal
        theme={briefTheme}
        onClose={() => setBriefTheme(null)}
      />
    </div>
  );
}
