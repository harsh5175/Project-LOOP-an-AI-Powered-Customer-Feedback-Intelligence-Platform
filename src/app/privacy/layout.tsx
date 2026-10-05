import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Enterprise privacy policy for Project LOOP. Learn how we collect, process, and safeguard customer feedback data with strict tenant isolation and AI safety guarantees.',
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
