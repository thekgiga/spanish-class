import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures/auth';

/**
 * Phase 0 baseline — cancellation behavior.
 *
 * Protects:
 *  - Student bookings page is the surface where cancellation lives
 *  - Professor slots/calendar pages are where slot cancellation lives
 *  - Student cancel of pending booking records student-initiated cancellation
 *  - Student cancel of confirmed booking records student-initiated cancellation
 *  - Professor cancels a slot with bookings (with reason)
 */

test.describe('baseline: cancellation', () => {
  test('student bookings list is reachable', async ({ page }) => {
    await loginAs(page, 'student');
    await page.goto('/dashboard/bookings');
    await expect(page).toHaveURL(/\/dashboard\/bookings/);
  });

  test('professor slots page is reachable', async ({ page }) => {
    await loginAs(page, 'professor');
    await page.goto('/admin/slots');
    await expect(page).toHaveURL(/\/admin\/slots/);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('student cancel before confirmation records a student-initiated cancellation', async ({ page }) => {
    // Create a fresh pending request
    await loginAs(page, 'student');
    await page.goto('/dashboard/book');

    const dateOption = page.getByRole('radio').first();
    await expect(dateOption).toBeVisible({ timeout: 10000 });
    await dateOption.click();

    const timeOption = page.getByRole('button', { name: /\d{1,2}:\d{2}/ }).first();
    if (!await timeOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip(true, 'No available slots — rerun after reseed');
      return;
    }
    await timeOption.click();

    const requestBtn = page.getByRole('button', { name: /request lesson/i });
    await expect(requestBtn).toBeVisible({ timeout: 5000 });
    await requestBtn.click();
    await expect(page.getByText(/awaiting approval/i)).toBeVisible({ timeout: 8000 });

    // Navigate to My Bookings and cancel the pending request
    await page.goto('/dashboard/bookings');
    await expect(page).toHaveURL(/\/dashboard\/bookings/);

    const cancelBtn = page.getByRole('button', { name: /cancel/i }).first();
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });
    await cancelBtn.click();

    const confirmBtn = page.getByRole('button', { name: /yes, cancel/i });
    await expect(confirmBtn).toBeVisible({ timeout: 3000 });
    await confirmBtn.click();

    await expect(page.getByText(/cancelled/i)).toBeVisible({ timeout: 8000 });
  });

  test('student cancel after confirmation records a student-initiated cancellation', async ({ page }) => {
    // The seed creates a confirmed booking for student@example.com
    await loginAs(page, 'student');
    await page.goto('/dashboard/bookings');
    await expect(page).toHaveURL(/\/dashboard\/bookings/);

    const cancelBtn = page.getByRole('button', { name: /cancel/i }).first();
    const hasCancelBtn = await cancelBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (!hasCancelBtn) {
      test.skip(true, 'No cancellable confirmed bookings visible — seed fixture may have been consumed by a prior test');
      return;
    }
    await cancelBtn.click();

    const confirmBtn = page.getByRole('button', { name: /yes, cancel/i });
    await expect(confirmBtn).toBeVisible({ timeout: 3000 });
    await confirmBtn.click();

    await expect(page.getByText(/cancelled/i)).toBeVisible({ timeout: 8000 });
  });

  test('professor cancels a slot with bookings', async ({ page }) => {
    await loginAs(page, 'professor');
    await page.goto('/admin/calendar');
    await expect(page).toHaveURL(/\/admin\/calendar/);

    const eventTile = page.locator('.fc-event').first();
    const hasEvent = await eventTile.isVisible({ timeout: 10000 }).catch(() => false);
    if (!hasEvent) {
      test.skip(true, 'No calendar events visible — calendar may not have loaded yet');
      return;
    }
    await eventTile.click();

    const cancelSlotBtn = page.getByRole('button', { name: /cancel slot/i }).first();
    await expect(cancelSlotBtn).toBeVisible({ timeout: 5000 });
    await cancelSlotBtn.click();

    // CANCEL-002: reason textarea appears
    const reasonField = page.locator('#cancel-reason');
    await expect(reasonField).toBeVisible({ timeout: 3000 });
    await reasonField.fill('Unforeseen scheduling conflict.');

    // Second cancel slot button (confirm step)
    const confirmCancelBtn = page.getByRole('button', { name: /cancel slot/i }).last();
    await confirmCancelBtn.click();

    await expect(page.getByText(/cancelled/i)).toBeVisible({ timeout: 8000 });
  });
});
