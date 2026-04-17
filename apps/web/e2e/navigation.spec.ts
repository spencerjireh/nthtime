import { test, expect } from '@playwright/test';
import {
  submitAndWaitForResults,
  EXPRESS_SOLUTION,
  getChallengeSlug,
  challengePath,
} from './helpers';

let challengeSlug: string;

test.beforeAll(async () => {
  challengeSlug = await getChallengeSlug('express-basics', 1);
});

test.describe('Navigation', () => {
  test('pack slug threads through challenge URL', async ({ page }) => {
    await page.goto('/packs/express-basics');
    await page.getByText('Hello World Server').click();
    await expect(page).toHaveURL(/\/packs\/express-basics\/challenges\/.+\?view=details/);
  });

  test('results navigation shows Back to pack and Retry', async ({ page }) => {
    await page.goto(challengePath('express-basics', challengeSlug));
    await submitAndWaitForResults(page, EXPRESS_SOLUTION);

    await expect(page.getByRole('link', { name: 'Back to pack' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('Back to pack returns to pack page', async ({ page }) => {
    await page.goto(challengePath('express-basics', challengeSlug));
    await submitAndWaitForResults(page, EXPRESS_SOLUTION);

    await page.getByRole('link', { name: 'Back to pack' }).click();
    await expect(page).toHaveURL('/packs/express-basics');
    await expect(page.getByText('Hello World Server')).toBeVisible();
  });

  test('header logo navigates home', async ({ page }) => {
    await page.goto('/packs/express-basics');
    // Scope to the header banner — the site footer has a duplicate
    // "nthtime" link with the same accessible name.
    await page.getByRole('banner').getByRole('link', { name: 'nthtime' }).click();
    await expect(page).toHaveURL('/');
  });
});
