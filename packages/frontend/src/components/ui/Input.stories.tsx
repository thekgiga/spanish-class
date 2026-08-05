import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Input } from './input';
import { Mail, Lock, Search } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  argTypes: {
    error:    { control: 'text',    description: 'Error message' },
    disabled: { control: 'boolean', description: 'Disabled state' },
  },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { placeholder: 'Enter text…' } };

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-1.5">
      <label htmlFor="email-demo" className="text-small font-medium text-ink">Email</label>
      <Input id="email-demo" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const WithIcon: Story = {
  args: { placeholder: 'Search…', icon: <Search className="h-4 w-4" /> },
};

export const WithError: Story = {
  args: { placeholder: 'Email', defaultValue: 'bad-email', error: 'Enter a valid email address.' },
};

export const Disabled: Story = {
  args: { placeholder: 'Disabled', disabled: true, defaultValue: 'Cannot edit' },
};

export const ReadOnly: Story = {
  args: { defaultValue: 'Read-only value', readOnly: true },
};

export const Password: Story = {
  args: { type: 'password', placeholder: 'Enter password', icon: <Lock className="h-4 w-4" /> },
};

export const CompleteForm: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="f-name" className="text-small font-medium text-ink">Full Name</label>
        <Input id="f-name" placeholder="John Doe" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="f-email" className="text-small font-medium text-ink">Email</label>
        <Input id="f-email" type="email" placeholder="john@example.com" icon={<Mail className="h-4 w-4" />} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="f-pw" className="text-small font-medium text-ink">Password</label>
        <Input id="f-pw" type="password" placeholder="Enter password" icon={<Lock className="h-4 w-4" />} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="f-search" className="text-small font-medium text-ink">Search</label>
        <Input id="f-search" placeholder="Search…" icon={<Search className="h-4 w-4" />} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="f-error" className="text-small font-medium text-ink">With Error</label>
        <Input id="f-error" placeholder="Email" defaultValue="oops" error="This field is required." />
      </div>
    </div>
  ),
};
