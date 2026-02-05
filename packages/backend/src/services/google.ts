import { google } from 'googleapis';
import type { AvailabilitySlot, UserPublic } from '@spanish-class/shared';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !privateKey) {
    console.warn('Google Calendar credentials not configured');
    return null;
  }

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: SCOPES,
  });
}

const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
const bookedCalendarId = process.env.GOOGLE_BOOKED_CALENDAR_ID;

interface CreateEventInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: { email: string; name: string }[];
}

interface EventResult {
  eventId: string;
  meetLink?: string;
}

export async function createCalendarEvent(input: CreateEventInput): Promise<EventResult | null> {
  const auth = getAuth();
  if (!auth) {
    console.warn('[Google Calendar] Auth not configured, skipping calendar event creation');
    return null;
  }

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    console.log('[Google Calendar] Creating event:', {
      title: input.title,
      startTime: input.startTime.toISOString(),
      endTime: input.endTime.toISOString(),
      calendarId,
    });

    const event = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: input.title,
        description: input.description,
        start: {
          dateTime: input.startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: input.endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: input.attendees?.map((a) => ({
          email: a.email,
          displayName: a.name,
        })),
        conferenceData: {
          createRequest: {
            requestId: `spanish-class-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'googleMeet',
            },
          },
        },
      },
    });

    const meetLink = event.data.conferenceData?.entryPoints?.[0]?.uri;

    // Log detailed info about Meet link creation
    if (!meetLink) {
      console.warn('[Google Calendar] Meet link NOT created. Conference data:', JSON.stringify(event.data.conferenceData, null, 2));
      console.warn('[Google Calendar] Note: Google Meet links require the calendar owner to have Google Workspace. Personal Gmail accounts cannot create Meet links via Calendar API.');
    } else {
      console.log('[Google Calendar] Event created successfully with Meet link:', meetLink);
    }

    return {
      eventId: event.data.id || '',
      meetLink: meetLink || undefined,
    };
  } catch (error) {
    console.error('[Google Calendar] Failed to create event:', error);
    return null;
  }
}

export async function updateCalendarEvent(
  eventId: string,
  updates: Partial<CreateEventInput>
): Promise<boolean> {
  const auth = getAuth();
  if (!auth) {
    return false;
  }

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const requestBody: Record<string, unknown> = {};

    if (updates.title) requestBody.summary = updates.title;
    if (updates.description !== undefined) requestBody.description = updates.description;
    if (updates.startTime) {
      requestBody.start = {
        dateTime: updates.startTime.toISOString(),
        timeZone: 'UTC',
      };
    }
    if (updates.endTime) {
      requestBody.end = {
        dateTime: updates.endTime.toISOString(),
        timeZone: 'UTC',
      };
    }
    if (updates.attendees) {
      requestBody.attendees = updates.attendees.map((a) => ({
        email: a.email,
        displayName: a.name,
      }));
    }

    await calendar.events.patch({
      calendarId,
      eventId,
      requestBody,
    });

    return true;
  } catch (error) {
    console.error('Failed to update Google Calendar event:', error);
    return false;
  }
}

export async function addAttendeeToEvent(
  eventId: string,
  attendee: { email: string; name: string }
): Promise<boolean> {
  const auth = getAuth();
  if (!auth) {
    return false;
  }

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    // First get current attendees
    const event = await calendar.events.get({
      calendarId,
      eventId,
    });

    const currentAttendees = event.data.attendees || [];

    // Add new attendee
    await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: {
        attendees: [
          ...currentAttendees,
          {
            email: attendee.email,
            displayName: attendee.name,
          },
        ],
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to add attendee to Google Calendar event:', error);
    return false;
  }
}

export async function removeAttendeeFromEvent(
  eventId: string,
  attendeeEmail: string
): Promise<boolean> {
  const auth = getAuth();
  if (!auth) {
    return false;
  }

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    // First get current attendees
    const event = await calendar.events.get({
      calendarId,
      eventId,
    });

    const currentAttendees = event.data.attendees || [];
    const filteredAttendees = currentAttendees.filter((a: { email?: string | null }) => a.email !== attendeeEmail);

    // Update with filtered attendees
    await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: {
        attendees: filteredAttendees,
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to remove attendee from Google Calendar event:', error);
    return false;
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const auth = getAuth();
  if (!auth) {
    return false;
  }

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    await calendar.events.delete({
      calendarId,
      eventId,
    });

    return true;
  } catch (error) {
    console.error('Failed to delete Google Calendar event:', error);
    return false;
  }
}

export async function createSlotCalendarEvent(
  slot: Omit<AvailabilitySlot, 'id' | 'createdAt' | 'updatedAt' | 'googleEventId' | 'googleMeetLink'>
): Promise<EventResult | null> {
  return createCalendarEvent({
    title: slot.title || 'Spanish Class',
    description: slot.description || undefined,
    startTime: new Date(slot.startTime),
    endTime: new Date(slot.endTime),
  });
}

export async function addStudentToSlotEvent(
  eventId: string,
  student: UserPublic
): Promise<boolean> {
  return addAttendeeToEvent(eventId, {
    email: student.email,
    name: `${student.firstName} ${student.lastName}`,
  });
}

export async function removeStudentFromSlotEvent(
  eventId: string,
  studentEmail: string
): Promise<boolean> {
  return removeAttendeeFromEvent(eventId, studentEmail);
}

// ==========================================
// Booked Sessions Calendar Functions
// ==========================================

interface BookedSessionInput {
  booking: {
    id: string;
  };
  slot: {
    id: string;
    title: string | null;
    description: string | null;
    startTime: Date;
    endTime: Date;
    slotType: string;
    googleMeetLink: string | null;
  };
  student: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  professor: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export async function createBookedSessionEvent(input: BookedSessionInput): Promise<EventResult | null> {
  const auth = getAuth();
  if (!auth) {
    console.warn('[Booked Calendar] Auth not configured, skipping booked session event creation');
    return null;
  }

  if (!bookedCalendarId) {
    console.warn('[Booked Calendar] GOOGLE_BOOKED_CALENDAR_ID not configured, skipping booked session event creation');
    return null;
  }

  const calendar = google.calendar({ version: 'v3', auth });
  const { booking, slot, student, professor } = input;

  const studentFullName = `${student.firstName} ${student.lastName}`;
  const sessionType = slot.slotType === 'GROUP' ? 'Group Session' : 'Individual Session';

  const description = [
    `Session: ${slot.title || 'Spanish Class'}`,
    `Student: ${studentFullName} (${student.email})`,
    `Type: ${sessionType}`,
    '',
    slot.description || '',
    '',
    slot.googleMeetLink ? `Join: ${slot.googleMeetLink}` : '',
  ].filter(Boolean).join('\n');

  try {
    console.log('[Booked Calendar] Creating booked session event for student:', studentFullName);

    const event = await calendar.events.insert({
      calendarId: bookedCalendarId,
      requestBody: {
        summary: `Spanish Class - ${studentFullName}`,
        description,
        location: slot.googleMeetLink || undefined,
        start: {
          dateTime: new Date(slot.startTime).toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: new Date(slot.endTime).toISOString(),
          timeZone: 'UTC',
        },
        attendees: [
          {
            email: student.email,
            displayName: studentFullName,
          },
          {
            email: professor.email,
            displayName: `${professor.firstName} ${professor.lastName}`,
          },
        ],
      },
    });

    console.log('[Booked Calendar] Event created successfully:', event.data.id);

    return {
      eventId: event.data.id || '',
      meetLink: slot.googleMeetLink || undefined,
    };
  } catch (error) {
    console.error('[Booked Calendar] Failed to create booked session event:', error);
    return null;
  }
}

export async function deleteBookedSessionEvent(eventId: string): Promise<boolean> {
  const auth = getAuth();
  if (!auth) {
    console.warn('[Booked Calendar] Auth not configured, skipping event deletion');
    return false;
  }

  if (!bookedCalendarId) {
    console.warn('[Booked Calendar] GOOGLE_BOOKED_CALENDAR_ID not configured, skipping event deletion');
    return false;
  }

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    console.log('[Booked Calendar] Deleting event:', eventId);

    await calendar.events.delete({
      calendarId: bookedCalendarId,
      eventId,
    });

    console.log('[Booked Calendar] Event deleted successfully');
    return true;
  } catch (error) {
    console.error('[Booked Calendar] Failed to delete event:', error);
    return false;
  }
}

// ==========================================
// Debug Functions
// ==========================================

export interface CalendarDebugResult {
  configured: boolean;
  serviceAccountEmail?: string;
  availabilityCalendarId?: string;
  bookedCalendarId?: string;
  availabilityCalendarAccess?: boolean;
  bookedCalendarAccess?: boolean;
  canCreateMeetLinks?: boolean;
  errors: string[];
}

export async function debugCalendarConnection(): Promise<CalendarDebugResult> {
  const result: CalendarDebugResult = {
    configured: false,
    errors: [],
  };

  const auth = getAuth();
  if (!auth) {
    result.errors.push('Google Calendar credentials not configured (GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY missing)');
    return result;
  }

  result.configured = true;
  result.serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  result.availabilityCalendarId = calendarId;
  result.bookedCalendarId = bookedCalendarId || 'Not configured';

  const calendar = google.calendar({ version: 'v3', auth });

  // Test availability calendar access
  try {
    await calendar.calendarList.get({ calendarId });
    result.availabilityCalendarAccess = true;
  } catch (error) {
    result.availabilityCalendarAccess = false;
    result.errors.push(`Cannot access availability calendar (${calendarId}): ${error instanceof Error ? error.message : String(error)}`);
  }

  // Test booked calendar access
  if (bookedCalendarId) {
    try {
      await calendar.calendarList.get({ calendarId: bookedCalendarId });
      result.bookedCalendarAccess = true;
    } catch (error) {
      result.bookedCalendarAccess = false;
      result.errors.push(`Cannot access booked sessions calendar (${bookedCalendarId}): ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Note about Meet links
  result.canCreateMeetLinks = undefined; // Cannot be determined without creating a test event
  if (result.errors.length === 0) {
    result.errors.push('Note: Google Meet link creation requires the calendar owner to have Google Workspace. Personal Gmail accounts cannot create Meet links via Calendar API.');
  }

  return result;
}
