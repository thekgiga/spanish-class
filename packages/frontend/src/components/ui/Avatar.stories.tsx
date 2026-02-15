import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarFallback } from './avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Avatar size',
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Avatar shape',
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'busy', 'away'],
      description: 'Status indicator',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    alt: 'User avatar',
  },
};

export const WithInitials: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const WithStatus: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    alt: 'User avatar',
    status: 'online',
  },
};

export const Online: Story = {
  render: () => (
    <Avatar status="online">
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

export const Busy: Story = {
  render: () => (
    <Avatar status="busy">
      <AvatarFallback>CD</AvatarFallback>
    </Avatar>
  ),
};

export const Away: Story = {
  render: () => (
    <Avatar status="away">
      <AvatarFallback>EF</AvatarFallback>
    </Avatar>
  ),
};

export const Offline: Story = {
  render: () => (
    <Avatar status="offline">
      <AvatarFallback>GH</AvatarFallback>
    </Avatar>
  ),
};

export const Square: Story = {
  args: {
    shape: 'square',
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    alt: 'User avatar',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="xs">
        <AvatarFallback>XS</AvatarFallback>
      </Avatar>
      <Avatar size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar size="md">
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
      <Avatar size="xl">
        <AvatarFallback>XL</AvatarFallback>
      </Avatar>
      <Avatar size="2xl">
        <AvatarFallback>2XL</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const StatusIndicators: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <Avatar status="online">
          <AvatarFallback>ON</AvatarFallback>
        </Avatar>
        <p className="text-xs mt-2">Online</p>
      </div>
      <div className="text-center">
        <Avatar status="busy">
          <AvatarFallback>BS</AvatarFallback>
        </Avatar>
        <p className="text-xs mt-2">Busy</p>
      </div>
      <div className="text-center">
        <Avatar status="away">
          <AvatarFallback>AW</AvatarFallback>
        </Avatar>
        <p className="text-xs mt-2">Away</p>
      </div>
      <div className="text-center">
        <Avatar status="offline">
          <AvatarFallback>OF</AvatarFallback>
        </Avatar>
        <p className="text-xs mt-2">Offline</p>
      </div>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="flex -space-x-3">
      <Avatar className="border-2 border-white">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-white">
        <AvatarFallback>CD</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-white">
        <AvatarFallback>EF</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-white">
        <AvatarFallback>+5</AvatarFallback>
      </Avatar>
    </div>
  ),
};
