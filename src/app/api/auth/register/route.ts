import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';
import { logEvent } from '@/lib/logger';
import { registerSchema } from '@/lib/validations';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import z from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { email, password, name } = result.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const emailVerifyToken = randomBytes(32).toString('hex');

    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        emailVerified: false,
        emailVerifyToken,
        status: 'ACTIVE',
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: 'USER' },
                create: { name: 'USER', description: 'Default user role' }
              }
            }
          }
        },
        passwordHistory: {
          create: {
            passwordHash: hashedPassword
          }
        }
      }
    });

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logEvent({
      action: 'USER_CREATED',
      userId: user.id,
      ipAddress: ip,
      userAgent,
      details: { email }
    });

    // Send the verification email using SendGrid
    await sendVerificationEmail(email, emailVerifyToken);

    return NextResponse.json({ message: 'User registered successfully, please verify your email', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
