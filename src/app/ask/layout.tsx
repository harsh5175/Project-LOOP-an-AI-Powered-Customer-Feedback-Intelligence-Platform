import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ask LOOP — Grounded Customer Intelligence Q&A',
  description:
    'Conversational AI assistant utilizing semantic cosine vector retrieval to answer customer inquiries grounded strictly in real quotes.',
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
