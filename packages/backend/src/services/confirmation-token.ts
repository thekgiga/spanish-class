import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const TOKEN_EXPIRY_HOURS = 48;

export interface ConfirmationTokenPayload {
  bookingId: string;
  professorId: string;
  studentId: string;
  jti: string;
  exp: number;
}

/**
 * Generate a confirmation token for booking approval
 */
export function generateConfirmationToken(
  bookingId: string,
  professorId: string,
  studentId: string,
): { token: string; expiresAt: Date; jti: string } {
  const jti = randomBytes(16).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

  const payload: ConfirmationTokenPayload = {
    bookingId,
    professorId,
    studentId,
    jti,
    exp: Math.floor(expiresAt.getTime() / 1000),
  };

  const token = jwt.sign(payload, JWT_SECRET);

  return { token, expiresAt, jti };
}

/**
 * Verify and decode a confirmation token
 */
export function verifyConfirmationToken(
  token: string,
): ConfirmationTokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ConfirmationTokenPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired confirmation token");
  }
}

/**
 * Check if a token has already been used
 */
export async function isTokenUsed(jti: string): Promise<boolean> {
  const usedToken = await prisma.usedConfirmationToken.findUnique({
    where: { jti },
  });
  return !!usedToken;
}

/**
 * Mark a token as used to prevent replay attacks
 */
export async function markTokenAsUsed(
  jti: string,
  bookingId: string,
): Promise<void> {
  await prisma.usedConfirmationToken.create({
    data: {
      jti,
      bookingId,
    },
  });
}

/**
 * Validate a confirmation token (verify signature and check if used)
 */
export async function validateConfirmationToken(
  token: string,
): Promise<ConfirmationTokenPayload> {
  const payload = verifyConfirmationToken(token);

  const tokenUsed = await isTokenUsed(payload.jti);
  if (tokenUsed) {
    throw new Error("Confirmation token has already been used");
  }

  return payload;
}
