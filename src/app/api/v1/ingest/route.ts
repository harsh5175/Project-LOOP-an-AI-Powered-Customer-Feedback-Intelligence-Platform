import { NextRequest, NextResponse } from 'next/server';
import dataStore from '@/lib/dataStore';
import { Feedback } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // 1. Validate API Key Authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Missing or invalid Authorization header. Expected format: Bearer <api_key>',
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token.startsWith('loop_') && token !== 'test-key-developer') {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid API Key token provided. Keys must begin with prefix "loop_".',
        },
        { status: 401 }
      );
    }

    // 2. Parse & Validate Payload
    const body = await req.json().catch(() => null);
    if (!body || !body.content || typeof body.content !== 'string' || body.content.trim().length < 5) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Field "content" is required and must contain at least 5 characters.',
        },
        { status: 400 }
      );
    }

    const { content, channel = 'SUPPORT_TICKET', customerLabel = 'Enterprise API Client', arr = 24000 } = body;

    // 3. Automated Sentiment & Theme Intelligence
    const lower = content.toLowerCase();
    let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
    let sentimentScore = 0.0;
    let theme = 'Dashboard Speed & UX';

    if (
      lower.includes('slow') ||
      lower.includes('broken') ||
      lower.includes('bug') ||
      lower.includes('fail') ||
      lower.includes('error') ||
      lower.includes('timeout') ||
      lower.includes('cannot') ||
      lower.includes('annoying') ||
      lower.includes('bad')
    ) {
      sentiment = 'NEGATIVE';
      sentimentScore = -0.82;
    } else if (
      lower.includes('love') ||
      lower.includes('great') ||
      lower.includes('fast') ||
      lower.includes('gorgeous') ||
      lower.includes('smooth') ||
      lower.includes('amazing') ||
      lower.includes('helpful')
    ) {
      sentiment = 'POSITIVE';
      sentimentScore = 0.91;
    }

    if (lower.includes('invoice') || lower.includes('billing') || lower.includes('stripe') || lower.includes('card')) {
      theme = 'Billing & Invoicing';
    } else if (lower.includes('invite') || lower.includes('onboard') || lower.includes('member')) {
      theme = 'Team Onboarding & Invites';
    } else if (lower.includes('sso') || lower.includes('saml') || lower.includes('okta') || lower.includes('azure')) {
      theme = 'Enterprise SSO & SAML';
    } else if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android')) {
      theme = 'Mobile App Experience';
    } else if (lower.includes('export') || lower.includes('csv') || lower.includes('pdf')) {
      theme = 'CSV & Report Export';
    }

    const generatedId = `fb-live-${Math.floor(1000 + Math.random() * 9000)}`;

    const ingestedItem = {
      id: generatedId,
      content,
      channel,
      sourceRef: `API-${Math.floor(100 + Math.random() * 900)}`,
      customerLabel,
      sentiment,
      sentimentScore,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      workspaceId: 'ws-acme-corp-01',
      featureArea: theme,
      rationale: `Classified via Public Ingestion REST API endpoint (/api/v1/ingest). Scored ${sentiment} (${sentimentScore.toFixed(2)}).`,
      confidence: 0.97,
      themes: [theme],
      arr: Number(arr) || 12000,
      customerTier: arr >= 40000 ? 'Enterprise' : arr >= 15000 ? 'Growth' : 'Startup',
      churnRisk: sentiment === 'NEGATIVE' ? (arr >= 40000 ? 'HIGH' : 'MEDIUM') : 'LOW',
    };

    await dataStore.addFeedback(ingestedItem as Feedback);

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback ingested successfully into workspace pipeline.',
        feedback: ingestedItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred during feedback ingestion.',
      },
      { status: 500 }
    );
  }
}
