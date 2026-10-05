'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SentimentBreakdownProps {
  positive: number;
  neutral: number;
  negative: number;
}

export const SentimentDonutChart: React.FC<SentimentBreakdownProps> = ({
  positive,
  neutral,
  negative,
}) => {
  const total = positive + neutral + negative || 1;
  const posPct = ((positive / total) * 100).toFixed(1);
  const neuPct = ((neutral / total) * 100).toFixed(1);
  const negPct = ((negative / total) * 100).toFixed(1);

  const data = [
    { name: 'Positive', value: positive, color: '#10b981', pct: posPct },
    { name: 'Neutral', value: neutral, color: '#f59e0b', pct: neuPct },
    { name: 'Negative', value: negative, color: '#f43f5e', pct: negPct },
  ];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full h-56 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="#090d16" 
                  strokeWidth={3}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(value: any, name: any, item: any) => [
                `${value} items (${item.payload.pct}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Sentiment Health KPI */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {posPct}%
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Positive
          </span>
        </div>
      </div>

      {/* Legend with exact items & percentages */}
      <div className="grid grid-cols-3 gap-2 w-full mt-2 pt-3 border-t border-slate-800/80 text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Pos
          </div>
          <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{posPct}%</div>
          <div className="text-[10px] text-slate-400">({positive})</div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Neu
          </div>
          <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{neuPct}%</div>
          <div className="text-[10px] text-slate-400">({neutral})</div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-[11px] text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Neg
          </div>
          <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{negPct}%</div>
          <div className="text-[10px] text-slate-400">({negative})</div>
        </div>
      </div>
    </div>
  );
};
