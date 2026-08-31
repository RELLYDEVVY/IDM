import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logEvent } from '@/lib/audit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  roleId: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !await hasPermission(user.id, 'user:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }
    if (status) {
      whereClause.status = status;
    }
    if (role) {
      whereClause.roles = {
        some: { role: { name: role } }
      };
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: { roles: { include: { role: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where: whereClause })
    ]);

    // Omit passwords
    const safeUsers = users.map(({ password, ...u }) => u);

    return NextResponse.json({
      data: safeUsers,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !await hasPermission(currentUser.id, 'user:create')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createUserSchema.parse(body);

    const existingUser = await db.user.findUnique({ where: { email: validated.email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    const newUser = await db.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        password: hashedPassword,
        roles: {
          create: { roleId: validated.roleId }
        },
        passwordHistory: {
          create: { hash: hashedPassword }
        }
      }
    });

    await logEvent({
      eventType: 'USER_CREATED',
      userId: currentUser.id,
      targetId: newUser.id,
      details: { email: newUser.email }
    });

    return NextResponse.json({ id: newUser.id, email: newUser.email, name: newUser.name }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error in POST /api/users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
