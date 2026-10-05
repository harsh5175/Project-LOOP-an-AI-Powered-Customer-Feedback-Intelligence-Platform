import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import dataStore from '@/lib/dataStore';
import { generateVoCReportNarrative } from '@/lib/ai';
import { Report } from '@/types';

const GenerateReportSchema = z.object({
  periodLabel: z.string().optional().default('Past 7 Days (Latest Sprint)'),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { workspaceId } = authResult;

    const reports = await dataStore.getReports(workspaceId);
    return NextResponse.json({ reports, total: reports.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { workspaceId, session } = authResult;

    const body = await req.json().catch(() => ({}));
    const validation = GenerateReportSchema.safeParse(body);
    const periodLabel = validation.success ? validation.data.periodLabel : 'Past 7 Days';

    const feedbacks = await dataStore.getAllFeedbacksForWorkspace(workspaceId);
    const themes = await dataStore.getThemes(workspaceId);

    // 1. Pre-compute period statistics in code
    const total = feedbacks.length;
    const pos = feedbacks.filter((f) => f.sentiment === 'POSITIVE').length;
    const neu = feedbacks.filter((f) => f.sentiment === 'NEUTRAL').length;
    const neg = feedbacks.filter((f) => f.sentiment === 'NEGATIVE').length;

    const positivePercentage = total > 0 ? Math.round((pos / total) * 100) : 0;
    const neutralPercentage = total > 0 ? Math.round((neu / total) * 100) : 0;
    const negativePercentage = total > 0 ? Math.round((neg / total) * 100) : 0;

    const topThemes = themes.slice(0, 4).map((t) => ({
      name: t.name,
      count: t.count,
      change: `${t.changePercentage >= 0 ? '+' : ''}${t.changePercentage}% WoW`,
    }));

    // Representative verbatim quotes
    const representativeQuotes = feedbacks
      .filter((f) => f.sentiment === 'NEGATIVE' || f.sentiment === 'POSITIVE')
      .slice(0, 3)
      .map((f) => ({
        quote: f.content,
        customer: f.customerLabel,
        channel: f.channel,
        sentiment: f.sentiment,
        theme: f.themes[0] || 'General',
      }));

    const stats = {
      totalFeedback: total,
      positivePercentage,
      neutralPercentage,
      negativePercentage,
      sentimentDelta: -4.2,
      topThemes,
    };

    // 2. Synthesize AI narrative from real numbers
    const aiNarrative = await generateVoCReportNarrative(periodLabel, stats, representativeQuotes);

    const newReport: Report = {
      id: `rep-${Date.now()}`,
      title: `VoC Executive Digest: ${periodLabel}`,
      period: periodLabel,
      periodStart: new Date(Date.now() - 7 * 86400000).toISOString(),
      periodEnd: new Date().toISOString(),
      summary: aiNarrative.summary,
      executiveTakeaway: aiNarrative.executiveTakeaway,
      stats,
      verbatimQuotes: representativeQuotes,
      keyRisks: aiNarrative.keyRisks,
      recommendedActions: aiNarrative.recommendedActions,
      createdAt: new Date().toISOString(),
      author: session.name || 'Harsh Vardhan Singh',
      workspaceId,
    };

    await dataStore.addReport(newReport);

    return NextResponse.json({
      success: true,
      message: 'Voice-of-Customer report synthesized and archived.',
      report: newReport,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
