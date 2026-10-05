import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import dataStore from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const workspace = await dataStore.getWorkspace(session.workspaceId);

  return NextResponse.json({
    authenticated: true,
    user: session,
    workspace,
    permissions: {
      canManageMembers: session.role === 'ADMIN',
      canIngestFeedback: session.role === 'ADMIN' || session.role === 'ANALYST',
      canTriageFeedback: session.role === 'ADMIN' || session.role === 'ANALYST',
      canGenerateReports: true,
      isReadOnly: session.role === 'VIEWER',
    },
  });
}
