import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import dataStore from '@/lib/dataStore';
import { classifyFeedbackWithAI } from '@/lib/ai';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const roleCheck = requireRole(req, ['ADMIN', 'ANALYST']);
    if (roleCheck instanceof NextResponse) return roleCheck;
    const { workspaceId } = roleCheck;

    const { id } = await params;
    const item = await dataStore.getFeedbackById(id, workspaceId);

    if (!item) {
      return NextResponse.json(
        { error: 'Not Found', message: `Feedback with id "${id}" not found in your workspace.` },
        { status: 404 }
      );
    }

    const themesList = await dataStore.getThemes(workspaceId);
    const existingThemes = themesList.map((t) => t.name);
    const reclassified = await classifyFeedbackWithAI(item.content, existingThemes);

    item.sentiment = reclassified.sentiment;
    item.sentimentScore = reclassified.sentimentScore;
    item.themes = reclassified.themes;
    item.featureArea = reclassified.featureArea;
    item.rationale = `Manual Re-Classification: ${reclassified.rationale}`;
    item.confidence = reclassified.confidence;
    item.churnRisk = reclassified.sentiment === 'NEGATIVE' ? ((item.arr || 12000) >= 30000 ? 'HIGH' : 'MEDIUM') : 'LOW';

    await dataStore.updateFeedbackClassification(id, workspaceId, {
      sentiment: item.sentiment,
      sentimentScore: item.sentimentScore,
      themes: item.themes,
      featureArea: item.featureArea,
      rationale: item.rationale,
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback reclassified successfully.',
      feedback: item,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
