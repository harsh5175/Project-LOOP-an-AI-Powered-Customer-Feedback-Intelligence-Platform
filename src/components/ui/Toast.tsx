'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, toastType } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border text-sm font-medium backdrop-blur-md ${
          toastType === 'success'
            ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/60'
            : toastType === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-700/60'
            : 'bg-indigo-950/90 text-indigo-200 border-indigo-700/60'
        }`}
      >
        {toastType === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
        {toastType === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
        {toastType === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
