'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, ShieldAlert, FileText, CheckCircle2, UserCheck, AlertTriangle, HelpCircle } from 'lucide-react';

export default function TermsPage() {
  const effectiveDate = 'September 28, 2026';

  return (
    <div className="min-h-screen bg-[var(--background)] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Decorative Ambient Glow */}
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
            Effective Date: <span className="text-indigo-300 font-semibold">{effectiveDate}</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/15 mb-10 shadow-2xl backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 mb-4">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>Standard Enterprise SaaS Terms</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            These Terms &amp; Conditions govern access to and use of <strong>Project LOOP</strong>, including the AI sentiment classifier, vector search Q&amp;A studio, VoC reporting pipeline, and multi-tenant workspace environments.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h2>1. Agreement to Terms</h2>
            </div>
            <p>
              By accessing Project LOOP, logging into a workspace, or using our automated feedback ingestion APIs, you agree to be bound by these Terms and our Privacy Policy. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity.
            </p>
          </section>

          {/* Section 2 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <UserCheck className="w-5 h-5 text-purple-400" />
              <h2>2. Workspaces &amp; Role-Based Governance</h2>
            </div>
            <p>
              Access to Project LOOP is provisioned per workspace with strictly separated security roles:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
              <li>
                <strong>ADMIN:</strong> Holds complete workspace administrative authority, including user invitations, role assignments, feedback triage, and VoC report exports.
              </li>
              <li>
                <strong>ANALYST:</strong> Authorized to ingest feedback, update triage workflow statuses, simulate RAG conversational Q&amp;A, and analyze trends.
              </li>
              <li>
                <strong>VIEWER:</strong> Granted read-only visibility into dashboards, ARR metrics, and inbox records. Mutating actions return HTTP 403 Forbidden.
              </li>
            </ul>
            <p className="text-xs text-slate-400">
              Account administrators are solely responsible for managing teammate permissions and safeguarding workspace credentials.
            </p>
          </section>

          {/* Section 3 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2>3. Intellectual Property Rights</h2>
            </div>
            <p>
              <strong>Your Customer Data:</strong> You retain 100% full ownership, intellectual property rights, and title to all customer feedback data, verbatim transcripts, CSV files, and organizational metadata uploaded into your workspace.
            </p>
            <p>
              <strong>Platform IP:</strong> Project LOOP, including its source code, UI designs, proprietary classification pipelines, 3D dossier visualizers, and documentation, is the exclusive intellectual property of Project LOOP and Zidio Development.
            </p>
          </section>

          {/* Section 4 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2>4. Acceptable Use &amp; AI Safety</h2>
            </div>
            <p>
              You agree not to misuse the Platform. Prohibited activities include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
              <li>Attempting to bypass tenant boundaries, manipulate workspace identifiers, or escalate RBAC privileges.</li>
              <li>Injecting malicious prompt-injection payloads designed to compromise LLM integrity.</li>
              <li>Running automated scraping bots or denial-of-service scripts against API route handlers.</li>
              <li>Uploading unlawful, defamatory, or infringing materials into the feedback stream.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2>5. AI Decision Support &amp; Limitation of Liability</h2>
            </div>
            <p>
              Project LOOP utilizes artificial intelligence (Claude 3.7) to categorize feedback and calculate estimated ARR risk. While our grounded RAG pipeline achieves high verification rates, <strong>AI-generated outputs are intended as decision-support insights</strong>.
            </p>
            <p className="text-xs text-slate-400">
              Project LOOP shall not be held liable for commercial decisions, product roadmap prioritizations, or contract renewals executed on the basis of AI-synthesized summaries.
            </p>
          </section>

          {/* Section 6 */}
          <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-white">
              <HelpCircle className="w-5 h-5 text-sky-400" />
              <h2>6. Termination &amp; Contact</h2>
            </div>
            <p>
              Workspace administrators may terminate their account at any time by exporting their data and requesting workspace decommission. Upon termination, all feedback records are permanently purged in accordance with our Privacy Policy.
            </p>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
              Inquiries: <a href="mailto:legal@projectloop.ai" className="text-indigo-400 hover:underline">legal@projectloop.ai</a>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div>&copy; 2026 Project LOOP. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
