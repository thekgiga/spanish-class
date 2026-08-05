import type { Meta, StoryObj } from '@storybook/react';
import { StudentDashboardSkeleton, AdminShellSkeleton } from './RouteSkeletons';

/**
 * RouteSkeletons — geometry-matched Suspense fallbacks used inside
 * DashboardLayout while a lazy-loaded page chunk downloads. The purpose of
 * these stories is not visual variation (there are no props) but visual
 * reviewability: reviewers can see the silhouettes without reproducing a
 * slow-network scenario.
 */
const meta: Meta = {
  title: 'Shared/RouteSkeletons',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Suspense fallbacks that keep the shell mounted while a route chunk downloads. Match the destination page altitude so the transition to real content does not shift layout.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const StudentDashboard: Story = {
  name: 'StudentDashboardSkeleton',
  render: () => (
    <div className="min-h-screen bg-canvas p-6 sm:p-8">
      <StudentDashboardSkeleton />
    </div>
  ),
};

export const AdminShell: Story = {
  name: 'AdminShellSkeleton',
  render: () => (
    <div className="min-h-screen bg-canvas p-6 sm:p-8">
      <AdminShellSkeleton />
    </div>
  ),
};
