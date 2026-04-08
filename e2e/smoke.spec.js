import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/La Chasse aux Renards/);
});

test('loads main application', async ({ page }) => {
  await page.goto('/');

  // Ensure the main app component is present.
  // It might be 'hidden' but attached to the DOM depending on web components initialization
  const appElement = page.locator('renard-app');
  await expect(appElement).toBeAttached();
});
