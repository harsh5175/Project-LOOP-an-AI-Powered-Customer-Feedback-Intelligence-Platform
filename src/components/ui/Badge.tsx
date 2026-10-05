import React from 'react';
import { Channel, Sentiment, Status } from '@/types';
import { 
  LifeBuoy, 
  Smartphone, 
  BarChart2, 
  PhoneCall, 
  MessageSquare,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  Clock,
  Inbox
} from 'lucide-react';

export const ChannelBadge: React.FC<{ channel: Channel; size?: 'sm' | 'md' }> = ({ channel, size = 'sm' }) => {
  const configs: Record<Channel, { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }> = {
    SUPPORT_TICKET: {
      label: 'Support Ticket',
      icon: LifeBuoy,
      bg: 'bg-blue-950/50',
      text: 'text-blue-400',
      border: 'border-blue-800/40',
    },
    APP_STORE: {
      label: 'App Store',
      icon: Smartphone,
      bg: 'bg-purple-950/50',
      text: 'text-purple-400',
      border: 'border-purple-800/40',
    },
    NPS_SURVEY: {
      label: 'NPS Survey',
      icon: BarChart2,
      bg: 'bg-emerald-950/50',
      text: 'text-emerald-400',
      border: 'border-emerald-800/40',
    },
    SALES_NOTE: {
      label: 'Sales Call Note',
      icon: PhoneCall,
      bg: 'bg-amber-950/50',
      text: 'text-amber-400',
      border: 'border-amber-800/40',
    },
    COMMUNITY: {
      label: 'Community Post',
      icon: MessageSquare,
      bg: 'bg-indigo-950/50',
      text: 'text-indigo-400',
      border: 'border-indigo-800/40',
    },
  };

  const conf = configs[channel] || configs.SUPPORT_TICKET;
  const Icon = conf.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${conf.bg} ${conf.text} ${conf.border} ${sizeClasses}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{conf.label}</span>
    </span>
  );
};

export const SentimentBadge: React.FC<{ sentiment: Sentiment; score?: number; showScore?: boolean }> = ({
  sentiment,
  score,
  showScore = true,
}) => {
  if (sentiment === 'POSITIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
        <Smile className="w-3.5 h-3.5" />
        <span>Positive</span>
        {showScore && score !== undefined && (
          <span className="font-mono text-[11px] opacity-80">({score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)})</span>
        )}
      </span>
    );
  }

  if (sentiment === 'NEGATIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-950/60 text-rose-400 border border-rose-800/50">
        <Frown className="w-3.5 h-3.5" />
        <span>Negative</span>
        {showScore && score !== undefined && (
          <span className="font-mono text-[11px] opacity-80">({score.toFixed(2)})</span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-950/60 text-amber-400 border border-amber-800/50">
      <Meh className="w-3.5 h-3.5" />
      <span>Neutral</span>
      {showScore && score !== undefined && (
        <span className="font-mono text-[11px] opacity-80">({score >= 0 ? `+${score.toFixed(2)}` : score.toFixed(2)})</span>
      )}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  if (status === 'ACTIONED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        ACTIONED
      </span>
    );
  }

  if (status === 'REVIEWED') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30">
        <Clock className="w-3 h-3 text-blue-400" />
        REVIEWED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
      <Inbox className="w-3 h-3 text-amber-400" />
      NEW
    </span>
  );
};
