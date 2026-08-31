import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logEvent } from '@/lib/audit';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'oauth:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const app = await db.application.findUnique({ where: { id: params.id } });
    if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(app);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'oauth:manage')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data: any = {};
    if (body.name) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.redirectUris) data.redirectUris = JSON.stringify(body.redirectUris);

    const app = await db.application.update({
      where: { id: params.id },
      data
    });

    return NextResponse.json(app);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'oauth:manage')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.application.delete({ where: { id: params.id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
