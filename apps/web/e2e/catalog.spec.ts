import { test, expect } from '@playwright/test';

test.describe('Catalog browsing', () => {
  test('renders pack cards on catalog page', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.getByText('Express Basics')).toBeVisible();
    await expect(page.getByText('React Fundamentals')).toBeVisible();
    await expect(page.getByText('FastAPI Basics')).toBeVisible();
  });

  test('clicking a pack card navigates to pack page', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.getByRole('link', { name: /Express Basics/ })).toBeVisible();
    await page.getByRole('link', { name: /Express Basics/ }).click();
    await expect(page).toHaveURL('/packs/express-basics');
    await expect(page.getByText('Hello World Server')).toBeVisible();
  });

  test('pack page shows challenge details', async ({ page }) => {
    await page.goto('/packs/express-basics');
    // Challenge rows show title and difficulty badge
    await expect(page.getByText('Hello World Server')).toBeVisible();
    await expect(page.getByText('beginner').first()).toBeVisible();
  });

  test('language filter narrows results', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
    // Open language dropdown and select Python
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Python' }).click();
    // Only FastAPI pack should be visible
    await expect(page.getByText('FastAPI Basics')).toBeVisible();
    await expect(page.getByText('Express Basics')).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText('React Fundamentals')).not.toBeVisible();
    // URL should have language param
    await expect(page).toHaveURL(/language=python/);
  });

  test('difficulty filter badges update URL', async ({ page }) => {
    await page.goto('/catalog');
    // Click the "Beginner" difficulty badge
    await page.getByRole('button', { name: 'Beginner' }).click();
    await expect(page).toHaveURL(/difficulty=beginner/);
  });
});
