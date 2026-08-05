import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Textarea } from './textarea';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <div className="w-80"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = { args: { placeholder: 'Write something…' } };

export const WithError: Story = {
  args: { placeholder: 'Notes', defaultValue: 'x', error: 'At least 10 characters required.' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Cannot edit this field.' },
};

export const WithCount: Story = {
  args: { placeholder: 'Bio (max 200 chars)', showCount: true, maxLength: 200 },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-1.5">
      <label htmlFor="notes-demo" className="text-small font-medium text-ink">
        Notes <span className="text-ink-tertiary text-xs">(optional)</span>
      </label>
      <Textarea id="notes-demo" placeholder="Add context for the professor…" rows={4} />
    </div>
  ),
};
