import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures/auth';

/**
 * Phase 0 baseline — cancellation behavior.
 *
 * Protects (where possible against the seeded backend):
 *  - Student bookings page is the surface where cancellation lives
 *  - Professor slots/calendar pages are where slot cancellation lives
 *
 * Deferred — `test.fixme()`:
 *  - Full cancel-with-reason transitions require a pre-existing booking
 *    in a cancellable state, which depends on the same seed chain as
 *    professor-approval.spec.ts.
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

  test.fixme('student cancel before confirmation records a student-initiated cancellation', async () => {
    // Depends on a seeded pending booking. Tracked P0-TEST-003.
  });

  test.fixme('student cancel after confirmation records a student-initiated cancellation', async () => {
    // Depends on a seeded confirmed booking. Tracked P0-TEST-003.
  });

  test.fixme('professor cancels a slot with bookings', async () => {
    // Depends on a seeded confirmed booking attached to a slot. Tracked P0-TEST-003.
  });
});
