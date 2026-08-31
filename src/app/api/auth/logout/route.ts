import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logEvent } from '@/lib/logger';
import { cookies } from 'next/headers';
import { verifyToken, clearAuthCookies } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (token) {
      const payload = await verifyToken(token, 'access').catch(() => null);
      if (payload && payload.sessionId) {
        await db.session.delete({ where: { id: payload.sessionId as string } });
        await logEvent({ action: 'LOGOUT', userId: payload.userId as string, ipAddress: ip, userAgent });
      }
    }

    await clearAuthCookies();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
