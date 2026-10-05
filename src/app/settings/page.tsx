'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Role } from '@/types';
import {
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  Building,
  Key,
  Check,
  X,
  AlertCircle,
  Lock,
  Code,
  Copy,
  Terminal,
  Bell,
  Webhook,
  Play,
  ExternalLink,
  Send,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { MongoDBManager } from '@/components/ui/MongoDBManager';

export default function SettingsPage() {
  const { 
    workspace, 
    teamMembers, 
    currentRole, 
    isAdmin, 
    inviteMember, 
    showToast,
    triggerSlackSpikeAlert,
  } = useApp();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('ANALYST');
  const [title, setTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // API Tester & Webhooks state
  const [testPayload, setTestPayload] = useState('Payment method update gateway failed with 504 timeout during card verification');
  const [testChannel, setTestChannel] = useState('SUPPORT_TICKET');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('https://your-workspace.slack.com/webhook/sample-placeholder');
  const [copiedKey, setCopiedKey] = useState(false);

  // Community API tester state
  const [commPlatform, setCommPlatform] = useState<'Discord' | 'Slack' | 'Reddit' | 'GitHub' | 'Discourse' | 'Community Forum'>('Discord');
  const [commPayload, setCommPayload] = useState('Discord feedback: Can we get automated webhook triggers when negative sentiment spikes?');
  const [commAuthor, setCommAuthor] = useState('DevChampion_99');
  const [commResponse, setCommResponse] = useState<any>(null);
  const [isTestingComm, setIsTestingComm] = useState(false);

  // Global Approach API tester state
  const [approachFocus, setApproachFocus] = useState('ALL');
  const [approachResponse, setApproachResponse] = useState<any>(null);
  const [isTestingApproach, setIsTestingApproach] = useState(false);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAdmin) {
      showToast('Action forbidden (403): Only ADMIN can invite team members.', 'error');
      return;
    }

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and email are required.');
      return;
    }

    const res = await inviteMember(name.trim(), email.trim(), role, title.trim() || 'Team Member');
    if (res.success) {
      setName('');
      setEmail('');
      setTitle('');
      setIsInviteOpen(false);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            <span>Workspace &amp; Team Settings</span>
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Multi-Tenant
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Manage workspace profile, tenant security isolation, team members, and role-based access control (RBAC).
        </p>
      </div>

      {/* Workspace Profile & Tenant Isolation Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Building className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{workspace.name}</h3>
              <p className="text-xs text-slate-400">Slug: loop.acme.io/{workspace.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-Tenant Isolated</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 block mb-1">Tenant ID (Hard Filter Key)</span>
            <span className="font-mono text-slate-200 font-bold">{workspace.tenantId}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 block mb-1">Subscription Plan</span>
            <span className="text-indigo-300 font-semibold">{workspace.plan}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 block mb-1">Created Date</span>
            <span className="text-slate-300">{new Date(workspace.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-slate-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            Every database query scopes on <code className="font-mono text-indigo-300">workspaceId</code>. Tenant isolation ensures Company A can never read Company B records.
          </span>
        </div>
      </div>

      {/* MongoDB Database Connection & Management Card */}
      <MongoDBManager />

      {/* Team Members & RBAC Section */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Workspace Members &amp; Assigned Roles</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Role permissions strictly determine ingestion, triage, and administrative actions.
            </p>
          </div>

          <button
            onClick={() => {
              if (!isAdmin) {
                showToast('Action forbidden (403): Only ADMINs can invite team members.', 'error');
                return;
              }
              setIsInviteOpen(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-all ${
              !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Teammate</span>
          </button>
        </div>

        {/* Members List */}
        <div className="divide-y divide-slate-800/60 rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden text-xs">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs border border-slate-700 shadow-sm shrink-0">
                    {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{member.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        member.role === 'ADMIN'
                          ? 'bg-purple-950 text-purple-300 border-purple-800'
                          : member.role === 'ANALYST'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {member.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {member.email} • {member.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RBAC Permission Matrix Reference Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-400" />
          <span>Role-Based Access Control (RBAC) Permissions Matrix</span>
        </h3>
        <p className="text-xs text-slate-400">
          This matrix illustrates how the 3 roles operate in accordance with Section 08 C2 of the specification:
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 mt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold text-[11px]">
                <th className="p-3">Platform Capability</th>
                <th className="p-3 text-center text-purple-400">ADMIN</th>
                <th className="p-3 text-center text-blue-400">ANALYST</th>
                <th className="p-3 text-center text-slate-400">VIEWER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="p-3 font-medium">View Dashboards, Inbox, Trends, &amp; Reports</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Full</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Read-Only</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Ingest Feedback (Manual, CSV Bulk, Channel Pull)</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                <td className="p-3 text-center text-rose-400 font-bold">✗ Forbidden (403)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Update Triage Status (NEW ➔ REVIEWED ➔ ACTIONED)</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                <td className="p-3 text-center text-rose-400 font-bold">✗ Forbidden (403)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Re-Classify Items with Claude AI</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                <td className="p-3 text-center text-rose-400 font-bold">✗ Forbidden (403)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Ask LOOP (Retrieval-Grounded Q&amp;A)</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Generate Voice-of-Customer Reports</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Allowed</td>
                <td className="p-3 text-center text-rose-400 font-bold">✗ Read Existing Only</td>
              </tr>
              <tr>
                <td className="p-3 font-medium">Invite Teammates &amp; Manage Workspace Roles</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ Admin Only</td>
                <td className="p-3 text-center text-rose-400 font-bold">✗ Forbidden (403)</td>
                <td className="p-3 text-center text-rose-400 font-bold">✗ Forbidden (403)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Developer API & Live Webhook Ingestion Section */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Public REST API &amp; Webhook Ingestion</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Push real-time customer feedback programmatically from Zendesk, Stripe, Intercom, or custom microservices.
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 flex items-center gap-1.5 w-fit">
            <Webhook className="w-3.5 h-3.5 text-indigo-400" />
            <span>v1 REST Ingest</span>
          </span>
        </div>

        {/* API Credentials Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">
                Production Bearer API Key
              </span>
              <span className="font-mono text-indigo-300 text-sm font-bold select-all">
                loop_live_sec_9941a87b2e31
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText('loop_live_sec_9941a87b2e31');
                setCopiedKey(true);
                showToast('API Key copied to clipboard', 'success');
                setTimeout(() => setCopiedKey(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer w-fit"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-300 flex items-center justify-between">
            <span>Endpoint: <code className="text-emerald-400 font-bold">POST /api/v1/ingest</code></span>
            <span className="text-slate-500">JSON Payload</span>
          </div>
        </div>

        {/* Interactive Live Ingest Tester */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interactive Live API Ingestion Tester</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Pings live Next.js route handler</span>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 font-medium block">
              Sample Feedback Payload (Content)
            </label>
            <input
              type="text"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Channel:</span>
              <select
                value={testChannel}
                onChange={(e) => setTestChannel(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none"
              >
                <option value="SUPPORT_TICKET">SUPPORT_TICKET</option>
                <option value="APP_STORE">APP_STORE</option>
                <option value="NPS_SURVEY">NPS_SURVEY</option>
                <option value="SALES_NOTE">SALES_NOTE</option>
                <option value="COMMUNITY">COMMUNITY</option>
              </select>
            </div>

            <button
              disabled={isTestingApi}
              onClick={async () => {
                setIsTestingApi(true);
                try {
                  const res = await fetch('/api/v1/ingest', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: 'Bearer loop_live_sec_9941a87b2e31',
                    },
                    body: JSON.stringify({
                      content: testPayload,
                      channel: testChannel,
                      customerLabel: 'Enterprise API Partner ($48k ARR)',
                      arr: 48000,
                    }),
                  });
                  const json = await res.json();
                  setApiResponse({ status: res.status, ok: res.ok, data: json });
                  if (res.ok) {
                    showToast('API Ingest succeeded: HTTP 201 Created', 'success');
                  } else {
                    showToast(`API error: ${json.message}`, 'error');
                  }
                } catch (err: any) {
                  setApiResponse({ status: 500, ok: false, data: { error: err.message } });
                } finally {
                  setIsTestingApi(false);
                }
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isTestingApi ? 'Sending...' : 'Send Live POST Request'}</span>
            </button>
          </div>

          {/* Test Response Display */}
          {apiResponse && (
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Response Status:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    apiResponse.ok
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  HTTP {apiResponse.status} {apiResponse.ok ? 'CREATED' : 'FAILED'}
                </span>
              </div>
              <pre className="text-indigo-300 overflow-x-auto p-2 bg-slate-950 rounded-lg max-h-40">
                {JSON.stringify(apiResponse.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 1. Community API Interactive Tester */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Community API Tester</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">
                /api/community
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Discord • Reddit • Slack • Discourse • GitHub</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Community Platform
              </label>
              <select
                value={commPlatform}
                onChange={(e) => setCommPlatform(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl p-2 focus:outline-none"
              >
                <option value="Discord">Discord (Community Server)</option>
                <option value="Slack">Slack (Connect Channel)</option>
                <option value="Reddit">Reddit (r/SaaS Community)</option>
                <option value="GitHub">GitHub (Discussions / Issues)</option>
                <option value="Discourse">Discourse (Developer Forum)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">
                Author / Handle
              </label>
              <input
                type="text"
                value={commAuthor}
                onChange={(e) => setCommAuthor(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-medium block">
              Discussion Content / Feedback
            </label>
            <input
              type="text"
              value={commPayload}
              onChange={(e) => setCommPayload(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              disabled={isTestingComm}
              onClick={async () => {
                setIsTestingComm(true);
                try {
                  const res = await fetch('/api/community', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      content: commPayload,
                      author: commAuthor,
                      platform: commPlatform,
                      arr: 16000,
                    }),
                  });
                  const json = await res.json();
                  setCommResponse({ status: res.status, ok: res.ok, data: json });
                  if (res.ok) {
                    showToast(`Community feedback posted via ${commPlatform}!`, 'success');
                  } else {
                    showToast(`Error: ${json.message}`, 'error');
                  }
                } catch (err: any) {
                  setCommResponse({ status: 500, ok: false, data: { error: err.message } });
                } finally {
                  setIsTestingComm(false);
                }
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isTestingComm ? 'Ingesting...' : 'Test POST /api/community'}</span>
            </button>

            <button
              disabled={isTestingComm}
              onClick={async () => {
                setIsTestingComm(true);
                try {
                  const res = await fetch('/api/community?limit=5', {
                    method: 'GET',
                  });
                  const json = await res.json();
                  setCommResponse({ status: res.status, ok: res.ok, data: json });
                  if (res.ok) {
                    showToast('Fetched Community analytics & discussions!', 'success');
                  }
                } catch (err: any) {
                  setCommResponse({ status: 500, ok: false, data: { error: err.message } });
                } finally {
                  setIsTestingComm(false);
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
            >
              <span>Test GET /api/community (Fetch Analytics)</span>
            </button>
          </div>

          {commResponse && (
            <div className="mt-2 p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Community Response:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    commResponse.ok
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  HTTP {commResponse.status} {commResponse.ok ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>
              <pre className="text-emerald-300 overflow-x-auto p-2 bg-slate-950 rounded-lg max-h-48">
                {JSON.stringify(commResponse.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 2. Global Approach API Interactive Tester */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>Global Approach API Tester</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 font-mono">
                /api/global-approach
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Cross-Channel Matrix • 4 Strategic Pillars</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Target Focus:</span>
              <select
                value={approachFocus}
                onChange={(e) => setApproachFocus(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none"
              >
                <option value="ALL">ALL (Macro Synthesis)</option>
                <option value="CHURN_PREVENTION">CHURN_PREVENTION (Pillar 1)</option>
                <option value="UX_FRICTION">UX_FRICTION (Pillar 2)</option>
                <option value="ENTERPRISE_ARR">ENTERPRISE_ARR (Pillar 3)</option>
                <option value="COMMUNITY_GROWTH">COMMUNITY_GROWTH (Pillar 4)</option>
              </select>
            </div>

            <button
              disabled={isTestingApproach}
              onClick={async () => {
                setIsTestingApproach(true);
                try {
                  const res = await fetch('/api/global-approach', {
                    method: 'GET',
                  });
                  const json = await res.json();
                  setApproachResponse({ status: res.status, ok: res.ok, data: json });
                  if (res.ok) {
                    showToast('Global Approach intelligence synthesized!', 'success');
                  }
                } catch (err: any) {
                  setApproachResponse({ status: 500, ok: false, data: { error: err.message } });
                } finally {
                  setIsTestingApproach(false);
                }
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
            >
              <span>Test GET /api/global-approach</span>
            </button>

            <button
              disabled={isTestingApproach}
              onClick={async () => {
                setIsTestingApproach(true);
                try {
                  const res = await fetch('/api/global-approach', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      focusArea: approachFocus,
                      timeHorizon: 'IMMEDIATE',
                      targetAudience: 'EXECUTIVE',
                    }),
                  });
                  const json = await res.json();
                  setApproachResponse({ status: res.status, ok: res.ok, data: json });
                  if (res.ok) {
                    showToast(`Generated Strategic Brief for ${approachFocus}!`, 'success');
                  }
                } catch (err: any) {
                  setApproachResponse({ status: 500, ok: false, data: { error: err.message } });
                } finally {
                  setIsTestingApproach(false);
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold shadow transition-all cursor-pointer"
            >
              <span>Test POST /api/global-approach</span>
            </button>
          </div>

          {approachResponse && (
            <div className="mt-2 p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Global Approach Response:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    approachResponse.ok
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  HTTP {approachResponse.status} {approachResponse.ok ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>
              <pre className="text-purple-300 overflow-x-auto p-2 bg-slate-950 rounded-lg max-h-52">
                {JSON.stringify(approachResponse.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Slack & Teams Spike Alert Webhook Simulator */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Slack Spike Alerts</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Webhook Delivery</span>
          </div>

          <p className="text-xs text-slate-400">
            Automatically triggers structured alert notifications into your designated Slack channel when a theme surges &gt;50% WoW.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="text"
              value={slackWebhookUrl}
              onChange={(e) => setSlackWebhookUrl(e.target.value)}
              className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => triggerSlackSpikeAlert('Billing & Invoicing')}
              className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Broadcast Test Spike Alert</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Invite Workspace Member</h3>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Work Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@acme.io"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Role Permission *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ANALYST">ANALYST (Ingest &amp; Triage)</option>
                  <option value="VIEWER">VIEWER (Read-Only)</option>
                  <option value="ADMIN">ADMIN (Full Workspace Control)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior PM or Support Lead"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow transition-all"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
