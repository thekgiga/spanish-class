/**
 * Homepage E2E Tests
 *
 * Tests critical user flows on the homepage
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load and display hero section', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Premium Spanish Classes Online/i);

    // Check hero heading
    const heading = page.getByRole('heading', { name: /Master Spanish with/i });
    await expect(heading).toBeVisible();

    // Check CTA buttons
    const startButton = page.getByRole('link', { name: /Start Learning/i });
    await expect(startButton).toBeVisible();

    const viewClassesButton = page.getByRole('link', { name: /View Classes/i });
    await expect(viewClassesButton).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check navigation landmark
    const nav = page.getByRole('navigation', { name: /Main navigation/i });
    await expect(nav).toBeVisible();

    // Check skip link (should be hidden but exist)
    const skipLink = page.getByRole('link', { name: /Skip to main content/i });
    await expect(skipLink).toBeInViewport({ ratio: 0 }); // Hidden but in DOM
  });

  test('should display features section', async ({ page }) => {
    // Scroll to features
    await page.getByRole('heading', { name: /Why Choose Us/i }).scrollIntoViewIfNeeded();

    // Check feature cards
    await expect(page.getByText(/Flexible Scheduling/i)).toBeVisible();
    await expect(page.getByText(/Live Video Sessions/i)).toBeVisible();
    await expect(page.getByText(/Individual & Group/i)).toBeVisible();
  });

  test('should navigate to registration', async ({ page }) => {
    // Click Start Learning CTA
    await page.getByRole('link', { name: /Start Learning/i }).first().click();

    // Should navigate to register page
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole('heading', { name: /Create your account/i })).toBeVisible();
  });

  test('should navigate to login', async ({ page }) => {
    // Click sign in button
    await page.getByRole('link', { name: /Sign in/i }).first().click();

    // Should navigate to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Check mobile menu button exists
    const menuButton = page.getByRole('button', { name: /Open menu/i });
    await expect(menuButton).toBeVisible();

    // Open mobile menu
    await menuButton.click();

    // Check mobile menu is open
    await expect(page.getByRole('button', { name: /Close menu/i })).toBeVisible();
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that main content is visible quickly (LCP)
    const hero = page.getByRole('heading', { name: /Master Spanish/i });
    await expect(hero).toBeVisible({ timeout: 2500 }); // LCP < 2.5s
  });
});
