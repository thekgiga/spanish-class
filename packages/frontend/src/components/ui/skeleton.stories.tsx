import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Line: Story = { render: () => <Skeleton className="h-4 w-full" /> };
export const Avatar: Story = { render: () => <SkeletonAvatar /> };
export const Text: Story = { render: () => <SkeletonText lines={4} /> };
export const Card: Story = { render: () => <SkeletonCard /> };

export const ListSkeleton: Story = {
  render: () => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonAvatar />
          <SkeletonText lines={2} className="flex-1" />
        </div>
      ))}
    </div>
  ),
};
