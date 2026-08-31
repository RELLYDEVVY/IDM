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

    const { roleId } = await request.json();
    if (!roleId) {
      return NextResponse.json({ error: 'roleId is required' }, { status: 400 });
    }

    // Check if demoting self from SUPER_ADMIN
    if (user.id === params.id) {
      const currentRoles = await db.userRole.findMany({
        where: { userId: user.id },
        include: { role: true }
      });
      const isSuperAdmin = currentRoles.some(ur => ur.role.name === 'SUPER_ADMIN');
      const targetRole = await db.role.findUnique({ where: { id: roleId } });
      if (isSuperAdmin && targetRole?.name !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Cannot demote yourself from SUPER_ADMIN' }, { status: 400 });
      }
    }

    await db.$transaction([
      db.userRole.deleteMany({ where: { userId: params.id } }),
      db.userRole.create({ data: { userId: params.id, roleId } })
    ]);

    await logEvent({
      eventType: 'ROLE_CHANGED',
      userId: user.id,
      targetId: params.id,
      details: { roleId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
