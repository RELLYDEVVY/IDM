import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logEvent } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const rateLimitOk = await checkRateLimit(email, 'forgot-password', 3, 60 * 60);
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      const token = randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.user.update({
        where: { id: user.id },
        data: { passwordResetToken: token, passwordResetExpiry: expiry }
      });

      await logEvent({ action: 'PASSWORD_RESET_REQUESTED', userId: user.id, ipAddress: ip, userAgent });
      
      // Real app: send email here
    }

    return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
