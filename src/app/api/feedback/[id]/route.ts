import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/lib/auth';
import dataStore from '@/lib/dataStore';
import { Status } from '@/types';

const UpdateFeedbackSchema = z.object({
  status: z.enum(['NEW', 'REVIEWED', 'ACTIONED']).optional(),
  note: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { workspaceId } = authResult;

    const { id } = await params;
    const item = await dataStore.getFeedbackById(id, workspaceId);

    if (!item) {
      return NextResponse.json(
        { error: 'Not Found', message: `Feedback with id "${id}" not found in your workspace.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ feedback: item });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // RBAC: Only ADMIN or ANALYST can triage or update feedback status
    const roleCheck = requireRole(req, ['ADMIN', 'ANALYST']);
    if (roleCheck instanceof NextResponse) return roleCheck;
    const { workspaceId, session } = roleCheck;

    const { id } = await params;
    const body = await req.json();
    const validation = UpdateFeedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Bad Request', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, note } = validation.data;
    const item = await dataStore.getFeedbackById(id, workspaceId);

    if (!item) {
      return NextResponse.json(
        { error: 'Not Found', message: `Feedback with id "${id}" not found in your workspace.` },
        { status: 404 }
      );
    }

    if (status) {
      await dataStore.updateFeedbackStatus(id, status as Status, workspaceId);
      item.status = status as Status;
    }

    if (note) {
      if (!item.internalNotes) item.internalNotes = [];
      item.internalNotes.push({
        id: `note-${Date.now()}`,
        author: session.name,
        avatar: session.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        text: note,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully.',
      feedback: item,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
