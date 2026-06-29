import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { RecurringPreview } from './recurring-preview';

const meta: Meta<typeof RecurringPreview> = {
  title: 'Domain/RecurringPreview',
  component: RecurringPreview,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [(Story) => <div className="max-w-lg bg-canvas p-4 rounded-ui-md"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof RecurringPreview>;

const startDate = new Date(2026, 6, 7); // Mon Jul 7

export const NoConflicts: Story = {
  args: {
    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    startDate,
    weeksAhead: 4,
    startTime: '10:00',
    endTime: '11:00',
    existingSlots: [],
  },
};

export const WithConflicts: Story = {
  args: {
    daysOfWeek: [1, 3],
    startDate,
    weeksAhead: 3,
    startTime: '10:00',
    endTime: '11:00',
    existingSlots: [
      {
        id: 'existing-1',
        professorId: 'prof-1',
        slotType: 'INDIVIDUAL',
        maxParticipants: 1,
        currentParticipants: 0,
        status: 'AVAILABLE' as any,
        isPrivate: false,
        recurringPatternId: null,
        meetLink: null,
        title: 'Existing',
        description: null,
        createdAt: startDate,
        updatedAt: startDate,
        // Conflict on Monday Jul 14 at same time
        startTime: new Date(2026, 6, 14, 10, 0) as any,
        endTime:   new Date(2026, 6, 14, 11, 0) as any,
        version: 1,
      } as any,
    ],
  },
};

export const SingleDayWeekly: Story = {
  args: {
    daysOfWeek: [2], // Tue
    startDate,
    weeksAhead: 8,
    startTime: '14:00',
    endTime: '15:30',
    existingSlots: [],
  },
};
