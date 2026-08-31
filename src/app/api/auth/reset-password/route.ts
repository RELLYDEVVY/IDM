import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/crypto';
import { logEvent } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() }
      },
      include: {
        passwordHistories: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Check history
    for (const hist of user.passwordHistories) {
      const isMatch = await verifyPassword(newPassword, hist.passwordHash);
      if (isMatch) {
        return NextResponse.json({ error: 'Password cannot be the same as recent passwords' }, { status: 400 });
      }
    }

    const newHash = await hashPassword(newPassword);

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash,
          passwordResetToken: null,
          passwordResetExpiry: null
        }
      });

      await tx.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash: newHash
        }
      });
    });

    await logEvent({ action: 'PASSWORD_CHANGED', userId: user.id, ipAddress: ip, userAgent });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
