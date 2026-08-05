import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { CalendarEventTile } from './calendar-event';
import type { UiLifecycleStatus } from '@/lib/ui-system/status';

const meta: Meta<typeof CalendarEventTile> = {
  title: 'Domain/CalendarEventTile',
  component: CalendarEventTile,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof CalendarEventTile>;

// Simulate event tile at realistic calendar widths
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-36 h-16 bg-canvas rounded overflow-hidden">{children}</div>
);

export const Available: Story = {
  render: () => <Wrapper><CalendarEventTile status="available" iconName="CalendarPlus" title="Available" time="10:00 – 11:00" /></Wrapper>,
};
export const Requested: Story = {
  render: () => <Wrapper><CalendarEventTile status="requested" iconName="Clock3" title="Ana Kovač" time="10:00 – 11:00" /></Wrapper>,
};
export const Confirmed: Story = {
  render: () => <Wrapper><CalendarEventTile status="confirmed" iconName="CalendarCheck2" title="John Doe" time="10:00 – 11:00" /></Wrapper>,
};
export const Blocked: Story = {
  render: () => <Wrapper><CalendarEventTile status="blocked" iconName="Lock" title="Blocked" time="12:00 – 13:00" /></Wrapper>,
};
export const Completed: Story = {
  render: () => <Wrapper><CalendarEventTile status="completed" iconName="CircleCheck" title="John Doe" time="09:00 – 10:00" /></Wrapper>,
};
export const Cancelled: Story = {
  render: () => <Wrapper><CalendarEventTile status="cancelled" iconName="CircleX" title="Cancelled" time="14:00 – 15:00" /></Wrapper>,
};

// Individual vs Group type differentiation
export const IndividualConfirmed: Story = {
  render: () => <Wrapper><CalendarEventTile status="confirmed" iconName="CalendarCheck2" title="John Doe" time="10:00 – 11:00" slotType="INDIVIDUAL" /></Wrapper>,
};
export const GroupConfirmed: Story = {
  render: () => <Wrapper><CalendarEventTile status="confirmed" iconName="CalendarCheck2" title="Beginner Class" time="10:00 – 11:00" slotType="GROUP" /></Wrapper>,
};
export const GroupAvailable: Story = {
  render: () => <Wrapper><CalendarEventTile status="available" iconName="CalendarPlus" title="Available" time="14:00 – 15:00" slotType="GROUP" /></Wrapper>,
};
export const GroupRequested: Story = {
  render: () => <Wrapper><CalendarEventTile status="requested" iconName="Clock3" title="Ana Kovač" time="10:00 – 11:00" slotType="GROUP" /></Wrapper>,
};
export const DenseGroup: Story = {
  render: () => (
    <div className="w-36 h-8 bg-canvas rounded overflow-hidden">
      <CalendarEventTile status="confirmed" iconName="CalendarCheck2" title="Beginner Class" dense slotType="GROUP" />
    </div>
  ),
};
export const BlockedNoType: Story = {
  name: 'Blocked (no type icon)',
  render: () => <Wrapper><CalendarEventTile status="blocked" iconName="Lock" title="Blocked" time="12:00 – 13:00" /></Wrapper>,
};

// All tones at a glance
export const AllTones: Story = {
  render: () => (
    <div className="flex flex-col gap-2 max-w-xs">
      {(['available','requested','confirmed','blocked','completed','cancelled'] as UiLifecycleStatus[]).map(s => (
        <div key={s} className="w-full h-14 rounded overflow-hidden">
          <CalendarEventTile status={s} iconName="CalendarCheck2" title={s.charAt(0).toUpperCase()+s.slice(1)} time="10:00–11:00" />
        </div>
      ))}
    </div>
  ),
};
