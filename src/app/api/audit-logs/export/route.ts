import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'audit:export')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    
    const where: any = {};
    if (eventType) where.eventType = eventType;

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    });

    const csvRows = ['id,eventType,userId,userEmail,ipAddress,severity,createdAt'];
    for (const log of logs) {
      csvRows.push(`${log.id},${log.eventType},${log.userId || ''},${log.user?.email || ''},${log.ipAddress || ''},${log.severity},${log.createdAt.toISOString()}`);
    }

    const csv = csvRows.join('\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="audit-logs.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
