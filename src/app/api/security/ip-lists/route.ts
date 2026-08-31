import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logEvent } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'settings:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const policy = await db.securityPolicy.findFirst();
    return NextResponse.json({
      allowedIps: policy?.allowedIps ? JSON.parse(policy.allowedIps) : [],
      blockedIps: policy?.blockedIps ? JSON.parse(policy.blockedIps) : []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'settings:manage')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { allowedIps, blockedIps } = await request.json();
    
    let policy = await db.securityPolicy.findFirst();
    if (!policy) {
      policy = await db.securityPolicy.create({ data: {} });
    }

    const updated = await db.securityPolicy.update({
      where: { id: policy.id },
      data: {
        allowedIps: JSON.stringify(allowedIps || []),
        blockedIps: JSON.stringify(blockedIps || [])
      }
    });

    await logEvent({ eventType: 'POLICY_UPDATED' as any, userId: user.id, details: { ipListsChanged: true } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
