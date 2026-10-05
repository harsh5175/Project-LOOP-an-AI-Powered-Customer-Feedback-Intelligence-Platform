import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import dataStore from '@/lib/dataStore';
import { Feedback, Sentiment } from '@/types';

const CreateCommunityFeedbackSchema = z.object({
  content: z.string().min(5, 'Community feedback content must be at least 5 characters.'),
  author: z.string().optional().default('Community Contributor'),
  platform: z.enum(['Discord', 'Slack', 'Reddit', 'GitHub', 'Discourse', 'Community Forum']).optional().default('Discord'),
  sourceRef: z.string().optional(),
  arr: z.number().optional().default(12000),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
  theme: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { workspaceId } = authResult;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const sentimentFilter = searchParams.get('sentiment')?.toUpperCase();
    const platformFilter = searchParams.get('platform')?.toLowerCase();
    const themeFilter = searchParams.get('theme')?.toLowerCase();
    const searchQuery = (searchParams.get('q') || searchParams.get('search') || '').toLowerCase().trim();

    // 1. Retrieve all feedback items for workspace
    const allItems = await dataStore.getAllFeedbacksForWorkspace(workspaceId);

    // 2. Filter by channel === 'COMMUNITY'
    let communityItems = allItems.filter((item) => item.channel === 'COMMUNITY');

    // 3. Platform helper to identify platform from sourceRef, customerLabel, or content
    const getPlatform = (item: Feedback): string => {
      const combined = `${item.sourceRef} ${item.customerLabel} ${item.rationale || ''}`.toLowerCase();
      if (combined.includes('discord')) return 'Discord';
      if (combined.includes('slack')) return 'Slack';
      if (combined.includes('reddit')) return 'Reddit';
      if (combined.includes('github') || combined.includes('gh-')) return 'GitHub';
      if (combined.includes('discourse') || combined.includes('forum')) return 'Discourse';
      return 'Discord'; // default community hub
    };

    // Calculate overall community metrics before secondary filters
    const totalCommunity = communityItems.length;
    const posCount = communityItems.filter((i) => i.sentiment === 'POSITIVE').length;
    const neuCount = communityItems.filter((i) => i.sentiment === 'NEUTRAL').length;
    const negCount = communityItems.filter((i) => i.sentiment === 'NEGATIVE').length;
    const totalArr = communityItems.reduce((acc, curr) => acc + (curr.arr || 0), 0);
    const avgScore = totalCommunity > 0
      ? Number((communityItems.reduce((acc, curr) => acc + curr.sentimentScore, 0) / totalCommunity).toFixed(2))
      : 0.0;

    // Platform distribution
    const platformCounts: Record<string, number> = {
      Discord: 0,
      Slack: 0,
      Reddit: 0,
      GitHub: 0,
      Discourse: 0,
    };
    communityItems.forEach((item) => {
      const p = getPlatform(item);
      platformCounts[p] = (platformCounts[p] || 0) + 1;
    });

    // Theme frequency
    const themeCounts: Record<string, number> = {};
    communityItems.forEach((item) => {
      (item.themes || []).forEach((th) => {
        themeCounts[th] = (themeCounts[th] || 0) + 1;
      });
    });
    const topThemes = Object.entries(themeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Apply secondary filters
    if (sentimentFilter && ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(sentimentFilter)) {
      communityItems = communityItems.filter((i) => i.sentiment === sentimentFilter);
    }

    if (platformFilter && platformFilter !== 'all') {
      communityItems = communityItems.filter((i) => getPlatform(i).toLowerCase() === platformFilter);
    }

    if (themeFilter && themeFilter !== 'all') {
      communityItems = communityItems.filter((i) =>
        (i.themes || []).some((t) => t.toLowerCase().includes(themeFilter)) ||
        (i.featureArea || '').toLowerCase().includes(themeFilter)
      );
    }

    if (searchQuery) {
      communityItems = communityItems.filter((i) =>
        i.content.toLowerCase().includes(searchQuery) ||
        i.customerLabel.toLowerCase().includes(searchQuery) ||
        i.sourceRef.toLowerCase().includes(searchQuery) ||
        (i.featureArea || '').toLowerCase().includes(searchQuery)
      );
    }

    // Sort by latest
    communityItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalFiltered = communityItems.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / limit));
    const offset = (page - 1) * limit;
    const paginatedItems = communityItems.slice(offset, offset + limit).map((item) => ({
      ...item,
      platform: getPlatform(item),
    }));

    return NextResponse.json({
      success: true,
      channel: 'COMMUNITY',
      metrics: {
        totalDiscussions: totalCommunity,
        sentimentBreakdown: {
          positive: posCount,
          neutral: neuCount,
          negative: negCount,
          positivePercentage: totalCommunity > 0 ? Number(((posCount / totalCommunity) * 100).toFixed(1)) : 0,
          neutralPercentage: totalCommunity > 0 ? Number(((neuCount / totalCommunity) * 100).toFixed(1)) : 0,
          negativePercentage: totalCommunity > 0 ? Number(((negCount / totalCommunity) * 100).toFixed(1)) : 0,
          averageSentimentScore: avgScore,
        },
        arrRepresented: totalArr,
        platformDistribution: platformCounts,
        topThemes,
        trendingKeywords: [
          'export',
          'csv',
          'discord',
          'billing',
          'speed',
          'api',
          'webhooks',
          'mobile',
        ],
      },
      pagination: {
        total: totalFiltered,
        page,
        limit,
        totalPages,
      },
      discussions: paginatedItems,
    });
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
    const { workspaceId } = authResult;

    const body = await req.json();
    const validation = CreateCommunityFeedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid community feedback payload.',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { content, author, platform, sourceRef, arr, theme } = validation.data;
    const lower = content.toLowerCase();

    // Sentiment heuristic fallback
    let sentiment: Sentiment = validation.data.sentiment || 'NEUTRAL';
    let sentimentScore = validation.data.sentimentScore ?? 0.0;

    if (!validation.data.sentiment) {
      if (
        lower.includes('broken') ||
        lower.includes('fail') ||
        lower.includes('bug') ||
        lower.includes('slow') ||
        lower.includes('error') ||
        lower.includes('worst') ||
        lower.includes('bad') ||
        lower.includes('issue')
      ) {
        sentiment = 'NEGATIVE';
        sentimentScore = -0.76;
      } else if (
        lower.includes('love') ||
        lower.includes('great') ||
        lower.includes('fast') ||
        lower.includes('awesome') ||
        lower.includes('smooth') ||
        lower.includes('helpful') ||
        lower.includes('excellent')
      ) {
        sentiment = 'POSITIVE';
        sentimentScore = 0.88;
      }
    }

    let identifiedTheme = theme || 'Dashboard Speed & UX';
    if (lower.includes('invoice') || lower.includes('billing') || lower.includes('stripe')) {
      identifiedTheme = 'Billing & Invoicing';
    } else if (lower.includes('invite') || lower.includes('onboard') || lower.includes('team')) {
      identifiedTheme = 'Team Onboarding & Invites';
    } else if (lower.includes('sso') || lower.includes('saml') || lower.includes('okta')) {
      identifiedTheme = 'Enterprise SSO & SAML';
    } else if (lower.includes('mobile') || lower.includes('phone') || lower.includes('ios')) {
      identifiedTheme = 'Mobile App Experience';
    } else if (lower.includes('export') || lower.includes('csv') || lower.includes('pdf')) {
      identifiedTheme = 'CSV & Report Export';
    }

    const newId = `fb-comm-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalSourceRef = sourceRef || `${platform.toUpperCase()}-#${Math.floor(100 + Math.random() * 900)}`;

    const newFeedback: Feedback = {
      id: newId,
      content,
      channel: 'COMMUNITY',
      sourceRef: finalSourceRef,
      customerLabel: `${author} (${platform})`,
      sentiment,
      sentimentScore,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      workspaceId,
      featureArea: identifiedTheme,
      rationale: `Ingested via Community API (${platform} Hub). Scored as ${sentiment} (${sentimentScore.toFixed(2)}).`,
      confidence: 0.95,
      themes: [identifiedTheme],
      arr: arr || 12000,
      customerTier: (arr || 12000) >= 40000 ? 'Enterprise' : (arr || 12000) >= 15000 ? 'Growth' : 'Startup',
      churnRisk: sentiment === 'NEGATIVE' ? 'MEDIUM' : 'LOW',
    };

    const saved = await dataStore.addFeedback(newFeedback);

    return NextResponse.json(
      {
        success: true,
        message: `Community post from ${platform} ingested successfully into LOOP pipeline.`,
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
