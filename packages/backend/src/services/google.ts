// Google Calendar integration stub
// TODO: Implement Google Calendar integration

export async function debugCalendarConnection() {
  return {
    success: false,
    message: "Google Calendar integration not yet implemented",
  };
}

export async function createBookedSessionEvent(params: {
  booking: { id: string };
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
}): Promise<{ eventId?: string } | null> {
  // Stub - no-op for now
  return null;
}

export async function deleteBookedSessionEvent(eventId: string): Promise<void> {
  // Stub - no-op for now
}
