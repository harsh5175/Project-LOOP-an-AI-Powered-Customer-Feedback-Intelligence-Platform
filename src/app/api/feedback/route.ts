import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/lib/auth';
import dataStore from '@/lib/dataStore';
import { classifyFeedbackWithAI } from '@/lib/ai';
import { Feedback } from '@/types';

const CreateFeedbackSchema = z.object({
  content: z.string().min(5, 'Content must be at least 5 characters long.'),
  channel: z.enum(['SUPPORT_TICKET', 'APP_STORE', 'NPS_SURVEY', 'SALES_NOTE', 'COMMUNITY']),
  customerLabel: z.string().optional().default('Standard User'),
  sourceRef: z.string().optional(),
  arr: z.number().optional().default(15000),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { workspaceId } = authResult;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('q') || searchParams.get('search') || undefined;
    const channel = searchParams.get('channel') || undefined;
    const sentiment = searchParams.get('sentiment') || undefined;
    const status = searchParams.get('status') || undefined;
    const theme = searchParams.get('theme') || undefined;

    const result = await dataStore.getFeedbacks(workspaceId, {
      page,
      limit,
      search,
      channel,
      sentiment,
      status,
      theme,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. RBAC Guard: Only ADMIN or ANALYST can ingest feedback
    const roleCheck = requireRole(req, ['ADMIN', 'ANALYST']);
    if (roleCheck instanceof NextResponse) return roleCheck;
    const { workspaceId, session } = roleCheck;

    // 2. Validate payload with Zod
    const body = await req.json();
    const validation = CreateFeedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Validation failed for feedback payload.',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { content, channel, customerLabel, sourceRef, arr } = validation.data;

    // 3. AI Auto-Classification
    const themesList = await dataStore.getThemes(workspaceId);
    const existingThemes = themesList.map((t) => t.name);
    const aiResult = await classifyFeedbackWithAI(content, existingThemes);

    const newFeedback: Feedback = {
      id: `fb-${Date.now()}`,
      content,
      channel,
      sourceRef: sourceRef || `MANUAL-${Math.floor(100 + Math.random() * 900)}`,
      customerLabel: customerLabel || 'Standard Customer',
      sentiment: aiResult.sentiment,
      sentimentScore: aiResult.sentimentScore,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      workspaceId,
      featureArea: aiResult.featureArea,
      rationale: aiResult.rationale,
      confidence: aiResult.confidence,
      themes: aiResult.themes,
      arr,
      customerTier: arr >= 40000 ? 'Enterprise' : arr >= 15000 ? 'Growth' : 'Startup',
      churnRisk: aiResult.sentiment === 'NEGATIVE' ? (arr >= 40000 ? 'HIGH' : 'MEDIUM') : 'LOW',
    };

    const saved = await dataStore.addFeedback(newFeedback);

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback ingested and auto-classified with Claude AI.',
        feedback: saved,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
