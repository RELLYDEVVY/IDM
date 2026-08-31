import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logEvent } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
    }

    const user = await db.user.findFirst({
      where: { emailVerifyToken: token }
    });

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerifyToken: null }
    });

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await logEvent({ action: 'EMAIL_VERIFIED', userId: user.id, ipAddress: ip, userAgent });

    return NextResponse.redirect(new URL('/login?verified=true', request.url));
  } catch (error) {
    return NextResponse.redirect(new URL('/login?error=verification_failed', request.url));
  }
}
