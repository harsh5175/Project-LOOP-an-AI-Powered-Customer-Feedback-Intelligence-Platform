import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import dataStore from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  try {
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { workspaceId } = authResult;

    const themes = await dataStore.getThemes(workspaceId);
    const feedbacks = await dataStore.getAllFeedbacksForWorkspace(workspaceId);

    // Compute volume over time and spike detection for each theme
    const enhancedThemes = themes.map((theme) => {
      const matchingFeedbacks = feedbacks.filter((f) =>
        f.themes.some((t) => t.toLowerCase() === theme.name.toLowerCase())
      );

      const negativeCount = matchingFeedbacks.filter((f) => f.sentiment === 'NEGATIVE').length;
      const positiveCount = matchingFeedbacks.filter((f) => f.sentiment === 'POSITIVE').length;
      const negativeRate = matchingFeedbacks.length > 0
        ? Math.round((negativeCount / matchingFeedbacks.length) * 100)
        : 0;

      // Spike detection logic: if negative rate > 50% or volume increased > 30%
      const isSpike = theme.isSpike || (negativeRate >= 50 && matchingFeedbacks.length >= 8);

      return {
        ...theme,
        count: matchingFeedbacks.length,
        negativeCount,
        positiveCount,
        negativeRate,
        isSpike,
      };
    });

    return NextResponse.json({
      themes: enhancedThemes,
      totalThemes: enhancedThemes.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
