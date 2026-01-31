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
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    req.user = user;
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
