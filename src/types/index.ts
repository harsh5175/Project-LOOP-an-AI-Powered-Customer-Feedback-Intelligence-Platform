export type Role = 'ADMIN' | 'ANALYST' | 'VIEWER';

export type AppTheme = 'midnight' | 'obsidian' | 'emerald' | 'royal';

export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export type Status = 'NEW' | 'REVIEWED' | 'ACTIONED';

export type Channel = 
  | 'SUPPORT_TICKET' 
  | 'APP_STORE' 
  | 'NPS_SURVEY' 
  | 'SALES_NOTE' 
  | 'COMMUNITY';

export interface Theme {
  id: string;
  name: string;
  description: string;
  color: string;
  count: number;
  changePercentage: number; // e.g. +35% WoW
  isSpike?: boolean; // Flagged as spiking vs previous period
}

export interface Feedback {
  id: string;
  content: string;
  channel: Channel;
  sourceRef: string; // e.g. 'ZD-8921', 'AppStore-v3.2', 'NPS-Q3'
  customerLabel: string; // e.g. 'Enterprise (1,000+ seats)', 'Pro Tier', 'Free Trial'
  sentiment: Sentiment;
  sentimentScore: number; // -1.0 to 1.0
  status: Status;
  createdAt: string;
  workspaceId: string;
  featureArea: string; // e.g. 'Authentication', 'Billing', 'Mobile App'
  rationale: string; // Claude one-line classification rationale
  confidence: number; // 0.0 to 1.0
  themes: string[]; // Associated theme names or IDs
  citedCount?: number;
  customerTier?: 'Enterprise' | 'Growth' | 'Startup' | 'Free';
  arr?: number; // Annual Recurring Revenue in USD
  churnRisk?: 'HIGH' | 'MEDIUM' | 'LOW';
  externalTicket?: {
    platform: 'Linear' | 'Jira' | 'GitHub';
    ticketKey: string;
    ticketUrl: string;
    status: string;
    createdAt: string;
  };
  internalNotes?: Array<{
    id: string;
    author: string;
    avatar: string;
    text: string;
    createdAt: string;
  }>;
}

export interface RecommendedAction {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  owner: string;
  suggestedEffort: 'Small' | 'Medium' | 'Large';
}

export interface VerbatimQuote {
  quote: string;
  customer: string;
  channel: Channel;
  sentiment: Sentiment;
  theme: string;
}

export interface Report {
  id: string;
  title: string;
  period: string; // e.g. 'Past 7 Days (Oct 1 - Oct 7)'
  periodStart: string;
  periodEnd: string;
  summary: string;
  executiveTakeaway: string;
  stats: {
    totalFeedback: number;
    positivePercentage: number;
    neutralPercentage: number;
    negativePercentage: number;
    sentimentDelta: number; // e.g. -4.5% vs prev period
    topThemes: { name: string; count: number; change: string }[];
  };
  verbatimQuotes: VerbatimQuote[];
  keyRisks: string[];
  recommendedActions: RecommendedAction[];
  createdAt: string;
  author: string;
  workspaceId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  title: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  tenantId: string;
  plan: string;
  createdAt: string;
}

export interface AskAnswer {
  id: string;
  query: string;
  answer: string;
  timestamp: string;
  retrievedFeedback: Feedback[];
  keyThemes: string[];
}

export interface EngineeringBrief {
  themeName: string;
  incidentTitle: string;
  severity: 'P0 - CRITICAL' | 'P1 - HIGH' | 'P2 - MEDIUM';
  affectedArr: number;
  affectedCustomersCount: number;
  rootCauseAnalysis: string;
  suggestedFix: string;
  codeSnippet?: string;
  acceptanceCriteria: string[];
  createdAt: string;
}

export interface SlackAlertPayload {
  channel: string;
  themeName: string;
  surgeDelta: string;
  negativePercentage: string;
  affectedArr: number;
  sampleVerbatim: string;
  timestamp: string;
}
