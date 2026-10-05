import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { AnalyticsProvider } from '@/components/ui/AnalyticsProvider';

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'Project LOOP — AI Customer-Feedback Intelligence Platform',
    template: '%s | Project LOOP',
  },
  description:
    'Enterprise AI platform to ingest, classify, cluster, and analyze multi-channel customer feedback with role-based access control, spike alerts, and grounded Claude 3.7 intelligence.',
  applicationName: 'Project LOOP',
  keywords: [
    'Customer Feedback Intelligence',
    'Voice of Customer',
    'VoC Analytics',
    'Sentiment Analysis',
    'Claude 3.7 AI',
    'Customer Churn Prevention',
    'Product Feedback Triage',
    'Multi-Tenant SaaS',
    'Zidio Development',
  ],
  authors: [{ name: 'Project LOOP Engineering Team' }],
  creator: 'Harsh Vardhan Singh',
  publisher: 'Project LOOP',
  metadataBase: new URL('https://projectloop.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Project LOOP — AI Customer-Feedback Intelligence Platform',
    description:
      'Turns scattered customer feedback into a ranked, evidence-backed list of what to do next. Multi-tenant RBAC, live trend spikes, and grounded vector Q&A.',
    url: 'https://projectloop.ai',
    siteName: 'Project LOOP',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Project LOOP — AI Customer Feedback Intelligence Showcase',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Project LOOP — AI Customer-Feedback Intelligence Platform',
    description:
      'Turns scattered customer feedback into a ranked, evidence-backed list of what to do next with Claude AI.',
    creator: '@projectloop',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/icon.svg' }],
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark theme-midnight">
      <body className="bg-[var(--background)] text-slate-100 flex min-h-screen antialiased selection:bg-indigo-500/30 transition-colors duration-200 relative overflow-x-hidden">
        {/* Dynamic ambient top glow harmonized with active theme */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[950px] h-[340px] bg-[radial-gradient(ellipse_at_top,_var(--accent-glow),_transparent_70%)] pointer-events-none z-0 opacity-70 transition-all duration-300 transform-gpu will-change-transform" />

        <AnalyticsProvider>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
