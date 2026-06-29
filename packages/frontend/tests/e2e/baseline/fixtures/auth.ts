import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { SEEDED } from './users';

/**
 * Submit the login form on `/auth` and wait for redirect to the role-appropriate dashboard.
 * Uses the i18n English form labels rendered by AuthPage.tsx.
 */
export async function loginAs(
  page: Page,
  role: 'professor' | 'student',
): Promise<void> {
  const creds = SEEDED[role];
  await page.goto('/auth');
  await page.getByLabel('Email', { exact: true }).first().fill(creds.email);
  await page.getByLabel('Password', { exact: true }).first().fill(creds.password);
  // Two buttons on the page match /sign in/i — the role tab and the form
  // submit. Scope to the submit type to avoid strict-mode ambiguity.
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
  const expectedPrefix = role === 'professor' ? '/admin' : '/dashboard';
  await page.waitForURL(new RegExp(expectedPrefix));
  await expect(page).toHaveURL(new RegExp(expectedPrefix));
}

/**
 * Logout via the dashboard UI; falls back to clearing auth-storage if the
 * dashboard logout control is not surfaced (e.g. for back-to-back tests
 * that need a clean slate before redirect logic kicks in).
 */
export async function logout(page: Page): Promise<void> {
  await page.evaluate(() => window.localStorage.removeItem('auth-storage'));
  await page.evaluate(() => window.localStorage.removeItem('token'));
  await page.goto('/');
}
