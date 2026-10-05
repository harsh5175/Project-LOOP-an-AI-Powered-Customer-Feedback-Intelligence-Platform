import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unified Feedback Inbox & Triage',
  description:
    'Browse, search, and triage multi-channel customer feedback records from Zendesk, App Store, Discord, and CSV uploads with Claude AI.',
};

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
