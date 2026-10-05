'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Theme } from '@/types';

interface ThemeDistributionProps {
  themes: Theme[];
  onThemeClick?: (themeName: string) => void;
}

export const ThemeDistributionChart: React.FC<ThemeDistributionProps> = ({
  themes,
  onThemeClick,
}) => {
  const chartData = [...themes]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((t) => ({
      name: t.name,
      count: t.count,
      color: t.color,
      isSpike: t.isSpike,
      change: t.changePercentage,
    }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            dataKey="name"
            type="category"
            width={140}
            stroke="#94a3b8"
            tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#fff',
            }}
            formatter={(val: any, name: any, item: any) => [
              `${val} items (${item.payload.change > 0 ? '+' : ''}${item.payload.change}% WoW)`,
              'Volume',
            ]}
          />
          <Bar 
            dataKey="count" 
            radius={[0, 4, 4, 0]}
            onClick={(entry) => onThemeClick && onThemeClick(entry.name)}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`bar-cell-${index}`} 
                fill={entry.color} 
                className="hover:opacity-80 transition-opacity"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
