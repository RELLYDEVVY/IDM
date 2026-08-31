import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logEvent } from '@/lib/audit';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'user:update')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.user.update({
      where: { id: params.id },
      data: { mustChangePassword: true }
    });

    await logEvent({
      eventType: 'PASSWORD_RESET_REQUESTED',
      userId: user.id,
      targetId: params.id,
      details: { forcedByAdmin: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
