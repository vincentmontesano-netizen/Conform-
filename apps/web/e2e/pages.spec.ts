import { test, expect } from '@playwright/test';

test.describe('Public pages', () => {
  test('login page loads without errors', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBeLessThan(500);
  });

  test('register page loads without errors', async ({ page }) => {
    const response = await page.goto('/register');
    expect(response?.status()).toBeLessThan(500);
  });
});
