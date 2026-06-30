import type { Meta, StoryObj } from '@storybook/react';
import { BookingRequestCard } from './booking-request-card';
import {
  pendingConfirmationStatus, confirmedBookingStatus,
  fullyBookedSlotStatus,
} from '@/lib/ui-system/status';

const meta: Meta<typeof BookingRequestCard> = {
  title: 'Domain/BookingRequestCard',
  component: BookingRequestCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [(Story) => <div className="max-w-md"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof BookingRequestCard>;

import React from 'react';

const professor = { firstName: 'Maria', lastName: 'Garcia' };
const slot = {
  id: 'slot-1', professorId: 'prof-1',
  slotType: 'INDIVIDUAL', maxParticipants: 1, currentParticipants: 0,
  isPrivate: false, recurringPatternId: null, meetLink: null,
  title: 'Conversation Practice', description: null, version: 1,
  createdAt: new Date(), updatedAt: new Date(),
  startTime: new Date(2026, 6, 15, 10, 0),
  endTime: new Date(2026, 6, 15, 11, 0),
  status: 'AVAILABLE',
  professor,
};

const makeBooking = (overrides: object) => ({
  id: 'b-1', slotId: 'slot-1', studentId: 'stu-1',
  bookedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
  cancelledAt: null, cancelReason: null, confirmedAt: null,
  rejectedAt: null, confirmationToken: null, reminderSentAt: null,
  secondReminderSentAt: null, reminderSent24h: null, reminderSent1h: null,
  confirmationExpiresAt: new Date(Date.now() + 23 * 3_600_000),
  slot,
  ...overrides,
} as any);

export const PendingHero: Story = {
  args: {
    booking: makeBooking({ status: pendingConfirmationStatus() }),
    variant: 'hero',
  },
};
export const PendingCompact: Story = {
  args: {
    booking: makeBooking({ status: pendingConfirmationStatus() }),
    variant: 'compact',
  },
};
export const Confirmed: Story = {
  args: {
    booking: makeBooking({
      status: confirmedBookingStatus(),
      slot: { ...slot, status: fullyBookedSlotStatus(), meetLink: 'https://meet.jit.si/test' },
    }),
    variant: 'hero',
  },
};
export const Rejected: Story = {
  args: {
    booking: makeBooking({ status: 'REJECTED', cancelReason: 'Schedule conflict.' }),
    variant: 'compact',
  },
};
export const Expired: Story = {
  args: {
    booking: makeBooking({
      status: 'EXPIRED',
      confirmationExpiresAt: new Date(Date.now() - 3_600_000),
    }),
    variant: 'compact',
  },
};
