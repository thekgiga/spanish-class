import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { EmptyState } from './empty-state';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar } from './skeleton';
import { Button } from './button';
import { Calendar, BookOpen } from 'lucide-react';

const emptyMeta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default emptyMeta;
type EmptyStory = StoryObj<typeof EmptyState>;

export const NoBookings: EmptyStory = {
  args: {
    icon: <BookOpen className="h-10 w-10" />,
    title: 'No bookings yet',
    description: 'Request a lesson from your professor to get started.',
    action: <Button variant="primary">Book a lesson</Button>,
  },
};

export const NoSlots: EmptyStory = {
  args: {
    icon: <Calendar className="h-10 w-10" />,
    title: 'No available times',
    description: 'Check back later or contact your professor.',
  },
};

export const MinimalText: EmptyStory = {
  args: { title: 'No pending approvals', description: 'New booking requests will appear here.' },
};
