import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return NextResponse.json({ error: 'invalid_client' }, { status: 401 });
    }
    const decoded = Buffer.from(authHeader.substring(6), 'base64').toString('utf8');
    const [client_id, client_secret] = decoded.split(':');

    const app = await db.application.findUnique({ where: { clientId: client_id } });
    if (!app || app.clientSecret !== client_secret) return NextResponse.json({ error: 'invalid_client' }, { status: 401 });

    const data = await request.text();
    const params = new URLSearchParams(data);
    const token = params.get('token');
    
    if (!token) return NextResponse.json({ active: false });

    const oauthToken = await db.oAuthToken.findUnique({ where: { accessToken: token } });
    if (!oauthToken || oauthToken.expiresAt < new Date()) {
      return NextResponse.json({ active: false });
    }

    const user = await db.user.findUnique({ where: { id: oauthToken.userId } });

    return NextResponse.json({
      active: true,
      scope: oauthToken.scope,
      client_id: oauthToken.clientId,
      username: user?.email,
      exp: Math.floor(oauthToken.expiresAt.getTime() / 1000)
    });
  } catch (error) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
