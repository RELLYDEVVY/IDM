import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logEvent } from '@/lib/audit';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'oauth:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apps = await db.application.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(apps);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'oauth:create')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const clientId = crypto.randomBytes(16).toString('hex');
    const clientSecret = crypto.randomBytes(32).toString('hex');

    const app = await db.application.create({
      data: {
        name: body.name,
        description: body.description || '',
        redirectUris: JSON.stringify(body.redirectUris || []),
        clientId,
        clientSecret,
        ownerId: user.id
      }
    });

    await logEvent({
      eventType: 'OAUTH_APP_CREATED',
      userId: user.id,
      targetId: app.id,
      details: { name: app.name }
    });

    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
