import { Prisma } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  email: string;
  roles: string[];
}

export type UserWithRoles = Prisma.UserGetPayload<{
  include: { roles: { include: { role: true } } }
}>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export type AuditLogEntry = Prisma.AuditLogGetPayload<{}>;

export interface SecurityScoreData {
  score: number;
  metrics: {
    mfaEnabled: number;
    strongPasswords: number;
    activeSessions: number;
    recentIncidents: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  failedLogins: number;
  securityScore: number;
}

export interface LoginTrendData {
  date: string;
  success: number;
  failed: number;
}
