import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DateStrip } from './date-strip';
import { addDays } from 'date-fns';

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
