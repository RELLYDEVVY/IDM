import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as otplib from 'otplib';
const { authenticator } = otplib;
import qrcode from 'qrcode';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateTOTPSecret(email: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, 'CloudIdentity', secret);
  return { secret, otpauth };
}

export function verifyTOTP(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}

export async function generateQRCode(otpauth: string): Promise<string> {
  return qrcode.toDataURL(otpauth);
}

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    codes.push(crypto.randomBytes(4).toString('hex'));
  }
  return codes;
}

export async function hashBackupCode(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export function checkPasswordStrength(password: string) {
  let score = 0;
  let feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push('Password should be at least 8 characters long.');

  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score++;
  else feedback.push('Password should contain both lowercase and uppercase letters.');

  if (password.match(/\d/)) score++;
  else feedback.push('Password should contain at least one number.');

  if (password.match(/[^a-zA-Z\d]/)) score++;
  else feedback.push('Password should contain at least one special character.');

  return { score, feedback };
}
