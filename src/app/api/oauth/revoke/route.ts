import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.text();
    const params = new URLSearchParams(data);
    const token = params.get('token');

    if (token) {
      await db.oAuthToken.deleteMany({
        where: {
          OR: [
            { accessToken: token },
            { refreshToken: token }
          ]
        }
      });
    }

    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
