import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AppShell, AppSidebar, AppTopbar, AppMain } from './app-shell';

const meta: Meta = {
  title: 'UI/AppShell',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

export const Expanded: Story = {
  render: () => (
    <div className="h-64 relative overflow-hidden border border-line rounded-ui-md">
      <AppShell
        sidebar={
          <div className="p-4 text-small text-ink-secondary">Sidebar nav</div>
        }
        topbar={
          <div className="flex items-center gap-3 px-4 text-small font-medium text-ink">
            Spanish Class
          </div>
        }
      >
        <div className="p-6 text-small text-ink-secondary">Main content area</div>
      </AppShell>
    </div>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <div className="h-64 relative overflow-hidden border border-line rounded-ui-md">
      <AppShell
        sidebarCollapsed
        sidebar={<div className="p-2 text-small text-ink-secondary">⋮</div>}
        topbar={<div className="px-4 text-small font-medium text-ink">Spanish Class</div>}
      >
        <div className="p-6 text-small text-ink-secondary">Main content — sidebar collapsed to 72 px</div>
      </AppShell>
    </div>
  ),
};
