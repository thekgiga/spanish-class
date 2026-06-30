import { test, expect } from '@playwright/test';
import { loginAs, logout } from './fixtures/auth';

/**
 * Phase 0 baseline — professor approval workflow.
 *
 * Protects:
 *  - /admin/pending-approvals route is reachable for the professor role
 *  - Page renders without runtime error against the seeded backend
 *  - Approve transitions a pending request to confirmed
 *  - Reject with reason transitions a pending request to rejected
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

  test('approve transitions a pending request to confirmed', async ({ page }) => {
    await loginAs(page, 'professor');
    await page.goto('/admin/pending-approvals');
    await expect(page).toHaveURL(/\/admin\/pending-approvals/);

    // If no pending bookings, create one first via the student booking flow
    const reviewBtn = page.getByRole('button', { name: /review request/i }).first();
    const hasReview = await reviewBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasReview) {
      // Log out professor, log in as student, create a booking
      await logout(page);
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

      // Log back in as professor
      await logout(page);
      await loginAs(page, 'professor');
      await page.goto('/admin/pending-approvals');
    }

    const reviewBtnFinal = page.getByRole('button', { name: /review request/i }).first();
    await expect(reviewBtnFinal).toBeVisible({ timeout: 8000 });
    await reviewBtnFinal.click();

    const approveBtn = page.getByRole('button', { name: /^approve$/i });
    await expect(approveBtn).toBeVisible({ timeout: 5000 });
    await approveBtn.click();

    await expect(page.getByText(/approved/i)).toBeVisible({ timeout: 8000 });
  });

  test('reject with reason transitions a pending request to rejected', async ({ page }) => {
    // Create a fresh pending request via student booking flow
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

    // Switch to professor and reject
    await logout(page);
    await loginAs(page, 'professor');
    await page.goto('/admin/pending-approvals');

    const reviewBtn = page.getByRole('button', { name: /review request/i }).first();
    await expect(reviewBtn).toBeVisible({ timeout: 8000 });
    await reviewBtn.click();

    const rejectBtn = page.getByRole('button', { name: /^reject$/i });
    await expect(rejectBtn).toBeVisible({ timeout: 5000 });
    await rejectBtn.click();

    const reasonField = page.getByPlaceholder(/reason/i);
    await expect(reasonField).toBeVisible({ timeout: 3000 });
    await reasonField.fill('Schedule conflict — please rebook for next week.');

    const confirmRejectBtn = page.getByRole('button', { name: /confirm reject/i });
    await confirmRejectBtn.click();

    await expect(page.getByText(/rejected/i)).toBeVisible({ timeout: 8000 });
  });
});
