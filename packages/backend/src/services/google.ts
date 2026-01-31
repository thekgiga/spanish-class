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
    return null;
  }

  const calendar = google.calendar({ version: 'v3', auth });

  try {
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

    return {
      eventId: event.data.id || '',
      meetLink: event.data.conferenceData?.entryPoints?.[0]?.uri,
    };
  } catch (error) {
    console.error('Failed to create Google Calendar event:', error);
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
    const filteredAttendees = currentAttendees.filter((a) => a.email !== attendeeEmail);

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
