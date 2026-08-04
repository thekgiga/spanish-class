/**
 * HW-001 responsive screenshot capture.
 * Run once to produce evidence; not part of the regression suite.
 */
import { test } from '@playwright/test';
import { loginAs } from './fixtures/auth';
import path from 'path';
import fs from 'fs';

const VIEWPORTS = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1440', width: 1440, height: 900 },
];

const OUT_DIR = path.join(
  process.cwd(),
  'docs/redesign/evidence/screenshots/hw-001',
);

test.describe('HW-001 responsive screenshots', () => {
  test.beforeAll(() => {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  });

  for (const vp of VIEWPORTS) {
    test(`homework page — ${vp.name}px`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      await loginAs(page, 'student');
      await page.goto('/dashboard/homework');
      // Wait for skeleton to resolve (either empty state or populated)
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(OUT_DIR, `homework-${vp.name}.png`),
        fullPage: true,
      });
      await ctx.close();
    });

    test(`homework nav visible in sidebar — ${vp.name}px`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      await loginAs(page, 'student');
      // On mobile the sidebar is hidden — open it first
      if (vp.width < 1024) {
        await page.getByRole('button', { name: /open menu/i }).click();
        await page.waitForTimeout(300);
      }
      await page.screenshot({
        path: path.join(OUT_DIR, `sidebar-${vp.name}.png`),
        fullPage: false,
      });
      await ctx.close();
    });
  }
});
