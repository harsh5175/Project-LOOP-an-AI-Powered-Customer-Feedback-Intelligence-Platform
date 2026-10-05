'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ArrowRight, 
  Activity, 
  Layers, 
  ShieldCheck, 
  Database, 
  Zap, 
  Terminal, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ChevronRight, 
  Palette, 
  FolderGit2, 
  Radio, 
  Lock, 
  Users, 
  Inbox, 
  BarChart3, 
  LayoutDashboard, 
  Settings,
  Cpu,
  Search,
  ExternalLink,
  MessageSquare,
  Menu,
  X
} from 'lucide-react';

// VengeanceUI Components
import { SpotlightNavbar, NavItem } from '@/components/ui/spotlight-navbar';
import { FlipText } from '@/components/ui/flip-text';
import { KineticTextLoader } from '@/components/ui/kinetic-text-loader';
import { FolderPreview } from '@/components/ui/folder-preview';
import { StaggeredGrid, BentoItem } from '@/components/ui/staggered-grid';
import { GlassDock, DockItem } from '@/components/ui/glass-dock';
import { Live3DBackground } from '@/components/ui/Live3DBackground';
import type { BookCfg } from '@/components/ui/books-showcase';
import { DemoRequestModal } from '@/components/ui/DemoRequestModal';
import { Footer } from '@/components/layout/Footer';

// Performance: dynamically load Three.js Books Showcase off the critical bundle path
const BooksShowcase = dynamic(
  () => import('@/components/ui/books-showcase').then((mod) => mod.BooksShowcase),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-slate-950/60 rounded-3xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Initializing 3D Three.js Engine...</p>
        </div>
      </div>
    ),
  }
);

// Context & Assets
import { useApp } from '@/context/AppContext';
import { AppTheme } from '@/types';
import { 
  billingFolderImages, 
  ssoFolderImages, 
  mobileFolderImages, 
  integrationsFolderImages 
} from '@/data/showcaseAssets';

export default function ShowcasePage() {
  const router = useRouter();
  const { appTheme, setAppTheme, showToast } = useApp();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active theme list for cycling
  const themeList: AppTheme[] = ['midnight', 'obsidian', 'emerald', 'royal'];
  const themeLabels: Record<AppTheme, string> = {
    midnight: 'Midnight Indigo 🌌',
    obsidian: 'Obsidian Slate 🖤',
    emerald: 'Cyber Emerald 🌲',
    royal: 'Royal Amethyst 🔮',
  };

  const cycleTheme = () => {
    const currentIndex = themeList.indexOf(appTheme);
    const nextTheme = themeList[(currentIndex + 1) % themeList.length];
    setAppTheme(nextTheme);
    showToast(`Switched theme to ${themeLabels[nextTheme]}`, 'info');
  };

  // --- Interactive AI Query State (KineticTextLoader demo) ---
  const [selectedPrompt, setSelectedPrompt] = useState<string>(
    'Why are enterprise deals stalling on authentication?'
  );
  const [isQueryRunning, setIsQueryRunning] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<{
    status: string;
    citations: number;
    arrRisk: string;
    summary: string;
    recommendation: string;
  } | null>({
    status: 'Grounded Analysis Verified',
    citations: 24,
    arrRisk: '$180,000 ARR',
    summary:
      '3 Tier-1 enterprise prospects (including HealthTech Alliance with 1,200 seats) have SAML 2.0 / Okta as a hard contract precondition. Automated SCIM deprovisioning was flagged by 2 separate CISOs.',
    recommendation:
      'Fast-track Okta SAML 2.0 integration to Sprint 42. Prevents $180k pipeline slippage this quarter.',
  });

  const samplePrompts = [
    {
      label: 'SSO Deal Blockers',
      prompt: 'Why are enterprise deals stalling on authentication?',
      result: {
        status: 'Grounded in 24 sales notes & enterprise tickets',
        citations: 24,
        arrRisk: '$180,000 ARR',
        summary:
          '3 Tier-1 enterprise prospects (including HealthTech Alliance with 1,200 seats) have SAML 2.0 / Okta as a hard contract precondition. Automated SCIM deprovisioning was flagged by 2 separate CISOs.',
        recommendation:
          'Fast-track Okta SAML 2.0 integration to Sprint 42. Prevents $180k pipeline slippage this quarter.',
      },
    },
    {
      label: 'Billing 504 Timeouts',
      prompt: 'What is causing the sudden +62% spike in Billing negative sentiment?',
      result: {
        status: 'Surge Alert Verified (p < 0.001)',
        citations: 34,
        arrRisk: '$45,000 ARR',
        summary:
          'Enterprise finance teams encounter 504 Gateway Timeouts when downloading consolidated VAT invoices. 2 mid-market customers are withholding annual renewals until resolved.',
        recommendation:
          'Increase invoice PDF generation worker timeout from 30s to 120s and stream PDF blobs directly from S3 cache.',
      },
    },
    {
      label: 'iOS 18 Crash Surge',
      prompt: 'Summarize App Store 1-star reviews for version 2.4.1 release.',
      result: {
        status: 'Grounded in 21 mobile review items',
        citations: 21,
        arrRisk: 'NPS -18 Drop',
        summary:
          'Users on iOS 18 with FaceID enabled experience instant app crash on cold start. 84% of reviews mention biometric keychain failure.',
        recommendation:
          'Emergency hotfix patch release 2.4.2 to handle null bio-token on iOS 18 LocalAuthentication framework.',
      },
    },
  ];

  const handleRunQuery = (sample: typeof samplePrompts[0]) => {
    setSelectedPrompt(sample.prompt);
    setIsQueryRunning(true);
    setQueryResult(null);

    setTimeout(() => {
      setIsQueryRunning(false);
      setQueryResult(sample.result);
    }, 1800);
  };

  // --- Folder Details Modal / Drawer State ---
  const [activeFolderInfo, setActiveFolderInfo] = useState<{
    title: string;
    variant: string;
    itemsCount: number;
    urgency: string;
    arrImpact: string;
    description: string;
    feedbackQuotes: Array<{ author: string; role: string; quote: string; tag: string }>;
  } | null>(null);

  const folderDetails = {
    billing: {
      title: 'Billing & Invoicing Cluster',
      variant: 'rudras',
      itemsCount: 34,
      urgency: 'CRITICAL HIGH',
      arrImpact: '$45,000 ARR at Risk',
      description:
        'Contains invoice download 504 gateway logs, customer churn risk warnings, and finance team renewal block declarations.',
      feedbackQuotes: [
        {
          author: 'Enterprise Finance Director ($45k ARR)',
          role: 'Admin Customer',
          quote:
            'We are physically unable to retrieve our quarterly VAT tax receipts. Our CFO has frozen renewal authorization until your PDF generation is stabilized.',
          tag: 'Churn Blocker',
        },
        {
          author: 'Ops Lead @ NorthStar Logistics',
          role: 'Paying Customer',
          quote:
            'Mid-cycle seat prorations do not match the dashboard summary. We need immediate manual invoice recalculation.',
          tag: 'Calculation Defect',
        },
      ],
    },
    sso: {
      title: 'Enterprise SSO & SAML Dossier',
      variant: 'ardra',
      itemsCount: 24,
      urgency: 'HIGH REVENUE IMPACT',
      arrImpact: '$180,000 Pipeline Value',
      description:
        'Enterprise security checklists, Okta / Azure AD compliance mandates, and automated SCIM provisioning requirements.',
      feedbackQuotes: [
        {
          author: 'VP of InfoSec, HealthTech Alliance',
          role: 'Prospect (1,200 Seats)',
          quote:
            'SAML 2.0 with SCIM auto-deprovisioning is mandatory for our SOC2 Type II compliance. We cannot advance pilot to contract without it.',
          tag: 'Contract Precondition',
        },
        {
          author: 'IT Director @ Horizon Financial',
          role: 'Enterprise Prospect',
          quote:
            'Google Workspace SAML was remarkably fast to test, but we require Azure AD conditional access support.',
          tag: 'Identity Provider',
        },
      ],
    },
    mobile: {
      title: 'Mobile Experience & Core App',
      variant: 'shakti',
      itemsCount: 21,
      urgency: 'MODERATE DEFECT',
      arrImpact: 'NPS -18 Drop',
      description:
        'iOS 18 biometric authentication crashes, iPad orientation layout defects, and push notification sync delays.',
      feedbackQuotes: [
        {
          author: 'App Store Review ★☆☆☆☆',
          role: 'Mobile End User',
          quote:
            'App crashes every single time FaceID prompts on iOS 18. Totally unusable after the latest update.',
          tag: 'iOS 18 Crash',
        },
        {
          author: 'Field Inspector @ Apex Field',
          role: 'Tablet User',
          quote:
            'Landscape mode on iPad cuts off the triage action bar. Have to force portrait mode to submit tickets.',
          tag: 'UI Layout Bug',
        },
      ],
    },
    integrations: {
      title: 'Integrations & Webhook Sync',
      variant: 'kubera',
      itemsCount: 19,
      urgency: 'STRATEGIC EXPANSION',
      arrImpact: '28 Connected Workspaces',
      description:
        'Real-time ingestion pipelines from Slack, HubSpot, Discord, and GitHub issue trackers.',
      feedbackQuotes: [
        {
          author: 'Head of Support @ ScaleX',
          role: 'Power User',
          quote:
            'The Slack spike alert webhook saved our support team today when the billing timeout alert fired automatically.',
          tag: 'Automated Alerting',
        },
        {
          author: 'Product Operations Lead',
          role: 'Analyst',
          quote:
            'Two-way sync to Linear tickets has eliminated our weekly manual copy-pasting of customer verbatim quotes.',
          tag: 'Linear Integration',
        },
      ],
    },
  };

  // --- Staggered Grid Configuration ---
  const bentoItems: BentoItem[] = [
    {
      id: 'bento-1',
      title: 'Neural Classifier',
      subtitle: 'Sentiment & Polarity Engine',
      description: 'Zod-validated classification (-1.0 to 1.0) with Claude 3.7 / Sonnet',
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'bento-2',
      title: 'ARR Impact Weighted',
      subtitle: 'Contract Risk Mapping',
      description: '$285,000 at-risk ARR linked directly to actionable engineering tickets',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'bento-3',
      title: 'Spike Detector',
      subtitle: 'Statistical Surge Alerts',
      description: 'Automated anomaly detection triggering instantaneous Slack webhooks',
      icon: <Radio className="w-5 h-5 text-rose-400" />,
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'bento-4',
      title: 'Ask LOOP RAG',
      subtitle: 'Semantic Vector Retrieval',
      description: 'Verifiable natural language Q&A strictly grounded in customer transcripts',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Images or channel identifiers passed to StaggeredGrid
  const gridImages = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
  ];

  // --- GlassDock Items Definition ---
  const dockItems: DockItem[] = [
    {
      title: 'Home',
      icon: Sparkles,
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      onClick: () => router.push('/dashboard'),
    },
    {
      title: 'Inbox',
      icon: Inbox,
      onClick: () => router.push('/inbox'),
    },
    {
      title: 'Ask AI',
      icon: MessageSquare,
      onClick: () => router.push('/ask'),
    },
    {
      title: 'Trends',
      icon: BarChart3,
      onClick: () => router.push('/trends'),
    },
    {
      title: 'Reports',
      icon: FileText,
      onClick: () => router.push('/reports'),
    },
    {
      title: 'Settings',
      icon: Settings,
      onClick: () => router.push('/settings'),
    },
    {
      title: 'Theme',
      icon: Palette,
      onClick: cycleTheme,
    },
  ];

  const intelligenceBooks: BookCfg[] = [
    {
      id: 'book-churn',
      title: 'The Churn Autopsy',
      author: 'Project LOOP Intelligence',
      year: '2026',
      stars: 5,
      desc: 'In-depth root cause analysis on the 504 gateway invoice timeout surge and its $45,000 ARR retention impact on mid-market accounts.',
      spineBg: '#31101e',
      spineInk: '#f43f5e',
      spineFont: '700 36px Georgia',
      backBg: '#1f0d16',
      backInk: '244,63,94',
      edge: '#fee2e2',
      chapters: [
        'Executive Brief',
        'The 504 Surge Timeline',
        'At-Risk ARR Breakdown',
        'Customer Verbatims',
        'Engineering Architecture Fix',
        'S3 Direct Stream Deployment',
      ],
    },
    {
      id: 'book-sso',
      title: 'Enterprise Security',
      author: 'InfoSec & Deal Strategy',
      year: '2026',
      stars: 5,
      desc: 'Unlocking $180,000 in blocked enterprise deals via SAML 2.0 / Okta integration and SCIM automated user provisioning.',
      spineBg: '#0f2238',
      spineInk: '#38bdf8',
      spineFont: '700 36px sans-serif',
      backBg: '#0a1626',
      backInk: '56,189,248',
      edge: '#e0f2fe',
      chapters: [
        'Enterprise Deal Audit',
        'HealthTech 1200-Seat Block',
        'Okta & Azure AD Schema',
        'SCIM Protocol Implementation',
        'SOC2 Type II Audit Mapping',
      ],
    },
    {
      id: 'book-mobile',
      title: 'Mobile App Incident',
      author: 'Mobile Reliability Eng',
      year: '2026',
      stars: 5,
      desc: 'Addressing the iOS 18 cold-start FaceID biometric crash and restoring App Store customer sentiment.',
      spineBg: '#271138',
      spineInk: '#c084fc',
      spineFont: '700 36px Georgia',
      backBg: '#170a24',
      backInk: '192,132,252',
      edge: '#fae8ff',
      chapters: [
        'Incident Postmortem',
        'App Store Review Dip (-18 NPS)',
        'LocalAuth Crash Stack Trace',
        'iPad Landscape Viewport Patch',
        'Hotfix Release 2.4.2 Verification',
      ],
    },
    {
      id: 'book-ai',
      title: 'Neural Ecosystem',
      author: 'Claude 3.7 Pipeline',
      year: '2026',
      stars: 5,
      desc: 'Autonomous multi-channel streaming telemetry from Slack, Zendesk, Discord, and HubSpot into real-time vector embeddings.',
      spineBg: '#09241b',
      spineInk: '#34d399',
      spineFont: '700 36px sans-serif',
      backBg: '#04140e',
      backInk: '52,211,153',
      edge: '#dcfce7',
      chapters: [
        'Continuous Ingestion Pipeline',
        'Strict Zod Schema Validation',
        'Cosine Vector Retrieval Math',
        'Real-Time Slack Spike Webhooks',
      ],
    },
  ];

  // Spotlight Navbar items
  const navItems: NavItem[] = [
    { label: 'Overview', href: '#hero' },
    { label: 'AI Live Engine', href: '#ai-engine' },
    { label: 'Knowledge Clusters', href: '#clusters' },
    { label: 'Neural Bento', href: '#bento' },
    { label: '3D Dossiers', href: '#dossiers' },
    { label: 'Architecture', href: '#architecture' },
  ];

  const handleNavClick = (item: NavItem) => {
    const el = document.querySelector(item.href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[var(--background)] text-slate-100 pb-32">
      {/* Interactive 3D Living Background Layer with Parallax & Generative Visuals */}
      <Live3DBackground initialScene="cosmic" showControls={true} />

      {/* Background Decorative Ambient Radials */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-[radial-gradient(ellipse_at_top,_var(--accent-glow),_transparent_70%)] pointer-events-none z-0 opacity-60" />
      <div className="absolute top-[1800px] right-[-200px] w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[3200px] left-[-200px] w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* TOP HEADER / SPOTLIGHT NAVBAR */}
      <header className="sticky top-0 z-40 w-full px-4 pt-2 pb-3 backdrop-blur-md bg-[var(--background)]/75 border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Live Status */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                PROJECT LOOP
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  AI v2.4
                </span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Customer-Feedback Intelligence</span>
            </div>
          </Link>

          {/* SPOTLIGHT NAVBAR COMPONENT */}
          <div className="hidden md:flex items-center justify-center">
            <SpotlightNavbar 
              items={navItems} 
              onItemClick={handleNavClick}
              className="pt-0"
            />
          </div>

          {/* Quick Access CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={cycleTheme}
              className="p-2 sm:p-2.5 rounded-xl border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
              title="Cycle Theme"
            >
              <Palette className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline font-medium capitalize">{appTheme}</span>
            </button>

            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 transition-all"
            >
              Sign In
            </Link>

            <Link
              href="/dashboard"
              className="btn-glow-indigo px-3.5 sm:px-4 py-2 text-xs font-semibold flex items-center gap-1.5 sm:gap-2 shadow-indigo-500/20"
            >
              <span>Enter App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Navigation Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/10 bg-slate-950/95 rounded-2xl p-4 space-y-2 backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  handleNavClick(item);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 px-3 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsDemoModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold text-center"
              >
                Request Enterprise Demo
              </button>
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold text-center"
              >
                Sign In to Workspace
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          HERO SECTION with FLIP TEXT COMPONENT
         ======================================================== */}
      <section id="hero" className="relative pt-16 md:pt-24 pb-16 px-4 max-w-6xl mx-auto text-center z-10">
        {/* Release / Model Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 shadow-sm mb-6 backdrop-blur-sm">
          <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Anthropic Claude 3.7 / Sonnet Grounded Architecture</span>
          <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
          <span className="text-slate-400">Production Ready</span>
        </div>

        {/* HERO TITLE FEATURING FLIP TEXT COMPONENT */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-5xl mx-auto">
          <span className="block text-slate-200">TURN CUSTOMER CHAOS INTO</span>
          <span className="text-indigo-400 mt-2 block font-black">
            <FlipText
              className="text-indigo-400 drop-shadow-[0_0_35px_rgba(99,102,241,0.45)]"
              duration={2.4}
              delay={0.2}
              loop={true}
            >
              RANKED REVENUE ACTION
            </FlipText>
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          Mid-market and enterprise SaaS lose millions when qualitative feedback rots in Zendesk tickets and inboxes. 
          <strong className="text-white font-semibold"> Project LOOP</strong> ingests, classifies, and clusters customer voices into prioritized product roadmaps tied directly to 
          <span className="text-emerald-400 font-semibold"> ARR impact</span> and 
          <span className="text-indigo-400 font-semibold"> churn signals</span>.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="btn-glow-indigo px-7 py-3.5 text-sm font-bold flex items-center gap-2.5 rounded-xl shadow-lg"
          >
            <span>Explore Acme SaaS Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#ai-engine"
            className="px-6 py-3.5 text-sm font-semibold rounded-xl border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white backdrop-blur-md transition-all flex items-center gap-2"
          >
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Test Live AI Engine</span>
          </a>

          <a
            href="#clusters"
            className="px-6 py-3.5 text-sm font-semibold rounded-xl border border-white/10 hover:border-white/20 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-2"
          >
            <FolderGit2 className="w-4 h-4 text-purple-400" />
            <span>Interactive Dossiers</span>
          </a>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="glass-panel p-4 rounded-2xl border border-white/10">
            <div className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
              <span>4,820+</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">+18%</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Ingested Multi-Channel Points</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10">
            <div className="text-2xl font-black text-indigo-400 tracking-tight flex items-center gap-1.5">
              <span>98.4%</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Zod</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">AI Classification Precision</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10">
            <div className="text-2xl font-black text-rose-400 tracking-tight flex items-center gap-1.5">
              <span>$285k</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">Churn</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Identified At-Risk ARR</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10">
            <div className="text-2xl font-black text-emerald-400 tracking-tight flex items-center gap-1.5">
              <span>&lt;180ms</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Vector</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Cosine Vector Search Latency</div>
          </div>
        </div>
      </section>

      {/* ========================================================
          INTERACTIVE AI LIVE ENGINE (KINETIC TEXT LOADER DEMO)
         ======================================================== */}
      <section id="ai-engine" className="py-20 px-4 max-w-6xl mx-auto z-10 relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/25 text-purple-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Interactive RAG Engine Simulation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Conversational Grounded Intelligence
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mt-2">
            Ask any strategic product question. Watch the kinetic synthesis engine retrieve vector embeddings and formulate verified recommendations.
          </p>
        </div>

        {/* Interactive Query Box */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/15 shadow-2xl relative overflow-hidden backdrop-blur-xl bg-slate-950/70">
          {/* Kinetic Live Telemetry Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900/60 to-purple-950/50 border border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div>
                <span className="text-xs font-bold text-white tracking-wide block">
                  Continuous RAG Stream Active
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Latency: 142ms • Vector Index: Pinecone/Cosine
                </span>
              </div>
            </div>

            {/* Kinetic Animated Loader Pill */}
            <div className="h-10 px-4 py-1 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center overflow-hidden">
              <KineticTextLoader text="LOOP" className="text-indigo-400 scale-[0.42] origin-center -my-2" />
            </div>
          </div>

          {/* Prompt Selector Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-slate-400 mr-2">Try Real Queries:</span>
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleRunQuery(s)}
                disabled={isQueryRunning}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedPrompt === s.prompt
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                <span>{s.label}</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>

          {/* Query Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl bg-slate-900/90 border border-white/10 shadow-inner mb-6">
            <div className="flex items-center gap-3 px-3 flex-1 w-full">
              <Search className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                type="text"
                value={selectedPrompt}
                onChange={(e) => setSelectedPrompt(e.target.value)}
                placeholder="Ask LOOP AI any product question..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                const matched = samplePrompts.find((p) => p.prompt === selectedPrompt) || samplePrompts[0];
                handleRunQuery(matched);
              }}
              disabled={isQueryRunning}
              className="btn-glow-indigo w-full sm:w-auto px-6 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shrink-0"
            >
              <Cpu className="w-4 h-4" />
              <span>{isQueryRunning ? 'Synthesizing...' : 'Run Grounded AI'}</span>
            </button>
          </div>

          {/* AI PROCESSING STATE USING KINETIC TEXT LOADER */}
          {isQueryRunning ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="mb-4">
                <KineticTextLoader text="LOOP" className="text-indigo-400 scale-90" />
              </div>
              <p className="text-sm font-medium text-slate-400 animate-pulse">
                Embedding query vector • Scanning 4,820 feedback items • Re-ranking citations...
              </p>
            </div>
          ) : queryResult ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{queryResult.status}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                  <span>Citations: <strong className="text-indigo-300">{queryResult.citations} Items</strong></span>
                  <span>Financial Exposure: <strong className="text-rose-400">{queryResult.arrRisk}</strong></span>
                </div>
              </div>

              {/* Synthesized Response Card */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Synthesis & Verbatim Context
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {queryResult.summary}
                </p>
              </div>

              {/* Prescribed Engineering Recommendation */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3">
                <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                    Prescribed Strategic Action
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {queryResult.recommendation}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Link
                  href="/ask"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  <span>Open Full Conversational Q&A Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ========================================================
          KNOWLEDGE CLUSTERS WITH FOLDER PREVIEW COMPONENT
         ======================================================== */}
      <section id="clusters" className="py-20 px-4 max-w-6xl mx-auto z-10 relative">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 mb-3">
            <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive 3D Dossier Inspection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Thematic Intelligence Folders
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mt-2">
            Hover over any folder dossier to see verbatim customer artifacts and risk signals fan out in 3D physics. Click to inspect live transcripts.
          </p>
        </div>

        {/* 4 Themed Folders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 1. Billing & Invoicing Folder */}
          <div 
            onClick={() => setActiveFolderInfo(folderDetails.billing)}
            className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-indigo-500/40 transition-all duration-300 flex flex-col items-center text-center cursor-pointer group hover:-translate-y-1.5"
          >
            <div className="h-44 flex items-center justify-center w-full">
              <FolderPreview
                variant="rudras"
                images={billingFolderImages}
                label="Billing 504"
                size="md"
              />
            </div>
            <div className="mt-4 w-full">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">Billing & Invoicing</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">CRITICAL</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 text-left mb-3">
                504 timeout logs, VAT invoice retrieval failures, and mid-market renewal blocks.
              </p>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 font-mono">
                <span className="text-slate-400">34 items</span>
                <span className="text-rose-400 font-semibold">$45k ARR Risk</span>
              </div>
            </div>
          </div>

          {/* 2. Enterprise SSO Folder */}
          <div 
            onClick={() => setActiveFolderInfo(folderDetails.sso)}
            className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-sky-500/40 transition-all duration-300 flex flex-col items-center text-center cursor-pointer group hover:-translate-y-1.5"
          >
            <div className="h-44 flex items-center justify-center w-full">
              <FolderPreview
                variant="ardra"
                images={ssoFolderImages}
                label="SAML SSO"
                size="md"
              />
            </div>
            <div className="mt-4 w-full">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-white group-hover:text-sky-400 transition-colors">Enterprise SSO / SAML</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">DEAL BLOCKER</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 text-left mb-3">
                Okta, Azure AD, and automated SCIM deprovisioning required for 1,200 seats.
              </p>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 font-mono">
                <span className="text-slate-400">24 items</span>
                <span className="text-sky-400 font-semibold">$180k Pipeline</span>
              </div>
            </div>
          </div>

          {/* 3. Mobile App Experience */}
          <div 
            onClick={() => setActiveFolderInfo(folderDetails.mobile)}
            className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-purple-500/40 transition-all duration-300 flex flex-col items-center text-center cursor-pointer group hover:-translate-y-1.5"
          >
            <div className="h-44 flex items-center justify-center w-full">
              <FolderPreview
                variant="shakti"
                images={mobileFolderImages}
                label="Mobile App"
                size="md"
              />
            </div>
            <div className="mt-4 w-full">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-white group-hover:text-purple-400 transition-colors">Mobile App UX</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">NPS IMPACT</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 text-left mb-3">
                iOS 18 FaceID cold start crash dumps and iPad landscape action bar issues.
              </p>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 font-mono">
                <span className="text-slate-400">21 items</span>
                <span className="text-amber-400 font-semibold">NPS -18 Drop</span>
              </div>
            </div>
          </div>

          {/* 4. Integrations & Webhooks */}
          <div 
            onClick={() => setActiveFolderInfo(folderDetails.integrations)}
            className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-emerald-500/40 transition-all duration-300 flex flex-col items-center text-center cursor-pointer group hover:-translate-y-1.5"
          >
            <div className="h-44 flex items-center justify-center w-full">
              <FolderPreview
                variant="kubera"
                images={integrationsFolderImages}
                label="Webhooks"
                size="md"
              />
            </div>
            <div className="mt-4 w-full">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">Integrations & Sync</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">LIVE BOT</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 text-left mb-3">
                Slack real-time spike webhooks and two-way CRM telemetry synchronization.
              </p>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5 font-mono">
                <span className="text-slate-400">19 items</span>
                <span className="text-emerald-400 font-semibold">4 Active Channels</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal / Inspection Drawer for Folder Details */}
        {activeFolderInfo && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
            onClick={() => setActiveFolderInfo(null)}
          >
            <div 
              className="glass-panel max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative bg-slate-950"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {activeFolderInfo.urgency}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {activeFolderInfo.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveFolderInfo(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
                {activeFolderInfo.description}
              </p>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono mb-6">
                <span>Cluster Size: <strong className="text-white">{activeFolderInfo.itemsCount} Transcripts</strong></span>
                <span>Financial Weight: <strong className="text-rose-400">{activeFolderInfo.arrImpact}</strong></span>
              </div>

              <div className="space-y-3 mb-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Customer Verbatim Samples
                </span>
                {activeFolderInfo.feedbackQuotes.map((q, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-indigo-300">{q.author}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                        {q.tag}
                      </span>
                    </div>
                    <p className="text-slate-200 italic font-serif">"{q.quote}"</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveFolderInfo(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <Link
                  href="/inbox"
                  className="btn-glow-indigo px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Open in Triage Inbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================
          NEURAL BENTO & MULTI-CHANNEL INGESTION (STAGGERED GRID)
         ======================================================== */}
      <section id="bento" className="py-20 px-4 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 mb-3">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Automated Ingestion Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Neural Ecosystem Architecture
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mt-2">
            Multi-source ingestion streams from GitHub, Slack, Twitter, Zendesk, and Discord converge directly into our dynamic Bento core.
          </p>
        </div>

        {/* STAGGERED GRID COMPONENT */}
        <div className="w-full relative rounded-3xl border border-white/10 glass-panel p-2 sm:p-6 overflow-hidden">
          <StaggeredGrid
            centerText="LOOP CORE"
            images={gridImages}
            bentoItems={bentoItems}
            showFooter={false}
            className="w-full"
          />
        </div>
      </section>

      {/* ========================================================
          3D EXECUTIVE VOC DOSSIERS (BOOKS SHOWCASE - THREE.JS)
         ======================================================== */}
      <section id="dossiers" className="py-20 px-4 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 border border-pink-500/25 text-pink-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Interactive 3D Three.js Dossiers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            3D Executive VoC Playbooks
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mt-2">
            Click and rotate real-time Three.js 3D customer intelligence dossiers. Open any book to inspect financial impact and engineering plans.
          </p>
        </div>

        {/* 3D BOOKS SHOWCASE COMPONENT */}
        <div className="w-full relative h-[640px] rounded-3xl border border-white/10 glass-panel overflow-hidden shadow-2xl bg-slate-950/70">
          <BooksShowcase
            books={intelligenceBooks}
            heroTitle="LOOP"
            navTitle="VoC Dossiers"
            showNav={true}
            showDetailPanel={true}
            showCarousel={true}
            className="h-full w-full"
          />
        </div>
      </section>

      {/* ========================================================
          ARCHITECTURE & ENTERPRISE RBAC SECTION
         ======================================================== */}
      <section id="architecture" className="py-20 px-4 max-w-6xl mx-auto z-10 relative">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Multi-Tenant Isolation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Enterprise RBAC & Security Boundaries
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mt-2">
            Zidio-certified RBAC matrix guaranteeing data isolation and permission guards on every API route and database query.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">ADMIN Role</h3>
              <p className="text-xs text-slate-400 mb-4">Full operational command & governance.</p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Single & Bulk CSV feedback ingestion</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Member invite & role assignment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Claude AI manual reclassification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>VoC executive report generation</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className="mt-6 w-full py-2.5 rounded-xl text-center text-xs font-bold btn-glow-indigo"
            >
              Sign In as Admin
            </Link>
          </div>

          {/* Analyst Card */}
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-purple-950/20 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">ANALYST Role</h3>
              <p className="text-xs text-slate-400 mb-4">Deep investigation & channel triage.</p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Feedback ingestion & triage status updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ask LOOP conversational RAG assistant</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Trend spike analysis & threshold alerts</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500 line-through">
                  <span>Workspace team member management</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className="mt-6 w-full py-2.5 rounded-xl text-center text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all"
            >
              Sign In as Analyst
            </Link>
          </div>

          {/* Viewer Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-slate-900/40 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">VIEWER Role</h3>
              <p className="text-xs text-slate-400 mb-4">Read-only transparency for stakeholders.</p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Live dashboard metrics & ARR charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Feedback inbox browsing & search</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500 line-through">
                  <span>Feedback ingestion (Returns 403)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500 line-through">
                  <span>Status modification (Returns 403)</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className="mt-6 w-full py-2.5 rounded-xl text-center text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
            >
              Sign In as Viewer
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          SINGLE CLEAR CTA (CALL TO ACTION) SECTION
         ======================================================== */}
      <section id="cta" className="py-24 px-4 max-w-5xl mx-auto z-10 relative text-center">
        <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 via-slate-900/80 to-slate-950/90 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
          {/* Ambient Glow Orb */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[220px] bg-gradient-to-r from-indigo-500/20 via-purple-500/25 to-pink-500/20 blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ready for Production Intelligence</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 max-w-3xl mx-auto leading-tight">
            Stop Guessing What to Build. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Turn Feedback into ARR Growth.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Join engineering and product leaders leveraging Project LOOP to classify multi-channel feedback with Claude 3.7 AI, catch contract churn spikes early, and align teams around verified customer evidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-8">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto btn-glow-indigo py-3.5 px-8 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/30"
            >
              <span>Launch Demo Workspace Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto py-3.5 px-6 rounded-xl border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Request Custom Demo</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant 1-Click Access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>SOC 2 Type II &amp; GDPR Aligned</span>
            </div>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE FOOTER */}
      <Footer />

      {/* ENTERPRISE DEMO MODAL */}
      <DemoRequestModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSuccessLaunch={() => router.push('/dashboard')}
      />

      {/* ========================================================
          BOTTOM FLOATING VISIONOS / MACOS GLASS DOCK
         ======================================================== */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto max-w-[95vw]">
        <GlassDock
          items={dockItems}
          dockClassName="shadow-2xl shadow-indigo-950/80 border border-white/20 bg-slate-950/85 backdrop-blur-2xl"
        />
      </div>
    </div>
  );
}
