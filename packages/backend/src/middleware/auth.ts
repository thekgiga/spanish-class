import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import type { UserPublic } from '@spanish-class/shared';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: UserPublic;
      jwtPayload?: JwtPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Verify token
    const payload = verifyToken(token);
    req.jwtPayload = payload;

    // Block pre-auth (2FA pending) tokens from all endpoints except the 2FA verify/recovery routes
    if (payload.twoFactorPending) {
      const allowed2FAPaths = ['/api/auth/2fa/verify', '/api/auth/2fa/recovery'];
      if (!allowed2FAPaths.includes(req.path) && !allowed2FAPaths.some(p => req.originalUrl.startsWith(p))) {
        res.status(403).json({
          success: false,
          error: 'Two-factor authentication required',
        });
        return;
      }
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
        tokenVersion: true,
        deletedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    if (user.deletedAt) {
      res.status(401).json({
        success: false,
        error: 'Account has been deleted',
      });
      return;
    }

    const payloadVersion = payload.tokenVersion ?? 0;
    if (payloadVersion !== user.tokenVersion) {
      res.status(401).json({
        success: false,
        error: 'Session has been invalidated. Please log in again.',
      });
      return;
    }

    const { tokenVersion: _tv, deletedAt: _da, ...publicUser } = user;
    req.user = publicUser;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user?.isAdmin) {
    res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
    return;
  }
  next();
}

export function requireStudent(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.isAdmin) {
    res.status(403).json({
      success: false,
      error: 'Student access required',
    });
    return;
  }
  next();
}
