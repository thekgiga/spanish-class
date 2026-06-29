import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { InlineAlert } from './inline-alert';

const meta: Meta<typeof InlineAlert> = {
  title: 'UI/InlineAlert',
  component: InlineAlert,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [(Story) => <div className="max-w-md"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof InlineAlert>;

export const Success: Story = { args: { variant: 'success', children: 'Your changes have been saved.' } };
export const Error: Story = { args: { variant: 'error', children: 'Something went wrong. Please try again.' } };
export const Warning: Story = { args: { variant: 'warning', children: 'This slot expires in 10 minutes.' } };
export const Info: Story = { args: { variant: 'info', children: 'Approval usually takes less than a day.' } };

export const Dismissible: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true);
    return visible
      ? <InlineAlert variant="error" onDismiss={() => setVisible(false)}>Network error — check your connection.</InlineAlert>
      : <p className="text-small text-ink-tertiary">Dismissed.</p>;
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-2">
      <InlineAlert variant="success">Booking confirmed.</InlineAlert>
      <InlineAlert variant="error">Failed to submit.</InlineAlert>
      <InlineAlert variant="warning">Approval pending — expires in 24 h.</InlineAlert>
      <InlineAlert variant="info">You can reschedule up to 2 hours before the class.</InlineAlert>
    </div>
  ),
};
