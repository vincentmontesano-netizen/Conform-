import { test, expect } from '@playwright/test';

test.describe('Navigation (unauthenticated)', () => {
  test('should redirect /companies to /login', async ({ page }) => {
    await page.goto('/companies');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect /duerp to /login', async ({ page }) => {
    await page.goto('/duerp');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect /alerts to /login', async ({ page }) => {
    await page.goto('/alerts');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect /audit-log to /login', async ({ page }) => {
    await page.goto('/audit-log');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect /settings to /login', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login/);
  });
});
