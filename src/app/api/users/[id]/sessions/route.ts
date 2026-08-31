import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logEvent } from '@/lib/audit';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'user:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await db.session.findMany({
      where: { userId: params.id },
      orderBy: { lastActive: 'desc' }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'user:update')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    await db.session.delete({
      where: { id: sessionId }
    });

    await logEvent({
      eventType: 'SESSION_REVOKED',
      userId: user.id,
      targetId: params.id,
      details: { sessionId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
