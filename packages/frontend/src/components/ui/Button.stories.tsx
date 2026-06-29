import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { ArrowRight, Download, Trash2 } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'quiet', 'danger', 'link', 'outline', 'ghost', 'cta'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    isLoading: { control: 'boolean' },
    disabled:  { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ── Contract variants ─────────────────────────────────────────────────────

export const Primary: Story = { args: { variant: 'primary', children: 'Primary' } };

export const Secondary: Story = { args: { variant: 'secondary', children: 'Secondary' } };

export const Quiet: Story = { args: { variant: 'quiet', children: 'Quiet' } };

export const Danger: Story = { args: { variant: 'danger', children: 'Delete' } };

export const Link: Story = { args: { variant: 'link', children: 'Learn more' } };

// ── States ────────────────────────────────────────────────────────────────

export const Loading: Story = { args: { variant: 'primary', children: 'Saving…', isLoading: true } };

export const Disabled: Story = { args: { variant: 'primary', children: 'Disabled', disabled: true } };

export const WithTrailingIcon: Story = {
  args: {
    variant: 'primary',
    children: (
      <>
        Continue <ArrowRight className="h-4 w-4" />
      </>
    ),
  },
};

export const WithLeadingIcon: Story = {
  args: {
    variant: 'secondary',
    children: (
      <>
        <Download className="h-4 w-4" /> Download
      </>
    ),
  },
};

export const DestructiveWithIcon: Story = {
  args: {
    variant: 'danger',
    children: (
      <>
        <Trash2 className="h-4 w-4" /> Delete forever
      </>
    ),
  },
};

// ── Sizes ─────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small (32px)</Button>
      <Button size="md">Medium (40px)</Button>
      <Button size="lg">Large (48px)</Button>
    </div>
  ),
};

// ── All contract variants at a glance ────────────────────────────────────

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="quiet">Quiet</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};
