import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');
  
  // Clean up existing data to avoid conflicts on re-run
  await prisma.auditLog.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.passwordHistory.deleteMany({});
  await prisma.oAuthApp.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.securityPolicy.deleteMany({});
  
  // 1. Security Policy
  console.log('Seeding Security Policy...');
  const policy = await prisma.securityPolicy.create({
    data: {
      minPasswordLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiryDays: 90,
      maxFailedAttempts: 5,
      lockoutDurationMinutes: 30,
      mfaPolicy: 'OPTIONAL'
    }
  });

  // 2. Permissions
  console.log('Seeding Permissions...');
  const permNames = [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'audit:read', 'audit:export',
    'settings:read', 'settings:manage',
    'oauth:create', 'oauth:read', 'oauth:manage',
    'dashboard:read'
  ];
  
  const permissions = await Promise.all(
    permNames.map(name => {
      const [resource, action] = name.split(':');
      return prisma.permission.create({ 
        data: { 
          name, 
          description: `Permission for ${name}`,
          resource,
          action
        } 
      });
    })
  );
  
  const permMap = permissions.reduce((acc, p) => {
    acc[p.name] = p.id;
    return acc;
  }, {} as Record<string, string>);

  // 3. Roles with permission assignments
  console.log('Seeding Roles...');
  const roleConfigs = [
    {
      name: 'SUPER_ADMIN',
      description: 'System Administrator with full access',
      permissions: permNames
    },
    {
      name: 'IAM_ADMIN',
      description: 'Identity and Access Management Administrator',
      permissions: ['user:create', 'user:read', 'user:update', 'user:delete', 'audit:read', 'dashboard:read', 'oauth:create', 'oauth:read', 'oauth:manage']
    },
    {
      name: 'AUDITOR',
      description: 'Security Auditor with read-only access',
      permissions: ['audit:read', 'audit:export', 'dashboard:read', 'user:read']
    },
    {
      name: 'USER',
      description: 'Standard User',
      permissions: ['dashboard:read']
    }
  ];

  const roles = [];
  for (const rc of roleConfigs) {
    const role = await prisma.role.create({
      data: {
        name: rc.name,
        description: rc.description,
        permissions: {
          create: rc.permissions.map(pName => ({
            permissionId: permMap[pName]
          }))
        }
      }
    });
    roles.push(role);
  }

  const roleMap = roles.reduce((acc, r) => {
    acc[r.name] = r.id;
    return acc;
  }, {} as Record<string, string>);

  // 4. Users
  console.log('Seeding Users...');
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const auditHash = await bcrypt.hash('Audit@123', 12);
  const userHash = await bcrypt.hash('User@1234', 12);

  const usersData = [
    { email: 'admin@cloudguard.com', passwordHash: adminHash, name: 'System Administrator', roleId: roleMap['SUPER_ADMIN'], emailVerified: true, status: 'ACTIVE' },
    { email: 'iam.admin@cloudguard.com', passwordHash: adminHash, name: 'IAM Administrator', roleId: roleMap['IAM_ADMIN'], emailVerified: true, status: 'ACTIVE' },
    { email: 'auditor@cloudguard.com', passwordHash: auditHash, name: 'Security Auditor', roleId: roleMap['AUDITOR'], emailVerified: true, status: 'ACTIVE' },
    { email: 'john.doe@example.com', passwordHash: userHash, name: 'John Doe', roleId: roleMap['USER'], emailVerified: true, status: 'ACTIVE' },
    { email: 'jane.smith@example.com', passwordHash: userHash, name: 'Jane Smith', roleId: roleMap['USER'], emailVerified: true, status: 'SUSPENDED' }
  ];

  const users = await Promise.all(
    usersData.map(u => {
      const { roleId, ...userData } = u;
      return prisma.user.create({ 
        data: {
          ...userData,
          roles: {
            create: { roleId }
          }
        } 
      });
    })
  );

  const adminUser = users.find(u => u.email === 'admin@cloudguard.com')!;
  const johnUser = users.find(u => u.email === 'john.doe@example.com')!;

  // 5. Sessions
  console.log('Seeding Sessions...');
  await prisma.session.createMany({
    data: [
      { userId: adminUser.id, token: crypto.randomBytes(32).toString('hex'), ipAddress: '192.168.1.10', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) },
      { userId: adminUser.id, token: crypto.randomBytes(32).toString('hex'), ipAddress: '10.0.0.5', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) },
      { userId: johnUser.id, token: crypto.randomBytes(32).toString('hex'), ipAddress: '192.168.1.15', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) }
    ]
  });

  // 6. OAuth Apps
  console.log('Seeding OAuth Apps...');
  await prisma.oAuthApp.createMany({
    data: [
      {
        name: "Employee Portal",
        clientId: "754c9386d7c0b26bb7ee203392ec6f3a",
        clientSecret: "63bd4bddb7bc8a58407f9a7e20e35de524140e6728fb4e526e5a3861cf5af550",
        redirectUris: "http://localhost:4000/callback",
        allowedScopes: "openid profile email",
        createdById: adminUser.id
      },
      {
        name: "HR Management System",
        clientId: "3653f78efc7b83ab186899f824c3738d",
        clientSecret: "c30cf5997dda8ddd56eabefa90cf33822c36cbf8df37502a18b622a66f44ddb3",
        redirectUris: "http://localhost:5000/callback",
        allowedScopes: "openid email",
        createdById: adminUser.id
      }
    ]
  });

  // 7. Audit Logs
  console.log('Seeding Audit Logs...');
  const auditLogs = [];
  const events = ['LOGIN_SUCCESS', 'LOGIN_FAILURE', 'PASSWORD_CHANGED', 'MFA_ENABLED', 'USER_CREATED', 'ROLE_CHANGED', 'POLICY_UPDATED', 'SESSION_REVOKED', 'ACCOUNT_LOCKED'];
  const severities = ['INFO', 'WARNING', 'CRITICAL'];
  const ips = ['192.168.1.10', '10.0.0.5', '192.168.1.15', '185.12.34.56', '203.0.113.1'];
  
  for (let i = 0; i < 55; i++) {
    const isBruteForce = i >= 40 && i < 48; // Cluster of failures
    
    let event = events[Math.floor(Math.random() * events.length)];
    let severity = severities[0]; // INFO default
    let ip = ips[Math.floor(Math.random() * ips.length)];
    let userId = users[Math.floor(Math.random() * users.length)].id;
    
    if (isBruteForce) {
      event = 'LOGIN_FAILURE';
      severity = 'WARNING';
      ip = '185.12.34.56'; // Suspicious IP
      userId = adminUser.id; // Targeting admin
    } else if (i === 48) {
      event = 'ACCOUNT_LOCKED';
      severity = 'CRITICAL';
      ip = '185.12.34.56';
      userId = adminUser.id;
    } else if (event === 'LOGIN_FAILURE') {
      severity = 'WARNING';
    } else if (event === 'POLICY_UPDATED') {
      severity = 'INFO';
      userId = adminUser.id;
    }
    
    // Spread over last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    auditLogs.push({
      eventType: event,
      userId: userId,
      ipAddress: ip,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      metadata: JSON.stringify({ reason: 'Simulated audit event' }),
      description: 'Simulated audit event',
      severity: severity,
      createdAt: date
    });
  }
  
  await prisma.auditLog.createMany({ data: auditLogs });

  // 8. Password History
  console.log('Seeding Password History...');
  await prisma.passwordHistory.createMany({
    data: [
      { userId: adminUser.id, passwordHash: await bcrypt.hash('OldAdmin@123', 12) },
      { userId: adminUser.id, passwordHash: await bcrypt.hash('OlderAdmin@123', 12) },
      { userId: johnUser.id, passwordHash: await bcrypt.hash('OldUser@1234', 12) }
    ]
  });

  console.log('-------------------------------------------');
  console.log('Seed completed successfully!');
  console.log(`- 1 Security Policy`);
  console.log(`- 12 Permissions`);
  console.log(`- 4 Roles`);
  console.log(`- 5 Users`);
  console.log(`- 3 Sessions`);
  console.log(`- 2 OAuth Apps`);
  console.log(`- 55 Audit Logs`);
  console.log(`- 3 Password History records`);
  console.log('-------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
