import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SlotEventDrawer } from './slot-event-drawer';
import {
  pendingConfirmationStatus,
  confirmedBookingStatus,
  fullyBookedSlotStatus,
} from '@/lib/ui-system/status';
import type { AvailabilitySlotWithBookings } from '@spanish-class/shared';

const meta: Meta = {
  title: 'Domain/SlotEventDrawer',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

const baseSlot = {
  id: 'slot-1',
  professorId: 'prof-1',
  slotType: 'INDIVIDUAL' as const,
  maxParticipants: 1,
  currentParticipants: 0,
  isPrivate: false,
  recurringPatternId: null,
  meetLink: null,
  title: 'Conversation Practice',
  description: null,
  status: 'AVAILABLE',
  createdAt: new Date(),
  updatedAt: new Date(),
  startTime: new Date(2026, 6, 1, 10, 0),
  endTime:   new Date(2026, 6, 1, 11, 0),
  version: 1,
};

const student = {
  id: 'stu-1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  isAdmin: false,
  timezone: 'Europe/Belgrade',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const makeSlot = (overrides: object): AvailabilitySlotWithBookings =>
  ({ ...baseSlot, bookings: [], ...overrides } as unknown as AvailabilitySlotWithBookings);

export const Available: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({})}
      onEdit={() => {}}
    />
  ),
};

export const Requested: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({
        bookings: [{
          id: 'b-1', slotId: 'slot-1', studentId: 'stu-1',
          status: pendingConfirmationStatus(),
          bookedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
          cancelledAt: null, cancelReason: null, confirmedAt: null,
          rejectedAt: null, confirmationToken: 'tok', reminderSentAt: null,
          secondReminderSentAt: null, reminderSent24h: null, reminderSent1h: null,
          confirmationExpiresAt: new Date(Date.now() + 86_400_000),
          student,
        }],
      })}
    />
  ),
};

export const Confirmed: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({
        status: fullyBookedSlotStatus(),
        meetLink: 'https://meet.jit.si/spanish-test',
        bookings: [{
          id: 'b-2', slotId: 'slot-1', studentId: 'stu-1',
          status: confirmedBookingStatus(),
          bookedAt: new Date(), confirmedAt: new Date(),
          createdAt: new Date(), updatedAt: new Date(),
          cancelledAt: null, cancelReason: null,
          rejectedAt: null, confirmationToken: null, reminderSentAt: null,
          secondReminderSentAt: null, reminderSent24h: null, reminderSent1h: null,
          confirmationExpiresAt: null,
          student,
        }],
      })}
    />
  ),
};

export const Blocked: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({ title: 'Personal time', bookings: [] })}
    />
  ),
};
