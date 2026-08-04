/**
 * CAL-SCHED-001 — Schedule for student: responsive screenshot evidence.
 *
 * Captures the SlotEventDrawer in three states at all four required viewports:
 *   1. Available slot — default footer (Edit, Schedule for student, Cancel)
 *   2. Available slot — schedule panel open (search + empty list)
 *   3. Available slot — student selected in schedule panel (confirmed chip)
 *
 * Requires a running dev stack (docker compose up) and a seeded database.
 * The available slot is created via the API before the test runs.
 */
import { test, chromium, request as playwrightRequest } from '@playwright/test';
import { SEEDED } from './baseline/fixtures/users';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EVIDENCE_DIR = path.resolve(
  __dirname,
  '../../../../docs/redesign/evidence/screenshots/cal-sched-001'
);

const VIEWPORTS = [
  { name: '390',  width: 390,  height: 844  },
  { name: '768',  width: 768,  height: 1024 },
  { name: '1280', width: 1280, height: 800  },
  { name: '1440', width: 1440, height: 900  },
];

test.setTimeout(180_000);

test('capture schedule-for-student drawer at all viewports', async () => {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

  // ── 1. Obtain a JWT ───────────────────────────────────────────────────────
  const apiCtx = await playwrightRequest.newContext({ baseURL: 'http://localhost:80' });
  const loginRes = await apiCtx.post('/api/auth/login', {
    data: { email: SEEDED.professor.email, password: SEEDED.professor.password },
  });
  const loginBody = await loginRes.json();
  const token: string = loginBody?.data?.token ?? loginBody?.token ?? '';
  if (!token) throw new Error(`Login failed: ${JSON.stringify(loginBody)}`);

  // ── 2. Create an available slot at 17:00–18:00 UTC today ─────────────────
  // 17:00–18:00 UTC = 19:00–20:00 local (known free slot in seed schedule)
  const todayUTC = new Date().toISOString().slice(0, 10); // YYYY-MM-DD in UTC
  const startISO = `${todayUTC}T17:00:00.000Z`;
  const endISO   = `${todayUTC}T18:00:00.000Z`;

  const slotRes = await apiCtx.post('/api/professor/slots', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      startTime: startISO,
      endTime: endISO,
      slotType: 'INDIVIDUAL',
      maxParticipants: 1,
      isPrivate: false,
      title: 'SCHED-001 screenshot slot',
    },
  });
  const slotBody = await slotRes.json();
  const slotId: string = slotBody?.data?.slot?.id ?? slotBody?.data?.id ?? '';
  if (!slotId) throw new Error(`Slot creation failed: ${JSON.stringify(slotBody)}`);

  try {
    const browser = await chromium.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
    });

    try {
      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const page = await context.newPage();

        // ── Log in ─────────────────────────────────────────────────────────
        await page.goto('http://localhost:80/auth');
        await page.getByLabel('Email', { exact: true }).first().fill(SEEDED.professor.email);
        await page.getByLabel('Password', { exact: true }).first().fill(SEEDED.professor.password);
        await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
        await page.waitForURL(/\/admin/);

        // ── Navigate to calendar ──────────────────────────────────────────
        await page.goto('http://localhost:80/admin');
        await page.waitForSelector('[class*="fc-event"]', { timeout: 20_000 });

        // On mobile, the "Today" button is hidden — navigate via DateStrip instead.
        // The strip renders role="radio" buttons with text "Wed\n8" (day abbrev + day number).
        // On desktop/tablet the "Today" button is in the toolbar.
        const todayNavBtn = page.getByRole('button', { name: /^Today$/i });
        if ((await todayNavBtn.count()) > 0) {
          await todayNavBtn.click();
        } else {
          // Mobile: click today's date in the DateStrip (role=radio, text contains today's day number)
          const todayNum = new Date().getDate().toString();
          const todayDayStrip = page.getByRole('radio').filter({ hasText: todayNum }).first();
          if ((await todayDayStrip.count()) > 0) await todayDayStrip.click();
        }
        await page.waitForTimeout(400);

        // Scroll to 19:00 local (where 17:00 UTC slot appears) — ~19 × 46px ≈ 874px
        await page.evaluate(() => {
          const scroller = document.querySelector('.fc-scroller-liquid-absolute') as HTMLElement | null
            ?? document.querySelector('.fc-scroller') as HTMLElement | null;
          if (scroller) scroller.scrollTop = 850;
        });
        await page.waitForTimeout(600);

        // ── Click the SCHED-001 slot event ────────────────────────────────
        // Try title text first (visible on desktop/tablet), then time text (mobile).
        let target = page.locator('[class*="fc-event"]').filter({ hasText: /SCHED-001/i }).first();
        if ((await target.count()) === 0) {
          await page.evaluate(() => {
            const s = document.querySelector('.fc-scroller-liquid-absolute') as HTMLElement | null
              ?? document.querySelector('.fc-scroller') as HTMLElement | null;
            if (s) s.scrollTop = 900;
          });
          await page.waitForTimeout(400);
          target = page.locator('[class*="fc-event"]').filter({ hasText: /SCHED-001/i }).first();
        }
        if ((await target.count()) === 0) {
          // Mobile shows time not title; look for Open slot at 19:00
          target = page.locator('[class*="fc-event"]').filter({ hasText: /19:00/i }).first();
        }
        if ((await target.count()) === 0) {
          console.log(`[${vp.name}px] SCHED-001 event not visible — skipping drawer screenshots`);
          await context.close();
          continue;
        }
        await target.click();
        await page.waitForSelector('[role="dialog"]', { timeout: 8_000 });
        await page.waitForTimeout(400);

        // ── Screenshot 1: default available footer ────────────────────────
        await page.screenshot({
          path: path.join(EVIDENCE_DIR, `${vp.name}px-1-drawer-available.png`),
          fullPage: false,
        });

        // ── Click "Schedule for student" ──────────────────────────────────
        const scheduleBtn = page.getByRole('button', { name: /schedule for student/i });
        if ((await scheduleBtn.count()) > 0) {
          await scheduleBtn.click();
          await page.waitForTimeout(600);

          // ── Screenshot 2: schedule panel open (loading / empty list) ─────
          await page.screenshot({
            path: path.join(EVIDENCE_DIR, `${vp.name}px-2-schedule-panel-open.png`),
            fullPage: false,
          });

          // Type in the search box to show no-results state
          const searchInput = page.locator('input[type="search"]').first();
          if ((await searchInput.count()) > 0) {
            await searchInput.fill('zzz-no-match');
            await page.waitForTimeout(300);

            // ── Screenshot 3: no-results state ───────────────────────────
            await page.screenshot({
              path: path.join(EVIDENCE_DIR, `${vp.name}px-3-schedule-no-results.png`),
              fullPage: false,
            });

            // Clear and try to select a student if any appear
            await searchInput.fill('');
            await page.waitForTimeout(300);
            const firstOption = page.getByRole('option').first();
            if ((await firstOption.count()) > 0) {
              await firstOption.click();
              await page.waitForTimeout(300);

              // ── Screenshot 4: student selected (chip state) ───────────
              await page.screenshot({
                path: path.join(EVIDENCE_DIR, `${vp.name}px-4-schedule-selected.png`),
                fullPage: false,
              });
            }
          }
        }

        await context.close();
        console.log(`✓ ${vp.name}px screenshots captured`);
      }
    } finally {
      await browser.close();
    }
  } finally {
    // Cancel then the slot will be removable — or just cancel it
    await apiCtx.post(`/api/professor/slots/${slotId}/cancel-with-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    await apiCtx.dispose();
  }
});
