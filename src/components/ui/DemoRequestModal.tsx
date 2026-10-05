'use client';

import React, { useState } from 'react';
import { X, Sparkles, Building2, Mail, User, Users, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLaunch?: () => void;
}

export function DemoRequestModal({ isOpen, onClose, onSuccessLaunch }: DemoRequestModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [teamSize, setTeamSize] = useState('51-200');
  const [honeypot, setHoneypot] = useState('');
  const [startedAt] = useState<number>(() => Date.now());

  const [errors, setErrors] = useState<{ name?: string; email?: string; company?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Spam check
    if (honeypot) {
      // Silently reject bot
      setIsSubmitted(true);
      return;
    }
    if (Date.now() - startedAt < 700) {
      // Bot speed check
      setIsSubmitted(true);
      return;
    }

    // Validation
    const nextErrors: typeof errors = {};
    if (!name.trim() || name.trim().length < 2) {
      nextErrors.name = 'Please provide your full name (minimum 2 characters)';
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      nextErrors.email = 'Please provide a valid work email address';
    }
    if (!company.trim() || company.trim().length < 2) {
      nextErrors.company = 'Please enter your organization name';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      trackEvent('demo_requested', {
        company,
        teamSize,
        emailDomain: email.split('@')[1] || 'unknown',
      });
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="max-w-lg w-full rounded-3xl bg-slate-900/95 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl relative text-white ring-1 ring-white/10">
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-5 top-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight">
              Enterprise Walkthrough Reserved!
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              Thank you, <strong className="text-white">{name}</strong>. An enterprise solution architect will contact <strong className="text-indigo-300">{email}</strong> within 4 business hours with your custom sandbox.
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left text-xs space-y-1.5 font-mono text-slate-300">
              <div>Workspace: <span className="text-indigo-400">{company}</span></div>
              <div>Team Seat Tier: <span className="text-emerald-400">{teamSize} seats</span></div>
              <div>Status: <span className="text-amber-400">Sandbox Provisioned (Ready)</span></div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  onClose();
                  if (onSuccessLaunch) onSuccessLaunch();
                }}
                className="w-full btn-glow-indigo py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Launch Interactive Demo Immediately</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 w-fit mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dedicated Enterprise Pilot</span>
            </div>

            <h3 id="demo-modal-title" className="text-2xl font-black text-white tracking-tight mb-1">
              Request VIP Enterprise Demo
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Experience Project LOOP customized to your Zendesk, HubSpot, and App Store feedback channels. Zero commitment.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Anti-spam honeypot */}
              <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input
                  type="text"
                  name="website_demo_hp"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="e.g. Sarah Connor"
                    aria-invalid={!!errors.name}
                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 text-xs text-white rounded-xl border focus:outline-none transition-colors ${
                      errors.name ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-rose-400">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="sconnor@enterprise.io"
                    aria-invalid={!!errors.email}
                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 text-xs text-white rounded-xl border focus:outline-none transition-colors ${
                      errors.email ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-400">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Organization Name</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => {
                        setCompany(e.target.value);
                        if (errors.company) setErrors((prev) => ({ ...prev, company: undefined }));
                      }}
                      placeholder="Cyberdyne Systems"
                      aria-invalid={!!errors.company}
                      className={`w-full pl-9 pr-3 py-2 bg-slate-950 text-xs text-white rounded-xl border focus:outline-none transition-colors ${
                        errors.company ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {errors.company && <p className="text-[11px] text-rose-400">{errors.company}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Team Size</label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 text-xs text-white rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="1-50">1-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1,000 employees</option>
                      <option value="1000+">1,000+ Enterprise seats</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-glow-indigo py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirm &amp; Request Demo</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SOC 2 Type II Certified • GDPR Compliant • No Credit Card Required</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
