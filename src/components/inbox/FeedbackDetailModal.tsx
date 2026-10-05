'use client';

import React, { useState } from 'react';
import { Feedback } from '@/types';
import { useApp } from '@/context/AppContext';
import { ChannelBadge, SentimentBadge, StatusBadge } from '@/components/ui/Badge';
import {
  X,
  Sparkles,
  Calendar,
  User,
  Hash,
  ExternalLink,
  Layers,
  MessageSquare,
  Copy,
  Check,
  Send,
  DollarSign,
  ShieldAlert,
  GitPullRequest,
  CheckCircle2,
} from 'lucide-react';

interface ModalProps {
  feedback: Feedback | null;
  onClose: () => void;
}

export const FeedbackDetailModal: React.FC<ModalProps> = ({ feedback, onClose }) => {
  const { updateFeedbackStatus, reclassifyFeedback, canTriage, showToast, createExternalTicket, addInternalNote } =
    useApp();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REPLY' | 'NOTES'>('OVERVIEW');
  const [isReclassifying, setIsReclassifying] = useState(false);
  const [isSyncingTicket, setIsSyncingTicket] = useState(false);
  const [ticketPlatform, setTicketPlatform] = useState<'Linear' | 'Jira' | 'GitHub'>('Linear');
  const [showPlatformSelect, setShowPlatformSelect] = useState(false);

  // Reply Drafter state
  const [replyTone, setReplyTone] = useState<'EMPATHETIC' | 'TECHNICAL' | 'EXECUTIVE'>('EMPATHETIC');
  const [copiedReply, setCopiedReply] = useState(false);

  // Notes state
  const [newNoteText, setNewNoteText] = useState('');

  if (!feedback) return null;

  const handleReclassify = async () => {
    setIsReclassifying(true);
    await reclassifyFeedback(feedback.id);
    setIsReclassifying(false);
  };

  const handleStatusChange = (newStatus: Feedback['status']) => {
    updateFeedbackStatus(feedback.id, newStatus);
  };

  const handleCreateTicket = async (platform: 'Linear' | 'Jira' | 'GitHub') => {
    setIsSyncingTicket(true);
    setShowPlatformSelect(false);
    await createExternalTicket(feedback.id, platform);
    setIsSyncingTicket(false);
  };

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addInternalNote(feedback.id, newNoteText);
    setNewNoteText('');
  };

  // Generate dynamic contextual reply draft
  const generateReply = () => {
    const customer = feedback.customerLabel;
    const theme = feedback.featureArea;

    if (replyTone === 'EMPATHETIC') {
      return `Hi ${customer.split(' ')[0] || 'there'},\n\nThank you so much for reaching out to us regarding "${theme}". We completely understand how critical this is for your team's workflow, and we sincerely apologize for the inconvenience.\n\nOur engineering team has escalated this issue (tracked under #${feedback.id}) and is actively working on a fix. We will notify you the moment this resolution is deployed to production.\n\nWarm regards,\nCustomer Experience Team @ LOOP`;
    } else if (replyTone === 'TECHNICAL') {
      return `Hello,\n\nRegarding ticket #${feedback.sourceRef} pertaining to ${theme}:\n\nOur telemetry identified this behavior in our latest deployment cycle. We have isolated the root cause to an execution timeout during payload processing and are preparing an updated build to mitigate this.\n\nYou can track the engineering issue status directly. Please let us know if you observe recurring 5xx traces in the interim.\n\nBest,\nPlatform Engineering Team`;
    } else {
      return `Dear ${customer},\n\nWe appreciate you taking the time to share feedback on our ${theme} capabilities. As a valued customer, ensuring seamless operational stability is our highest priority.\n\nI have personally flagged this feedback to our VP of Product and Lead Architect for our immediate sprint cycle. We will provide an executive progress update by tomorrow.\n\nSincerely,\nExecutive Product Operations`;
    }
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(generateReply());
    setCopiedReply(true);
    showToast('AI response draft copied to clipboard!', 'success');
    setTimeout(() => setCopiedReply(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-[var(--card-border)] flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-800/80 border border-[var(--card-border)] px-2 py-0.5 rounded">
              {feedback.id}
            </span>
            <ChannelBadge channel={feedback.channel} />
            <StatusBadge status={feedback.status} />

            {/* External Ticket Badge if already linked */}
            {feedback.externalTicket && (
              <a
                href={feedback.externalTicket.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 hover:bg-indigo-900 transition-colors"
              >
                <GitPullRequest className="w-3 h-3 text-indigo-400" />
                <span>{feedback.externalTicket.ticketKey}</span>
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            )}
          </div>

          <button
            type="button"
            aria-label="Close feedback detail modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-[var(--card-border)] bg-black/10">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'OVERVIEW'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Intelligence &amp; Verbatim</span>
          </button>

          <button
            onClick={() => setActiveTab('REPLY')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'REPLY'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Reply Drafter</span>
          </button>

          <button
            onClick={() => setActiveTab('NOTES')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'NOTES'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Team Notes ({feedback.internalNotes?.length || 0})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {activeTab === 'OVERVIEW' && (
            <>
              {/* Customer Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-900/60 border border-[var(--card-border)] text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5 flex items-center gap-1 text-[11px]">
                    <User className="w-3 h-3 text-slate-400" /> Customer
                  </span>
                  <span className="font-semibold text-slate-200 truncate block">{feedback.customerLabel}</span>
                </div>

                <div>
                  <span className="text-slate-500 block mb-0.5 flex items-center gap-1 text-[11px]">
                    <DollarSign className="w-3 h-3 text-emerald-400" /> ARR / Tier
                  </span>
                  <span className="font-bold text-emerald-400">
                    ${(feedback.arr || 18000).toLocaleString()}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">({feedback.customerTier || 'Enterprise'})</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block mb-0.5 flex items-center gap-1 text-[11px]">
                    <ShieldAlert className="w-3 h-3 text-amber-400" /> Churn Risk
                  </span>
                  <span
                    className={`font-bold text-[11px] px-2 py-0.5 rounded inline-block ${
                      feedback.churnRisk === 'HIGH'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        : feedback.churnRisk === 'MEDIUM'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {feedback.churnRisk || 'LOW'} RISK
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block mb-0.5 flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-400" /> Received
                  </span>
                  <span className="text-slate-300 text-[11px]">
                    {new Date(feedback.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Verbatim Feedback Content */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Verbatim Customer Feedback
                </label>
                <div className="p-4 rounded-xl bg-slate-950/70 border border-[var(--card-border)] text-sm leading-relaxed text-slate-100 font-normal selection:bg-indigo-500/30">
                  &ldquo;{feedback.content}&rdquo;
                </div>
              </div>

              {/* AI Intelligence Section */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900/80 border border-indigo-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Claude AI Intelligence Analysis
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/50">
                    Confidence: {(feedback.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-[var(--card-border)]">
                    <span className="text-[11px] text-slate-400 block mb-1">Sentiment Polarity</span>
                    <SentimentBadge sentiment={feedback.sentiment} score={feedback.sentimentScore} />
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/70 border border-[var(--card-border)]">
                    <span className="text-[11px] text-slate-400 block mb-1">Assigned Theme</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      <Layers className="w-3 h-3 text-indigo-400" />
                      {feedback.featureArea}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-[var(--card-border)]">
                  <span className="font-semibold text-indigo-400">Classification Rationale: </span>
                  {feedback.rationale}
                </div>
              </div>
            </>
          )}

          {activeTab === 'REPLY' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Contextual Response Generator</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Empathetic AI draft tailored to this customer&apos;s tier and sentiment.
                  </p>
                </div>

                {/* Tone selector */}
                <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-[var(--card-border)] text-xs">
                  {(['EMPATHETIC', 'TECHNICAL', 'EXECUTIVE'] as const).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setReplyTone(tone)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        replyTone === tone
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tone.charAt(0) + tone.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Text Box */}
              <div className="relative">
                <textarea
                  readOnly
                  rows={8}
                  value={generateReply()}
                  className="w-full p-4 rounded-xl bg-slate-950/80 border border-[var(--card-border)] text-xs text-slate-200 font-sans leading-relaxed focus:outline-none resize-none"
                />

                <button
                  onClick={handleCopyReply}
                  className="absolute right-3 bottom-4 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  {copiedReply ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReply ? 'Copied!' : 'Copy Draft'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'NOTES' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white">Internal Team Collaboration Thread</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Private workspace discussion. Visible to Product, Engineering, and CS.
                </p>
              </div>

              {/* Notes List */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {feedback.internalNotes && feedback.internalNotes.length > 0 ? (
                  feedback.internalNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-slate-900/70 border border-[var(--card-border)] flex items-start gap-3 text-xs"
                    >
                      {note.avatar ? (
                        <img
                          src={note.avatar}
                          alt={note.author}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700 mt-0.5 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-indigo-400 mt-0.5 shrink-0">
                          {note.author ? note.author.charAt(0).toUpperCase() : 'A'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white">{note.author}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{note.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-[var(--card-border)] rounded-xl">
                    No internal notes yet. Use the input below to tag a teammate or leave triage context.
                  </div>
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handlePostNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Leave a note or @mention colleague..."
                  className="flex-1 p-2.5 bg-slate-950/80 border border-[var(--card-border)] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>
            </div>
          )}

          {/* Inline Triage & External Ticketing Controls */}
          <div className="pt-4 border-t border-[var(--card-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                Update Triage Workflow:
              </span>
              <div className="flex items-center gap-1.5">
                {(['NEW', 'REVIEWED', 'ACTIONED'] as Feedback['status'][]).map((st) => (
                  <button
                    key={st}
                    disabled={!canTriage}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      feedback.status === st
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    } ${!canTriage ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              {/* Push to Linear / Jira Button */}
              {feedback.externalTicket ? (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Synced to {feedback.externalTicket.platform}</span>
                </span>
              ) : (
                <div className="relative">
                  <button
                    disabled={isSyncingTicket}
                    onClick={() => setShowPlatformSelect(!showPlatformSelect)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-[var(--card-border)] transition-all cursor-pointer"
                  >
                    <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isSyncingTicket ? 'Pushing...' : 'Push to Issue Tracker ▾'}</span>
                  </button>

                  {/* Platform dropdown menu */}
                  {showPlatformSelect && (
                    <div className="absolute right-0 bottom-full mb-1 w-44 rounded-xl bg-slate-900 border border-[var(--card-border)] shadow-xl p-1 z-20 text-xs">
                      <button
                        onClick={() => handleCreateTicket('Linear')}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span>Push to Linear</span>
                        <span className="text-[10px] font-mono text-slate-400">LOOP</span>
                      </button>
                      <button
                        onClick={() => handleCreateTicket('Jira')}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span>Create Jira Issue</span>
                        <span className="text-[10px] font-mono text-slate-400">PROD</span>
                      </button>
                      <button
                        onClick={() => handleCreateTicket('GitHub')}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span>Create GitHub Issue</span>
                        <span className="text-[10px] font-mono text-slate-400">ISSUE</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Reclassify button */}
              <button
                disabled={!canTriage || isReclassifying}
                onClick={handleReclassify}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 shadow transition-all cursor-pointer ${
                  !canTriage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${isReclassifying ? 'animate-spin' : ''}`} />
                <span>{isReclassifying ? 'Re-classifying...' : 'Re-classify'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
