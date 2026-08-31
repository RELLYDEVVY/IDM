import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        roles: true,
        mfaSecret: { select: { enabled: true } },
        _count: { select: { sessions: true } }
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { passwordHash, ...safeUser } = dbUser;
    
    return NextResponse.json({ 
      user: {
        ...safeUser,
        roleNames: safeUser.roles.map(r => r.name),
        mfaEnabled: safeUser.mfaSecret?.enabled || false,
        sessionCount: safeUser._count.sessions
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
