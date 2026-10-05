'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, Database, Server, Cpu, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'September 28, 2026';

  return (
    <div className="min-h-screen bg-[var(--background)] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Decorative Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[320px] bg-[radial-gradient(ellipse_at_top,_var(--accent-glow),_transparent_70%)] pointer-events-none z-0 opacity-60" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Back to Home</span>
          </Link>
          <div className="text-xs text-slate-400">
            Last Updated: <span className="text-indigo-300 font-semibold">{lastUpdated}</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/15 mb-10 shadow-2xl backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SOC 2 Type II &amp; GDPR Compliant Policy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            At <strong>Project LOOP</strong>, we believe customer feedback is proprietary corporate intelligence. This policy explains our non-negotiable commitments to data privacy, multi-tenant isolation, role-based governance, and safe AI usage.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero training on customer data</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Strict tenant isolation</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>End-to-end TLS 1.3 encryption</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <Eye className="w-5 h-5 text-indigo-400" />
              <h2>1. Information We Collect</h2>
            </div>
            <p>
              When you use Project LOOP to analyze feedback or manage customer intelligence, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
              <li>
                <strong>Feedback Data:</strong> Customer tickets, NPS survey free-text, app store reviews, sales notes, and community discussions uploaded via CSV or synchronized through third-party webhooks (e.g. Zendesk, Slack, Discord).
              </li>
              <li>
                <strong>Account Credentials:</strong> Work email, user name, organization/workspace name, and salted cryptographic password hashes (bcrypt 10 rounds).
              </li>
              <li>
                <strong>Workspace Telemetry:</strong> Ingestion logs, triage activity, AI search queries (Ask LOOP), and audit trails for compliance verification.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h2>2. AI Model Governance &amp; Grounding</h2>
            </div>
            <p>
              Project LOOP utilizes state-of-the-art Large Language Models (Anthropic Claude 3.7 / Sonnet) to classify sentiment, cluster themes, and synthesize Voice-of-Customer digests.
            </p>
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200">
              <strong>Our AI Pledge:</strong> Your customer feedback data is <strong>NEVER used to train, fine-tune, or improve any public or foundational AI models</strong>. Interactions with Anthropic API are stateless, ephemeral, and strictly governed by commercial enterprise zero-retention agreements.
            </div>
          </section>

          {/* Section 3 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <Lock className="w-5 h-5 text-emerald-400" />
              <h2>3. Multi-Tenant Isolation &amp; Security</h2>
            </div>
            <p>
              Data confidentiality is built into our core relational database architecture:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
              <li>
                Every single query enforces strict partition scoping: <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded font-mono">WHERE workspaceId = session.workspaceId</code>.
              </li>
              <li>
                Cross-workspace data leakage is architecturally prohibited. Users cannot read, mutate, or infer data outside their authorized workspace boundaries.
              </li>
              <li>
                Role-Based Access Control (RBAC) enforces granular permissions: <strong className="text-white">ADMIN</strong> (full governance), <strong className="text-white">ANALYST</strong> (ingestion &amp; triage), and <strong className="text-white">VIEWER</strong> (read-only audit).
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <FileText className="w-5 h-5 text-sky-400" />
              <h2>4. Cookie Policy &amp; Consent</h2>
            </div>
            <p>
              We implement a privacy-first cookie policy compliant with GDPR and the ePrivacy Directive:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
              <li>
                <strong>Strictly Necessary:</strong> Encrypted HTTP-only session cookies (<code className="text-sky-300 font-mono">loop_session_token</code>) necessary to identify your authenticated user state and protect against CSRF attacks.
              </li>
              <li>
                <strong>Preferences:</strong> LocalStorage keys (<code className="text-sky-300 font-mono">loop_theme_preference</code>) storing your active UI theme (Midnight, Obsidian, Emerald, Royal).
              </li>
              <li>
                <strong>Analytics:</strong> Anonymous usage metrics, collected only with your explicit consent via our Cookie Preferences banner.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <Database className="w-5 h-5 text-amber-400" />
              <h2>5. Your Rights (GDPR &amp; CCPA)</h2>
            </div>
            <p>
              Under international data protection legislation, you retain the following rights:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
              <li><strong>Right to Access:</strong> Export all feedback records, theme clusters, and audit trails associated with your workspace.</li>
              <li><strong>Right to Rectification:</strong> Edit or correct any user profiles or feedback metadata via the Inbox &amp; Settings views.</li>
              <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request permanent deletion of your workspace and all associated feedback data.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <Server className="w-5 h-5 text-rose-400" />
              <h2>6. Contact &amp; Governance</h2>
            </div>
            <p>
              For data protection inquiries, security audit requests, or GDPR deletion demands, please reach our Data Governance Officer:
            </p>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1 font-mono text-slate-300">
              <div>Entity: Project LOOP — AI Customer-Feedback Intelligence Platform</div>
              <div>Lead: Harsh Vardhan Singh (VP of Product Management)</div>
              <div>Email: <a href="mailto:privacy@projectloop.ai" className="text-indigo-400 hover:underline">privacy@projectloop.ai</a></div>
              <div>Capstone: Zidio Development Web Engineering Track</div>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div>&copy; 2026 Project LOOP. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
