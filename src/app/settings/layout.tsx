import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workspace Configuration & Integrations',
  description:
    'Manage API keys, team member RBAC permissions, webhook ingestion pipelines, and AI sensitivity thresholds for Project LOOP.',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
