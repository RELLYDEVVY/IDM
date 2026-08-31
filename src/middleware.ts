import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production'
);

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow MFA if mid-auth
  if (pathname === '/mfa' || pathname === '/auth/mfa') {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    const requestHeaders = new Headers(request.headers);
    if (payload.sub) requestHeaders.set('x-user-id', payload.sub);
    if (payload.email) requestHeaders.set('x-user-email', payload.email as string);
    if (payload.roles) requestHeaders.set('x-user-roles', JSON.stringify(payload.roles));
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth/login|api/auth/register|api/auth/verify-email|api/auth/forgot-password|api/auth/reset-password).*)',
  ],
};
