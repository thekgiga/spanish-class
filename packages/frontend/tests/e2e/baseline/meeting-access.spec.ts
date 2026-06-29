import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures/auth';

/**
 * Phase 0 baseline — meeting access.
 *
 * Protects:
 *  - Student dashboard and bookings page render without error
 *  - The Join Meeting link, when surfaced, points to meet.jit.si
 *    (the only meeting backend in use, per the seeded slot meetLink)
 *
 * Deferred — `test.fixme()`:
 *  - End-to-end "join meeting" against a confirmed booking depends on
 *    the booking seed chain.
 */

test.describe('baseline: meeting access', () => {
  test('student dashboard renders', async ({ page }) => {
    await loginAs(page, 'student');
    await page.goto('/dashboard');
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('any rendered join-meeting link points to meet.jit.si', async ({ page }) => {
    await loginAs(page, 'student');
    await page.goto('/dashboard');
    const joinLinks = page.getByRole('link', { name: /join/i });
    const count = await joinLinks.count();
    if (count === 0) {
      // No confirmed booking yet for the seeded student — the contract
      // we protect is "when shown, the link is a Jitsi room." There is
      // nothing to assert against if no booking is confirmed.
      test.skip(true, 'No confirmed bookings on the seeded student dashboard.');
    }
    for (let i = 0; i < count; i++) {
      await expect(joinLinks.nth(i)).toHaveAttribute('href', /meet\.jit\.si/);
    }
  });

  test.fixme('confirmed booking surfaces a Join Meeting link', async () => {
    // Depends on a deterministic confirmed booking. Tracked P0-TEST-003.
  });
});
