import { NextRequest, NextResponse } from 'next/server';
import dataStore from '@/lib/dataStore';
import { Feedback } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // 1. Bearer Token Auth verification
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

    const {
      content,
      platform = 'Discord',
      author = 'Community Member',
      sourceRef,
      arr = 12000,
    } = body;

    const lower = content.toLowerCase();
    let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' = 'NEUTRAL';
    let sentimentScore = 0.0;

    if (
      lower.includes('broken') ||
      lower.includes('fail') ||
      lower.includes('bug') ||
      lower.includes('slow') ||
      lower.includes('error') ||
      lower.includes('crash') ||
      lower.includes('bad')
    ) {
      sentiment = 'NEGATIVE';
      sentimentScore = -0.75;
    } else if (
      lower.includes('love') ||
      lower.includes('great') ||
      lower.includes('fast') ||
      lower.includes('smooth') ||
      lower.includes('thanks') ||
      lower.includes('awesome')
    ) {
      sentiment = 'POSITIVE';
      sentimentScore = 0.9;
    }

    let theme = 'Dashboard Speed & UX';
    if (lower.includes('invoice') || lower.includes('billing') || lower.includes('stripe')) {
      theme = 'Billing & Invoicing';
    } else if (lower.includes('invite') || lower.includes('onboard') || lower.includes('team')) {
      theme = 'Team Onboarding & Invites';
    } else if (lower.includes('sso') || lower.includes('saml') || lower.includes('okta')) {
      theme = 'Enterprise SSO & SAML';
    } else if (lower.includes('mobile') || lower.includes('ios') || lower.includes('android')) {
      theme = 'Mobile App Experience';
    } else if (lower.includes('export') || lower.includes('csv') || lower.includes('pdf')) {
      theme = 'CSV & Report Export';
    }

    const generatedId = `fb-comm-v1-${Math.floor(1000 + Math.random() * 9000)}`;

    const ingestedItem: Feedback = {
      id: generatedId,
      content,
      channel: 'COMMUNITY',
      sourceRef: sourceRef || `${platform.toUpperCase()}-WEBHOOK-${Math.floor(100 + Math.random() * 900)}`,
      customerLabel: `${author} (${platform})`,
      sentiment,
      sentimentScore,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      workspaceId: 'ws-acme-corp-01',
      featureArea: theme,
      rationale: `Ingested via Public Community Webhook REST API (/api/v1/community) from ${platform}.`,
      confidence: 0.96,
      themes: [theme],
      arr: Number(arr) || 12000,
      customerTier: (Number(arr) || 12000) >= 40000 ? 'Enterprise' : 'Growth',
      churnRisk: sentiment === 'NEGATIVE' ? 'MEDIUM' : 'LOW',
    };

    await dataStore.addFeedback(ingestedItem);

    return NextResponse.json(
      {
        success: true,
        message: `Community post from ${platform} ingested successfully via v1 API.`,
        feedback: ingestedItem,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred during community ingestion.',
      },
      { status: 500 }
    );
  }
}
