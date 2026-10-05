'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Channel } from '@/types';
import { 
  X, 
  Upload, 
  PlusCircle, 
  RefreshCw, 
  FileSpreadsheet, 
  LifeBuoy, 
  Smartphone, 
  BarChart2, 
  PhoneCall, 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IngestionModal: React.FC<IngestionModalProps> = ({ isOpen, onClose }) => {
  const { 
    canIngest, 
    addSingleFeedback, 
    bulkImportFeedback, 
    simulateChannelPull, 
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'single' | 'csv' | 'channels'>('single');

  // Single entry form state
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState<Channel>('SUPPORT_TICKET');
  const [customerLabel, setCustomerLabel] = useState('');
  const [sourceRef, setSourceRef] = useState('');
  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);
  const [validationError, setValidationError] = useState('');

  // CSV State
  const [csvText, setCsvText] = useState('');
  const [csvSummary, setCsvSummary] = useState<{ imported: number; failed: number; errors: string[] } | null>(null);

  // Channels state
  const [syncingChannel, setSyncingChannel] = useState<Channel | null>(null);

  if (!isOpen) return null;

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!canIngest) {
      showToast('Viewer role is read-only. Role ADMIN or ANALYST required to ingest.', 'error');
      return;
    }

    if (!content.trim() || content.trim().length < 5) {
      setValidationError('Feedback content must be at least 5 characters long.');
      return;
    }

    setIsSubmittingSingle(true);
    try {
      await addSingleFeedback(
        content.trim(),
        channel,
        customerLabel.trim() || 'Direct Entry Customer',
        sourceRef.trim() || undefined
      );
      setContent('');
      setCustomerLabel('');
      setSourceRef('');
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to ingest feedback.');
    } finally {
      setIsSubmittingSingle(false);
    }
  };

  const handleCsvImport = () => {
    if (!canIngest) {
      showToast('Viewer role is read-only. Cannot import CSV.', 'error');
      return;
    }

    if (!csvText.trim()) {
      showToast('Please paste CSV text or load sample data.', 'error');
      return;
    }

    // Parse simple CSV rows
    const lines = csvText.trim().split('\n');
    const parsedRows: Array<{ content: string; channel?: string; customer_label?: string; created_at?: string }> = [];

    // Header check
    const startIndex = lines[0].toLowerCase().includes('content') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by comma taking basic quotes into account
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const cleanParts = parts.map((p) => p.replace(/^"|"$/g, '').trim());

      parsedRows.push({
        content: cleanParts[0] || '',
        channel: cleanParts[1] || 'SUPPORT_TICKET',
        customer_label: cleanParts[2] || 'Imported User',
        created_at: cleanParts[3] || new Date().toISOString(),
      });
    }

    const summary = bulkImportFeedback(parsedRows);
    setCsvSummary(summary);
  };

  const handleLoadSampleCsv = () => {
    const sample = `content,channel,customer_label,created_at
"Onboarding took forever — I couldn't figure out how to invite my team.",SUPPORT_TICKET,"Trial User #891","2026-09-08T10:00:00Z"
"The new dashboard is gorgeous and finally fast. Huge improvement.",APP_STORE,"Enterprise Founder","2026-09-08T11:00:00Z"
"It does the job, but the mobile experience needs work on iPad.",NPS_SURVEY,"Product Lead","2026-09-08T11:30:00Z"
"Prospect wants SSO before they'll sign — third time this month.",SALES_NOTE,"HealthTech Alliance","2026-09-08T12:00:00Z"
"Love the new export feature, saved me an hour today.",COMMUNITY,"Dev Advocate","2026-09-08T13:00:00Z"
"Billing page keeps timing out when I try to download an invoice.",SUPPORT_TICKET,"CFO @ Stripe Partner","2026-09-08T14:00:00Z"`;
    setCsvText(sample);
  };

  const handleChannelSync = async (ch: Channel) => {
    if (!canIngest) {
      showToast('Viewer role is read-only. Cannot trigger simulated channels.', 'error');
      return;
    }
    setSyncingChannel(ch);
    await new Promise((r) => setTimeout(r, 600));
    simulateChannelPull(ch);
    setSyncingChannel(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
              <Upload className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ingest Customer Feedback</h3>
              <p className="text-[11px] text-slate-400">Manual Entry, CSV Bulk Import, or Simulated Channels</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close ingestion modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 cursor-pointer transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Notice if Viewer */}
        {!canIngest && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center gap-3 text-xs text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold">Viewer Role Active (Read-Only):</span> You can browse and preview ingestion methods, but executing requires switching to <strong className="text-white">Admin</strong> or <strong className="text-white">Analyst</strong> role.
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--card-border)] px-6 pt-2 bg-black/10">
          <button
            onClick={() => setActiveTab('single')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'single'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Single Feedback Entry
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'csv'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            CSV Bulk Import
          </button>

          <button
            onClick={() => setActiveTab('channels')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'channels'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Simulated Channel Feeds
          </button>
        </div>

        {/* Tab 1: Single Entry */}
        {activeTab === 'single' && (
          <form onSubmit={handleSingleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {validationError && (
              <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                {validationError}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Customer Feedback Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter customer feedback text (e.g. 'Billing page keeps timing out whenever I try to download an invoice...')"
                rows={4}
                className="w-full p-3 bg-slate-950 text-slate-100 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                * LOOP AI will automatically classify sentiment, theme, and feature area upon submission.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Source Channel *
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as Channel)}
                  className="w-full p-2.5 bg-slate-950 text-slate-200 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="SUPPORT_TICKET">Support Ticket (Zendesk)</option>
                  <option value="APP_STORE">App Store / Google Play</option>
                  <option value="NPS_SURVEY">NPS / CSAT Survey</option>
                  <option value="SALES_NOTE">Sales Call Note (Gong / CRM)</option>
                  <option value="COMMUNITY">Community / Discord Post</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Customer Label
                </label>
                <input
                  type="text"
                  value={customerLabel}
                  onChange={(e) => setCustomerLabel(e.target.value)}
                  placeholder="e.g. Enterprise ($50k ARR) or Pro User"
                  className="w-full p-2.5 bg-slate-950 text-slate-200 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--card-border)] flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canIngest || isSubmittingSingle}
                className="relative overflow-hidden group flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 transition-all cursor-pointer ring-1 ring-white/15"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                <Sparkles className="w-3.5 h-3.5 text-indigo-100 relative z-10" />
                <span className="relative z-10">{isSubmittingSingle ? 'Classifying with AI...' : 'Ingest & Auto-Classify'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: CSV Bulk Uploader */}
        {activeTab === 'csv' && (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Expected columns: <code className="text-indigo-300 font-mono bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">content, channel, customer_label, created_at</code>
              </span>
              <button
                type="button"
                onClick={handleLoadSampleCsv}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold"
              >
                Insert Sample Rows (6 items)
              </button>
            </div>

            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste raw CSV content here with header..."
              rows={7}
              className="w-full p-3 font-mono text-xs bg-slate-950 text-slate-300 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
            />

            {csvSummary && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-3 font-semibold mb-1">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Successfully Imported: {csvSummary.imported}
                  </span>
                  {csvSummary.failed > 0 && (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Failed / Skipped: {csvSummary.failed}
                    </span>
                  )}
                </div>
                {csvSummary.errors.length > 0 && (
                  <ul className="text-rose-300/80 list-disc pl-5 mt-1 space-y-0.5">
                    {csvSummary.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-[var(--card-border)] flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                disabled={!canIngest || !csvText.trim()}
                onClick={handleCsvImport}
                className="relative overflow-hidden group flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 transition-all cursor-pointer ring-1 ring-white/15"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-100 relative z-10" />
                <span className="relative z-10">Parse &amp; Import Rows</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Simulated Channel Sources */}
        {activeTab === 'channels' && (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <p className="text-xs text-slate-400">
              Click any integration channel below to pull realistic incoming feedback items directly into the workspace. Ingested items are immediately available for triage and analysis.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { ch: 'SUPPORT_TICKET' as Channel, name: 'Zendesk Support', desc: 'Sync customer tickets & bug complaints', icon: LifeBuoy, color: 'text-blue-400' },
                { ch: 'APP_STORE' as Channel, name: 'Apple App Store', desc: 'Pull iOS ratings & written reviews', icon: Smartphone, color: 'text-purple-400' },
                { ch: 'NPS_SURVEY' as Channel, name: 'Typeform NPS', desc: 'Ingest CSAT / NPS score feedback', icon: BarChart2, color: 'text-emerald-400' },
                { ch: 'SALES_NOTE' as Channel, name: 'Gong Sales Notes', desc: 'Prospect enterprise feature blockers', icon: PhoneCall, color: 'text-amber-400' },
                { ch: 'COMMUNITY' as Channel, name: 'Discord Community', desc: 'Community power-user comments', icon: MessageSquare, color: 'text-indigo-400' },
              ].map((item) => {
                const Icon = item.icon;
                const isSyncing = syncingChannel === item.ch;

                return (
                  <div
                    key={item.ch}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-[var(--card-border)] hover:border-indigo-500/50 hover:bg-slate-900/90 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-800/80 border border-[var(--card-border)] flex items-center justify-center shrink-0">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.name}</h4>
                        <p className="text-[11px] text-slate-400">{item.desc}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canIngest || isSyncing}
                      onClick={() => handleChannelSync(item.ch)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {isSyncing ? 'Pulling...' : 'Simulate Pull'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[var(--card-border)] flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
