'use client';

import React, { useState } from 'react';
import { Theme } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  X,
  Sparkles,
  Copy,
  Check,
  GitPullRequest,
  AlertTriangle,
  Code,
  CheckSquare,
  DollarSign,
  Users,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  theme: Theme | null;
  onClose: () => void;
}

export const EngineeringBriefModal: React.FC<Props> = ({ theme, onClose }) => {
  const { showToast, feedbacks } = useApp();
  const [copied, setCopied] = useState(false);
  const [linearTicketCreated, setLinearTicketCreated] = useState(false);

  if (!theme) return null;

  const themeFeedbacks = feedbacks.filter((f) => f.themes.includes(theme.name));
  const affectedArr = themeFeedbacks.reduce((sum, f) => sum + (f.arr || 0), 0);
  const negativeCount = themeFeedbacks.filter((f) => f.sentiment === 'NEGATIVE').length;

  const briefMarkdown = `# Engineering Fix Spec: ${theme.name} Surging Defect
**Severity:** P0 - CRITICAL | **Status:** PROPOSED FIX | **Target Sprint:** Sprint 37
**ARR at Risk:** $${affectedArr.toLocaleString()} | **Reported Accounts:** ${themeFeedbacks.length} (${negativeCount} Negative)

## 1. Problem Description & Root Cause
Telemetry and incoming customer tickets indicate a sharp ${theme.changePercentage}% WoW volume spike.
The primary failure mode is a synchronous gateway timeout (HTTP 504) during PDF generation for accounts with >50 billing line items.
Currently, the invoice rendering routine synchronously compiles HTML to PDF in the serverless edge runtime, exceeding the 15-second execution limit.

## 2. Customer Impact
- Enterprise customers are actively blocked from downloading VAT and tax receipts.
- 4 accounts totaling $100k+ in contract renewals have flagged this as an accounting compliance blocker.

## 3. Recommended Architecture Fix
1. Offload invoice generation to an asynchronous BullMQ / Redis worker queue.
2. Store finalized PDF artifacts in S3 with presigned download URLs (TTL: 1 hour).
3. Update frontend checkout and billing history to poll or listen to WebSocket event \`invoice.ready\`.

\`\`\`typescript
// Proposed Async Invoice Worker Pattern
export async function queueInvoiceGeneration(invoiceId: string, accountId: string) {
  await redisQueue.add('generate-pdf', {
    invoiceId,
    accountId,
    requestedAt: Date.now(),
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  });
  return { status: 'QUEUED', message: 'Invoice rendering initiated in background.' };
}
\`\`\`

## 4. Acceptance Criteria
- [x] Invoices with >200 line items generate under 2.5s via async worker pipeline.
- [x] S3 signed download URLs expire after 60 minutes.
- [x] Zero HTTP 504 gateway timeouts observed in Datadog APM for 7 consecutive days.
- [x] UI displays progress spinner during queue processing instead of blank screen.
`;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(briefMarkdown);
    setCopied(true);
    showToast('AI Engineering Brief copied as Markdown!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePushLinear = () => {
    setLinearTicketCreated(true);
    showToast('Created Linear Epic: LOOP-2080 (Billing Async PDF Fix)', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-[var(--card-bg)] border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">AI Engineering PRD &amp; Fix Spec</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-950/80 text-rose-300 border border-rose-800">
                  P0 CRITICAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auto-synthesized root-cause analysis and implementation spec for {theme.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Executive Impact Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-[var(--card-border)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Surge Anomaly</span>
                <span className="text-rose-400 font-bold font-mono text-sm">+{theme.changePercentage}% WoW</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-[var(--card-border)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Affected Pipeline</span>
                <span className="text-amber-300 font-bold font-mono text-sm">
                  ${(affectedArr || 63000).toLocaleString()} ARR
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-[var(--card-border)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Impacted Customers</span>
                <span className="text-white font-bold font-mono text-sm">{themeFeedbacks.length} Accounts</span>
              </div>
            </div>
          </div>

          {/* Root Cause Analysis */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>Root Cause Diagnosis</span>
            </h4>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-[var(--card-border)] text-slate-200 leading-relaxed font-sans">
              <p className="mb-2">
                Telemetry and customer ticket traces show repeated <code className="text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded font-mono">HTTP 504 Gateway Timeout</code> errors occurring on endpoint <code className="text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded font-mono">/api/v1/billing/invoices/[id]/pdf</code>.
              </p>
              <p>
                Serverless execution threads are currently compiling complex SVG invoice tables into PDF buffers synchronously. When an invoice contains more than 40 line items, execution exceeds the 15,000ms edge gateway timeout threshold.
              </p>
            </div>
          </div>

          {/* Proposed Architecture Solution & Code */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recommended Engineering Solution</span>
            </h4>
            <div className="p-4 rounded-xl bg-slate-950/90 border border-[var(--card-border)] space-y-3">
              <p className="text-slate-300 leading-relaxed">
                Decouple PDF rendering from the HTTP request cycle using an asynchronous queue worker (BullMQ + Redis) and persist generated binaries directly to Amazon S3 with signed 60-minute download URLs.
              </p>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto leading-relaxed">
                <div><span className="text-purple-400">export async function</span> <span className="text-yellow-300">queueInvoiceGeneration</span>(invoiceId: <span className="text-emerald-400">string</span>) &#123;</div>
                <div className="pl-4"><span className="text-purple-400">await</span> redisQueue.<span className="text-blue-300">add</span>(<span className="text-amber-300">&apos;generate-pdf&apos;</span>, &#123; invoiceId, requestedAt: Date.<span className="text-blue-300">now</span>() &#125;, &#123;</div>
                <div className="pl-8">attempts: <span className="text-orange-400">3</span>, backoff: &#123; type: <span className="text-amber-300">&apos;exponential&apos;</span>, delay: <span className="text-orange-400">2000</span> &#125;</div>
                <div className="pl-4">&#125;);</div>
                <div className="pl-4"><span className="text-purple-400">return</span> &#123; status: <span className="text-amber-300">&apos;QUEUED&apos;</span>, message: <span className="text-amber-300">&apos;Invoice rendering initiated in background.&apos;</span> &#125;;</div>
                <div>&#125;</div>
              </div>
            </div>
          </div>

          {/* Acceptance Criteria Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>QA &amp; Release Acceptance Criteria</span>
            </h4>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-[var(--card-border)] space-y-2 text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>Invoices with &gt;200 line items generate under 2.5s via async worker pipeline.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>S3 signed download URLs expire securely after 60 minutes.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>Zero HTTP 504 gateway timeouts recorded for 7 consecutive days.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>Frontend displays responsive loading spinner with live polling status.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[var(--card-border)] bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-[var(--card-border)] text-xs font-semibold transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Markdown' : 'Copy Brief as Markdown'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              Close
            </button>

            {linearTicketCreated ? (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Created: LOOP-2080</span>
              </span>
            ) : (
              <button
                onClick={handlePushLinear}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:-translate-y-0.5"
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Push Epic to Linear</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
