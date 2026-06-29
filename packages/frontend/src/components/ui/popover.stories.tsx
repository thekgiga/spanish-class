import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from './popover';
import { Button } from './button';

const meta: Meta = { title: 'UI/Popover', parameters: { layout: 'centered' }, tags: ['autodocs'] };
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild><Button variant="secondary">Open Popover</Button></PopoverTrigger>
      <PopoverContent className="p-4">
        <p className="text-small font-medium text-ink mb-1">Filter by status</p>
        <p className="text-small text-ink-secondary">Contextual options appear here.</p>
      </PopoverContent>
    </Popover>
  ),
};

export const AlignEnd: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild><Button variant="secondary">Align end</Button></PopoverTrigger>
      <PopoverContent align="end" className="p-4">
        <p className="text-small text-ink-secondary">Anchored to end of trigger.</p>
      </PopoverContent>
    </Popover>
  ),
};
