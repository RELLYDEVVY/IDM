import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logEvent } from '@/lib/logger';
import { getCurrentUser, clearAuthCookies } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await db.session.deleteMany({
      where: { userId: user.id }
    });

    await clearAuthCookies();
    await logEvent({ action: 'ALL_SESSIONS_REVOKED', userId: user.id, ipAddress: ip, userAgent });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
