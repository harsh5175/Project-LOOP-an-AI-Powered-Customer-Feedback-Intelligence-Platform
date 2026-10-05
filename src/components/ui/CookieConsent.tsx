'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, Check, Settings2, X } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

const CONSENT_KEY = 'loop_cookie_consent_v1';

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

export function openCookiePreferences() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-cookie-preferences'));
  }
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(true);
  const [marketingAllowed, setMarketingAllowed] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) {
        // Small delay so user isn't immediately bombarded upon page paint
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      } else {
        const parsed: CookiePreferences = JSON.parse(stored);
        setAnalyticsAllowed(parsed.analytics);
        setMarketingAllowed(parsed.marketing);
      }
    } catch {
      setIsVisible(true);
    }

    // Listen for custom trigger to reopen consent
    const handleReopen = () => {
      setIsVisible(true);
      setShowCustomize(true);
    };

    window.addEventListener('open-cookie-preferences', handleReopen);
    return () => window.removeEventListener('open-cookie-preferences', handleReopen);
  }, []);

  const saveConsent = (analytics: boolean, marketing: boolean) => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics,
      marketing,
      decidedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
    setAnalyticsAllowed(analytics);
    setMarketingAllowed(marketing);
    setIsVisible(false);
    setShowCustomize(false);

    if (analytics) {
      trackEvent('essential_cookie_consent_given', { analytics, marketing });
    }
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleRejectOptional = () => {
    saveConsent(false, false);
  };

  const handleSavePreferences = () => {
    saveConsent(analyticsAllowed, marketingAllowed);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="p-5 rounded-2xl bg-slate-900/95 border border-indigo-500/30 shadow-2xl backdrop-blur-2xl text-slate-100 ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Privacy &amp; Cookie Preferences
              </h3>
              <p className="text-[11px] text-slate-400">GDPR &amp; ePrivacy Compliant</p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss cookie notice"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          We use strictly necessary cookies to keep your workspace session secure. With your permission, we also use privacy-first analytics to understand platform usage. We never sell your personal data.
        </p>

        {showCustomize && (
          <div className="mb-4 space-y-2.5 pt-3 border-t border-white/10 text-xs">
            {/* Essential */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Strictly Necessary</span>
                </div>
                <div className="text-[10px] text-slate-400">Authentication, RBAC isolation &amp; CSRF protection.</div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Always Active
              </span>
            </div>

            {/* Analytics */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <div>
                <div className="font-semibold text-white">Product Analytics</div>
                <div className="text-[10px] text-slate-400">Aggregated telemetry to improve Claude AI latency.</div>
              </div>
              <input
                type="checkbox"
                checked={analyticsAllowed}
                onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </label>

            {/* Marketing / Attribution */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <div>
                <div className="font-semibold text-white">Attribution &amp; Growth</div>
                <div className="text-[10px] text-slate-400">Measures conversion from demo showcase to workspace.</div>
              </div>
              <input
                type="checkbox"
                checked={marketingAllowed}
                onChange={(e) => setMarketingAllowed(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {showCustomize ? (
            <button
              onClick={handleSavePreferences}
              className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleAcceptAll}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectOptional}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-xs border border-white/10 transition-colors"
              >
                Necessary Only
              </button>
              <button
                onClick={() => setShowCustomize(true)}
                aria-label="Customize cookie settings"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Customize Preferences"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        <div className="mt-3 pt-2 text-center text-[10px] text-slate-400 border-t border-white/5">
          Read our{' '}
          <Link href="/privacy" className="text-indigo-400 hover:underline">
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link href="/terms" className="text-indigo-400 hover:underline">
            Terms of Service
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
