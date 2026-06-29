import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { PageHeader } from './page-header';
import { Button } from './button';

const meta: Meta<typeof PageHeader> = {
  title: 'UI/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

export const TitleOnly: Story = { args: { title: 'Schedule' } };

export const WithDescription: Story = {
  args: {
    title: 'My Bookings',
    description: 'Upcoming, pending, and past lesson requests.',
  },
};

export const WithAction: Story = {
  args: {
    title: 'Availability',
    description: 'Manage your available times.',
    action: <Button variant="primary">Add slot</Button>,
  },
};

export const WithBreadcrumb: Story = {
  args: {
    title: 'Maria Garcia',
    description: 'Goals · B2 level · Active since January',
    breadcrumb: 'Students',
    action: <Button variant="secondary">Edit</Button>,
  },
};
