import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dataStore from '@/lib/dataStore';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

import { checkRateLimit, validateBotProtection } from '@/lib/rateLimit';

const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid work email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  honeypot: z.string().optional(),
  submissionStartedAt: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'local';
    const rateCheck = checkRateLimit(`signup_${ip}`, { limit: 10, windowMs: 60_000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Too many signup attempts. Please wait a minute.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const botCheck = validateBotProtection({
      honeypot: body.honeypot,
      submissionStartedAt: body.submissionStartedAt,
      minDurationMs: 800,
    });

    if (botCheck.isBot) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Automated signup rejected.' },
        { status: 403 }
      );
    }

    const validation = SignupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid Input', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, companyName } = validation.data;
    const cleanEmail = email.toLowerCase().trim();

    // Generate isolated workspace
    const workspaceId = `ws-${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.floor(100 + Math.random() * 900)}`;
    const newWorkspace = {
      id: workspaceId,
      name: companyName,
      slug: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      tenantId: `tenant_${Date.now()}`,
      plan: 'Growth Dedicated',
      createdAt: new Date().toISOString(),
    };

    // Creator is assigned ADMIN role
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email: cleanEmail,
      role: 'ADMIN' as const,
      workspaceId: newWorkspace.id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      title: 'Workspace Founder & Admin',
    };

    // Save workspace to database (MongoDB & Prisma)
    try {
      const { getMongoDb } = await import('@/lib/mongodb');
      const db = await getMongoDb();
      if (db) {
        await db.collection('workspaces').updateOne(
          { id: newWorkspace.id },
          { $set: newWorkspace },
          { upsert: true }
        );
      }
    } catch (e) {
      console.warn('MongoDB workspace create fallback:', e);
    }

    try {
      const { prisma } = await import('@/lib/db');
      await prisma.workspace.create({
        data: {
          id: newWorkspace.id,
          name: newWorkspace.name,
          slug: newWorkspace.slug,
          tenantId: newWorkspace.tenantId,
          plan: newWorkspace.plan,
        },
      });
    } catch (e) {
      console.warn('Workspace db create fallback:', e);
    }

    await dataStore.addUser(newUser);

    const sessionPayload = Buffer.from(
      JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        workspaceId: newUser.workspaceId,
        avatar: newUser.avatar,
        title: newUser.title,
      })
    ).toString('base64');

    const response = NextResponse.json(
      {
        success: true,
        message: `Workspace "${companyName}" created successfully. You are logged in as ADMIN.`,
        workspace: newWorkspace,
        user: newUser,
      },
      { status: 201 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionPayload,
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
