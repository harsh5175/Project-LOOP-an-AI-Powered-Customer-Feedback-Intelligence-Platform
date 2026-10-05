'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Lock, ExternalLink, Cookie, Activity, Heart } from 'lucide-react';
import { openCookiePreferences } from '@/components/ui/CookieConsent';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950/80 backdrop-blur-xl text-slate-400 relative z-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Live Status */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group inline-flex">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                PROJECT LOOP
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              Corporate-grade AI Customer-Feedback Intelligence Platform. Ingest, cluster, and turn qualitative feedback into an evidence-backed roadmap.
            </p>

            {/* Live Operational Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Col 2: Product & Capabilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Executive Dashboard
                </Link>
              </li>
              <li>
                <Link href="/inbox" className="hover:text-white transition-colors">
                  Feedback Triage Inbox
                </Link>
              </li>
              <li>
                <Link href="/trends" className="hover:text-white transition-colors">
                  Theme Spikes &amp; Trend Alerts
                </Link>
              </li>
              <li>
                <Link href="/ask" className="hover:text-white transition-colors">
                  Ask LOOP RAG Assistant
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-white transition-colors">
                  VoC Narrative Digests
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Compliance &amp; Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Terms &amp; Conditions</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={openCookiePreferences}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left"
                >
                  <Cookie className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cookie Preferences</span>
                </button>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white transition-colors">
                  Multi-Tenant RBAC Matrix
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Demo Credentials & Team */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Evaluation &amp; Demo
            </h4>
            <p className="text-xs text-slate-400">
              Built for the <strong>Zidio Development Web Engineering Internship</strong> by Harsh Vardhan Singh.
            </p>
            <div className="pt-1 space-y-1.5 text-xs">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <span>1-Click Quick Login Demo</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <div className="text-[11px] text-slate-400">
                ADMIN • ANALYST • VIEWER
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-slate-400">
            &copy; {new Date().getFullYear()} Project LOOP. All rights reserved. Enforced with TLS 1.3 &amp; HSTS.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <button
              onClick={openCookiePreferences}
              className="hover:text-white transition-colors"
            >
              Cookies
            </button>
            <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Live App
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
