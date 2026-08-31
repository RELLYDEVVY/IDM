import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logEvent } from '@/lib/audit';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'user:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetUser = await db.user.findUnique({
      where: { id: params.id },
      include: {
        roles: { include: { role: true } },
        _count: { select: { sessions: true } }
      }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password, ...safeUser } = targetUser;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error in GET /api/users/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'user:update')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateUserSchema.parse(body);

    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: validated,
    });

    await logEvent({
      eventType: 'USER_UPDATED',
      userId: user.id,
      targetId: params.id,
      details: validated
    });

    return NextResponse.json({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email });
  } catch (error) {
    console.error('Error in PATCH /api/users/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
