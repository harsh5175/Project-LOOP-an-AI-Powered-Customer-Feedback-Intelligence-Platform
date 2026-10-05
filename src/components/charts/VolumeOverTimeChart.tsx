'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface VolumeDataPoint {
  date: string;
  total: number;
  tickets: number;
  reviews: number;
  surveys: number;
  sales: number;
  community: number;
}

const mockTimelineData: VolumeDataPoint[] = [
  { date: 'Sep 02', total: 12, tickets: 4, reviews: 2, surveys: 3, sales: 1, community: 2 },
  { date: 'Sep 03', total: 15, tickets: 5, reviews: 3, surveys: 4, sales: 2, community: 1 },
  { date: 'Sep 04', total: 18, tickets: 7, reviews: 3, surveys: 3, sales: 3, community: 2 },
  { date: 'Sep 05', total: 22, tickets: 9, reviews: 4, surveys: 4, sales: 2, community: 3 },
  { date: 'Sep 06', total: 26, tickets: 12, reviews: 5, surveys: 4, sales: 2, community: 3 },
  { date: 'Sep 07', total: 29, tickets: 14, reviews: 4, surveys: 5, sales: 3, community: 3 },
  { date: 'Sep 08', total: 33, tickets: 16, reviews: 5, surveys: 5, sales: 4, community: 3 },
];

export const VolumeOverTimeChart: React.FC<{ data?: VolumeDataPoint[] }> = ({ data = mockTimelineData }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="totalVolumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="ticketGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            tick={{ fill: '#64748b', fontSize: 11 }} 
            tickLine={false} 
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
          />
          <YAxis 
            stroke="#64748b" 
            tick={{ fill: '#64748b', fontSize: 11 }} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              fontSize: '12px',
              color: '#f8fafc',
            }}
            itemStyle={{ color: '#cbd5e1' }}
          />
          <Area
            type="monotone"
            dataKey="total"
            name="Total Ingested"
            stroke="#6366f1"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#totalVolumeGradient)"
          />
          <Area
            type="monotone"
            dataKey="tickets"
            name="Support Tickets"
            stroke="#38bdf8"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#ticketGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
