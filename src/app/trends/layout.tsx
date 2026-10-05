import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Theme Trends & Spike Anomaly Detection',
  description:
    'Statistical surge monitoring and anomaly alerts across customer feedback themes to prevent customer contract churn.',
};

export default function TrendsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
