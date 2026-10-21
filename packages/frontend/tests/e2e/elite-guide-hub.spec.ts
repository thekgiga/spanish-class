/**
 * Elite Guide hub E2E — verifies the intent-organized information architecture
 * of the rebuilt /elite-guide page (cornerstone, path shortcuts, themed
 * sections, consultation CTA). Static content page; English i18n defaults.
 */
import { test, expect } from '@playwright/test';

test.describe('Elite Guide hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/elite-guide');
  });

  test('shows hero, cornerstone, and path shortcuts', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1, name: /Your guide through Spain/i }),
    ).toBeVisible();

    // "Start here" cornerstone with a single primary action
    await expect(page.getByRole('heading', { name: /Start here\.?$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Why I started Elite Education/i })).toBeVisible();

    // Three intent shortcuts
    await expect(page.getByRole('heading', { name: /Where would you like to start/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /I want to study in Spain/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /I want to learn Spanish/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /parent exploring camps/i })).toBeVisible();
  });

  test('renders the four themed sections', async ({ page }) => {
    for (const name of [/^Study in Spain$/i, /^Learn Spanish$/i, /^Living & settling in$/i, /^Stories & experience$/i]) {
      await expect(page.getByRole('heading', { name })).toBeVisible();
    }
    // featured article is promoted to the cornerstone, not duplicated as a grid card
    await expect(page.getByRole('link', { name: /^Why I started Elite Education$/i })).toHaveCount(1);
  });

  test('path shortcut scrolls to its section', async ({ page }) => {
    await page.getByRole('link', { name: /I want to study in Spain/i }).click();
    await expect(page.locator('#guide-study')).toBeInViewport();
  });

  test('closing CTA links to the consultation page', async ({ page }) => {
    const cta = page.getByRole('link', { name: /Book a consultation/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/contact');
  });
});
