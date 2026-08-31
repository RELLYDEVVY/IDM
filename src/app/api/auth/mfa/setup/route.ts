import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logEvent } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth';
import * as otplib from 'otplib';
const { authenticator } = otplib;
import qrcode from 'qrcode';
import { randomBytes } from 'crypto';
import { hashPassword } from '@/lib/crypto'; // Assuming this also hashes backup codes

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'CloudIdentitySys', secret);
    const qrCode = await qrcode.toDataURL(otpauth);

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => randomBytes(4).toString('hex'));
    const hashedCodes = await Promise.all(backupCodes.map(code => hashPassword(code)));

    await db.mfaSecret.upsert({
      where: { userId: user.id },
      update: { secret, backupCodes: hashedCodes, enabled: false },
      create: { userId: user.id, secret, backupCodes: hashedCodes, enabled: false }
    });

    return NextResponse.json({ secret, qrCode, backupCodes });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const mfaSecret = await db.mfaSecret.findUnique({ where: { userId: user.id } });
    if (!mfaSecret) return NextResponse.json({ error: 'No MFA setup found' }, { status: 400 });

    const isValid = authenticator.verify({ token: code, secret: mfaSecret.secret });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
    }

    await db.mfaSecret.update({
      where: { userId: user.id },
      data: { enabled: true, verifiedAt: new Date() }
    });

    await logEvent({ action: 'MFA_ENABLED', userId: user.id, ipAddress: ip, userAgent });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
