import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logEvent } from '@/lib/audit';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'user:update')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.id === params.id) {
      return NextResponse.json({ error: 'Cannot change own status' }, { status: 400 });
    }

    const { status } = await request.json();
    if (!['ACTIVE', 'SUSPENDED', 'DEACTIVATED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await db.user.update({
      where: { id: params.id },
      data: { status }
    });

    const eventType = `USER_${status}` as any;
    await logEvent({
      eventType,
      userId: user.id,
      targetId: params.id,
      details: { status }
    });

    return NextResponse.json({ success: true, status });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
