import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from './db';
import { AuthPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function signAccessToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(encodedSecret);
}

export async function signRefreshToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedSecret);
}

export async function signToken(userId: string, sessionId: string, type: 'access' | 'refresh'): Promise<string> {
  const payload: AuthPayload = { userId, sessionId };
  if (type === 'access') return signAccessToken(payload);
  return signRefreshToken(payload);
}

export async function signTempMfaToken(userId: string): Promise<string> {
  return new SignJWT({ userId, type: 'temp_mfa' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(encodedSecret);
}

export async function verifyTempMfaToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    if (payload.type !== 'temp_mfa') return null;
    return payload as unknown as { userId: string };
  } catch (error) {
    return null;
  }
}

export async function verifyToken(token: string, type?: 'access' | 'refresh'): Promise<AuthPayload> {
  const { payload } = await jwtVerify(token, encodedSecret);
  return payload as unknown as AuthPayload;
}

export async function verifyAccessToken(token: string): Promise<AuthPayload> {
  const { payload } = await jwtVerify(token, encodedSecret);
  return payload as unknown as AuthPayload;
}

export async function verifyRefreshToken(token: string): Promise<AuthPayload> {
  const { payload } = await jwtVerify(token, encodedSecret);
  return payload as unknown as AuthPayload;
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  });

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}

export async function getTokenFromCookies(request?: NextRequest): Promise<string | null> {
  if (request) {
    return request.cookies.get('access_token')?.value || null;
  }
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value || null;
}

export async function getCurrentUser(request?: NextRequest) {
  try {
    const token = await getTokenFromCookies(request);
    if (!token) return null;

    const payload = await verifyAccessToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { roles: { include: { role: true } } },
    });

    return user;
  } catch (error) {
    return null;
  }
}
