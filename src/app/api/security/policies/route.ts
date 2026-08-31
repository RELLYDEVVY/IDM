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

    let policy = await db.securityPolicy.findFirst();
    if (!policy) {
      policy = await db.securityPolicy.create({ data: {} });
    }

    return NextResponse.json(policy);
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

    const body = await request.json();
    let policy = await db.securityPolicy.findFirst();
    
    if (!policy) {
      policy = await db.securityPolicy.create({ data: body });
    } else {
      policy = await db.securityPolicy.update({
        where: { id: policy.id },
        data: body
      });
    }

    await logEvent({ eventType: 'POLICY_UPDATED' as any, userId: user.id, details: body });

    return NextResponse.json(policy);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
