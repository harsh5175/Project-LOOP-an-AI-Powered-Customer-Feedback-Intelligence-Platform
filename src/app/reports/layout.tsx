import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Executive Insights & ROI Reports',
  description:
    'Comprehensive VoC analytics, AI executive briefs, theme distribution metrics, and churn-risk prevention reports for enterprise leadership.',
};

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
