import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import dataStore from '@/lib/dataStore';
import { Channel, Feedback } from '@/types';

const SIMULATED_CHANNEL_TEMPLATES: Record<Channel, Array<{ content: string; sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'; score: number; theme: string; arr: number }>> = {
  SUPPORT_TICKET: [
    { content: 'Our legal department cannot verify the SSL cert on the custom domain CNAME. Is there a way to provision our own wildcard cert?', sentiment: 'NEUTRAL', score: 0.1, theme: 'Enterprise SSO & SAML', arr: 54000 },
    { content: 'Urgent: Bulk user invite CSV upload failed with error code 500. We have 40 engineers waiting to join our workspace today.', sentiment: 'NEGATIVE', score: -0.92, theme: 'Team Onboarding & Invites', arr: 48000 },
  ],
  APP_STORE: [
    { content: 'The new iOS biometric login update is instantaneous. FaceID unlock makes reviewing feedback on the subway super seamless! 5 stars.', sentiment: 'POSITIVE', score: 0.95, theme: 'Mobile App Experience', arr: 12000 },
  ],
  NPS_SURVEY: [
    { content: 'Score 4/10: Dashboard charts look sleek, but downloading the underlying data as raw CSV requires too many clicks.', sentiment: 'NEGATIVE', score: -0.65, theme: 'CSV & Report Export', arr: 22000 },
  ],
  SALES_NOTE: [
    { content: 'Meeting with FinTech CTO ($80k ARR pipeline): Deal is contingent on HIPAA compliance attestation and audit log retention.', sentiment: 'NEUTRAL', score: 0.05, theme: 'Enterprise SSO & SAML', arr: 80000 },
  ],
  COMMUNITY: [
    { content: 'Shoutout to the Loop product team for adding dark mode and the new Ask Loop conversational agent. Total gamechanger!', sentiment: 'POSITIVE', score: 0.96, theme: 'Dashboard Speed & UX', arr: 18000 },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const roleCheck = requireRole(req, ['ADMIN', 'ANALYST']);
    if (roleCheck instanceof NextResponse) return roleCheck;
    const { workspaceId } = roleCheck;

    const body = await req.json().catch(() => ({}));
    const channel: Channel = body.channel || 'SUPPORT_TICKET';

    const templates = SIMULATED_CHANNEL_TEMPLATES[channel] || SIMULATED_CHANNEL_TEMPLATES.SUPPORT_TICKET;
    const created: Feedback[] = [];

    for (const t of templates) {
      const item: Feedback = {
        id: `fb-sim-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        content: t.content,
        channel,
        sourceRef: `SIM-${channel.substring(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
        customerLabel: 'Simulated Integration Event',
        sentiment: t.sentiment,
        sentimentScore: t.score,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        workspaceId,
        featureArea: t.theme,
        rationale: `Simulated inbound webhook pull from ${channel}.`,
        confidence: 0.96,
        themes: [t.theme],
        arr: t.arr,
        customerTier: t.arr >= 40000 ? 'Enterprise' : 'Growth',
        churnRisk: t.sentiment === 'NEGATIVE' ? 'HIGH' : 'LOW',
      };
      await dataStore.addFeedback(item);
      created.push(item);
    }

    return NextResponse.json({
      success: true,
      message: `Simulated pull from ${channel} complete. Added ${created.length} new feedback records.`,
      feedbacks: created,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
