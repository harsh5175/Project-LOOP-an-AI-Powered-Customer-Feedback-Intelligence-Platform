'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { X, ExternalLink, AlertTriangle, MessageSquare, Check, Bell } from 'lucide-react';

export const SlackAlertModal: React.FC = () => {
  const { slackAlertNotification, dismissSlackAlert, showToast, setActiveThemeFilter } = useApp();
  const router = useRouter();

  if (!slackAlertNotification) return null;

  const { channel, themeName, surgeDelta, negativePercentage, affectedArr, sampleVerbatim, timestamp } =
    slackAlertNotification;

  const handleInvestigate = () => {
    setActiveThemeFilter(themeName);
    dismissSlackAlert();
    router.push('/trends');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-[#1A1D21] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Slack-like Channel Header */}
        <div className="bg-[#121016] px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold text-sm">#</span>
            <span className="font-bold text-white tracking-wide">{channel.replace('#', '')}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
              Live Webhook
            </span>
          </div>

          <button
            onClick={dismissSlackAlert}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slack Message Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            {/* Bot Avatar */}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Bell className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white text-sm">LOOP VoC Alert Bot</span>
                <span className="text-[10px] font-bold bg-[#2C3136] text-slate-300 px-1.5 py-0.5 rounded uppercase">
                  APP
                </span>
                <span className="text-xs text-slate-500">{timestamp}</span>
              </div>

              {/* Message Block Card */}
              <div className="rounded-xl border-l-4 border-l-rose-500 bg-[#222529] border border-slate-700/70 p-4 space-y-3 mt-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Anomaly Spike Detected: {themeName}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 font-mono">
                    {surgeDelta}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#1A1D21] border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Negative Ratio</span>
                    <span className="text-rose-400 font-bold font-mono text-sm">{negativePercentage}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#1A1D21] border border-slate-800">
                    <span className="text-[11px] text-slate-400 block mb-0.5">ARR at Risk</span>
                    <span className="text-amber-300 font-bold font-mono text-sm">
                      ${affectedArr.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                    Recent Customer Verbatim:
                  </span>
                  <p className="text-xs text-slate-200 italic bg-[#1A1D21] p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                    &ldquo;{sampleVerbatim}&rdquo;
                  </p>
                </div>
              </div>

              {/* Slack Interactive Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  onClick={handleInvestigate}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <span>Investigate in Trends</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    dismissSlackAlert();
                    showToast('Alert marked as acknowledged', 'info');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#2C3136] hover:bg-[#383F45] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Acknowledge</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
