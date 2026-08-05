import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures/auth';

/**
 * Phase 0 baseline — in-app notifications.
 *
 * Protects:
 *  - NotificationBell renders in the mobile dashboard shell for both roles
 *  - GET /api/notifications resolves without error
 *
 * Deferred — `test.fixme()`:
 *  - Desktop bell visibility (NotificationBell is mounted only inside
 *    DashboardLayout's lg:hidden mobile header, so desktop viewports
 *    have no bell — see audit/02-component-inventory.md).
 *  - End-to-end popover open + mark-as-read decrement requires a
 *    seeded notification, which the seed does not currently create.
 */

test.describe('baseline: notifications', () => {
  test.fixme(
    'desktop dashboard surfaces the notification bell',
    async () => {
      // Real gap: DashboardLayout currently renders NotificationBell only in
      // the mobile header (lg:hidden, see DashboardLayout.tsx:264-273).
      // Desktop viewports show no bell. Tracked NOTIF-001 and recorded in
      // docs/redesign/audit/02-component-inventory.md.
    },
  );

  test('mobile student dashboard shows the notification bell', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page, 'student');
    const bell = page.getByRole('button', { name: /notification/i });
    await expect(bell.first()).toBeVisible();
  });

  test('mobile professor dashboard shows the notification bell', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAs(page, 'professor');
    const bell = page.getByRole('button', { name: /notification/i });
    await expect(bell.first()).toBeVisible();
  });

  test('GET /api/notifications resolves with 2xx for the student', async ({ page }) => {
    await loginAs(page, 'student');
    const response = await page.waitForResponse(
      (r) => r.url().includes('/api/notifications') && r.request().method() === 'GET',
      { timeout: 15_000 },
    );
    expect(response.status(), 'notifications API must respond 2xx').toBeLessThan(300);
  });

  test.fixme('notification popover lists items and mark-as-read decrements the count', async () => {
    // Popover exists in NotificationBell.tsx but requires a seeded
    // notification. Phase 1 will extend the seed to provide one.
  });
});
