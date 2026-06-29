import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Clock, Users } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['plain', 'interactive', 'selected', 'status', 'elevated', 'outlined'],
    },
    hover: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Plain: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Plain card</CardTitle>
        <CardDescription>Default surface with border and shadow-1.</CardDescription>
      </CardHeader>
      <CardContent><p className="text-small text-ink-secondary">Content goes here.</p></CardContent>
      <CardFooter><Button variant="secondary" className="w-full">Action</Button></CardFooter>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card variant="interactive" className="w-80">
      <CardContent className="p-5">
        <p className="text-small text-ink-secondary">Hover or focus me — lift + shadow-2.</p>
      </CardContent>
    </Card>
  ),
};

export const Selected: Story = {
  render: () => (
    <Card variant="selected" className="w-80">
      <CardContent className="p-5">
        <p className="text-small font-medium text-brand">This slot is selected.</p>
      </CardContent>
    </Card>
  ),
};

// Status tones: all six semantic booking states
export const StatusTones: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-72">
      {(['available', 'requested', 'confirmed', 'blocked', 'completed', 'cancelled'] as const).map(tone => (
        <Card key={tone} variant="status" statusTone={tone} className="px-4 py-3">
          <span className="text-small font-medium capitalize">{tone}</span>
        </Card>
      ))}
    </div>
  ),
};

// Domain example — lesson card
export const LessonCard: Story = {
  render: () => (
    <Card variant="interactive" className="w-80">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-ink-tertiary" aria-hidden="true" />
          <span className="text-small text-ink-secondary">Group</span>
        </div>
        <p className="text-title font-semibold text-ink mb-1">Spanish Conversation</p>
        <div className="flex items-center gap-1 text-small text-ink-secondary mb-4">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Mon 10:00 – 11:00</span>
        </div>
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-small text-ink-secondary">3 / 5 spots</span>
          <Button size="sm" variant="primary">Book Now</Button>
        </div>
      </CardContent>
    </Card>
  ),
};
