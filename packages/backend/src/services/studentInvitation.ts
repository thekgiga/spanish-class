import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";

const INVITE_EXPIRY_DAYS = 7;

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Create a student invitation email for an unregistered user.
 * If the email already belongs to a registered non-admin user,
 * returns { alreadyRegistered: true, userId } so the caller can
 * call assignStudent directly instead.
 */
export async function createStudentInvitation(
  professorId: string,
  email: string,
): Promise<{ tokenRaw: string; expiresAt: Date } | { alreadyRegistered: true; userId: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if already registered
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, isAdmin: true, deletedAt: true },
  });

  if (existingUser && !existingUser.isAdmin && !existingUser.deletedAt) {
    return { alreadyRegistered: true, userId: existingUser.id };
  }

  // Check for an existing pending (non-expired, non-accepted) invitation
  const existing = await prisma.studentInvitation.findFirst({
    where: {
      professorId,
      email: normalizedEmail,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (existing) {
    throw new AppError(409, "A pending invitation already exists for this email");
  }

  const tokenRaw = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(tokenRaw);
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.studentInvitation.create({
    data: {
      professorId,
      email: normalizedEmail,
      tokenHash,
      expiresAt,
    },
  });

  return { tokenRaw, expiresAt };
}

/**
 * Assign (or reassign) a student to a professor.
 * allowOverride=false throws 409 if the student is already assigned to a different professor.
 * allowOverride=true replaces the existing assignment.
 */
export async function assignStudent(
  professorId: string,
  studentId: string,
  allowOverride = false,
): Promise<void> {
  if (!allowOverride) {
    const existing = await prisma.professorStudent.findUnique({
      where: { studentId },
    });
    if (existing && existing.professorId !== professorId) {
      throw new AppError(409, "This student is already assigned to another professor");
    }
  }

  await prisma.professorStudent.upsert({
    where: { studentId },
    update: { professorId },
    create: { professorId, studentId },
  });
}

/**
 * Remove a professor–student assignment.
 * Verifies the calling professor owns the assignment.
 */
export async function unassignStudent(
  professorId: string,
  studentId: string,
): Promise<void> {
  const record = await prisma.professorStudent.findUnique({
    where: { studentId },
  });
  if (!record) throw new AppError(404, "Assignment not found");
  if (record.professorId !== professorId) {
    throw new AppError(403, "You are not the primary professor for this student");
  }

  await prisma.professorStudent.delete({ where: { studentId } });
}

/**
 * Create StudentCover records for a cover period.
 * If applyToAllStudents=true, all students assigned to the calling professor are covered.
 * Otherwise only the specified studentIds are covered.
 */
export async function createCover(
  professorId: string,
  coverProfessorId: string,
  studentIds: string[] | undefined,
  applyToAllStudents: boolean,
  startsAt: Date,
  endsAt: Date,
): Promise<{ count: number }> {
  if (startsAt >= endsAt) {
    throw new AppError(400, "endsAt must be after startsAt");
  }

  // Verify cover professor exists and is admin
  const coverProf = await prisma.user.findFirst({
    where: { id: coverProfessorId, isAdmin: true, deletedAt: null },
  });
  if (!coverProf) throw new AppError(404, "Cover professor not found");
  if (coverProfessorId === professorId) {
    throw new AppError(400, "Cover professor must be different from the primary professor");
  }

  let targetStudentIds: string[];

  if (applyToAllStudents) {
    const assignments = await prisma.professorStudent.findMany({
      where: { professorId },
      select: { studentId: true },
    });
    targetStudentIds = assignments.map((a) => a.studentId);
  } else {
    // Verify all provided studentIds belong to this professor
    const assignments = await prisma.professorStudent.findMany({
      where: { professorId, studentId: { in: studentIds ?? [] } },
      select: { studentId: true },
    });
    targetStudentIds = assignments.map((a) => a.studentId);
  }

  if (targetStudentIds.length === 0) {
    throw new AppError(400, "No valid students found for cover assignment");
  }

  const result = await prisma.studentCover.createMany({
    data: targetStudentIds.map((studentId) => ({
      studentId,
      coverProfessorId,
      startsAt,
      endsAt,
    })),
  });

  return { count: result.count };
}

/**
 * Delete a cover period record.
 * Only allows deletion if any of the covered students belong to the calling professor.
 */
export async function deleteCover(coverId: string, professorId: string): Promise<void> {
  const cover = await prisma.studentCover.findUnique({
    where: { id: coverId },
    include: {
      student: {
        include: { assignedProfessor: { select: { professorId: true } } },
      },
    },
  });

  if (!cover) throw new AppError(404, "Cover period not found");

  if (cover.student.assignedProfessor?.professorId !== professorId) {
    throw new AppError(403, "You are not the primary professor for this student");
  }

  await prisma.studentCover.delete({ where: { id: coverId } });
}

/**
 * Accept a student invitation — assign the registered user to the inviting professor.
 * Idempotent: no-op if already accepted. Fails silently if token not found (called non-blocking).
 */
export async function acceptStudentInvitation(
  tokenRaw: string,
  registeredUserId: string,
): Promise<void> {
  const tokenHash = hashToken(tokenRaw);

  const invitation = await prisma.studentInvitation.findUnique({
    where: { tokenHash },
    include: { professor: { select: { id: true } } },
  });

  if (!invitation) return; // silently ignore — may have been deleted or wrong token

  if (invitation.acceptedAt) return; // already accepted — idempotent

  if (invitation.expiresAt < new Date()) {
    throw new AppError(400, "Invitation has expired");
  }

  await assignStudent(invitation.professorId, registeredUserId, true);

  await prisma.studentInvitation.update({
    where: { id: invitation.id },
    data: { acceptedAt: new Date() },
  });
}

/**
 * Look up invitation metadata by raw token.
 * Used by GET /auth/accept-invitation for the redirect decision.
 */
export async function getInvitationByToken(tokenRaw: string): Promise<{
  id: string;
  professorId: string;
  professorName: string;
  email: string;
  expired: boolean;
  accepted: boolean;
}> {
  const tokenHash = hashToken(tokenRaw);

  const invitation = await prisma.studentInvitation.findUnique({
    where: { tokenHash },
    include: {
      professor: { select: { firstName: true, lastName: true } },
    },
  });

  if (!invitation) throw new AppError(400, "Invalid invitation link");

  return {
    id: invitation.id,
    professorId: invitation.professorId,
    professorName: `${invitation.professor.firstName} ${invitation.professor.lastName}`,
    email: invitation.email,
    expired: invitation.expiresAt < new Date(),
    accepted: invitation.acceptedAt !== null,
  };
}

/**
 * List pending (not yet accepted, not expired) invitations for a professor.
 */
export async function listPendingInvitations(professorId: string): Promise<
  Array<{ id: string; email: string; expiresAt: Date; createdAt: Date }>
> {
  const now = new Date();
  return prisma.studentInvitation.findMany({
    where: {
      professorId,
      acceptedAt: null,
      expiresAt: { gt: now },
    },
    select: { id: true, email: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}
