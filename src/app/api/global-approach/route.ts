import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import dataStore from '@/lib/dataStore';
import { Channel } from '@/types';

const GenerateApproachSchema = z.object({
  focusArea: z.enum(['ALL', 'CHURN_PREVENTION', 'ENTERPRISE_ARR', 'UX_FRICTION', 'COMMUNITY_GROWTH']).optional().default('ALL'),
  timeHorizon: z.enum(['IMMEDIATE', 'Q1', 'Q2', 'Q3', 'Q4', 'ANNUAL']).optional().default('IMMEDIATE'),
  targetAudience: z.enum(['EXECUTIVE', 'PRODUCT_MANAGEMENT', 'ENGINEERING']).optional().default('EXECUTIVE'),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { workspaceId } = authResult;

    const [feedbacks, themes, workspace] = await Promise.all([
      dataStore.getAllFeedbacksForWorkspace(workspaceId),
      dataStore.getThemes(workspaceId),
      dataStore.getWorkspace(workspaceId),
    ]);

    const total = feedbacks.length;
    const pos = feedbacks.filter((f) => f.sentiment === 'POSITIVE').length;
    const neu = feedbacks.filter((f) => f.sentiment === 'NEUTRAL').length;
    const neg = feedbacks.filter((f) => f.sentiment === 'NEGATIVE').length;

    const avgScore = total > 0
      ? Number((feedbacks.reduce((sum, f) => sum + f.sentimentScore, 0) / total).toFixed(2))
      : 0.0;

    // Global Health Score (0 - 100)
    const rawHealth = Math.round(((avgScore + 1) / 2) * 100);
    const globalHealthScore = Math.max(10, Math.min(98, rawHealth));

    // ARR Analysis
    const totalArr = feedbacks.reduce((acc, curr) => acc + (curr.arr || 0), 0);
    const arrAtRisk = feedbacks
      .filter((f) => f.sentiment === 'NEGATIVE' || f.churnRisk === 'HIGH')
      .reduce((acc, curr) => acc + (curr.arr || 0), 0);

    // Cross-channel breakdown
    const channels: Channel[] = ['SUPPORT_TICKET', 'APP_STORE', 'NPS_SURVEY', 'SALES_NOTE', 'COMMUNITY'];
    const channelBreakdown = channels.map((ch) => {
      const items = feedbacks.filter((f) => f.channel === ch);
      const chTotal = items.length;
      const chPos = items.filter((f) => f.sentiment === 'POSITIVE').length;
      const chNeg = items.filter((f) => f.sentiment === 'NEGATIVE').length;
      const chArr = items.reduce((sum, f) => sum + (f.arr || 0), 0);
      const chAvgScore = chTotal > 0
        ? Number((items.reduce((sum, f) => sum + f.sentimentScore, 0) / chTotal).toFixed(2))
        : 0.0;

      return {
        channel: ch,
        volume: chTotal,
        positivePercentage: chTotal > 0 ? Number(((chPos / chTotal) * 100).toFixed(0)) : 0,
        negativePercentage: chTotal > 0 ? Number(((chNeg / chTotal) * 100).toFixed(0)) : 0,
        avgSentimentScore: chAvgScore,
        totalArr: chArr,
        status: chNeg / Math.max(1, chTotal) > 0.4 ? 'ATTENTION_REQUIRED' : 'HEALTHY',
      };
    });

    // 4 Strategic Global Approach Pillars
    const strategicPillars = [
      {
        pillarId: 'pillar-1',
        title: 'Pillar 1: Churn Defense & Revenue Protection',
        strategicFocus: 'Mitigate active contract risks by addressing mission-critical customer friction points.',
        urgency: 'P0 - CRITICAL',
        affectedArr: arrAtRisk,
        keyObservations: [
          'Payment gateway 504 timeouts and empty PDF invoice downloads account for the largest proportion of enterprise churn anxiety.',
          'Mid-market accounts report billing export errors on Microsoft Edge.',
        ],
        recommendedInitiatives: [
          'Refactor Stripe webhook timeout handling with exponential backoff.',
          'Implement client-side PDF renderer validation for monthly tax exports.',
        ],
      },
      {
        pillarId: 'pillar-2',
        title: 'Pillar 2: Product Usability & Friction Elimination',
        strategicFocus: 'Streamline the core web and mobile UX to elevate NPS sentiment and app store reviews.',
        urgency: 'P1 - HIGH',
        affectedArr: Math.round(totalArr * 0.28),
        keyObservations: [
          'Mobile app reviews highlight persistent notification badge clearing bugs on iOS.',
          'Users praise fast dashboard load times and Ask LOOP intelligence, indicating core UX delight is achievable.',
        ],
        recommendedInitiatives: [
          'Release patch for mobile background push badge sync handler.',
          'Optimize filter query debounce in feedback inbox search.',
        ],
      },
      {
        pillarId: 'pillar-3',
        title: 'Pillar 3: Enterprise Expansion & Security Readiness',
        strategicFocus: 'Unblock high-value procurement pipeline by delivering mandatory enterprise security standards.',
        urgency: 'P1 - HIGH',
        affectedArr: Math.round(totalArr * 0.35),
        keyObservations: [
          'Gong Sales notes show $120k+ ARR prospects demanding SCIM user de-provisioning and Okta integration before sign-off.',
          'Contractor immediate access revocation without deleting history is a recurring compliance requirement.',
        ],
        recommendedInitiatives: [
          'Publish SCIM 2.0 provisioning endpoint with Okta & Azure AD pre-built connectors.',
          'Deliver soft-delete and suspended contractor access state in team settings.',
        ],
      },
      {
        pillarId: 'pillar-4',
        title: 'Pillar 4: Developer Ecosystem & Community Advocacy',
        strategicFocus: 'Mobilize power users, community champions, and integrations to create organic product expansion.',
        urgency: 'P2 - MEDIUM',
        affectedArr: Math.round(totalArr * 0.15),
        keyObservations: [
          'Discord community members love CSV export with sentiment scores for internal sprint retros.',
          'Community request volume for public Webhook APIs and Zapier integration is growing 40% QoQ.',
        ],
        recommendedInitiatives: [
          'Launch community API developer portal with interactive curl examples.',
          'Establish automated weekly Slack spike alerts to keep engineering teams aligned with community voice.',
        ],
      },
    ];

    // Ranked Roadmap Initiatives
    const prioritizedRoadmap = [
      {
        id: 'INIT-101',
        title: 'Stripe Gateway Resiliency & Invoice PDF Rendering Fix',
        pillar: 'Pillar 1: Churn Defense',
        priority: 'P0',
        impactScore: 9.4,
        effort: 'Medium (1 Sprint)',
        owner: 'Billing & Platform Engineering',
        targetQuarter: 'Current Sprint',
        arrImpact: arrAtRisk,
      },
      {
        id: 'INIT-102',
        title: 'SCIM 2.0 Auto De-Provisioning & SAML Role Sync',
        pillar: 'Pillar 3: Enterprise Expansion',
        priority: 'P1',
        impactScore: 8.9,
        effort: 'Large (2 Sprints)',
        owner: 'Security & Auth Team',
        targetQuarter: 'Q1',
        arrImpact: 120000,
      },
      {
        id: 'INIT-103',
        title: 'Mobile App Push Badge Notification Synchronizer',
        pillar: 'Pillar 2: Usability',
        priority: 'P1',
        impactScore: 7.8,
        effort: 'Small (3 Days)',
        owner: 'Mobile Team',
        targetQuarter: 'Current Sprint',
        arrImpact: 45000,
      },
      {
        id: 'INIT-104',
        title: 'Public Community Webhooks & Zapier App Connector',
        pillar: 'Pillar 4: Ecosystem',
        priority: 'P2',
        impactScore: 7.2,
        effort: 'Medium (1.5 Sprints)',
        owner: 'DevRel & Integrations',
        targetQuarter: 'Q2',
        arrImpact: 35000,
      },
    ];

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        plan: workspace.plan,
      },
      approachMetadata: {
        generatedAt: new Date().toISOString(),
        framework: 'Project LOOP Enterprise Customer-Feedback Intelligence Matrix',
        version: '2.4.0',
      },
      globalHealthSummary: {
        totalFeedbackAnalyzed: total,
        globalHealthScore, // e.g. 74
        healthStatus: globalHealthScore >= 75 ? 'EXCELLENT' : globalHealthScore >= 60 ? 'STABLE' : 'ACTION_REQUIRED',
        globalSentimentAverage: avgScore,
        positivePercentage: total > 0 ? Number(((pos / total) * 100).toFixed(1)) : 0,
        neutralPercentage: total > 0 ? Number(((neu / total) * 100).toFixed(1)) : 0,
        negativePercentage: total > 0 ? Number(((neg / total) * 100).toFixed(1)) : 0,
        totalArrMonitored: totalArr,
        totalArrAtRisk: arrAtRisk,
        arrProtectionRate: totalArr > 0 ? Number((((totalArr - arrAtRisk) / totalArr) * 100).toFixed(1)) : 100,
      },
      channelBreakdown,
      strategicPillars,
      prioritizedRoadmap,
      executiveApproachStatement: `Our global VoC intelligence shows strong product traction with ${pos} positive signals and an overall Health Index of ${globalHealthScore}/100. However, $${arrAtRisk.toLocaleString()} ARR remains exposed to churn risks predominantly clustered in Billing & Invoicing edge-case failures. The recommended global approach is a balanced two-pronged strategy: immediately execute Pillar 1 fixes to protect existing ARR, while advancing Pillar 3 SCIM security capabilities to unlock pending enterprise expansion deals.`,
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

    const body = await req.json().catch(() => ({}));
    const validation = GenerateApproachSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid strategic approach parameters.',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { focusArea, timeHorizon, targetAudience } = validation.data;
    const feedbacks = await dataStore.getAllFeedbacksForWorkspace(workspaceId);

    // Compute tailored synthesis based on requested focus area
    const matchingItems = focusArea === 'CHURN_PREVENTION'
      ? feedbacks.filter((f) => f.sentiment === 'NEGATIVE')
      : focusArea === 'ENTERPRISE_ARR'
      ? feedbacks.filter((f) => (f.arr || 0) >= 30000)
      : focusArea === 'UX_FRICTION'
      ? feedbacks.filter((f) => (f.featureArea || '').includes('Speed') || (f.featureArea || '').includes('Mobile'))
      : focusArea === 'COMMUNITY_GROWTH'
      ? feedbacks.filter((f) => f.channel === 'COMMUNITY')
      : feedbacks;

    const focusArr = matchingItems.reduce((acc, curr) => acc + (curr.arr || 0), 0);

    return NextResponse.json({
      success: true,
      strategyBrief: {
        focusArea,
        timeHorizon,
        targetAudience,
        generatedAt: new Date().toISOString(),
        analyzedFeedbackCount: matchingItems.length,
        representedArr: focusArr,
        strategicDirectives: [
          `Directive A: Align ${targetAudience} sprint priorities strictly against ${focusArea} feedback verbatims.`,
          `Directive B: Target deployment timeline: ${timeHorizon} release cycle with measurable WoW sentiment lift.`,
          `Directive C: Establish cross-functional bi-weekly triage review between Product Management and Engineering leads.`,
        ],
        keyMetricsToTrack: [
          'Negative sentiment reduction rate (-25% target)',
          'High-tier customer resolution time (<48h target)',
          'Community upvote conversion to shipped product roadmap items',
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
