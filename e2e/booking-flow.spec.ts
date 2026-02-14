import { test, expect } from '@playwright/test';

test.describe('Complete Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('student can complete full booking journey', async ({ page }) => {
    // 1. Login as student
    await page.fill('input[name="email"]', 'student@example.com');
    await page.fill('input[name="password"]', 'Student123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/student/);

    // 2. Navigate to available slots
    await page.click('text=Book a Class');
    await expect(page).toHaveURL(/\/student\/book/);

    // 3. Select an available slot
    const firstAvailableSlot = page.locator('[data-testid="available-slot"]').first();
    await expect(firstAvailableSlot).toBeVisible();
    await firstAvailableSlot.click();

    // 4. Confirm booking
    await page.click('button:has-text("Confirm Booking")');

    // 5. Verify confirmation message
    await expect(page.locator('text=Booking confirmed!')).toBeVisible();

    // 6. Check that booking appears in dashboard
    await page.goto('/student/bookings');
    await expect(page.locator('[data-testid="booking-card"]')).toHaveCount(1);

    // 7. Verify meeting link is available
    const meetingLink = page.locator('a:has-text("Join Meeting")');
    await expect(meetingLink).toBeVisible();
    await expect(meetingLink).toHaveAttribute('href', /meet\.jit\.si/);
  });

  test('concurrent booking attempts handle race condition', async ({ browser }) => {
    // Create two browser contexts to simulate concurrent users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Both students login
    await Promise.all([
      loginAsStudent(page1, 'student1@example.com', 'Student123!'),
      loginAsStudent(page2, 'student2@example.com', 'Student123!'),
    ]);

    // Both navigate to booking page
    await Promise.all([
      page1.goto('/student/book'),
      page2.goto('/student/book'),
    ]);

    // Both try to book the same slot simultaneously
    const slotSelector = '[data-testid="available-slot"]:first-child';
    await Promise.all([
      page1.locator(slotSelector).click(),
      page2.locator(slotSelector).click(),
    ]);

    // Try to confirm booking simultaneously
    const confirmResults = await Promise.allSettled([
      page1.click('button:has-text("Confirm Booking")').catch(() => null),
      page2.click('button:has-text("Confirm Booking")').catch(() => null),
    ]);

    // Wait for responses
    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    // One should succeed, one should fail or see "fully booked"
    const page1Success = await page1.locator('text=Booking confirmed!').isVisible();
    const page2Success = await page2.locator('text=Booking confirmed!').isVisible();
    const page1Error = await page1.locator('text=fully booked').isVisible();
    const page2Error = await page2.locator('text=fully booked').isVisible();

    // Exactly one should succeed
    expect(page1Success || page2Success).toBe(true);
    expect(page1Success && page2Success).toBe(false);

    // The one that failed should see an error
    if (page1Success) {
      expect(page2Error).toBe(true);
    } else {
      expect(page1Error).toBe(true);
    }

    await context1.close();
    await context2.close();
  });

  test('student can cancel a booking', async ({ page }) => {
    // Login and create a booking first
    await loginAsStudent(page, 'student@example.com', 'Student123!');
    await page.goto('/student/bookings');

    // Assume there's already a booking
    const cancelButton = page.locator('button:has-text("Cancel")').first();
    await cancelButton.click();

    // Confirm cancellation
    await page.fill('textarea[name="reason"]', 'Schedule conflict');
    await page.click('button:has-text("Confirm Cancellation")');

    // Verify cancellation success
    await expect(page.locator('text=Booking cancelled')).toBeVisible();
  });

  test('professor can view booked students', async ({ page }) => {
    // Login as professor
    await page.fill('input[name="email"]', 'professor@spanishclass.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    // Navigate to schedule
    await page.goto('/admin/slots');

    // Click on a slot with bookings
    const bookedSlot = page.locator('[data-testid="booked-slot"]').first();
    await bookedSlot.click();

    // Verify student information is displayed
    await expect(page.locator('[data-testid="student-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="student-email"]')).toBeVisible();
  });
});

// Helper function
async function loginAsStudent(page: any, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/student/);
}
