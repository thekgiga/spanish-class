import { defineConfig, devices } from '@playwright/test';

/**
 * Phase 0 baseline regression suite configuration.
 *
 * Targets the running Docker Compose stack (Caddy on :80) instead of the
 * `npm run preview` Vite preview server used by the existing
 * `playwright.config.ts`. This keeps the production-like stack as the
 * source of truth for regression coverage, and avoids re-building the
 * frontend just to run E2E.
 *
 * Run from packages/frontend:
 *   npx playwright test --config tests/e2e/baseline/playwright.baseline.config.ts
 */
export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASELINE_BASE_URL ?? 'http://localhost',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});
