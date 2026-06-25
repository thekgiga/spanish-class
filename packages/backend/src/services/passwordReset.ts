import crypto from "crypto";
import { prisma } from "../lib/prisma.js";

const RESET_TOKEN_EXPIRY_HOURS = 1;

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  // Invalidate all existing pending tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId, usedAt: null },
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
  );

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt,
    },
  });

  return rawToken;
}

export async function validateAndConsumePasswordResetToken(
  rawToken: string,
): Promise<string> {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record) throw new Error("Invalid or expired reset link.");
  if (record.usedAt) throw new Error("This reset link has already been used.");
  if (record.expiresAt < new Date())
    throw new Error("This reset link has expired. Please request a new one.");

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record.userId;
}
