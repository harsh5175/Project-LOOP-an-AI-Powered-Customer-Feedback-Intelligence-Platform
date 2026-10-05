import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Executive Dashboard & Customer Intelligence',
  description:
    'Real-time synthesis across 5 feedback channels. AI-classified sentiment, recurring themes, spike surge detection, and revenue ARR at risk.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
