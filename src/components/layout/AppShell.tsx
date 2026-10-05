'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from '@/components/ui/Toast';
import { SlackAlertModal } from '@/components/ui/SlackAlertModal';
import { Live3DBackground } from '@/components/ui/Live3DBackground';

import { CookieConsent } from '@/components/ui/CookieConsent';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname === '/';
  const isLegalPage = pathname === '/privacy' || pathname === '/terms';

  if (isLoginPage) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center relative z-10 p-4">
        <main className="w-full flex-1 flex items-center justify-center">
          {children}
        </main>
        <Toast />
        <CookieConsent />
      </div>
    );
  }

  if (isLegalPage) {
    return (
      <div className="min-h-screen w-full relative z-10 overflow-x-hidden">
        <main className="w-full min-h-screen">
          {children}
        </main>
        <Toast />
        <CookieConsent />
      </div>
    );
  }

  if (isLandingPage) {
    return (
      <div className="min-h-screen w-full relative z-10 overflow-x-hidden">
        <main className="w-full min-h-screen">
          {children}
        </main>
        <Toast />
        <SlackAlertModal />
        <CookieConsent />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full antialiased relative overflow-hidden bg-[var(--background)]">
      {/* 3D Living Background underneath the entire dashboard & app */}
      <Live3DBackground initialScene="cyber" showControls={true} />

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-transparent transition-colors duration-200">
          {children}
        </main>
      </div>
      <Toast />
      <SlackAlertModal />
      <CookieConsent />
    </div>
  );
};
