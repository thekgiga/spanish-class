import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './icon-button';
import { Trash2, Settings, Download, Bell } from 'lucide-react';

const meta: Meta<typeof IconButton> = {
  title: 'UI/IconButton',
  component: IconButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: { label: 'Settings', children: <Settings className="h-5 w-5" /> },
};

export const Destructive: Story = {
  args: { label: 'Delete item', variant: 'danger', children: <Trash2 className="h-5 w-5" /> },
};

export const Disabled: Story = {
  args: { label: 'Download disabled', children: <Download className="h-5 w-5" />, disabled: true },
};

export const Loading: Story = {
  args: { label: 'Loading', children: <Bell className="h-5 w-5" />, isLoading: true },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton label="Small" size="sm"><Settings className="h-3.5 w-3.5" /></IconButton>
      <IconButton label="Medium" size="md"><Settings className="h-4 w-4" /></IconButton>
      <IconButton label="Large" size="lg"><Settings className="h-5 w-5" /></IconButton>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <IconButton label="Primary" variant="primary"><Settings className="h-4 w-4" /></IconButton>
      <IconButton label="Secondary" variant="secondary"><Settings className="h-4 w-4" /></IconButton>
      <IconButton label="Quiet (default)" variant="quiet"><Settings className="h-4 w-4" /></IconButton>
      <IconButton label="Destructive" variant="danger"><Trash2 className="h-4 w-4" /></IconButton>
    </div>
  ),
};
