import { prisma } from './db';

export const EventType = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  MFA_ENABLED: 'MFA_ENABLED',
  MFA_DISABLED: 'MFA_DISABLED',
  MFA_VERIFIED: 'MFA_VERIFIED',
  MFA_FAILED: 'MFA_FAILED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  ROLE_CHANGED: 'ROLE_CHANGED',
  OAUTH_APP_CREATED: 'OAUTH_APP_CREATED',
  OAUTH_CONSENT_GRANTED: 'OAUTH_CONSENT_GRANTED',
  OAUTH_CONSENT_DENIED: 'OAUTH_CONSENT_DENIED',
  SESSION_REVOKED: 'SESSION_REVOKED',
  ALL_SESSIONS_REVOKED: 'ALL_SESSIONS_REVOKED',
  POLICY_UPDATED: 'POLICY_UPDATED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
} as const;

export type EventTypeKeys = keyof typeof EventType;

export const Severity = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
} as const;

export type SeverityKeys = keyof typeof Severity;

interface AuditEventParams {
  userId?: string;
  eventType: string;
  severity: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export async function logAuditEvent({
  userId,
  eventType,
  severity,
  description,
  ipAddress,
  userAgent,
  metadata
}: AuditEventParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        eventType,
        severity,
        description,
        ipAddress,
        userAgent,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      }
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

export async function logEvent(params: { action: string; userId?: string; ipAddress?: string; userAgent?: string; details?: any; severity?: string }) {
  await logAuditEvent({
    eventType: params.action,
    description: params.action,
    severity: params.severity || 'INFO',
    userId: params.userId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: params.details
  });
}
