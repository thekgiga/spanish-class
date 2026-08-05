import { test, chromium, request as playwrightRequest } from '@playwright/test';
import { SEEDED } from './baseline/fixtures/users';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EVIDENCE_DIR = path.resolve(
  __dirname,
  '../../../docs/redesign/evidence/screenshots/blocked-tokens'
);

const VIEWPORTS = [
  { name: '390',  width: 390,  height: 844  },
  { name: '768',  width: 768,  height: 1024 },
  { name: '1280', width: 1280, height: 800  },
  { name: '1440', width: 1440, height: 900  },
];

test.setTimeout(120_000);

test('capture calendar at all viewports with blocked slot', async () => {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

  // ── 1. Obtain a JWT by logging in via the API directly ─────────────────
  const apiCtx = await playwrightRequest.newContext({ baseURL: 'http://localhost:80' });
  const loginRes = await apiCtx.post('/api/auth/login', {
    data: { email: SEEDED.professor.email, password: SEEDED.professor.password },
  });
  const loginBody = await loginRes.json();
  const token: string = loginBody?.data?.token ?? loginBody?.token ?? '';
  if (!token) throw new Error(`Login failed: ${JSON.stringify(loginBody)}`);

  // ── 2. Create a blocked slot for today ─────────────────────────────────
  // Use a time window that will be visible in the current week: today 14:00–15:00
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0);
  const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0, 0);

  const slotRes = await apiCtx.post('/api/professor/slots', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      slotType: 'BLOCKED',
      maxParticipants: 1,
      isPrivate: false,
    },
  });
  const slotBody = await slotRes.json();
  const slotId: string = slotBody?.data?.slot?.id ?? slotBody?.data?.id ?? '';
  if (!slotId) throw new Error(`Slot creation failed: ${JSON.stringify(slotBody)}`);

  try {
    // ── 3. Capture screenshots at each viewport ─────────────────────────
    const browser = await chromium.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
    });

    try {
      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const page = await context.newPage();

        // Log in via the UI form
        await page.goto('http://localhost:80/auth');
        await page.getByLabel('Email', { exact: true }).first().fill(SEEDED.professor.email);
        await page.getByLabel('Password', { exact: true }).first().fill(SEEDED.professor.password);
        await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
        await page.waitForURL(/\/admin/);

        // Navigate to calendar and wait for events to render
        await page.goto('http://localhost:80/admin');
        await page.waitForSelector('[class*="fc-event"]', { timeout: 15_000 });
        // Scroll so the blocked slot at 14:00 is visible in the time grid
        await page.evaluate(() => {
          // FullCalendar time grid: each hour row is ~44-48px; 14h × 46px ≈ 644px
          const scroller = document.querySelector('.fc-scroller-liquid-absolute') as HTMLElement | null
            ?? document.querySelector('.fc-scroller') as HTMLElement | null;
          if (scroller) scroller.scrollTop = 540;
        });
        await page.waitForTimeout(600);

        await page.screenshot({ path: `${EVIDENCE_DIR}/calendar-${vp.name}px.png`, fullPage: false });
        await context.close();
      }
    } finally {
      await browser.close();
    }
  } finally {
    // ── 4. Clean up — delete the blocked slot ──────────────────────────
    await apiCtx.delete(`/api/professor/slots/${slotId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await apiCtx.dispose();
  }
});
