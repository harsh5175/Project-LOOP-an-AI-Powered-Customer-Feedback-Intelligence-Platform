import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Role } from '@/types';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  workspaceId: string;
  avatar?: string;
  title?: string;
}

export const SESSION_COOKIE_NAME = 'loop_session';

// Helper to hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Helper to compare password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const adminUser: SessionUser = {
  id: 'user-admin-1',
  name: 'Harsh Vardhan Singh',
  email: 'H@rsh.V@rdhan.Singh',
  role: 'ADMIN',
  workspaceId: 'ws-acme-corp-01',
  avatar: '/harsh.jpg',
  title: 'VP of Product Management',
};

// Default mock sessions for demo accounts if external DB is running offline
export const DEMO_USERS: Record<string, SessionUser> = {
  'h@rsh.v@rdhan.singh': adminUser,
  'H@rsh.V@rdhan.Singh': adminUser,
  'sarah.chen@acme.io': adminUser,
  'alex.rivera@acme.io': {
    id: 'user-analyst-2',
    name: 'Alex Rivera',
    email: 'alex.rivera@acme.io',
    role: 'ANALYST',
    workspaceId: 'ws-acme-corp-01',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Lead Customer Intelligence Analyst',
  },
  'maya.patel@acme.io': {
    id: 'user-viewer-3',
    name: 'Maya Patel',
    email: 'maya.patel@acme.io',
    role: 'VIEWER',
    workspaceId: 'ws-acme-corp-01',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Product Operations Associate',
  },
};

/**
 * Extracts the authenticated user session from the request cookie or headers
 */
export function getSession(req: NextRequest): SessionUser | null {
  // 1. Check custom role override header (useful for client-side demo role switcher)
  const roleOverride = req.headers.get('x-demo-role') as Role | null;
  if (roleOverride && ['ADMIN', 'ANALYST', 'VIEWER'].includes(roleOverride)) {
    const userKey = roleOverride === 'ADMIN' 
      ? 'H@rsh.V@rdhan.Singh' 
      : roleOverride === 'ANALYST' 
        ? 'alex.rivera@acme.io' 
        : 'maya.patel@acme.io';
    return DEMO_USERS[userKey] || adminUser;
  }

  // 2. Check session cookie
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (cookie?.value) {
    try {
      const decoded = JSON.parse(Buffer.from(cookie.value, 'base64').toString('utf-8'));
      if (decoded && decoded.id && decoded.workspaceId && decoded.role) {
        return decoded as SessionUser;
      }
    } catch {
      // Fallback to default admin session
    }
  }

  // 3. Default fallback to Harsh Vardhan Singh (ADMIN) for smooth demonstration
  return adminUser;
}

/**
 * Ensures user is authenticated and belongs to a workspace
 */
export function requireAuth(req: NextRequest): { session: SessionUser; workspaceId: string } | NextResponse {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'You must be logged in to access this resource.' },
      { status: 401 }
    );
  }
  return { session, workspaceId: session.workspaceId };
}

/**
 * Ensures user has one of the allowed roles; returns 403 forbidden otherwise
 */
export function requireRole(
  req: NextRequest,
  allowedRoles: Role[]
): { session: SessionUser; workspaceId: string } | NextResponse {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { session } = authResult;
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: `Role "${session.role}" is not authorized to perform this operation. Requires one of: [${allowedRoles.join(', ')}].`,
        currentRole: session.role,
        requiredRoles: allowedRoles,
      },
      { status: 403 }
    );
  }

  return authResult;
}
