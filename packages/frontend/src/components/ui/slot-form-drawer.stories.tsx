import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SlotFormDrawer } from './slot-form-drawer';

const meta: Meta = {
  title: 'Domain/SlotFormDrawer',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const CreateAvailability: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return <SlotFormDrawer open={open} onClose={() => setOpen(false)} />;
  },
};

export const CreateWithPrefill: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    const prefill = {
      startTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      endTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    };
    return <SlotFormDrawer open={open} onClose={() => setOpen(false)} prefill={prefill} />;
  },
};

export const ScheduleStudent: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <SlotFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        prefill={{ scheduleStudent: true }}
      />
    );
  },
};

export const RecurringMode: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return <SlotFormDrawer open={open} onClose={() => setOpen(false)} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Open the drawer and toggle "Repeat weekly" to see the recurring fields and RecurringPreview.',
      },
    },
  },
};

/** Group session selected — Individual/Group toggle in active Group state, maxParticipants stepper visible. */
export const GroupSession: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return <SlotFormDrawer open={open} onClose={() => setOpen(false)} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Open the drawer on the My Availability tab and click "Group" to reveal the max-participants stepper. Default value is 2; max is 20.',
      },
    },
  },
};

/** Max participants stepper at boundary values (interact: set to 2 for min, 20 for max). */
export const GroupSessionMaxParticipants: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return <SlotFormDrawer open={open} onClose={() => setOpen(false)} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Click Group, then use the −/+ stepper. The − button is disabled at 2; the + button is disabled at 20. The number input also clamps to [2, 20].',
      },
    },
  },
};

/** Availability slot with visibility set to "Specific students" — the multi-select picker is visible. */
export const AvailabilityPrivate: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return <SlotFormDrawer open={open} onClose={() => setOpen(false)} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Open the drawer on the My Availability tab and click "Specific students" to reveal the multi-select student picker. Selecting students adds removable chips above the list. Submitting without selecting any student shows a validation error.',
      },
    },
  },
};

/** Edit mode with a private slot — visibility toggle pre-set to "Specific students" and allowed-student chips populated. */
export const EditPrivate: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    // slotId is provided so the drawer fetches and hydrates the existing slot.
    // In Storybook the query will show loading state since no MSW handler is set up.
    return <SlotFormDrawer open={open} onClose={() => setOpen(false)} slotId="story-private-slot" />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Edit mode for a private slot. The drawer loads the slot via professorApi.getSlot(), hydrates isPrivate=true, and pre-selects the allowedStudents chips. Changing to "Everyone" clears the selection.',
      },
    },
  },
};

/** Block time — opens My Availability tab with "Private hold" pre-selected in the session-type group. */
export const BlockTime: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <SlotFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        prefill={{ blockTime: true }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Opens the My Availability tab with "Private hold" pre-selected in the session-type group. Professor can optionally check "Block the whole day" to hide time/duration. Submit calls POST /slots with slotType=BLOCKED.',
      },
    },
  },
};

/** Block time — all-day variant. Open the story and check "Block the whole day" to see the layout collapse. */
export const BlockTimeAllDay: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <SlotFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        prefill={{ blockTime: true }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Same as BlockTime. Check "Block the whole day" checkbox to hide start-time and duration fields. The blocked slot will cover the entire day (00:00–23:59).',
      },
    },
  },
};
