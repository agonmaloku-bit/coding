// @ts-check
const { test, expect } = require('@playwright/test');
const { login } = require('./helpers');

/**
 * Read-only smoke tests against production (https://cl.ictility.com).
 * Every assertion is a "page-loads / no JS errors" check. No data is created,
 * modified, or deleted.
 *
 * Run: `npx playwright test` (from pmk-ui/).
 */

/**
 * Assert that the Vue SPA mounted a non-trivial page under #app and the
 * current URL matches the requested route. Use this instead of matching
 * specific table/empty-state classes, which vary per page.
 *
 * @param {import('@playwright/test').Page} page
 * @param {RegExp} urlRe
 */
async function expectPageMounted(page, urlRe) {
  await expect(page).toHaveURL(urlRe);
  // Wait until #app has non-trivial content.
  await page.waitForFunction(
    () => {
      const app = document.querySelector('#app');
      return !!app && app.innerText.trim().length > 50;
    },
    null,
    { timeout: 15_000 },
  );
}

test.describe('pmk smoke (read-only)', () => {
  /** @type {string[]} */
  let consoleErrors;
  /** @type {string[]} */
  let pageErrors;

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));
  });

  test.afterEach(async () => {
    expect(pageErrors, 'uncaught page errors').toEqual([]);
    expect(consoleErrors, 'console errors').toEqual([]);
  });

  test('login succeeds and lands in /platform', async ({ page }) => {
    await login(page);
    expect(page.url()).toMatch(/\/platform/);
  });

  test('bills list renders', async ({ page }) => {
    await login(page);
    await page.goto('/platform/bill');
    await page.waitForLoadState('networkidle').catch(() => {});
    await expectPageMounted(page, /\/platform\/bill/);
  });

  test('contracts list renders', async ({ page }) => {
    await login(page);
    await page.goto('/platform/contracts');
    await page.waitForLoadState('networkidle').catch(() => {});
    await expectPageMounted(page, /\/platform\/contracts/);
  });

  test('contract templates page renders and Add modal mounts', async ({ page }) => {
    await login(page);
    await page.goto('/platform/contract_templates');
    await page.waitForLoadState('networkidle').catch(() => {});
    await expectPageMounted(page, /\/platform\/contract_templates/);

    // Regression guard for Fix 02: clicking Add must render a modal and
    // mount Quill editors without triggering a vue-i18n compiler error.
    const addBtn = page.locator('button:has-text("Add"), button:has-text("Add new"), button:has-text("Shto")').first();
    if (await addBtn.count()) {
      await addBtn.click();
      await page.waitForTimeout(800);
      await expect(page.locator('.modal')).toHaveCount(1);
      await expect(page.locator('.ql-editor, .ql-container').first()).toBeVisible({ timeout: 5_000 });
      await page.keyboard.press('Escape').catch(() => {});
    }
  });

  test('contract types page renders', async ({ page }) => {
    await login(page);
    await page.goto('/platform/contract_types');
    await page.waitForLoadState('networkidle').catch(() => {});
    await expectPageMounted(page, /\/platform\/contract_types/);
  });

  test('directory / users page renders', async ({ page }) => {
    await login(page);
    const resp = await page.goto('/platform/users').catch(() => null);
    expect(resp && resp.status() < 400, 'users page should load').toBe(true);
    await page.waitForLoadState('networkidle').catch(() => {});
    await expectPageMounted(page, /\/platform\/users/);
  });
});
