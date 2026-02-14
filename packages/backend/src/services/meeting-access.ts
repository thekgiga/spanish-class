import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";
import type { UserPublic } from "@spanish-class/shared";
import { getMeetingProvider } from "./meeting-provider.js";

/**
 * Meeting access control service
 * Validates user authorization to join a meeting room
 */

export interface MeetingAccessResult {
  authorized: boolean;
  slot: {
    id: string;
    title: string | null;
    startTime: Date;
    endTime: Date;
    status: string;
  };
  userRole: "professor" | "student";
  meetingUrl: string;
  booking?: {
    id: string;
    status: string;
  };
}

/**
 * Validate if a user can join a meeting
 *
 * Access control rules:
 * 1. Slot must exist and have a meeting room
 * 2. User must be either:
 *    - The professor who owns the slot
 *    - A student with a CONFIRMED booking for the slot
 * 3. Time window validation:
 *    - Can join up to 15 minutes before start time
 *    - Cannot join more than 30 minutes after end time
 * 4. Slot must not be CANCELLED
 */
export async function validateMeetingAccess(
  slotId: string,
  user: UserPublic,
): Promise<MeetingAccessResult> {
  // Fetch slot with bookings and professor info
  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: slotId },
    include: {
      professor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      bookings: {
        where: {
          studentId: user.id,
          status: "CONFIRMED",
        },
      },
    },
  });

  if (!slot) {
    throw new AppError(404, "Slot not found");
  }

  if (!slot.meetLink) {
    throw new AppError(
      400,
      "This slot does not have a meeting room configured",
    );
  }

  // Check if slot is cancelled
  if (slot.status === "CANCELLED") {
    throw new AppError(403, "This slot has been cancelled");
  }

  // Determine user role and authorization
  const isProfessor = user.id === slot.professorId;
  const hasConfirmedBooking = slot.bookings.length > 0;

  if (!isProfessor && !hasConfirmedBooking) {
    throw new AppError(403, "You are not authorized to join this meeting");
  }

  // Time window validation
  const now = new Date();
  const startTime = new Date(slot.startTime);
  const endTime = new Date(slot.endTime);

  // Allow joining 15 minutes before start
  const earlyJoinWindow = 15 * 60 * 1000; // 15 minutes in ms
  const earliestJoinTime = new Date(startTime.getTime() - earlyJoinWindow);

  // Allow joining up to 30 minutes after end (for overruns)
  const lateJoinWindow = 30 * 60 * 1000; // 30 minutes in ms
  const latestJoinTime = new Date(endTime.getTime() + lateJoinWindow);

  if (now < earliestJoinTime) {
    const minutesUntilStart = Math.ceil(
      (startTime.getTime() - now.getTime()) / (60 * 1000),
    );
    throw new AppError(
      403,
      `This meeting is not yet available. You can join ${minutesUntilStart} minutes before the start time.`,
    );
  }

  if (now > latestJoinTime) {
    throw new AppError(
      403,
      "This meeting has ended and is no longer available",
    );
  }

  // Get meeting URL with user's display name
  const provider = getMeetingProvider();
  const displayName = `${user.firstName} ${user.lastName}`;
  const meetingUrl = provider.getJoinUrl(slot.meetLink, displayName);

  // Log meeting join attempt
  console.log("[Meeting Access] User joining meeting", {
    slotId: slot.id,
    userId: user.id,
    userRole: isProfessor ? "professor" : "student",
    meetLink: slot.meetLink,
    timestamp: now.toISOString(),
  });

  return {
    authorized: true,
    slot: {
      id: slot.id,
      title: slot.title,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
    },
    userRole: isProfessor ? "professor" : "student",
    meetingUrl,
    booking: hasConfirmedBooking
      ? {
          id: slot.bookings[0].id,
          status: slot.bookings[0].status,
        }
      : undefined,
  };
}

/**
 * Validate if a user can access a meeting by room name
 * This is useful when users try to join via a direct link
 */
export async function validateMeetingAccessByRoomName(
  roomName: string,
  user: UserPublic,
): Promise<MeetingAccessResult> {
  const slot = await prisma.availabilitySlot.findFirst({
    where: { meetLink: roomName },
  });

  if (!slot) {
    throw new AppError(404, "Meeting room not found");
  }

  return validateMeetingAccess(slot.id, user);
}

/**
 * Get meeting details for a slot (without full access validation)
 * Used for displaying meeting info in booking details
 */
export async function getMeetingDetails(slotId: string, user: UserPublic) {
  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: slotId },
    include: {
      professor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      bookings: {
        where: {
          studentId: user.id,
        },
      },
    },
  });

  if (!slot) {
    throw new AppError(404, "Slot not found");
  }

  // Check authorization (professor or has booking)
  const isProfessor = user.id === slot.professorId;
  const hasBooking = slot.bookings.length > 0;

  if (!isProfessor && !hasBooking) {
    throw new AppError(403, "You are not authorized to view this meeting");
  }

  const provider = getMeetingProvider();
  const displayName = `${user.firstName} ${user.lastName}`;

  return {
    slotId: slot.id,
    title: slot.title,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: slot.status,
    meetLink: slot.meetLink,
    meetingUrl: slot.meetLink
      ? provider.getJoinUrl(slot.meetLink, displayName)
      : null,
    professor: {
      name: `${slot.professor.firstName} ${slot.professor.lastName}`,
    },
  };
}
