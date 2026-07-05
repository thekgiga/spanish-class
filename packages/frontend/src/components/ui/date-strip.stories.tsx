import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DateStrip } from './date-strip';
import { addDays, format } from 'date-fns';

const meta: Meta<typeof DateStrip> = {
  title: 'UI/DateStrip',
  component: DateStrip,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof DateStrip>;

const today = new Date();

export const Default: Story = {
  args: {
    centerDate: today,
    selectedDate: today,
    onSelect: () => {},
  },
};

export const FutureFocus: Story = {
  args: {
    centerDate: addDays(today, 5),
    selectedDate: addDays(today, 5),
    onSelect: () => {},
  },
};

export const WideRadius: Story = {
  args: {
    centerDate: today,
    selectedDate: today,
    radius: 7,
    onSelect: () => {},
  },
};

// Build a slotCounts map centred on today: some days have slots, some don't.
const makeSlotCounts = (center: Date, radius = 3): Record<string, number> => {
  const counts: Record<string, number> = {};
  const pattern = [0, 3, 1, 0, 5, 2, 0];
  for (let i = -radius; i <= radius; i++) {
    const key = format(addDays(center, i), 'yyyy-MM-dd');
    counts[key] = pattern[(i + radius) % pattern.length];
  }
  return counts;
};

export const WithSlotCounts: Story = {
  args: {
    centerDate: today,
    selectedDate: today,
    slotCounts: makeSlotCounts(today),
    getSlotLabel: (n) => `${n} available`,
    onSelect: () => {},
  },
};

export const WithSlotCountsHighVolume: Story = {
  name: 'WithSlotCounts — high volume (9+ cap)',
  args: {
    centerDate: today,
    selectedDate: today,
    slotCounts: makeSlotCounts(today, 3),
    getSlotLabel: (n) => `${n} available`,
    onSelect: () => {},
  },
  render: (args) => {
    // Override with big numbers to verify the 9+ cap
    const bigCounts: Record<string, number> = {};
    for (const k of Object.keys(args.slotCounts ?? {})) {
      bigCounts[k] = 12;
    }
    return <DateStrip {...args} slotCounts={bigCounts} />;
  },
};

export const WithSlotCountsNoneAvailable: Story = {
  name: 'WithSlotCounts — all zero (spacer only)',
  args: {
    centerDate: today,
    selectedDate: today,
    slotCounts: makeSlotCounts(today, 3),
    getSlotLabel: (n) => `${n} available`,
    onSelect: () => {},
  },
  render: (args) => {
    const zeroCounts: Record<string, number> = {};
    for (const k of Object.keys(args.slotCounts ?? {})) {
      zeroCounts[k] = 0;
    }
    return <DateStrip {...args} slotCounts={zeroCounts} />;
  },
};
