import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'dashboard:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      activeSessions,
      failedLogins24h,
      usersWithMfa,
      lockedAccounts,
      recentActivity
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { status: 'ACTIVE' } }),
      db.session.count({ where: { expiresAt: { gt: now } } }),
      db.auditLog.count({ where: { eventType: 'LOGIN_FAILURE', createdAt: { gte: oneDayAgo } } }),
      db.user.count({ where: { mfaEnabled: true } }),
      db.user.count({ where: { lockedUntil: { gt: now } } }),
      db.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, email: true } } } })
    ]);

    const mfaAdoptionRate = totalUsers > 0 ? (usersWithMfa / totalUsers) * 100 : 0;

    return NextResponse.json({
      totalUsers,
      activeUsers,
      activeSessions,
      failedLogins24h,
      mfaAdoptionRate,
      lockedAccounts,
      recentActivity
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
