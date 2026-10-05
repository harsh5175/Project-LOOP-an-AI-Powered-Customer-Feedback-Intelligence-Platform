import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  SEED_WORKSPACE,
  SEED_USERS,
  SEED_THEMES,
  SEED_FEEDBACKS,
  SEED_REPORTS,
} from '../src/data/seedFeedback';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Project LOOP Seed Script (Zidio Corporate Grade)...');

  // 1. Seed Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: SEED_WORKSPACE.slug },
    update: {
      name: SEED_WORKSPACE.name,
      plan: SEED_WORKSPACE.plan,
    },
    create: {
      id: SEED_WORKSPACE.id,
      name: SEED_WORKSPACE.name,
      slug: SEED_WORKSPACE.slug,
      tenantId: SEED_WORKSPACE.tenantId,
      plan: SEED_WORKSPACE.plan,
    },
  });
  console.log(`✅ Seeded Workspace: ${workspace.name} (${workspace.id})`);

  // 2. Seed Users with Hashed Passwords
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  for (const u of SEED_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role as any,
        name: u.name,
        title: u.title,
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: defaultPasswordHash,
        role: u.role as any,
        avatar: u.avatar,
        title: u.title,
        workspaceId: workspace.id,
      },
    });
    console.log(`👤 Seeded User: ${user.name} [Role: ${user.role}] (${user.email})`);
  }

  // 3. Seed Themes
  const themeMap: Record<string, string> = {};
  for (const t of SEED_THEMES) {
    const theme = await prisma.theme.upsert({
      where: {
        workspaceId_name: {
          workspaceId: workspace.id,
          name: t.name,
        },
      },
      update: {
        description: t.description,
        color: t.color,
      },
      create: {
        id: t.id,
        name: t.name,
        description: t.description,
        color: t.color,
        workspaceId: workspace.id,
      },
    });
    themeMap[t.name] = theme.id;
  }
  console.log(`🎨 Seeded ${SEED_THEMES.length} core themes.`);

  // 4. Seed 125+ Feedback Items
  let feedbackCount = 0;
  for (const f of SEED_FEEDBACKS) {
    const feedback = await prisma.feedback.upsert({
      where: { id: f.id },
      update: {
        content: f.content,
        sentiment: f.sentiment as any,
        sentimentScore: f.sentimentScore,
        status: f.status as any,
      },
      create: {
        id: f.id,
        content: f.content,
        channel: f.channel as any,
        sourceRef: f.sourceRef,
        customerLabel: f.customerLabel,
        sentiment: f.sentiment as any,
        sentimentScore: f.sentimentScore,
        status: f.status as any,
        featureArea: f.featureArea,
        rationale: f.rationale,
        confidence: f.confidence,
        arr: f.arr,
        createdAt: new Date(f.createdAt),
        workspaceId: workspace.id,
      },
    });

    // Link themes
    for (const themeName of f.themes) {
      const themeId = themeMap[themeName];
      if (themeId) {
        await prisma.feedbackTheme.upsert({
          where: {
            feedbackId_themeId: {
              feedbackId: feedback.id,
              themeId,
            },
          },
          update: {},
          create: {
            feedbackId: feedback.id,
            themeId,
            confidence: 0.95,
          },
        }).catch(() => {});
      }
    }
    feedbackCount++;
  }
  console.log(`💬 Seeded ${feedbackCount} realistic feedback records with channel & sentiment distribution.`);

  // 5. Seed VoC Reports
  for (const r of SEED_REPORTS) {
    await prisma.report.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        title: r.title,
        periodStart: new Date(r.periodStart),
        periodEnd: new Date(r.periodEnd),
        contentJson: JSON.stringify(r),
        workspaceId: workspace.id,
        generatedById: 'user-admin-1',
      },
    });
  }
  console.log(`📊 Seeded ${SEED_REPORTS.length} Voice-of-Customer Reports.`);

  console.log('🎉 Project LOOP database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
