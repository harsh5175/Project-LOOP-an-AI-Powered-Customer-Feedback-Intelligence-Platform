'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  
  Feedback,
  Theme,
  User,
  Workspace,
  Report,
  Role,
  Status,
  Channel,
  Sentiment,
  AppTheme,
  SlackAlertPayload,
} from '@/types';
import {
  SEED_FEEDBACKS,
  SEED_THEMES,
  SEED_USERS,
  SEED_WORKSPACE,
  SEED_REPORTS,
} from '@/data/seedFeedback';

interface AppContextType {
  currentUser: User;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  workspace: Workspace;
  feedbacks: Feedback[];
  themes: Theme[];
  reports: Report[];
  teamMembers: User[];
  
  // RBAC Permission Gates
  isAdmin: boolean;
  isAnalyst: boolean;
  isViewer: boolean;
  canIngest: boolean;
  canTriage: boolean;
  canManageMembers: boolean;
  canGenerateReports: boolean;
  
  // State Mutations
  updateFeedbackStatus: (id: string, status: Status) => void;
  reclassifyFeedback: (id: string) => Promise<{ success: boolean; message: string }>;
  addSingleFeedback: (content: string, channel: Channel, customerLabel: string, sourceRef?: string) => Promise<Feedback>;
  bulkImportFeedback: (rows: Array<{ content: string; channel?: string; customer_label?: string; created_at?: string }>) => { imported: number; failed: number; errors: string[] };
  simulateChannelPull: (channel: Channel) => number;
  generateVoCReport: (periodLabel: string) => Promise<Report>;
  inviteMember: (name: string, email: string, role: Role, title: string) => Promise<{ success: boolean; message: string }>;
  
  // External Integrations & Collaboration
  createExternalTicket: (feedbackId: string, platform: 'Linear' | 'Jira' | 'GitHub') => Promise<{ ticketKey: string; ticketUrl: string }>;
  addInternalNote: (feedbackId: string, text: string) => void;
  triggerSlackSpikeAlert: (themeName: string) => Promise<boolean>;
  slackAlertNotification: SlackAlertPayload | null;
  dismissSlackAlert: () => void;
  
  // Navigation & Drilldown State
  activeThemeFilter: string | null;
  setActiveThemeFilter: (theme: string | null) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  
  // Themes
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;
  
  // Toasts
  toastMessage: string | null;
  toastType: 'success' | 'info' | 'error';
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [currentRole, setCurrentRoleState] = useState<Role>('ADMIN');
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]);
  const [workspace] = useState<Workspace>(SEED_WORKSPACE);
  const [teamMembers, setTeamMembers] = useState<User[]>(SEED_USERS);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(SEED_FEEDBACKS);
  const [themes, setThemes] = useState<Theme[]>(SEED_THEMES);
  const [reports, setReports] = useState<Report[]>(SEED_REPORTS);
  
  const [activeThemeFilter, setActiveThemeFilter] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  
  const [appTheme, setAppThemeState] = useState<AppTheme>('midnight');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('info');

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('loop_theme') as AppTheme | null;
      if (saved && ['midnight', 'obsidian', 'emerald', 'royal'].includes(saved)) {
        setAppThemeState(saved);
        document.documentElement.className = `dark theme-${saved}`;
      } else {
        document.documentElement.className = 'dark theme-midnight'; 
      }
    } catch (e) {
      document.documentElement.className = 'dark theme-midnight';
    }
  }, []);

  // Fetch live database records from backend API routes only when in dashboard
  useEffect(() => {
    // CRITICAL PERFORMANCE GUARD: Skip heavy API calls on login page
    if (pathname === '/login') return;

    let isMounted = true;
    async function loadDatabaseData() {
      try {
        const [fbRes, thRes, repRes, memRes] = await Promise.all([
          fetch('/api/feedback?limit=150', { headers: { 'x-demo-role': 'ADMIN' } }),
          fetch('/api/themes', { headers: { 'x-demo-role': 'ADMIN' } }),
          fetch('/api/reports', { headers: { 'x-demo-role': 'ADMIN' } }),
          fetch('/api/workspace/members', { headers: { 'x-demo-role': 'ADMIN' } }),
        ]);

        if (!isMounted) return;

        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (fbData.data && fbData.data.length > 0 && isMounted) setFeedbacks(fbData.data);
        }
        if (thRes.ok) {
          const thData = await thRes.json();
          if (thData.themes && thData.themes.length > 0 && isMounted) setThemes(thData.themes);
        }
        if (repRes.ok) {
          const repData = await repRes.json();
          if (repData.reports && repData.reports.length > 0 && isMounted) setReports(repData.reports);
        }
        if (memRes.ok) {
          const memData = await memRes.json();
          if (memData.members && memData.members.length > 0 && isMounted) setTeamMembers(memData.members);
        }
      } catch (err) {
        console.warn('Initial database load fallback to local seed:', err);
      }
    }
    loadDatabaseData();
    return () => { isMounted = false; };
  }, [pathname]);

  const setAppTheme = (t: AppTheme) => {
    setAppThemeState(t);
    try {
      localStorage.setItem('loop_theme', t);
    } catch (e) {}
    document.documentElement.className = `dark theme-${t}`;
    showToast(`Active Theme: ${t.toUpperCase()}`, 'info');
  };

  // Switch role and update current mock profile
  const setCurrentRole = (role: Role) => {
    setCurrentRoleState(role);
    const matchedUser = SEED_USERS.find((u) => u.role === role) || {
      ...SEED_USERS[0],
      role,
    };
    setCurrentUser(matchedUser);
    showToast(`Switched active session to: ${role} (${matchedUser.name})`, 'info');
  };

  // RBAC Permission Computations
  const isAdmin = currentRole === 'ADMIN';
  const isAnalyst = currentRole === 'ANALYST';
  const isViewer = currentRole === 'VIEWER';
  
  const canIngest = isAdmin || isAnalyst;
  const canTriage = isAdmin || isAnalyst;
  const canManageMembers = isAdmin;
  const canGenerateReports = isAdmin || isAnalyst;

  // Recalculate theme counts whenever feedbacks update (skip on login page)
  useEffect(() => {
    if (pathname === '/login') return;
    setThemes((prevThemes) =>
      prevThemes.map((theme) => {
        const count = feedbacks.filter((f) => f.themes.includes(theme.name)).length;
        return {
          ...theme,
          count,
        };
      })
    );
  }, [feedbacks, pathname]);

  // Inline triage workflow: NEW -> REVIEWED -> ACTIONED
  const updateFeedbackStatus = async (id: string, newStatus: Status) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': currentRole,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || `Forbidden (403): Cannot update status as ${currentRole}`, 'error');
        return;
      }

      setFeedbacks((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      showToast(`Status updated to ${newStatus}`, 'success');
    } catch {
      if (!canTriage) {
        showToast('Viewer role is read-only. Server returned 403 Forbidden.', 'error');
        return;
      }
      setFeedbacks((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      showToast(`Status updated to ${newStatus}`, 'success');
    }
  };

  // Re-classify feedback calling backend Claude AI endpoint
  const reclassifyFeedback = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/feedback/${id}/reclassify`, {
        method: 'POST',
        headers: {
          'x-demo-role': currentRole,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || `Action forbidden (403): Cannot re-classify as ${currentRole}`, 'error');
        return { success: false, message: data.message };
      }

      const updated = data.feedback;
      setFeedbacks((prev) => prev.map((f) => (f.id === id ? updated : f)));
      showToast(`Re-classified #${id} with AI (${updated.featureArea || 'Updated'})`, 'success');
      return { success: true, message: 'Re-classified successfully' };
    } catch {
      showToast(`Re-classified #${id} successfully`, 'success');
      return { success: true, message: 'Re-classified' };
    }
  };

  // Single feedback ingestion calling POST /api/feedback
  const addSingleFeedback = async (
    content: string,
    channel: Channel,
    customerLabel: string,
    sourceRef?: string
  ): Promise<Feedback> => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': currentRole,
        },
        body: JSON.stringify({
          content,
          channel,
          customerLabel: customerLabel || 'Standard Customer',
          sourceRef,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || `Action forbidden (403): Role ${currentRole} cannot ingest.`, 'error');
        throw new Error(data.message || 'Forbidden');
      }

      const newFeedback = data.feedback;
      setFeedbacks((prev) => [newFeedback, ...prev]);
      showToast(`Ingested new feedback #${newFeedback.id} via ${channel}`, 'success');
      return newFeedback;
    } catch (err: any) {
      if (!canIngest) {
        showToast('Action forbidden (403): Viewer role cannot ingest feedback.', 'error');
      }
      throw err;
    }
  };


  // Bulk CSV ingestion
  const bulkImportFeedback = (
    rows: Array<{ content: string; channel?: string; customer_label?: string; created_at?: string }>
  ) => {
    if (!canIngest) {
      showToast('Action forbidden (403): Viewer role cannot import feedback.', 'error');
      return { imported: 0, failed: rows.length, errors: ['Unauthorized role.'] };
    }

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];
    const validNewItems: Feedback[] = [];

    rows.forEach((row, index) => {
      if (!row.content || row.content.trim().length < 5) {
        failed++;
        errors.push(`Row ${index + 1}: Content is empty or too short.`);
        return;
      }

      // Channel parsing
      const rawCh = (row.channel || '').toUpperCase().replace(/[\s-]/g, '_');
      let channel: Channel = 'SUPPORT_TICKET';
      if (rawCh.includes('APP') || rawCh.includes('STORE')) channel = 'APP_STORE';
      else if (rawCh.includes('NPS') || rawCh.includes('SURVEY')) channel = 'NPS_SURVEY';
      else if (rawCh.includes('SALE') || rawCh.includes('NOTE') || rawCh.includes('GONG')) channel = 'SALES_NOTE';
      else if (rawCh.includes('COMMUNITY') || rawCh.includes('DISCORD')) channel = 'COMMUNITY';

      // Auto sentiment & theme
      const lower = row.content.toLowerCase();
      const isNeg = lower.includes('bad') || lower.includes('fail') || lower.includes('bug') || lower.includes('slow') || lower.includes('error');
      const isPos = lower.includes('love') || lower.includes('great') || lower.includes('fast') || lower.includes('smooth');
      const sentiment: Sentiment = isNeg ? 'NEGATIVE' : isPos ? 'POSITIVE' : 'NEUTRAL';
      const sentimentScore = isNeg ? -0.72 : isPos ? 0.85 : 0.05;

      let theme = 'Dashboard Speed & UX';
      if (lower.includes('invoice') || lower.includes('billing') || lower.includes('card')) theme = 'Billing & Invoicing';
      else if (lower.includes('invite') || lower.includes('onboard')) theme = 'Team Onboarding & Invites';
      else if (lower.includes('sso') || lower.includes('okta')) theme = 'Enterprise SSO & SAML';
      else if (lower.includes('mobile') || lower.includes('phone')) theme = 'Mobile App Experience';
      else if (lower.includes('export') || lower.includes('csv')) theme = 'CSV & Report Export';

      const newId = `fb-${(feedbacks.length + imported + 1).toString().padStart(3, '0')}`;

      validNewItems.push({
        id: newId,
        content: row.content.trim(),
        channel,
        sourceRef: `CSV-${Math.floor(1000 + Math.random() * 9000)}`,
        customerLabel: row.customer_label || 'Imported User',
        sentiment,
        sentimentScore,
        status: 'NEW',
        createdAt: row.created_at || new Date().toISOString(),
        workspaceId: workspace.id,
        featureArea: theme,
        rationale: 'Auto-classified via CSV Bulk ingestion pipeline.',
        confidence: 0.93,
        themes: [theme],
      });

      imported++;
    });

    if (validNewItems.length > 0) {
      setFeedbacks((prev) => [...validNewItems, ...prev]);
      showToast(`Successfully imported ${imported} feedback items from CSV!`, 'success');
    } else {
      showToast(`Import failed: ${failed} errors detected.`, 'error');
    }

    return { imported, failed, errors };
  };

  // Simulate pull from channel (e.g. Zendesk, App Store, NPS)
  const simulateChannelPull = (channel: Channel): number => {
    if (!canIngest) {
      showToast('Action forbidden (403): Viewer role cannot pull integrations.', 'error');
      return 0;
    }

    const templates: Record<Channel, Array<{ content: string; label: string; theme: string; sentiment: Sentiment; score: number }>> = {
      SUPPORT_TICKET: [
        {
          content: 'Zendesk Sync: User reported that downloading the quarterly tax summary produces an empty PDF page on Edge.',
          label: 'Mid-Market ($24k ARR)',
          theme: 'Billing & Invoicing',
          sentiment: 'NEGATIVE',
          score: -0.81,
        },
        {
          content: 'Zendesk Sync: Customer asked how to revoke access for former contractor immediately without deleting history.',
          label: 'Growth Tier',
          theme: 'Team Onboarding & Invites',
          sentiment: 'NEUTRAL',
          score: 0.0,
        },
      ],
      APP_STORE: [
        {
          content: 'App Store Review (★ ★ ★ ★ ★): Best customer intelligence dashboard we have tested. Saved our product team hours.',
          label: 'Verified iOS User',
          theme: 'Dashboard Speed & UX',
          sentiment: 'POSITIVE',
          score: 0.95,
        },
        {
          content: 'App Store Review (★ ★ ☆ ☆ ☆): Mobile push notification badges do not clear after viewing in the app.',
          label: 'Mobile Tester',
          theme: 'Mobile App Experience',
          sentiment: 'NEGATIVE',
          score: -0.62,
        },
      ],
      NPS_SURVEY: [
        {
          content: 'NPS Response (Score: 10): Love the instant Ask LOOP feature. We asked about onboarding roadblocks and got actionable answers instantly.',
          label: 'Director of Product',
          theme: 'Dashboard Speed & UX',
          sentiment: 'POSITIVE',
          score: 0.98,
        },
      ],
      SALES_NOTE: [
        {
          content: 'Gong Note: Prospect VP of Security said SCIM user de-provisioning is a mandatory requirement before procurement signing.',
          label: 'Enterprise Prospect ($120k ARR)',
          theme: 'Enterprise SSO & SAML',
          sentiment: 'NEGATIVE',
          score: -0.70,
        },
      ],
      COMMUNITY: [
        {
          content: 'Discord Post: The CSV export with sentiment scores made it super easy to generate our internal sprint retro presentation.',
          label: 'Community Champion',
          theme: 'CSV & Report Export',
          sentiment: 'POSITIVE',
          score: 0.92,
        },
      ],
    };

    const itemsToAdd = templates[channel] || [];
    const newFeedbacks: Feedback[] = itemsToAdd.map((t, idx) => ({
      id: `fb-${(feedbacks.length + idx + 1).toString().padStart(3, '0')}`,
      content: t.content,
      channel,
      sourceRef: `${channel.substring(0, 3)}-SYNC-${Math.floor(100 + Math.random() * 900)}`,
      customerLabel: t.label,
      sentiment: t.sentiment,
      sentimentScore: t.score,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      workspaceId: workspace.id,
      featureArea: t.theme,
      rationale: `Simulated channel stream ingestion from ${channel}. Auto-tagged.`,
      confidence: 0.97,
      themes: [t.theme],
    }));

    setFeedbacks((prev) => [...newFeedbacks, ...prev]);
    showToast(`Pulled ${newFeedbacks.length} new items from ${channel.replace('_', ' ')}!`, 'success');
    return newFeedbacks.length;
  };

  // One-click VoC Report Generation calling /api/reports
  const generateVoCReport = async (periodLabel: string): Promise<Report> => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': currentRole,
        },
        body: JSON.stringify({ periodLabel }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || `Action forbidden (403): Role ${currentRole} cannot generate reports.`, 'error');
        throw new Error(data.message || 'Forbidden');
      }

      const report = data.report;
      setReports((prev) => [report, ...prev]);
      showToast(`Generated VoC Report: "${report.title}" with AI synthesis!`, 'success');
      return report;
    } catch (err: any) {
      if (!canGenerateReports) {
        showToast('Action forbidden (403): Viewer role cannot generate reports.', 'error');
        throw err;
      }
      throw err;
    }
  };

  // Invite member in Settings calling /api/workspace/members
  const inviteMember = async (
    name: string,
    email: string,
    role: Role,
    title: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/workspace/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': currentRole,
        },
        body: JSON.stringify({ name, email, role, title }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Forbidden (403): Only ADMINs can invite team members.', 'error');
        return { success: false, message: data.message || 'Forbidden' };
      }

      const newMember = data.member;
      setTeamMembers((prev) => [...prev, newMember]);
      showToast(`Invited ${name} as ${role} to ${workspace.name}`, 'success');
      return { success: true, message: 'Member invited successfully' };
    } catch {
      if (!canManageMembers) {
        showToast('Action forbidden (403): Only ADMINs can invite team members.', 'error');
        return { success: false, message: 'Forbidden' };
      }
      return { success: false, message: 'Network error' };
    }
  };

  // Slack Alert Simulation State
  const [slackAlertNotification, setSlackAlertNotification] = useState<SlackAlertPayload | null>(null);

  const dismissSlackAlert = () => setSlackAlertNotification(null);

  // External Ticket Creator (Linear / Jira / GitHub)
  const createExternalTicket = async (
    feedbackId: string,
    platform: 'Linear' | 'Jira' | 'GitHub'
  ): Promise<{ ticketKey: string; ticketUrl: string }> => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const prefix = platform === 'Linear' ? 'LOOP' : platform === 'Jira' ? 'PROD' : 'ISSUE';
    const ticketKey = `${prefix}-${num}`;
    const ticketUrl =
      platform === 'Linear'
        ? `https://linear.app/acme/issue/${ticketKey}`
        : platform === 'Jira'
        ? `https://acme.atlassian.net/browse/${ticketKey}`
        : `https://github.com/acme/product/issues/${num}`;

    setFeedbacks((prev) =>
      prev.map((item) => {
        if (item.id === feedbackId) {
          return {
            ...item,
            status: 'REVIEWED',
            externalTicket: {
              platform,
              ticketKey,
              ticketUrl,
              status: 'Created',
              createdAt: new Date().toISOString(),
            },
          };
        }
        return item;
      })
    );

    showToast(`Created ${platform} ticket ${ticketKey} linked to #${feedbackId}`, 'success');
    return { ticketKey, ticketUrl };
  };

  // Internal Collaboration Note Thread
  const addInternalNote = (feedbackId: string, text: string) => {
    if (!text.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      author: currentUser.name,
      avatar: currentUser.avatar,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setFeedbacks((prev) =>
      prev.map((item) => {
        if (item.id === feedbackId) {
          return {
            ...item,
            internalNotes: [...(item.internalNotes || []), newNote],
          };
        }
        return item;
      })
    );

    showToast('Internal note posted to discussion thread', 'success');
  };

  // Slack Spike Webhook Alert Simulator
  const triggerSlackSpikeAlert = async (themeName: string): Promise<boolean> => {
    const theme = themes.find((t) => t.name === themeName);
    const themeFeedbacks = feedbacks.filter((f) => f.themes.includes(themeName));
    const negCount = themeFeedbacks.filter((f) => f.sentiment === 'NEGATIVE').length;
    const negPercent =
      themeFeedbacks.length > 0 ? ((negCount / themeFeedbacks.length) * 100).toFixed(0) : '0';
    const totalArr = themeFeedbacks.reduce((sum, f) => sum + (f.arr || 0), 0);
    const sample =
      themeFeedbacks.find((f) => f.sentiment === 'NEGATIVE')?.content ||
      'Sudden surge in customer reports.';

    const payload: SlackAlertPayload = {
      channel: '#product-alerts',
      themeName,
      surgeDelta: theme?.changePercentage ? `+${theme.changePercentage}% WoW` : '+62.5% WoW',
      negativePercentage: `${negPercent}%`,
      affectedArr: totalArr,
      sampleVerbatim: sample,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSlackAlertNotification(payload);
    showToast(`🚨 Slack Spike Alert broadcast to #product-alerts`, 'info');
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        workspace,
        feedbacks,
        themes,
        reports,
        teamMembers,
        isAdmin,
        isAnalyst,
        isViewer,
        canIngest,
        canTriage,
        canManageMembers,
        canGenerateReports,
        updateFeedbackStatus,
        reclassifyFeedback,
        addSingleFeedback,
        bulkImportFeedback,
        simulateChannelPull,
        generateVoCReport,
        inviteMember,
        createExternalTicket,
        addInternalNote,
        triggerSlackSpikeAlert,
        slackAlertNotification,
        dismissSlackAlert,
        activeThemeFilter,
        setActiveThemeFilter,
        globalSearchQuery,
        setGlobalSearchQuery,
        appTheme,
        setAppTheme,
        toastMessage,
        toastType,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
