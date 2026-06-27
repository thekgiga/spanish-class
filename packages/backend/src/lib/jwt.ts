import jwt, { SignOptions } from 'jsonwebtoken';
import type { UserPublic } from '@spanish-class/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  (process.env.NODE_ENV === 'production' ? '4h' : '7d')) as SignOptions['expiresIn'];

export interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  tokenVersion?: number;
  twoFactorPending?: boolean;
}

export function generateToken(
  user: UserPublic,
  options?: { twoFactorPending?: boolean; tokenVersion?: number }
): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    ...(options?.tokenVersion !== undefined ? { tokenVersion: options.tokenVersion } : {}),
    ...(options?.twoFactorPending ? { twoFactorPending: true } : {}),
  };

  const expiresIn = options?.twoFactorPending
    ? '5m'
    : JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'];

  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
}
