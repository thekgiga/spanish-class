/**
 * Accessibility E2E Tests
 *
 * Automated accessibility testing with axe-core
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  { url: '/', name: 'Homepage' },
  { url: '/login', name: 'Login' },
  { url: '/register', name: 'Register' },
];

test.describe('Accessibility', () => {
  for (const { url, name } of pages) {
    test(`${name} should not have accessibility violations`, async ({ page }) => {
      await page.goto(url);

      // Run axe accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Assert no violations
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test(`${name} should have proper heading hierarchy`, async ({ page }) => {
      await page.goto(url);

      // Get all headings
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

      // Should have at least one H1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      expect(h1Count).toBeLessThanOrEqual(1); // Only one H1 per page

      // All headings should be visible or have proper aria attributes
      for (const heading of headings) {
        const isVisible = await heading.isVisible();
        const ariaHidden = await heading.getAttribute('aria-hidden');

        if (!isVisible) {
          expect(ariaHidden).toBe('true');
        }
      }
    });

    test(`${name} should have proper focus management`, async ({ page }) => {
      await page.goto(url);

      // Tab through interactive elements
      let focusableCount = 0;
      const maxTabs = 50; // Safety limit

      for (let i = 0; i < maxTabs; i++) {
        await page.keyboard.press('Tab');

        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tag: el?.tagName.toLowerCase(),
            role: el?.getAttribute('role'),
            ariaLabel: el?.getAttribute('aria-label'),
          };
        });

        if (focusedElement.tag === 'body') break; // Cycled through all elements

        focusableCount++;
      }

      // Should have some focusable elements
      expect(focusableCount).toBeGreaterThan(0);
    });
  }

  test('Skip link should work', async ({ page }) => {
    await page.goto('/');

    // Focus skip link with keyboard
    await page.keyboard.press('Tab');

    // Check skip link is focused
    const skipLink = page.getByRole('link', { name: /Skip to main content/i });
    await expect(skipLink).toBeFocused();

    // Click skip link
    await skipLink.click();

    // Main content should be in view
    const main = page.locator('main, [role="main"], #main-content').first();
    await expect(main).toBeInViewport();
  });

  test('Forms should have proper labels', async ({ page }) => {
    await page.goto('/login');

    // All inputs should have associated labels
    const inputs = await page.locator('input').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      // Should have either a label (via id), aria-label, or aria-labelledby
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelExists = await label.count() > 0;
        const hasAriaLabel = ariaLabel !== null || ariaLabelledBy !== null;

        expect(labelExists || hasAriaLabel).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });
});
