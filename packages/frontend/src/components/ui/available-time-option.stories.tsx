import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AvailableTimeOption } from './available-time-option';

const meta: Meta<typeof AvailableTimeOption> = {
  title: 'UI/AvailableTimeOption',
  component: AvailableTimeOption,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [(Story) => <div className="max-w-sm space-y-2"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AvailableTimeOption>;

const slot = {
  id: 'slot-1',
  professorId: 'prof-1',
  slotType: 'INDIVIDUAL' as const,
  maxParticipants: 1,
  currentParticipants: 0,
  status: 'AVAILABLE' as any,
  isPrivate: false,
  recurringPatternId: null,
  meetLink: null,
  title: 'Conversation Practice',
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  startTime: new Date(2026, 6, 15, 10, 0),
  endTime:   new Date(2026, 6, 15, 11, 0),
  version: 1,
};

export const Default: Story = {
  args: { slot, onSelect: () => {} },
};
export const PendingApproval: Story = {
  args: {
    slot: { ...slot, isBookedByMe: true, myBookingStatus: 'pending' },
    onSelect: () => {},
  },
  parameters: {
    docs: {
      description: {
        story:
          'Slot the student has requested but the professor has not yet approved. Uses the requested (amber) tone — never green — so a request cannot be mistaken for a confirmed lesson.',
      },
    },
  },
};
export const AlreadyBooked: Story = {
  args: {
    slot: { ...slot, isBookedByMe: true, myBookingStatus: 'confirmed' },
    onSelect: () => {},
  },
};
export const WithDuration: Story = {
  args: { slot, showDuration: true, onSelect: () => {} },
};
export const AllStates: Story = {
  render: () => (
    <div className="space-y-2 max-w-sm">
      {/* Default — available, interactive */}
      <AvailableTimeOption slot={slot} onSelect={() => {}} />
      {/* WithDuration — secondary caption when durations vary */}
      <AvailableTimeOption slot={slot} showDuration onSelect={() => {}} />
      {/* Pending approval — amber requested tone */}
      <AvailableTimeOption
        slot={{ ...slot, isBookedByMe: true, myBookingStatus: 'pending' }}
        onSelect={() => {}}
      />
      {/* Already confirmed */}
      <AvailableTimeOption
        slot={{ ...slot, isBookedByMe: true, myBookingStatus: 'confirmed' }}
        onSelect={() => {}}
      />
    </div>
  ),
};
