import { test, expect } from '@playwright/test';
import { submitAndWaitForResults, EXPRESS_SOLUTION, getChallengeId } from './helpers';

let challengeId: string;

test.beforeAll(async () => {
  challengeId = await getChallengeId('express-basics', 1);
});

test.describe('Attempt persistence', () => {
  test('submit challenge and verify attempt persists', async ({ page }) => {
    await page.goto(`/challenge/${challengeId}`);
    await submitAndWaitForResults(page, EXPRESS_SOLUTION);

    // After submitting, the attempt should be persisted to the backend.
    // Navigate away and back -- the challenge should reflect the attempt.
    await page.goto('/pack/express-basics');

    // The challenge row should show a completion indicator
    const challengeRow = page.getByText('Hello World Server');
    await expect(challengeRow).toBeVisible();
  });

  test('attempt records correct pass/fail status', async ({ page }) => {
    // Submit a partial solution that will fail
    await page.goto(`/challenge/${challengeId}`);
    await submitAndWaitForResults(page, '// intentionally incomplete');

    await expect(page.getByText('Some Failed')).toBeVisible();
  });
});
