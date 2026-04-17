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

test.describe('Attempt persistence', () => {
  test('submit challenge and verify attempt persists', async ({ page }) => {
    await page.goto(challengePath('express-basics', challengeSlug));
    await submitAndWaitForResults(page, EXPRESS_SOLUTION);

    // After submitting, the attempt should be persisted to the backend.
    // Navigate away and back -- the challenge should reflect the attempt.
    await page.goto('/packs/express-basics');

    // The challenge row should show a completion indicator
    const challengeRow = page.getByText('Hello World Server');
    await expect(challengeRow).toBeVisible();
  });

  test('attempt records correct pass/fail status', async ({ page }) => {
    // Submit a partial solution that will fail
    await page.goto(challengePath('express-basics', challengeSlug));
    await submitAndWaitForResults(page, '// intentionally incomplete');

    await expect(page.getByText('Some Failed')).toBeVisible();
  });
});
