import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'dashboard:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const totalUsers = await db.user.count();
    const usersWithMfa = await db.user.count({ where: { mfaEnabled: true } });
    const lockedAccounts = await db.user.count({ where: { lockedUntil: { gt: new Date() } } });
    
    const policy = await db.securityPolicy.findFirst();
    const policyCompliance = policy ? (policy.mfaRequired ? 15 : 10) : 5;

    const mfaScore = totalUsers > 0 ? (usersWithMfa / totalUsers) * 30 : 0;
    const lockoutsScore = totalUsers > 0 ? Math.max(0, 15 - (lockedAccounts / totalUsers) * 15 * 10) : 15;
    
    const passwordAgeScore = 20; // simplified
    const failedLoginsScore = 20; // simplified

    const score = Math.round(mfaScore + lockoutsScore + passwordAgeScore + failedLoginsScore + policyCompliance);

    return NextResponse.json({
      score,
      breakdown: { mfa: mfaScore, passwordAge: passwordAgeScore, failedLogins: failedLoginsScore, lockouts: lockoutsScore, policyCompliance },
      recommendations: score < 80 ? ['Enable mandatory MFA', 'Review locked accounts'] : ['Good security posture']
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
