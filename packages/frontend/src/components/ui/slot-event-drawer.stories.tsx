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

// ── Available slot — default footer ───────────────────────────────────────

export const Available: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({})}
      onEdit={() => {}}
    />
  ),
};

// ── Schedule panel — loading state ───────────────────────────────────────
// Panel opens immediately; student list query is in-flight (empty list while loading).

export const SchedulePanelLoading: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({})}
      onEdit={() => {}}
      initialScheduleOpen
    />
  ),
};

// ── Schedule panel — no assigned students ────────────────────────────────
// Simulated by keeping panel open with empty student data (no MSW available).

export const SchedulePanelNoStudents: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({})}
      onEdit={() => {}}
      initialScheduleOpen
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Panel open, getStudents returns 0 results — shows "No assigned students yet." empty state.',
      },
    },
  },
};

// ── Requested / pending approval ─────────────────────────────────────────

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

// ── Confirmed lesson ──────────────────────────────────────────────────────

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

// ── Blocked slot ──────────────────────────────────────────────────────────

export const Blocked: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({ slotType: 'BLOCKED', title: 'Personal time', bookings: [] })}
    />
  ),
};

export const BlockedNoTitle: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({ slotType: 'BLOCKED', title: null, bookings: [] })}
    />
  ),
};

// ── Cancelled ─────────────────────────────────────────────────────────────

export const Cancelled: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({ status: 'CANCELLED', bookings: [] })}
    />
  ),
};

// ── Group slot — empty participants ──────────────────────────────────────

export const GroupSlotEmpty: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({
        slotType: 'GROUP',
        maxParticipants: 6,
        currentParticipants: 0,
        status: 'AVAILABLE',
        bookings: [],
      })}
      onEdit={() => {}}
    />
  ),
};

/**
 * Available GROUP slot: "Schedule for student" button is now shown.
 * Footer shows Edit + Schedule for student + Cancel.
 */
export const GroupSlotAvailableWithSchedule: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({
        slotType: 'GROUP',
        maxParticipants: 6,
        currentParticipants: 0,
        status: 'AVAILABLE',
        bookings: [],
      })}
      onEdit={() => {}}
    />
  ),
};

// ── Group slot partially filled ───────────────────────────────────────────

export const GroupSlotPartiallyFilled: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({
        slotType: 'GROUP',
        maxParticipants: 6,
        currentParticipants: 2,
        status: 'AVAILABLE',
        bookings: [
          {
            id: 'b-g1', slotId: 'slot-1', studentId: 'stu-1',
            status: confirmedBookingStatus(),
            bookedAt: new Date(), confirmedAt: new Date(),
            createdAt: new Date(), updatedAt: new Date(),
            cancelledAt: null, cancelReason: null,
            rejectedAt: null, confirmationToken: null, reminderSentAt: null,
            secondReminderSentAt: null, reminderSent24h: null, reminderSent1h: null,
            confirmationExpiresAt: null,
            student,
          },
          {
            id: 'b-g2', slotId: 'slot-1', studentId: 'stu-2',
            status: pendingConfirmationStatus(),
            bookedAt: new Date(), confirmedAt: null,
            createdAt: new Date(), updatedAt: new Date(),
            cancelledAt: null, cancelReason: null,
            rejectedAt: null, confirmationToken: 'tok2', reminderSentAt: null,
            secondReminderSentAt: null, reminderSent24h: null, reminderSent1h: null,
            confirmationExpiresAt: new Date(Date.now() + 86_400_000),
            student: { ...student, id: 'stu-2', firstName: 'Maria', lastName: 'García', email: 'maria@example.com' },
          },
        ],
      })}
      onEdit={() => {}}
    />
  ),
};

// ── Group slot full ────────────────────────────────────────────────────────

export const GroupSlotFull: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({
        slotType: 'GROUP',
        maxParticipants: 4,
        currentParticipants: 4,
        status: fullyBookedSlotStatus(),
        bookings: [
          {
            id: 'b-g1', slotId: 'slot-1', studentId: 'stu-1',
            status: confirmedBookingStatus(),
            bookedAt: new Date(), confirmedAt: new Date(),
            createdAt: new Date(), updatedAt: new Date(),
            cancelledAt: null, cancelReason: null,
            rejectedAt: null, confirmationToken: null, reminderSentAt: null,
            secondReminderSentAt: null, reminderSent24h: null, reminderSent1h: null,
            confirmationExpiresAt: null, student,
          },
          {
            id: 'b-g2', slotId: 'slot-1', studentId: 'stu-2',
            status: confirmedBookingStatus(),
            bookedAt: new Date(), confirmedAt: new Date(),
            createdAt: new Date(), updatedAt: new Date(),
            cancelledAt: null, cancelReason: null,
            rejectedAt: null, confirmationToken: null, reminderSentAt: null,
            secondReminderSentAt: null, reminderSent24h: null, reminderSent1h: null,
            confirmationExpiresAt: null,
            student: { ...student, id: 'stu-2', firstName: 'Maria', lastName: 'García', email: 'maria@example.com' },
          },
          {
            id: 'b-g3', slotId: 'slot-1', studentId: 'stu-3',
            status: confirmedBookingStatus(),
            bookedAt: new Date(), confirmedAt: new Date(),
            createdAt: new Date(), updatedAt: new Date(),
            cancelledAt: null, cancelReason: null,
            rejectedAt: null, confirmationToken: null, reminderSentAt: null,
            secondReminderSentAt: null, reminderSent24h: null, reminderSent1h: null,
            confirmationExpiresAt: null,
            student: { ...student, id: 'stu-3', firstName: 'Carlos', lastName: 'Ruiz', email: 'carlos@example.com' },
          },
          {
            id: 'b-g4', slotId: 'slot-1', studentId: 'stu-4',
            status: confirmedBookingStatus(),
            bookedAt: new Date(), confirmedAt: new Date(),
            createdAt: new Date(), updatedAt: new Date(),
            cancelledAt: null, cancelReason: null,
            rejectedAt: null, confirmationToken: null, reminderSentAt: null,
            secondReminderSentAt: null, reminderSent24h: null, reminderSent1h: null,
            confirmationExpiresAt: null,
            student: { ...student, id: 'stu-4', firstName: 'Ana', lastName: 'López', email: 'ana@example.com' },
          },
        ],
      })}
      onEdit={() => {}}
    />
  ),
};

// ── Edge: full group (stale data, no visible bookings) ───────────────────

export const FullyBookedNoVisibleBookings: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({ status: fullyBookedSlotStatus(), slotType: 'GROUP', maxParticipants: 4, currentParticipants: 4, bookings: [] })}
    />
  ),
};

// ── Group slot — schedule panel open (multi-add flow) ────────────────────
// Simulates the professor opening the "Schedule for student" panel on a
// group slot. The search list is loading while the panel first opens.

export const GroupSchedulePanelOpen: Story = {
  render: () => (
    <SlotEventDrawer
      open onClose={() => {}}
      slot={makeSlot({
        slotType: 'GROUP',
        maxParticipants: 5,
        currentParticipants: 1,
        status: 'AVAILABLE',
        bookings: [
          {
            id: 'b-g1', slotId: 'slot-1', studentId: 'stu-1',
            status: confirmedBookingStatus(),
            bookedAt: new Date(), confirmedAt: new Date(),
            createdAt: new Date(), updatedAt: new Date(),
            cancelledAt: null, cancelReason: null,
            rejectedAt: null, confirmationToken: null, reminderSentAt: null,
            secondReminderSentAt: null, reminderSent24h: null, reminderSent1h: null,
            confirmationExpiresAt: null, student,
          },
        ],
      })}
      onEdit={() => {}}
      initialScheduleOpen
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Group slot with 1 existing booking; professor opens the schedule panel to add more students. Student list is loading.',
      },
    },
  },
};

// ── Group slot — at capacity after scheduling session ────────────────────
// Simulates the panel state after all seats have been filled during the
// current session: "All seats are now filled" alert + Done button only.

export const GroupScheduleAtCapacity: Story = {
  render: () => {
    // We can only show the static full-capacity state via the slot props
    // since MSW is not wired in Storybook. Use a slot that is already full
    // to exercise the "blocked" + cancel-only footer (no schedule panel).
    return (
      <SlotEventDrawer
        open onClose={() => {}}
        slot={makeSlot({
          slotType: 'GROUP',
          maxParticipants: 2,
          currentParticipants: 2,
          status: fullyBookedSlotStatus(),
          bookings: [
            {
              id: 'b-g1', slotId: 'slot-1', studentId: 'stu-1',
              status: confirmedBookingStatus(),
              bookedAt: new Date(), confirmedAt: new Date(),
              createdAt: new Date(), updatedAt: new Date(),
              cancelledAt: null, cancelReason: null,
              rejectedAt: null, confirmationToken: null, reminderSentAt: null,
              secondReminderSentAt: null, reminderSent24h: null, reminderSent1h: null,
              confirmationExpiresAt: null, student,
            },
            {
              id: 'b-g2', slotId: 'slot-1', studentId: 'stu-2',
              status: confirmedBookingStatus(),
              bookedAt: new Date(), confirmedAt: new Date(),
              createdAt: new Date(), updatedAt: new Date(),
              cancelledAt: null, cancelReason: null,
              rejectedAt: null, confirmationToken: null, reminderSentAt: null,
              secondReminderSentAt: null, reminderSent24h: null, reminderSent1h: null,
              confirmationExpiresAt: null,
              student: { ...student, id: 'stu-2', firstName: 'Maria', lastName: 'García', email: 'maria@example.com' },
            },
          ],
        })}
        onEdit={() => {}}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Group slot at full capacity — footer shows only "Cancel slot". No schedule button.',
      },
    },
  },
};
