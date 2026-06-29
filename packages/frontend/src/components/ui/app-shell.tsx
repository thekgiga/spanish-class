/**
 * AppShell — two-panel layout with optional collapsible sidebar and topbar.
 *
 * Contract (docs/ui-system/06-component-contracts.md §AppShell):
 * - sidebar 240px; collapsed 72px (named Tailwind tokens)
 * - topbar 64px
 * - mobile: bottom navigation / sidebar hidden
 *
 * This shell is a presentational primitive; data and auth guards stay in
 * DashboardLayout or page-level wrappers.
 */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// ── Skip link (WCAG 2.4.1 — Bypass Blocks) ───────────────────────────────

export function AppSkipLink({ className }: { className?: string }) {
  const { t } = useTranslation('common');
  return (
    <a
      href="#main-content"
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:absolute focus:top-4 focus:left-4 focus:z-50',
        'focus:px-5 focus:py-2 focus:rounded-ui-sm',
        'focus:bg-brand focus:text-brand-contrast focus:shadow-ui-2',
        'focus:ring-2 focus:ring-focus focus:ring-offset-2',
        'focus:text-small focus:font-semibold',
        className,
      )}
    >
      {t('aria_labels.skip_to_main')}
    </a>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────

export interface AppSidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
}

export function AppSidebar({ collapsed = false, className, children, ...props }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 h-full bg-surface border-r border-line',
        'flex flex-col transition-all duration-spatial ease-ui-standard',
        'hidden lg:flex',
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
        className,
      )}
      aria-label="Primary navigation"
      {...props}
    >
      {children}
    </aside>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────

export interface AppTopbarProps extends React.HTMLAttributes<HTMLElement> {
  sidebarCollapsed?: boolean;
}

export function AppTopbar({ sidebarCollapsed = false, className, children, ...props }: AppTopbarProps) {
  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 h-topbar bg-surface border-b border-line',
        'flex items-center px-4 transition-all duration-spatial ease-ui-standard',
        sidebarCollapsed ? 'lg:left-sidebar-collapsed' : 'lg:left-sidebar',
        'left-0',
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}

// ── Main content area ─────────────────────────────────────────────────────

export interface AppMainProps extends React.HTMLAttributes<HTMLElement> {
  sidebarCollapsed?: boolean;
}

export function AppMain({ sidebarCollapsed = false, className, children, ...props }: AppMainProps) {
  return (
    <main
      className={cn(
        'min-h-screen pt-topbar bg-canvas transition-all duration-spatial ease-ui-standard',
        sidebarCollapsed ? 'lg:pl-sidebar-collapsed' : 'lg:pl-sidebar',
        className,
      )}
      id="main-content"
      tabIndex={-1}
      {...props}
    >
      {children}
    </main>
  );
}

// ── Shell composition helper ──────────────────────────────────────────────

export interface AppShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
}

export function AppShell({ sidebar, topbar, children, sidebarCollapsed = false }: AppShellProps) {
  return (
    <div className="relative">
      <AppSkipLink />
      <AppSidebar collapsed={sidebarCollapsed}>{sidebar}</AppSidebar>
      <AppTopbar sidebarCollapsed={sidebarCollapsed}>{topbar}</AppTopbar>
      <AppMain sidebarCollapsed={sidebarCollapsed}>{children}</AppMain>
    </div>
  );
}
