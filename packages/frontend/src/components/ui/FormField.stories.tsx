import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { FormField } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'UI/FormField',
  component: FormField,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = { args: { label: 'Email', placeholder: 'you@example.com', type: 'email' } };
export const WithHelper: Story = { args: { label: 'Username', helperText: 'Must be 3–20 characters.' } };
export const WithError: Story = { args: { label: 'Password', type: 'password', error: 'Password is too short.' } };
export const Required: Story = { args: { label: 'Name', required: true } };
export const Disabled: Story = { args: { label: 'Disabled', disabled: true, value: 'Cannot change' } };
