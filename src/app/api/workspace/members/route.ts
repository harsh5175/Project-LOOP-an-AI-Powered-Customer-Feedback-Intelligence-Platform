import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/lib/auth';
import dataStore from '@/lib/dataStore';
import { Role } from '@/types';

const InviteMemberSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']),
  title: z.string().min(2),
});

export async function GET(req: NextRequest) {
  try {
    const authResult = requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const { workspaceId } = authResult;

    const members = await dataStore.getUsers(workspaceId);
    return NextResponse.json({ members, total: members.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Server-side RBAC Guard: Only ADMIN can invite and assign roles!
    const roleCheck = requireRole(req, ['ADMIN']);
    if (roleCheck instanceof NextResponse) return roleCheck;
    const { workspaceId } = roleCheck;

    const body = await req.json();
    const validation = InviteMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Bad Request', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, role, title } = validation.data;

    const newMember = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: role as Role,
      workspaceId,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      title,
    };

    await dataStore.addUser(newMember);

    return NextResponse.json({
      success: true,
      message: `Teammate ${name} invited as ${role}.`,
      member: newMember,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
