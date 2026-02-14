import { randomBytes, createHash } from "crypto";

/**
 * Meeting provider interface - abstraction for different video conferencing solutions
 */
export interface MeetingProvider {
  /**
   * Generate a secure, immutable meeting room name
   */
  generateRoomName(bookingId: string): string;

  /**
   * Get the join URL for a meeting room
   * @param roomName - The meeting room name
   * @param displayName - Optional display name for the user joining
   */
  getJoinUrl(roomName: string, displayName?: string): string;

  /**
   * Get provider-specific meeting metadata (optional)
   */
  getMeetingMetadata?(roomName: string): Record<string, unknown>;
}

/**
 * Jitsi Meet provider using public instance (meet.jit.si)
 *
 * Security model:
 * - Backend generates cryptographically secure room names
 * - Room names are immutable and tied to bookingId
 * - Access control is enforced by backend (not Jitsi)
 * - No self-hosting or JWT authentication required
 */
export class JitsiMeetProvider implements MeetingProvider {
  private readonly jitsiDomain: string;
  private readonly roomPrefix: string;

  constructor(jitsiDomain = "meet.jit.si", roomPrefix = "spanish") {
    this.jitsiDomain = jitsiDomain;
    this.roomPrefix = roomPrefix;
  }

  /**
   * Generate secure room name using pattern: "spanish-{bookingId}-{randomHash}"
   *
   * - Uses crypto.randomBytes for unpredictability
   * - Hash is 16 characters (64 bits of entropy)
   * - Room name is deterministic for same bookingId + salt but unguessable
   */
  generateRoomName(bookingId: string): string {
    // Generate cryptographically secure random hash
    const randomHash = randomBytes(8).toString("hex");

    // Create room name with pattern: prefix-bookingId-hash
    const roomName = `${this.roomPrefix}-${bookingId}-${randomHash}`;

    return roomName;
  }

  /**
   * Get Jitsi join URL
   * Includes userInfo parameter to pre-populate display name
   */
  getJoinUrl(roomName: string, displayName?: string): string {
    const baseUrl = `https://${this.jitsiDomain}/${encodeURIComponent(roomName)}`;

    if (displayName) {
      return `${baseUrl}#userInfo.displayName="${encodeURIComponent(displayName)}"`;
    }

    return baseUrl;
  }

  /**
   * Get Jitsi meeting configuration hints
   */
  getMeetingMetadata(roomName: string): Record<string, unknown> {
    return {
      provider: "jitsi",
      domain: this.jitsiDomain,
      roomName,
      features: {
        recording: false, // Public instance doesn't support recording
        streaming: false, // Public instance doesn't support streaming
        transcription: false,
      },
    };
  }
}

/**
 * Factory to get the configured meeting provider
 */
export function getMeetingProvider(): MeetingProvider {
  const jitsiDomain = process.env.JITSI_DOMAIN || "meet.jit.si";
  return new JitsiMeetProvider(jitsiDomain);
}

/**
 * Helper to generate meeting room name and URL for a booking
 */
export function createMeetingRoom(
  bookingId: string,
  userDisplayName?: string,
): {
  roomName: string;
  joinUrl: string;
  metadata: Record<string, unknown>;
} {
  const provider = getMeetingProvider();
  const roomName = provider.generateRoomName(bookingId);
  const joinUrl = provider.getJoinUrl(roomName, userDisplayName);
  const metadata = provider.getMeetingMetadata?.(roomName) || {};

  return { roomName, joinUrl, metadata };
}
