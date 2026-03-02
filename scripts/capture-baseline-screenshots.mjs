#!/usr/bin/env node

/**
 * Capture baseline screenshots for Premium Education UI Redesign
 *
 * This script captures screenshots of all 6 pages before color migration:
 * - HomePage
 * - LoginPage
 * - RegisterPage (bonus)
 * - AdminDashboard
 * - StudentDashboard
 * - DashboardLayout (via student/admin view)
 *
 * Usage: node scripts/capture-baseline-screenshots.mjs
 *
 * Prerequisites:
 * - Dev server must be running on http://localhost:5173
 * - Playwright installed
 */

import { chromium } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = join(process.cwd(), 'specs', '011-premium-education-ui-redesign', 'baseline-screenshots');

// Define pages to capture
const PAGES = [
  {
    name: 'HomePage',
    url: '/',
    waitForSelector: 'main',
    fullPage: true
  },
  {
    name: 'LoginPage',
    url: '/login',
    waitForSelector: 'form',
    fullPage: true
  },
  {
    name: 'RegisterPage',
    url: '/register',
    waitForSelector: 'form',
    fullPage: true
  },
  {
    name: 'AboutPage',
    url: '/about',
    waitForSelector: 'main',
    fullPage: true
  }
];

// Pages requiring authentication
const AUTH_PAGES = [
  {
    name: 'StudentDashboard',
    url: '/dashboard',
    role: 'student',
    waitForSelector: '[data-testid="student-dashboard"], main',
    fullPage: true
  },
  {
    name: 'AdminDashboard',
    url: '/admin',
    role: 'admin',
    waitForSelector: '[data-testid="admin-dashboard"], main',
    fullPage: true
  }
];

async function captureScreenshots() {
  console.log('🎨 Premium Education UI Redesign - Baseline Screenshot Capture');
  console.log('='.repeat(70));

  // Create screenshots directory
  await mkdir(SCREENSHOTS_DIR, { recursive: true });
  console.log(`✓ Created directory: ${SCREENSHOTS_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  try {
    // Capture public pages
    console.log('📸 Capturing public pages...');
    for (const page of PAGES) {
      await capturePage(context, page);
    }

    // Capture authenticated pages
    console.log('\n📸 Capturing authenticated pages...');

    // Student dashboard
    const studentPage = await context.newPage();
    await authenticateAs(studentPage, 'student');
    for (const page of AUTH_PAGES.filter(p => p.role === 'student')) {
      await capturePage(context, page, studentPage);
    }
    await studentPage.close();

    // Admin dashboard
    const adminPage = await context.newPage();
    await authenticateAs(adminPage, 'admin');
    for (const page of AUTH_PAGES.filter(p => p.role === 'admin')) {
      await capturePage(context, page, adminPage);
    }
    await adminPage.close();

    console.log('\n' + '='.repeat(70));
    console.log('✅ Baseline screenshots captured successfully!');
    console.log(`📁 Location: ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('\n❌ Error capturing screenshots:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

async function capturePage(context, pageConfig, existingPage = null) {
  const page = existingPage || await context.newPage();

  try {
    console.log(`  → ${pageConfig.name}...`);

    // Navigate to page
    await page.goto(`${BASE_URL}${pageConfig.url}`, {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    // Wait for key element to be visible
    try {
      await page.waitForSelector(pageConfig.waitForSelector, {
        state: 'visible',
        timeout: 5000
      });
    } catch (e) {
      console.warn(`    ⚠️  Warning: Selector "${pageConfig.waitForSelector}" not found, continuing...`);
    }

    // Additional wait for animations to complete
    await page.waitForTimeout(1000);

    // Capture screenshot
    const screenshotPath = join(SCREENSHOTS_DIR, `${pageConfig.name}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: pageConfig.fullPage
    });

    console.log(`    ✓ Saved: ${pageConfig.name}.png`);

  } catch (error) {
    console.error(`    ✗ Failed to capture ${pageConfig.name}:`, error.message);
  } finally {
    if (!existingPage) {
      await page.close();
    }
  }
}

async function authenticateAs(page, role) {
  console.log(`  🔐 Authenticating as ${role}...`);

  try {
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    // Check if we need to login or if already authenticated
    const isAlreadyAuth = await page.evaluate(() => {
      return !!localStorage.getItem('auth_token');
    });

    if (!isAlreadyAuth) {
      // Mock authentication by setting token directly
      // (Adjust this based on your actual auth implementation)
      await page.evaluate((role) => {
        // This is a simplified mock - adjust based on your auth system
        const mockToken = `mock-${role}-token`;
        const mockUser = {
          id: role === 'admin' ? 1 : 2,
          email: `${role}@test.com`,
          role: role.toUpperCase(),
          firstName: role === 'admin' ? 'Admin' : 'Student',
          lastName: 'User'
        };

        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
      }, role);

      // Reload to apply authentication
      await page.reload({ waitUntil: 'networkidle' });
    }

    console.log(`    ✓ Authenticated as ${role}`);
  } catch (error) {
    console.warn(`    ⚠️  Authentication warning for ${role}:`, error.message);
    console.warn(`    Continuing anyway - screenshots may show login page`);
  }
}

// Main execution
captureScreenshots().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
