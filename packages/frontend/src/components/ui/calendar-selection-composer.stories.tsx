import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { CalendarSelectionComposer } from './calendar-selection-composer';
import { Button } from './button';

const meta: Meta = {
  title: 'Domain/CalendarSelectionComposer',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

const now   = new Date(2026, 5, 30, 10, 0, 0);
const later = new Date(2026, 5, 30, 11, 30, 0);

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    const [last, setLast] = React.useState<string | null>(null);
    return (
      <div className="relative h-72 w-full bg-canvas flex flex-col items-center justify-center gap-4">
        <Button variant="secondary" onClick={() => setOpen(true)}>Open composer</Button>
        {last && <p className="text-small text-ink-secondary">Last action: {last}</p>}
        <CalendarSelectionComposer
          range={{ start: now, end: later }}
          open={open}
          onClose={() => setOpen(false)}
          onOfferTime={() => { setLast('offer time'); setOpen(false); }}
          onScheduleStudent={() => { setLast('schedule student'); setOpen(false); }}
          onBlockTime={() => { setLast('block time'); setOpen(false); }}
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </div>
    );
  },
};

export const ShortDuration: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    const start = new Date(2026, 5, 30, 14, 0, 0);
    const end   = new Date(2026, 5, 30, 14, 45, 0);
    return (
      <div className="relative h-64 w-full bg-canvas flex items-center justify-center">
        <CalendarSelectionComposer
          range={{ start, end }}
          open={open}
          onClose={() => setOpen(false)}
          onOfferTime={() => setOpen(false)}
          onScheduleStudent={() => setOpen(false)}
          onBlockTime={() => setOpen(false)}
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </div>
    );
  },
};
