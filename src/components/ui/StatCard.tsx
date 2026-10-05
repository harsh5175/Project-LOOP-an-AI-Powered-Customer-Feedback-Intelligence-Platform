import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: {
    value: string;
    isPositive: boolean;
    isSpike?: boolean;
    periodLabel?: string;
  };
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  delta,
  subtitle,
  icon: Icon,
  accentColor = '#6366f1',
}) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 relative overflow-hidden group">
      {/* Top subtle glow bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800/80 border border-slate-700/50"
            style={{ color: accentColor }}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>

        {delta && (
          <div className="flex items-center gap-1">
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                delta.isSpike
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-medium'
                  : delta.isPositive
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
              }`}
            >
              {delta.isSpike ? (
                <TrendingUp className="w-3 h-3 text-amber-400" />
              ) : delta.isPositive ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-rose-400" />
              )}
              <span>{delta.value}</span>
            </span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 mt-2 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
