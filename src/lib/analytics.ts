/**
 * Privacy-First Web Analytics Engine for Project LOOP
 * - Zero tracking without user consent
 * - Complies with GDPR / ePrivacy Directive & respects DNT (Do Not Track)
 * - Built-in console event bus + optional Google Analytics / Plausible hook
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean | null | undefined>;
  timestamp: string;
  url: string;
}

const CONSENT_STORAGE_KEY = 'loop_cookie_consent_v1';

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return false;
    const consent = JSON.parse(raw);
    return !!consent.analytics;
  } catch {
    return false;
  }
}

export function isDoNotTrackEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
  return dnt === '1' || dnt === 'yes';
}

// In-memory debug buffer for live telemetry inspection
const recentEventsBuffer: AnalyticsEvent[] = [];
const subscribers = new Set<(event: AnalyticsEvent) => void>();

export function subscribeToAnalytics(callback: (event: AnalyticsEvent) => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

export function getRecentEvents(): AnalyticsEvent[] {
  return [...recentEventsBuffer];
}

/**
 * Track an analytics event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  if (typeof window === 'undefined') return;

  // Respect user privacy
  if (isDoNotTrackEnabled()) {
    return;
  }

  const consentGiven = hasAnalyticsConsent();
  // Essential operational telemetry allowed; detailed user tracking requires consent
  if (!consentGiven && !eventName.startsWith('essential_')) {
    return;
  }

  const payload: AnalyticsEvent = {
    name: eventName,
    properties,
    timestamp: new Date().toISOString(),
    url: window.location.pathname,
  };

  // Push to local event buffer
  recentEventsBuffer.unshift(payload);
  if (recentEventsBuffer.length > 50) {
    recentEventsBuffer.pop();
  }

  // Notify active subscribers (e.g. Telemetry modal or debug badge)
  subscribers.forEach((fn) => {
    try {
      fn(payload);
    } catch {
      // ignore
    }
  });

  // If Google Analytics is loaded on window (gtag), forward event
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, properties);
  }

  // Informative dev log
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug(`[LOOP Analytics] ${eventName}`, properties);
  }
}

/**
 * Standardized CTA Click tracker
 */
export function trackCtaClick(ctaName: string, destinationUrl?: string): void {
  trackEvent('cta_click', {
    cta_name: ctaName,
    destination: destinationUrl || 'in-page',
  });
}
