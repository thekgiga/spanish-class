import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Mail, Lock, Search } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    inputSize: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-80">
      <label htmlFor="email" className="block text-sm font-medium mb-2">
        Email address
      </label>
      <Input
        id="email"
        type="email"
        placeholder="you@example.com"
      />
    </div>
  ),
};

export const WithLeftIcon: Story = {
  args: {
    placeholder: 'Search...',
    leftIcon: <Search className="h-4 w-4" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    type: 'email',
    placeholder: 'Email address',
    rightIcon: <Mail className="h-4 w-4" />,
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
    leftIcon: <Lock className="h-4 w-4" />,
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Email address',
    error: 'Please enter a valid email address',
    defaultValue: 'invalid-email',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    defaultValue: 'Cannot edit',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <Input inputSize="sm" placeholder="Small" />
      <Input inputSize="md" placeholder="Medium (default)" />
      <Input inputSize="lg" placeholder="Large" />
    </div>
  ),
};

export const CompleteForm: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Full Name
        </label>
        <Input
          id="name"
          placeholder="John Doe"
        />
      </div>
      <div>
        <label htmlFor="email-form" className="block text-sm font-medium mb-2">
          Email
        </label>
        <Input
          id="email-form"
          type="email"
          placeholder="john@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Enter password"
          leftIcon={<Lock className="h-4 w-4" />}
        />
      </div>
      <div>
        <label htmlFor="search" className="block text-sm font-medium mb-2">
          Search
        </label>
        <Input
          id="search"
          placeholder="Search..."
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>
    </div>
  ),
};
