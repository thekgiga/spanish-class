import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { StatusBadge } from './status-badge';
import type { UiLifecycleStatus } from '@/lib/ui-system/status';

// StatusBadge uses useTranslation; Storybook loads locales via the backend
// plugin since preview.ts imports globals.css which triggers i18n init in
// the app bundle. In CI/non-app Storybook, labels fall back to the key.
const meta: Meta<typeof StatusBadge> = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    status:  { control: 'select', options: ['available','requested','confirmed','blocked','completed','cancelled'] as UiLifecycleStatus[] },
    variant: { control: 'radio',  options: ['pill', 'tag'] },
  },
};
export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Default: Story = { args: { status: 'confirmed' } };

export const Pill: Story = { args: { status: 'requested', variant: 'pill' } };

export const Tag: Story = { args: { status: 'requested', variant: 'tag' } };

// All six semantic tones
export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 max-w-sm">
      {(['available', 'requested', 'confirmed', 'blocked', 'completed', 'cancelled'] as UiLifecycleStatus[]).map(s => (
        <StatusBadge key={s} status={s} />
      ))}
    </div>
  ),
};

// Both sizes side by side
export const BothSizes: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(['available', 'requested', 'confirmed', 'blocked', 'completed', 'cancelled'] as UiLifecycleStatus[]).map(s => (
          <StatusBadge key={s} status={s} variant="pill" />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(['available', 'requested', 'confirmed', 'blocked', 'completed', 'cancelled'] as UiLifecycleStatus[]).map(s => (
          <StatusBadge key={s} status={s} variant="tag" />
        ))}
      </div>
    </div>
  ),
};
