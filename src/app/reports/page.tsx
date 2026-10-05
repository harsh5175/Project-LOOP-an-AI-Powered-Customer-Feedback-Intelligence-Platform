'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Report } from '@/types';
import { ChannelBadge, SentimentBadge } from '@/components/ui/Badge';
import {
  FileText,
  Sparkles,
  Download,
  Share2,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  Printer,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  Copy,
} from 'lucide-react';

export default function ReportsPage() {
  const { reports, generateVoCReport, canGenerateReports, showToast } = useApp();

  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [periodSelection, setPeriodSelection] = useState('Past 7 Days (Week 36)');

  const currentReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleGenerate = async () => {
    if (!canGenerateReports) {
      showToast('Viewer role is read-only. Role ADMIN or ANALYST required to generate reports.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const rep = await generateVoCReport(periodSelection);
      setSelectedReportId(rep.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate report', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Shareable report link copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto print:p-0 print:max-w-none">
      {/* Header (Hidden when printing) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-400" />
              <span>Voice-of-Customer (VoC) Reports</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Executive Grade
            </span>
          </div>
          <p className="text-xs text-slate-400">
            One-click weekly digests summarizing top themes, sentiment deltas, verbatim quotes, and recommended product actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={periodSelection}
            onChange={(e) => setPeriodSelection(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="Past 7 Days (Week 36)">Past 7 Days (Week 36)</option>
            <option value="Past 14 Days (Bi-Weekly)">Past 14 Days (Bi-Weekly)</option>
            <option value="Monthly Executive (August 2026)">Monthly Executive (August)</option>
            <option value="Q3 Quarterly Review">Q3 Quarterly Review</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={!canGenerateReports || isGenerating}
            className="relative overflow-hidden group flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 transition-all shrink-0 cursor-pointer hover:-translate-y-0.5 active:scale-95 ring-1 ring-white/10"
          >
            <Sparkles className={`w-4 h-4 text-indigo-100 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate New Digest'}</span>
          </button>
        </div>
      </div>

      {/* Reports Selection Bar (Hidden when printing) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs print:hidden">
        <span className="text-slate-400 uppercase font-semibold text-[11px] shrink-0 mr-1">
          Saved Digests:
        </span>
        {reports.map((rep) => (
          <button
            key={rep.id}
            onClick={() => setSelectedReportId(rep.id)}
            className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-2 font-medium cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
              currentReport?.id === rep.id
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/60 shadow-sm shadow-indigo-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border-[var(--card-border)]'
            }`}
          >
            <span>{rep.title}</span>
            <span className="text-[10px] text-slate-500 font-mono">({rep.id})</span>
          </button>
        ))}
      </div>

      {/* Main Report Document Canvas */}
      {currentReport && (
        <div className="glass-panel rounded-2xl border border-[var(--card-border)] p-8 space-y-8 bg-[var(--card-bg)] shadow-2xl print:border-none print:shadow-none print:p-0">
          {/* Document Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--card-border)]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-extrabold text-sm tracking-wider text-indigo-400 uppercase">
                  LOOP Intelligence
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">Confidential / Leadership Digest</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {currentReport.title}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {currentReport.period}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  Prepared by: {currentReport.author}
                </span>
              </div>
            </div>

            {/* Export & Action Buttons */}
            <div className="flex items-center gap-2 print:hidden self-start">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                title="Print or Export as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>
            </div>
          </div>

          {/* Executive Takeaway Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-slate-900 border border-indigo-500/40 shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
              Executive Summary &amp; Key Finding
            </span>
            <p className="text-sm font-semibold text-white leading-relaxed">
              {currentReport.executiveTakeaway}
            </p>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {currentReport.summary}
            </p>
          </div>

          {/* Pre-Computed Stats Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Period Quantitative Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-[var(--card-border)] text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Total Ingested</span>
                <span className="text-2xl font-bold font-mono text-white">
                  {currentReport.stats.totalFeedback}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-[var(--card-border)] text-center">
                <span className="text-[11px] text-emerald-400 block mb-1">Positive Feedback</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {currentReport.stats.positivePercentage}%
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-[var(--card-border)] text-center">
                <span className="text-[11px] text-amber-400 block mb-1">Neutral Feedback</span>
                <span className="text-2xl font-bold font-mono text-amber-400">
                  {currentReport.stats.neutralPercentage}%
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-[var(--card-border)] text-center">
                <span className="text-[11px] text-rose-400 block mb-1">Negative Feedback</span>
                <span className="text-2xl font-bold font-mono text-rose-400">
                  {currentReport.stats.negativePercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Top Recurring Themes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Dominant Themes &amp; Trends
            </h3>
            <div className="divide-y divide-[var(--card-border)] rounded-xl border border-[var(--card-border)] bg-slate-900/60 overflow-hidden text-xs">
              {currentReport.stats.topThemes.map((th, i) => (
                <div key={i} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-[10px] text-slate-400">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-slate-200">{th.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-slate-400">{th.count} items</span>
                    <span
                      className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                        th.change.includes('Spike')
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {th.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notable Verbatim Customer Quotes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Notable Verbatim Quotes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentReport.verbatimQuotes.map((vq, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-900/70 border border-[var(--card-border)] flex flex-col justify-between gap-3 text-xs"
                >
                  <p className="text-slate-200 leading-relaxed italic">
                    &ldquo;{vq.quote}&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border)] text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-300">{vq.customer}</span>
                      <ChannelBadge channel={vq.channel} size="sm" />
                    </div>
                    <SentimentBadge sentiment={vq.sentiment} showScore={false} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Risks & Recommended Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risks */}
            <div className="p-5 rounded-xl bg-rose-950/30 border border-rose-900/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5 mb-3">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Key Business &amp; Retention Risks
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {currentReport.keyRisks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div className="p-5 rounded-xl bg-indigo-950/30 border border-indigo-900/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                Leadership Recommended Next Steps
              </h4>
              <div className="space-y-3 text-xs">
                {currentReport.recommendedActions.map((act) => (
                  <div key={act.id} className="p-3 rounded-lg bg-slate-900/70 border border-[var(--card-border)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200">{act.title}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          act.priority === 'HIGH'
                            ? 'bg-rose-900 text-rose-300'
                            : 'bg-amber-900 text-amber-300'
                        }`}
                      >
                        {act.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{act.description}</p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-500">
                      <span>Owner: <strong className="text-slate-300">{act.owner}</strong></span>
                      <span>Effort: {act.suggestedEffort}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
