import jwt, { SignOptions } from 'jsonwebtoken';
import type { UserPublic } from '@spanish-class/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

export interface JwtPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export function generateToken(user: UserPublic): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
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
