// @ts-check
const { test, expect } = require('@playwright/test');

const EMAIL = process.env.PMK_E2E_EMAIL || 'agoni.m1@gmail.com';
const PASSWORD = process.env.PMK_E2E_PASSWORD || 'Admin1234';

/**
 * Log in via the UI and leave the page on the default post-login screen.
 * Shared helper for all read-only smoke tests.
 *
 * @param {import('@playwright/test').Page} page
 */
async function login(page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 15_000 });
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await Promise.all([
    page.waitForURL(/\/platform/, { timeout: 30_000 }).catch(() => {}),
    page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign")'),
  ]);
  await page.waitForLoadState('networkidle').catch(() => {});
  await expect(page).not.toHaveURL(/\/login$/);
}

module.exports = { login };
