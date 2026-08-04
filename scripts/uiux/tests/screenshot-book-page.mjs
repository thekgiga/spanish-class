/**
 * Captures BookPage screenshots at 4 required viewports for evidence.
 * Run: node scripts/uiux/tests/screenshot-book-page.mjs
 * Requires: stack running on http://localhost
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUT = 'docs/redesign/evidence/screenshots/book-vis-001';
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1440', width: 1440, height: 900 },
];

async function login(page) {
  await page.goto('http://localhost/login');
  await page.fill('input[type="email"]', 'student@example.com');
  await page.fill('input[type="password"]', 'Student123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
}

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const ctx  = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();

  await login(page);
  await page.goto('http://localhost/dashboard/book');
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  await page.screenshot({ path: join(OUT, `book-${vp.name}-default.png`), fullPage: false });
  console.log(`  ✓ ${vp.name} default`);

  await ctx.close();
}

await browser.close();
console.log('\nAll screenshots saved to', OUT);
