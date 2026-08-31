export const Permissions = {
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  AUDIT_READ: 'audit:read',
  AUDIT_EXPORT: 'audit:export',
  SETTINGS_READ: 'settings:read',
  SETTINGS_MANAGE: 'settings:manage',
  OAUTH_CREATE: 'oauth:create',
  OAUTH_READ: 'oauth:read',
  OAUTH_MANAGE: 'oauth:manage',
  DASHBOARD_READ: 'dashboard:read',
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

export const RolePermissions: Record<string, Permission[]> = {
  SUPER_ADMIN: Object.values(Permissions),
  IAM_ADMIN: [
    Permissions.USER_CREATE, Permissions.USER_READ, Permissions.USER_UPDATE, Permissions.USER_DELETE,
    Permissions.AUDIT_READ, Permissions.DASHBOARD_READ,
    Permissions.OAUTH_CREATE, Permissions.OAUTH_READ, Permissions.OAUTH_MANAGE
  ],
  AUDITOR: [
    Permissions.AUDIT_READ, Permissions.AUDIT_EXPORT,
    Permissions.DASHBOARD_READ, Permissions.USER_READ
  ],
  USER: [
    Permissions.DASHBOARD_READ
  ]
};

export function getUserPermissions(userRoles: string[]): Set<Permission> {
  const permissions = new Set<Permission>();
  for (const role of userRoles) {
    const rolePerms = RolePermissions[role.toUpperCase()];
    if (rolePerms) {
      for (const perm of rolePerms) {
        permissions.add(perm);
      }
    }
  }
  return permissions;
}

export function hasPermission(userRoles: string[], permission: Permission): boolean {
  const permissions = getUserPermissions(userRoles);
  return permissions.has(permission);
}
