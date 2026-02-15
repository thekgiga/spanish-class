import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";
import { randomBytes } from "crypto";
import type { Referral, ReferralStats } from "@spanish-class/shared";

/**
 * Generate a unique referral code for a user (T106)
 */
export async function generateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Create code from initials + random string
  const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
  const random = randomBytes(3).toString("hex").toUpperCase();
  return `${initials}${random}`;
}

/**
 * Get user's referral code (create if doesn't exist) (T107)
 */
export async function getUserReferralCode(userId: string): Promise<string> {
  // Check if user already has referrals (extract code from existing)
  const existingReferral = await prisma.referral.findFirst({
    where: { referrerId: userId },
    select: { referralCode: true },
  });

  if (existingReferral) {
    return existingReferral.referralCode;
  }

  // Generate new code
  return await generateReferralCode(userId);
}

/**
 * Track a referral (T108)
 */
export async function trackReferral(
  referralCode: string,
  referredId: string,
): Promise<Referral> {
  // Find referrer by code
  const existingReferral = await prisma.referral.findFirst({
    where: { referralCode },
  });

  if (!existingReferral) {
    throw new AppError(404, "Invalid referral code");
  }

  const referrerId = existingReferral.referrerId;

  // Prevent self-referral
  if (referrerId === referredId) {
    throw new AppError(400, "You cannot refer yourself");
  }

  // Check if already referred
  const alreadyReferred = await prisma.referral.findFirst({
    where: {
      referrerId,
      referredId,
    },
  });

  if (alreadyReferred) {
    throw new AppError(400, "This user has already been referred");
  }

  // Create referral
  const referral = await prisma.referral.create({
    data: {
      referrerId,
      referredId,
      referralCode,
      status: "pending",
    },
  });

  return referral as unknown as Referral;
}

/**
 * Get referral statistics for a user (T109)
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
  });

  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter((r) => r.status === "completed").length;
  const pendingReferrals = referrals.filter((r) => r.status === "pending").length;
  const rewardsEarned = referrals.filter((r) => r.rewardGranted).length;

  return {
    totalReferrals,
    completedReferrals,
    pendingReferrals,
    rewardsEarned,
  };
}
