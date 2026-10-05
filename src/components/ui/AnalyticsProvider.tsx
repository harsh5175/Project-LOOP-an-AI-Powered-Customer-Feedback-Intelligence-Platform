'use client';

import React, { createContext, useContext, useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent, trackCtaClick, getRecentEvents, subscribeToAnalytics, AnalyticsEvent } from '@/lib/analytics';

interface AnalyticsContextType {
  track: (name: string, properties?: Record<string, any>) => void;
  trackCta: (ctaName: string, destination?: string) => void;
  recentEvents: AnalyticsEvent[];
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  track: () => {},
  trackCta: () => {},
  recentEvents: [],
});

export const useAnalytics = () => useContext(AnalyticsContext);

function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fullUrl = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    trackEvent('page_view', {
      path: pathname,
      search: searchParams?.toString() || '',
      fullUrl,
      title: typeof document !== 'undefined' ? document.title : '',
      referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct',
    });
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  // Keep state synced with recent events buffer
  useEffect(() => {
    setEvents(getRecentEvents());
    const unsubscribe = subscribeToAnalytics((newEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 49)]);
    });
    return unsubscribe;
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        track: trackEvent,
        trackCta: trackCtaClick,
        recentEvents: events,
      }}
    >
      <Suspense fallback={null}>
        <PageTracker />
      </Suspense>
      {children}
    </AnalyticsContext.Provider>
  );
}
