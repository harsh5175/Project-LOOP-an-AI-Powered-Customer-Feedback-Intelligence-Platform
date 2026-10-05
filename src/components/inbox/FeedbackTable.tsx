'use client';

import React, { useState } from 'react';
import { Feedback } from '@/types';
import { useApp } from '@/context/AppContext';
import { ChannelBadge, SentimentBadge, StatusBadge } from '@/components/ui/Badge';
import { FeedbackDetailModal } from '@/components/inbox/FeedbackDetailModal';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  ExternalLink,
  Clock,
  Layers,
  Inbox
} from 'lucide-react';

interface FeedbackTableProps {
  feedbacks: Feedback[];
}

export const FeedbackTable: React.FC<FeedbackTableProps> = ({ feedbacks }) => {
  const { updateFeedbackStatus, reclassifyFeedback, canTriage, showToast } = useApp();

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [reclassifyingId, setReclassifyingId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(feedbacks.length / pageSize) || 1;
  const paginatedItems = feedbacks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    e.stopPropagation();
    updateFeedbackStatus(id, e.target.value as Feedback['status']);
  };

  const handleReclassify = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setReclassifyingId(id);
    await reclassifyFeedback(id);
    setReclassifyingId(null);
  };

  if (feedbacks.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl glass-panel border border-[var(--card-border)]">
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-[var(--card-border)] flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white mb-1">No feedback found</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No feedback matches the selected filters or search query. Try clearing your filters or ingest new feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table container */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--card-border)] glass-panel shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--card-border)] bg-black/25 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
              <th className="py-3.5 px-4 w-40">Customer &amp; Source</th>
              <th className="py-3.5 px-3 w-32">Channel</th>
              <th className="py-3.5 px-4 min-w-[320px]">Feedback Content</th>
              <th className="py-3.5 px-3 w-36">Theme &amp; Polarity</th>
              <th className="py-3.5 px-3 w-32">Triage Status</th>
              <th className="py-3.5 px-3 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)] text-slate-300">
            {paginatedItems.map((item) => {
              const isReclassifying = reclassifyingId === item.id;

              return (
                <tr
                  key={item.id}
                  onClick={() => setSelectedFeedback(item)}
                  className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                >
                  {/* Customer & Source */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                      {item.customerLabel}
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                      {item.sourceRef}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </td>

                  {/* Channel */}
                  <td className="py-3.5 px-3 align-top">
                    <ChannelBadge channel={item.channel} />
                  </td>

                  {/* Feedback Content Preview */}
                  <td className="py-3.5 px-4 align-top">
                    <p className="text-xs text-slate-200 font-normal line-clamp-2 leading-relaxed">
                      &ldquo;{item.content}&rdquo;
                    </p>
                    {item.rationale && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                        AI: {item.rationale}
                      </p>
                    )}
                  </td>

                  {/* Theme & Sentiment */}
                  <td className="py-3.5 px-3 align-top space-y-1.5">
                    <SentimentBadge sentiment={item.sentiment} score={item.sentimentScore} />
                    <div className="flex items-center gap-1 text-[11px] text-indigo-300">
                      <Layers className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="truncate max-w-[120px]">{item.featureArea}</span>
                    </div>
                  </td>

                  {/* Status Inline Workflow */}
                  <td className="py-3.5 px-3 align-top" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={item.status}
                      disabled={!canTriage}
                      onChange={(e) => handleStatusChange(e, item.id)}
                      className={`text-xs font-semibold rounded-lg px-2.5 py-1 border focus:outline-none transition-colors ${
                        item.status === 'ACTIONED'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                          : item.status === 'REVIEWED'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-700/60'
                          : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                      } ${!canTriage ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'}`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="REVIEWED">REVIEWED</option>
                      <option value="ACTIONED">ACTIONED</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-3 align-top text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Re-classify with Claude AI"
                        disabled={!canTriage || isReclassifying}
                        onClick={(e) => handleReclassify(e, item.id)}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors ${
                          !canTriage ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isReclassifying ? 'animate-spin text-indigo-400' : ''}`} />
                      </button>

                      <button
                        title="Open Details"
                        onClick={() => setSelectedFeedback(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-2 py-1 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="ml-2 font-mono">
            {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, feedbacks.length)} of {feedbacks.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-[var(--card-border)] bg-slate-900/80 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-[var(--card-border)] bg-slate-900/80 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      <FeedbackDetailModal
        feedback={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
      />
    </div>
  );
};
