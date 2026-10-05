import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import dataStore from '@/lib/dataStore';
import { retrieveTopGroundedFeedback } from '@/lib/search';
import { generateGroundedAnswer } from '@/lib/ai';

const QuerySchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters long.'),
});

export async function POST(req: NextRequest) {
  try {
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { workspaceId } = authResult;

    const body = await req.json();
    const validation = QuerySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Bad Request', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { query } = validation.data;
    const allFeedbacks = await dataStore.getAllFeedbacksForWorkspace(workspaceId);

    // 1. Semantic Retrieval (Top-K most relevant items)
    const retrievedFeedbacks = retrieveTopGroundedFeedback(query, allFeedbacks, 5);

    // 2. Grounded Q&A Generation
    const groundedResult = await generateGroundedAnswer(query, retrievedFeedbacks);

    return NextResponse.json({
      success: true,
      answer: {
        id: `ans-${Date.now()}`,
        query,
        answer: groundedResult.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        retrievedFeedback: retrievedFeedbacks,
        keyThemes: groundedResult.keyThemes,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
