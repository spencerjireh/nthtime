import { test, expect } from '@playwright/test';
import { submitAndWaitForResults, EXPRESS_SOLUTION } from './helpers';

test.describe('Navigation', () => {
  test('pack slug threads through challenge URL', async ({ page }) => {
    await page.goto('/pack/express-basics');
    await page.getByText('Hello World Server').click();
    await expect(page).toHaveURL(/\/challenge\/ch_express_1\?pack=express-basics/);
  });

  test('results navigation shows Back to pack and Retry', async ({ page }) => {
    await page.goto('/challenge/ch_express_1?pack=express-basics');
    await submitAndWaitForResults(page, EXPRESS_SOLUTION);

    await expect(page.getByRole('link', { name: 'Back to pack' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('Back to pack returns to pack page', async ({ page }) => {
    await page.goto('/challenge/ch_express_1?pack=express-basics');
    await submitAndWaitForResults(page, EXPRESS_SOLUTION);

    await page.getByRole('link', { name: 'Back to pack' }).click();
    await expect(page).toHaveURL('/pack/express-basics');
    await expect(page.getByText('Hello World Server')).toBeVisible();
  });

  test('header logo navigates to catalog', async ({ page }) => {
    await page.goto('/pack/express-basics');
    await page.getByRole('link', { name: 'nthtime' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Challenge Packs')).toBeVisible();
  });
});
