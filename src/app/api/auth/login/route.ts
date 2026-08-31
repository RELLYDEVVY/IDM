import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/crypto';
import { logEvent } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validations';
import { signTempMfaToken, signToken, setAuthCookies } from '@/lib/auth';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Rate limit check
    const rateLimitOk = await checkRateLimit(ip, 'login', 5, 15 * 60);
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
    }

    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const { email, password } = result.data;

    const user = await db.user.findUnique({
      where: { email },
      include: { roles: true, mfaSecret: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json({ error: 'Account locked' }, { status: 403 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 });
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      const newAttempts = user.failedLoginAttempts + 1;
      const updates: any = { failedLoginAttempts: newAttempts };
      
      if (newAttempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        await logEvent({ action: 'ACCOUNT_LOCKED', userId: user.id, ipAddress: ip, userAgent });
      }

      await db.user.update({ where: { id: user.id }, data: updates });
      await logEvent({ action: 'LOGIN_FAILURE', userId: user.id, ipAddress: ip, userAgent });

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Reset attempts
    await db.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });

    if (user.mfaSecret && user.mfaSecret.enabled) {
      const tempToken = await signTempMfaToken(user.id);
      return NextResponse.json({ mfaRequired: true, tempToken });
    }

    // No MFA
    const session = await db.session.create({
      data: {
        userId: user.id,
        token: randomBytes(32).toString('hex'),
        ipAddress: ip,
        userAgent: userAgent,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
      }
    });

    const accessToken = await signToken(user.id, session.id, 'access');
    const refreshToken = await signToken(user.id, session.id, 'refresh');

    await setAuthCookies(accessToken, refreshToken);
    
    await logEvent({ action: 'LOGIN_SUCCESS', userId: user.id, ipAddress: ip, userAgent });

    const { passwordHash, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
