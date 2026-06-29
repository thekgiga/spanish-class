import { test, expect } from '@playwright/test';
import { loginAs, logout } from './fixtures/auth';
import { SEEDED } from './fixtures/users';

/**
 * Phase 0 baseline — authentication.
 *
 * Protects:
 *  - Login (no-2FA path), per BPMN §1.2
 *  - Logout, per BPMN §1.4
 *  - Forgot password initiation, per BPMN §1.3
 *  - `/login` and `/register` legacy redirects
 *
 * Out of scope for the baseline:
 *  - Email verification clicks the link in a sent email — server-side; not exercised
 *  - 2FA branch — deferred to Phase 6 polish
 *  - Account registration end-to-end — requires inbox; deferred
 */

test.describe('baseline: authentication', () => {
  test('student can sign in and reach the dashboard', async ({ page }) => {
    await loginAs(page, 'student');
    await expect(page).toHaveURL(/\/dashboard(?:$|\/)/);
  });

  test('professor can sign in and reach the admin shell', async ({ page }) => {
    await loginAs(page, 'professor');
    await expect(page).toHaveURL(/\/admin(?:$|\/)/);
  });

  test('invalid credentials surface an error', async ({ page }) => {
    await page.goto('/auth');
    await page.getByLabel('Email', { exact: true }).first().fill(SEEDED.student.email);
    await page.getByLabel('Password', { exact: true }).first().fill('not-the-real-password');
    await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
    // Toast or inline error must surface; the AuthPage uses react-hot-toast
    // for transient errors. We do not depend on a specific copy beyond the
    // page failing to navigate.
    await expect(page).toHaveURL(/\/auth/);
  });

  test('legacy /login and /register redirect to /auth', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/auth$/);
    await page.goto('/register');
    await expect(page).toHaveURL(/\/auth$/);
  });

  test('forgot-password page is reachable and renders the email form', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading')).toBeVisible();
    // The form exposes an email control; we don't submit since that fires
    // a real email send via the dev SMTP. The presence of the input is
    // what the baseline protects.
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
  });

  test('logout clears the session', async ({ page }) => {
    await loginAs(page, 'student');
    await logout(page);
    // After clearing auth state, /dashboard must redirect to /auth.
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth/);
  });
});
