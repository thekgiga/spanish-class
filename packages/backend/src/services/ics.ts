import { createEvents, type EventAttributes } from 'ics';
import type { AvailabilitySlot, UserPublic } from '@spanish-class/shared';

export interface IcsEventData {
  slot: AvailabilitySlot;
  professor: UserPublic;
  student: UserPublic;
  meetLink?: string | null;
}

function dateToArray(date: Date): [number, number, number, number, number] {
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
  ];
}

export async function generateBookingIcs(data: IcsEventData): Promise<string> {
  const { slot, professor, student, meetLink } = data;
  const startTime = new Date(slot.startTime);
  const endTime = new Date(slot.endTime);

  const description = [
    slot.description || 'Spanish lesson',
    '',
    `Professor: ${professor.firstName} ${professor.lastName}`,
    meetLink ? `Join: ${meetLink}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const event: EventAttributes = {
    start: dateToArray(startTime),
    end: dateToArray(endTime),
    title: slot.title || 'Spanish Class',
    description,
    location: meetLink || undefined,
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: {
      name: `${professor.firstName} ${professor.lastName}`,
      email: professor.email,
    },
    attendees: [
      {
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        rsvp: true,
        partstat: 'ACCEPTED',
        role: 'REQ-PARTICIPANT',
      },
    ],
    productId: 'spanish-class-platform',
    uid: `booking-${slot.id}-${student.id}@spanishclass.com`,
  };

  return new Promise((resolve, reject) => {
    createEvents([event], (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

export async function generateCancellationIcs(data: IcsEventData): Promise<string> {
  const { slot, professor, student } = data;
  const startTime = new Date(slot.startTime);
  const endTime = new Date(slot.endTime);

  const event: EventAttributes = {
    start: dateToArray(startTime),
    end: dateToArray(endTime),
    title: `CANCELLED: ${slot.title || 'Spanish Class'}`,
    description: 'This session has been cancelled.',
    status: 'CANCELLED',
    method: 'CANCEL',
    organizer: {
      name: `${professor.firstName} ${professor.lastName}`,
      email: professor.email,
    },
    attendees: [
      {
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        rsvp: false,
        partstat: 'DECLINED',
        role: 'REQ-PARTICIPANT',
      },
    ],
    productId: 'spanish-class-platform',
    uid: `booking-${slot.id}-${student.id}@spanishclass.com`,
    sequence: 1,
  };

  return new Promise((resolve, reject) => {
    createEvents([event], (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}
