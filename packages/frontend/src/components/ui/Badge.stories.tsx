import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';
import { CheckCircle, Star, Users } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'destructive', 'success', 'gold', 'spanish'],
      description: 'Visual style variant',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Default',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
};

export const Gold: Story = {
  args: {
    variant: 'gold',
    children: 'Premium',
  },
};

export const Spanish: Story = {
  args: {
    variant: 'spanish',
    children: 'Spanish Class',
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'success',
    children: (
      <>
        <CheckCircle className="h-3 w-3 mr-1" />
        Confirmed
      </>
    ),
  },
};

export const ForYou: Story = {
  args: {
    variant: 'gold',
    children: (
      <>
        <Star className="h-3 w-3 mr-1 fill-current" />
        For You
      </>
    ),
  },
};

export const GroupSession: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        <Users className="h-3 w-3 mr-1" />
        Group
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="gold">Gold</Badge>
      <Badge variant="spanish">Spanish</Badge>
    </div>
  ),
};
