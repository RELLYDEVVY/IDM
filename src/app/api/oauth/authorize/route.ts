import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logEvent } from '@/lib/audit';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');

    if (!clientId) return NextResponse.json({ error: 'client_id required' }, { status: 400 });

    const app = await db.application.findUnique({ where: { clientId } });
    if (!app) return NextResponse.json({ error: 'Invalid client' }, { status: 400 });

    const uris = JSON.parse(app.redirectUris);
    if (!uris.includes(redirectUri)) return NextResponse.json({ error: 'Invalid redirect_uri' }, { status: 400 });

    return NextResponse.json({
      name: app.name,
      requestedScopes: searchParams.get('scope')?.split(' ') || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { client_id, redirect_uri, response_type, scope, state, code_challenge, code_challenge_method, approved } = body;

    const app = await db.application.findUnique({ where: { clientId: client_id } });
    if (!app) return NextResponse.json({ error: 'Invalid client' }, { status: 400 });

    if (!approved) {
      await logEvent({ eventType: 'OAUTH_CONSENT_DENIED' as any, userId: user.id, targetId: app.id, details: {} });
      const redirect = new URL(redirect_uri);
      redirect.searchParams.set('error', 'access_denied');
      if (state) redirect.searchParams.set('state', state);
      return NextResponse.json({ redirect: redirect.toString() });
    }

    const code = crypto.randomBytes(32).toString('hex');
    await db.authorizationCode.create({
      data: {
        code,
        clientId: client_id,
        userId: user.id,
        redirectUri: redirect_uri,
        scope,
        codeChallenge: code_challenge,
        codeChallengeMethod: code_challenge_method,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    await logEvent({ eventType: 'OAUTH_CONSENT_GRANTED' as any, userId: user.id, targetId: app.id, details: { scope } });

    const redirect = new URL(redirect_uri);
    redirect.searchParams.set('code', code);
    if (state) redirect.searchParams.set('state', state);
    
    return NextResponse.json({ redirect: redirect.toString() });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
