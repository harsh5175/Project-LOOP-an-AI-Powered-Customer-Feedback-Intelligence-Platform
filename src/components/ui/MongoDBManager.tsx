'use client';

import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, XCircle, RefreshCw, Sparkles, Copy, Check, Server, Layers, HelpCircle, HardDrive } from 'lucide-react';

interface MongoStatusResponse {
  isConnected: boolean;
  dbName: string;
  uriMasked: string;
  error?: string;
  stats?: {
    collections: string[];
    feedbacksCount: number;
    themesCount: number;
    usersCount: number;
    workspacesCount: number;
    reportsCount: number;
  };
}

export function MongoDBManager() {
  const [status, setStatus] = useState<MongoStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  // Custom URI testing state
  const [customUri, setCustomUri] = useState('');
  const [testingUri, setTestingUri] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedUri, setCopiedUri] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db/status');
      const data = await res.json();
      if (data.mongodb) {
        setStatus(data.mongodb);
      }
    } catch (e: any) {
      console.error('Failed to fetch MongoDB status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch('/api/db/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const data = await res.json();
      setSeedMessage(data.message || (data.success ? 'Seeded successfully!' : 'Seeding encountered an error'));
      if (data.mongodb) {
        setStatus(data.mongodb);
      } else {
        await fetchStatus();
      }
    } catch (e: any) {
      setSeedMessage(`Error: ${e.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleTestUri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUri.trim()) return;

    setTestingUri(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/db/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', uri: customUri.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `✅ Connected! Databases found: ${data.databases?.join(', ') || 'OK'}`,
        });
      } else {
        setTestResult({
          success: false,
          message: `❌ ${data.error || 'Connection failed'}`,
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: `❌ Network error: ${e.message}`,
      });
    } finally {
      setTestingUri(false);
    }
  };

  const copySampleUri = () => {
    navigator.clipboard.writeText('mongodb://localhost:27017/loop_db');
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">MongoDB Database Connection</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enterprise customer-feedback document store with multi-tier failover.
            </p>
          </div>
        </div>

        {/* Status Badge & Refresh */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
              <span>Checking...</span>
            </div>
          ) : status?.isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-xs font-semibold text-emerald-300 shadow-sm shadow-emerald-900/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MongoDB Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-700/80 text-xs font-semibold text-amber-300 shadow-sm shadow-amber-900/30">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Offline / Using SQLite &amp; Memory Fallback</span>
            </div>
          )}

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700"
            title="Refresh Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Info & Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database Name</span>
          </div>
          <p className="font-mono text-xs text-white font-bold truncate">
            {status?.dbName || 'loop_db'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Feedbacks Stored</span>
          </div>
          <p className="font-mono text-sm text-indigo-300 font-bold">
            {status?.stats ? status.stats.feedbacksCount : '0'} docs
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>Themes Identified</span>
          </div>
          <p className="font-mono text-sm text-amber-300 font-bold">
            {status?.stats ? status.stats.themesCount : '0'} categories
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Driver</span>
          </div>
          <p className="font-mono text-xs text-emerald-300 font-semibold truncate">
            mongodb v7.6.0
          </p>
        </div>
      </div>

      {/* Connection Details & Seeding Action */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-medium">Configured Connection String (.env):</span>
          <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-emerald-300">
            <span>{status?.uriMasked || 'mongodb://localhost:27017/loop_db'}</span>
            <button
              onClick={copySampleUri}
              className="text-slate-400 hover:text-white transition"
              title="Copy URI"
            >
              {copiedUri ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {status?.error && (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40 text-xs text-amber-300/90 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">MongoDB Notice</p>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                {status.error}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: To connect to MongoDB Atlas Cloud, add your connection string in <code className="text-indigo-300 font-mono">.env</code> as <code className="text-emerald-300 font-mono">MONGODB_URI="mongodb+srv://..."</code>.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleSeed}
            disabled={seeding || !status?.isConnected}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
              status?.isConnected
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Seeding MongoDB...' : 'Seed Loop Data into MongoDB'}</span>
          </button>

          {seedMessage && (
            <span className="text-xs text-emerald-400 font-medium animate-fadeIn">
              {seedMessage}
            </span>
          )}
        </div>
      </div>

      {/* Test Custom Connection Tester */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
          <span>Test Any MongoDB Connection String (Local / Atlas Cloud)</span>
        </h4>
        <form onSubmit={handleTestUri} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customUri}
            onChange={(e) => setCustomUri(e.target.value)}
            placeholder="mongodb+srv://username:password@cluster.mongodb.net/loop_db"
            className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={testingUri || !customUri.trim()}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition whitespace-nowrap flex items-center justify-center gap-2"
          >
            {testingUri && <RefreshCw className="w-3 h-3 animate-spin" />}
            <span>{testingUri ? 'Testing...' : 'Test Connection'}</span>
          </button>
        </form>

        {testResult && (
          <div
            className={`mt-2 p-2.5 rounded-lg text-xs font-mono border ${
              testResult.success
                ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800/80 text-rose-300'
            }`}
          >
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default MongoDBManager;
