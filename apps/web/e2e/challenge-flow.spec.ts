import { test, expect } from '@playwright/test';
import { submitAndWaitForResults, EXPRESS_SOLUTION } from './helpers';

test.describe('Challenge drill loop', () => {
  test('renders 3-panel layout with prompt and editor', async ({ page }) => {
    await page.goto('/challenge/ch_express_1');
    // Prompt panel
    await expect(page.getByText('Create a basic Express.js server')).toBeVisible();
    // Editor panel -- file tab visible
    await expect(page.getByRole('button', { name: 'app.js', exact: true })).toBeVisible();
    // Toolbar
    await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
  });

  test('submit reference solution and see results', async ({ page }) => {
    await page.goto('/challenge/ch_express_1');
    await submitAndWaitForResults(page, EXPRESS_SOLUTION);
  });

  test('retry returns to editor', async ({ page }) => {
    await page.goto('/challenge/ch_express_1');
    await submitAndWaitForResults(page, EXPRESS_SOLUTION);

    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
  });
});
