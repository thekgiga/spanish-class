import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { generateToken } from '../lib/jwt.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { loginSchema, registerSchema } from '@spanish-class/shared';
import { AppError } from '../middleware/error.js';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, timezone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, 'An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user (always as student, admin created via seed)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        timezone: timezone || 'Europe/Madrid',
        isAdmin: false,
      },
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

    // Generate token
    const token = generateToken(user);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Prepare user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      timezone: user.timezone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Generate token
    const token = generateToken(userData);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
