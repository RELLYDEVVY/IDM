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

    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '7');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const logs = await db.auditLog.findMany({
      where: {
        eventType: { in: ['LOGIN_SUCCESS', 'LOGIN_FAILURE'] },
        createdAt: { gte: startDate }
      },
      select: { eventType: true, createdAt: true }
    });

    const dataMap: Record<string, { successful: number, failed: number }> = {};
    for (let i = 0; i < period; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      dataMap[ds] = { successful: 0, failed: 0 };
    }

    for (const log of logs) {
      const ds = log.createdAt.toISOString().split('T')[0];
      if (dataMap[ds]) {
        if (log.eventType === 'LOGIN_SUCCESS') dataMap[ds].successful++;
        if (log.eventType === 'LOGIN_FAILURE') dataMap[ds].failed++;
      }
    }

    const result = Object.entries(dataMap).map(([date, counts]) => ({ date, ...counts })).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
