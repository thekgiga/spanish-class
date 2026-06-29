import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures/auth';

/**
 * Phase 0 baseline — professor approval workflow.
 *
 * Protects:
 *  - /admin/pending-approvals route is reachable for the professor role
 *  - Page renders without runtime error against the seeded backend
 *
 * Deferred — `test.fixme()`:
 *  - End-to-end approve/reject of a real booking request: requires a
 *    seeded "pending" booking, which depends on student-booking
 *    coverage running first or a test-only seed extension. Phase 1 wires
 *    the proper fixture chain. See
 *    docs/redesign/audit/04-booking-status-transition-map.md for the
 *    canonical state names referenced below.
 */

test.describe('baseline: professor approval workflow', () => {
  test('professor can open the pending-approvals page', async ({ page }) => {
    await loginAs(page, 'professor');
    await page.goto('/admin/pending-approvals');
    await expect(page).toHaveURL(/\/admin\/pending-approvals/);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('professor calendar page renders', async ({ page }) => {
    await loginAs(page, 'professor');
    await page.goto('/admin/calendar');
    await expect(page).toHaveURL(/\/admin\/calendar/);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test.fixme('approve transitions a pending request to confirmed', async () => {
    // Requires a deterministic pending booking. Phase 1 will
    // either run student-booking.spec first or add a test-only seed.
    // Tracked in matrix row P0-TEST-002.
  });

  test.fixme('reject with reason transitions a pending request to rejected', async () => {
    // Same fixture chain as above. Tracked in matrix row P0-TEST-002.
  });
});
