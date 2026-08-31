import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as jose from 'jose';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
    
    let payload;
    try {
      const result = await jose.jwtVerify(token, secret);
      payload = result.payload;
    } catch (e) {
      return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
    }

    const userId = payload.sub as string;
    const scope = (payload.scope as string) || '';

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'invalid_token' }, { status: 401 });

    const claims: any = {};
    if (scope.includes('openid')) claims.sub = user.id;
    if (scope.includes('profile')) claims.name = user.name;
    if (scope.includes('email')) claims.email = user.email;

    return NextResponse.json(claims);
  } catch (error) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
