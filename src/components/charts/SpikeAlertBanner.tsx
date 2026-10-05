'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AlertTriangle, ArrowRight, X, TrendingUp } from 'lucide-react';

export const SpikeAlertBanner: React.FC = () => {
  const router = useRouter();
  const { themes, setActiveThemeFilter } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);

  const spikingTheme = themes.find((t) => t.isSpike);

  if (!spikingTheme || isDismissed) return null;

  const handleInvestigate = () => {
    setActiveThemeFilter(spikingTheme.name);
    router.push('/inbox');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-slate-900 p-4 md:p-5 shadow-lg shadow-black/20 backdrop-blur-md transition-all">
      {/* Subtle warm accent bar on left */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-1">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Volume Surge Detected</span>
              </span>
              <h3 className="text-sm font-bold text-white">
                Feedback in &ldquo;{spikingTheme.name}&rdquo; jumped +{spikingTheme.changePercentage}% this week
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
              Multiple enterprise customers reported 504 gateway timeouts when downloading VAT invoices. Click to view all {spikingTheme.count} linked records in the unified inbox.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <button
            type="button"
            onClick={handleInvestigate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all group font-mono"
          >
            <span>Investigate Surge</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
          
          <button
            type="button"
            aria-label="Dismiss spike notification"
            onClick={() => setIsDismissed(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
