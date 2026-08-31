import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const mfaVerifySchema = z.object({
  code: z.string().length(6, 'MFA code must be exactly 6 digits').regex(/^\d+$/, 'MFA code must contain only digits'),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roles: z.array(z.string()).min(1, 'At least one role must be selected'),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  roles: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ['confirmPassword'],
});

export const oauthAppSchema = z.object({
  name: z.string().min(2, 'App name must be at least 2 characters'),
  redirectUris: z.array(z.string().url('Invalid URL')),
  allowedScopes: z.array(z.string()).min(1, 'At least one scope must be selected'),
});

export const securityPolicySchema = z.object({
  passwordMinLength: z.number().min(8).max(128),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
  mfaEnforced: z.boolean(),
  sessionTimeoutMinutes: z.number().min(5).max(1440),
  maxLoginAttempts: z.number().min(3).max(10),
  lockoutDurationMinutes: z.number().min(5).max(1440),
});
