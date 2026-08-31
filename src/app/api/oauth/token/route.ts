import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import * as jose from 'jose';

export async function POST(request: Request) {
  try {
    let data;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      data = Object.fromEntries(params.entries());
    } else {
      data = await request.json();
    }

    const grant_type = data.grant_type;
    let client_id = data.client_id;
    let client_secret = data.client_secret;

    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Basic ')) {
      const decoded = Buffer.from(authHeader.substring(6), 'base64').toString('utf8');
      [client_id, client_secret] = decoded.split(':');
    }

    if (!client_id || !client_secret) return NextResponse.json({ error: 'invalid_client' }, { status: 401 });

    const app = await db.application.findUnique({ where: { clientId: client_id } });
    if (!app || app.clientSecret !== client_secret) return NextResponse.json({ error: 'invalid_client' }, { status: 401 });

    if (grant_type === 'authorization_code') {
      const code = data.code;
      const code_verifier = data.code_verifier;
      const redirect_uri = data.redirect_uri;

      const authCode = await db.authorizationCode.findUnique({ where: { code } });
      if (!authCode || authCode.clientId !== client_id || authCode.redirectUri !== redirect_uri || authCode.used || authCode.expiresAt < new Date()) {
        return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
      }

      if (authCode.codeChallenge) {
        if (!code_verifier) return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
        if (authCode.codeChallengeMethod === 'S256') {
          const hash = crypto.createHash('sha256').update(code_verifier).digest('base64url');
          if (hash !== authCode.codeChallenge) return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
        } else {
          if (code_verifier !== authCode.codeChallenge) return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
        }
      }

      await db.authorizationCode.update({ where: { id: authCode.id }, data: { used: true } });

      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
      const access_token = await new jose.SignJWT({ sub: authCode.userId, client_id, scope: authCode.scope })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(secret);

      const refresh_token = crypto.randomBytes(40).toString('hex');
      const expiresAt = new Date(Date.now() + 3600 * 1000);

      await db.oAuthToken.create({
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
          clientId: client_id,
          userId: authCode.userId,
          scope: authCode.scope || '',
          expiresAt
        }
      });

      return NextResponse.json({
        access_token,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token,
        scope: authCode.scope
      });
    }

    return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
