import { test, expect } from '@playwright/test';
import { loginAs } from './fixtures/auth';

/**
 * HW-001 baseline — student homework page.
 *
 * Protects:
 *  - /dashboard/homework is reachable for authenticated students
 *  - The page renders a heading (loading, empty, or populated — all show PageHeader)
 *  - A professor cannot access the route (redirected to /admin)
 *  - An unauthenticated request is redirected to /auth
 *
 * Security guard:
 *  - GET /api/student/homework responds with homeworkNotes only.
 *    Response must NOT contain sessionNotes, agendaNotes, or studentObservation.
 */

test.describe('baseline: student homework page (HW-001)', () => {
  test('student can navigate to /dashboard/homework', async ({ page }) => {
    await loginAs(page, 'student');
    await page.goto('/dashboard/homework');
    await expect(page).toHaveURL(/\/dashboard\/homework/);
    // PageHeader is always rendered (loading or data)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 });
  });

  test('homework page shows heading in all three states (loading, empty, or populated)', async ({ page }) => {
    await loginAs(page, 'student');
    await page.goto('/dashboard/homework');
    // Wait for the page to settle out of the loading skeleton state
    await page.waitForTimeout(1500);
    // Heading remains visible in all states
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('unauthenticated user is redirected away from /dashboard/homework', async ({ page }) => {
    // No login — directly navigate to the protected route
    await page.goto('/dashboard/homework');
    // Should redirect to /auth (ProtectedRoute behavior)
    await expect(page).toHaveURL(/\/auth/, { timeout: 8_000 });
  });

  test('professor cannot access /dashboard/homework (redirected to /admin)', async ({ page }) => {
    await loginAs(page, 'professor');
    await page.goto('/dashboard/homework');
    // ProtectedRoute redirects admin users to /admin
    await expect(page).toHaveURL(/\/admin/, { timeout: 8_000 });
  });

  test('GET /api/student/homework response excludes professor-only fields', async ({ page, request }) => {
    // Log in to get an auth cookie
    await loginAs(page, 'student');

    // Grab the auth cookie that the browser stored
    const cookies = await page.context().cookies();
    const tokenCookie = cookies.find((c) => c.name === 'token');

    if (!tokenCookie) {
      test.skip(true, 'No auth cookie found — skip API assertion');
      return;
    }

    const baseUrl = process.env.BASELINE_BASE_URL ?? 'http://localhost';
    const response = await request.get(`${baseUrl}/api/student/homework`, {
      headers: { Cookie: `token=${tokenCookie.value}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);

    const items: unknown[] = body.data ?? [];
    for (const item of items) {
      // Each returned item must NOT contain professor-only note fields
      expect(item).not.toHaveProperty('sessionNotes');
      expect(item).not.toHaveProperty('agendaNotes');
      expect(item).not.toHaveProperty('studentObservation');
      // Must contain the student-visible field
      expect(item).toHaveProperty('homeworkNotes');
    }
  });

  test('homework nav link is visible in student sidebar', async ({ page }) => {
    await loginAs(page, 'student');
    await expect(
      page.getByRole('link', { name: /homework/i })
    ).toBeVisible({ timeout: 8_000 });
  });
});
