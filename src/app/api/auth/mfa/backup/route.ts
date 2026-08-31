import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logEvent } from '@/lib/logger';
import { verifyTempMfaToken, signToken, setAuthCookies } from '@/lib/auth';
import { verifyPassword } from '@/lib/crypto';

export async function POST(request: Request) {
  try {
    const { tempToken, code } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (!tempToken || !code) {
      return NextResponse.json({ error: 'Missing token or backup code' }, { status: 400 });
    }

    const payload = await verifyTempMfaToken(tempToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = payload.userId as string;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { mfaSecret: true, roles: true }
    });

    if (!user || !user.mfaSecret || !user.mfaSecret.enabled) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const backupCodes = user.mfaSecret.backupCodes;
    let codeMatchedIndex = -1;

    for (let i = 0; i < backupCodes.length; i++) {
      const isMatch = await verifyPassword(code, backupCodes[i]);
      if (isMatch) {
        codeMatchedIndex = i;
        break;
      }
    }

    if (codeMatchedIndex === -1) {
      await logEvent({ action: 'MFA_FAILED', userId, ipAddress: ip, userAgent });
      return NextResponse.json({ error: 'Invalid backup code' }, { status: 401 });
    }

    // Remove the used backup code
    const updatedCodes = backupCodes.filter((_, index) => index !== codeMatchedIndex);
    await db.mfaSecret.update({
      where: { userId },
      data: { backupCodes: updatedCodes }
    });

    const session = await db.session.create({
      data: {
        userId: user.id,
        ipAddress: ip,
        userAgent: userAgent,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    const accessToken = await signToken(user.id, session.id, 'access');
    const refreshToken = await signToken(user.id, session.id, 'refresh');

    await setAuthCookies(accessToken, refreshToken);
    
    await logEvent({ 
      action: 'MFA_VERIFIED', 
      userId, 
      ipAddress: ip, 
      userAgent,
      details: { method: 'backup_code' }
    });

    const { passwordHash, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });

  } catch (error) {
    console.error('MFA backup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
