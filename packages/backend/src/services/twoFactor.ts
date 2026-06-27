import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const APP_NAME = process.env.APP_NAME || "SpanishClass";

// Encrypt TOTP secrets at rest using AES-256-GCM.
// A DB dump alone cannot produce valid TOTP codes without TWO_FACTOR_ENCRYPTION_KEY.
function getEncKey(): Buffer {
  const hex = process.env.TWO_FACTOR_ENCRYPTION_KEY || "";
  if (hex.length < 64) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("TWO_FACTOR_ENCRYPTION_KEY must be a 64-char hex string in production");
    }
    const fallback = (process.env.JWT_SECRET || "dev-fallback").padEnd(32, "x").slice(0, 32);
    return Buffer.from(fallback);
  }
  return Buffer.from(hex.slice(0, 64), "hex");
}

function encryptSecret(plaintext: string): string {
  const key = getEncKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptSecret(stored: string): string {
  const key = getEncKey();
  const [ivHex, tagHex, encHex] = stored.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

function generateRecoveryCodes(): string[] {
  return Array.from({ length: 8 }, () =>
    crypto.randomBytes(5).toString("hex").toUpperCase(),
  );
}

async function hashRecoveryCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((c) => bcrypt.hash(c, 10)));
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateTotpSetup(
  userId: string,
  email: string,
): Promise<{ otpauthUrl: string; qrCodeDataUrl: string; recoveryCodes: string[] }> {
  const secretObj = speakeasy.generateSecret({ length: 20, name: `${APP_NAME}:${email}`, issuer: APP_NAME });
  const base32Secret = secretObj.base32;
  const otpauthUrl = speakeasy.otpauthURL({
    secret: base32Secret,
    label: email,
    issuer: APP_NAME,
    encoding: "base32",
  });
  const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
  const plainCodes = generateRecoveryCodes();
  const hashedCodes = await hashRecoveryCodes(plainCodes);

  await prisma.userTwoFactor.upsert({
    where: { userId },
    update: {
      secretEncrypted: encryptSecret(base32Secret),
      enabled: false,
      verifiedAt: null,
      recoveryCodesJson: JSON.stringify(hashedCodes),
    },
    create: {
      userId,
      secretEncrypted: encryptSecret(base32Secret),
      enabled: false,
      recoveryCodesJson: JSON.stringify(hashedCodes),
    },
  });

  // Return plaintext codes once — never stored in plaintext
  return { otpauthUrl, qrCodeDataUrl, recoveryCodes: plainCodes };
}

export async function verifyAndEnableTotp(
  userId: string,
  code: string,
): Promise<boolean> {
  const tf = await prisma.userTwoFactor.findUnique({ where: { userId } });
  if (!tf) return false;

  const secret = decryptSecret(tf.secretEncrypted);
  const isValid = speakeasy.totp.verify({ secret, encoding: "base32", token: code, window: 1 });
  if (!isValid) return false;

  await prisma.userTwoFactor.update({
    where: { userId },
    data: { enabled: true, verifiedAt: new Date() },
  });
  return true;
}

export async function verifyTotpCode(userId: string, code: string): Promise<boolean> {
  const tf = await prisma.userTwoFactor.findUnique({ where: { userId } });
  if (!tf || !tf.enabled) return true; // 2FA not enrolled → pass through
  const secret = decryptSecret(tf.secretEncrypted);
  return speakeasy.totp.verify({ secret, encoding: "base32", token: code, window: 1 });
}

export async function verifyRecoveryCode(userId: string, code: string): Promise<boolean> {
  const tf = await prisma.userTwoFactor.findUnique({ where: { userId } });
  if (!tf || !tf.enabled || !tf.recoveryCodesJson) return false;

  const hashes: string[] = JSON.parse(tf.recoveryCodesJson);
  const normalised = code.toUpperCase();

  // Find the matching hash — bcrypt compare is timing-safe
  let matchIdx = -1;
  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(normalised, hashes[i])) {
      matchIdx = i;
      break;
    }
  }
  if (matchIdx === -1) return false;

  // Remove the used code (single-use)
  hashes.splice(matchIdx, 1);
  await prisma.userTwoFactor.update({
    where: { userId },
    data: { recoveryCodesJson: JSON.stringify(hashes) },
  });
  return true;
}

export async function isTotpRequired(userId: string): Promise<boolean> {
  const tf = await prisma.userTwoFactor.findUnique({ where: { userId } });
  return !!(tf?.enabled);
}

export async function disableTotp(userId: string): Promise<void> {
  await prisma.userTwoFactor.updateMany({
    where: { userId },
    data: { enabled: false, verifiedAt: null },
  });
}

// A5: Generate a fresh set of recovery codes, replacing the old ones.
// Returns the plaintext codes (shown to the user once, never stored in plaintext).
export async function regenerateRecoveryCodes(userId: string): Promise<string[]> {
  const tf = await prisma.userTwoFactor.findUnique({ where: { userId } });
  if (!tf || !tf.enabled) {
    throw new Error("2FA is not enabled for this account");
  }
  const plainCodes = generateRecoveryCodes();
  const hashedCodes = await hashRecoveryCodes(plainCodes);
  await prisma.userTwoFactor.update({
    where: { userId },
    data: { recoveryCodesJson: JSON.stringify(hashedCodes) },
  });
  return plainCodes;
}
