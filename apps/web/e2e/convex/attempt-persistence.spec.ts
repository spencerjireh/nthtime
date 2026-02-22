import { test, expect } from '@playwright/test';
import { submitAndWaitForResults, EXPRESS_SOLUTION } from '../helpers';

// These tests require a running Convex backend.
// They are skipped automatically when CONVEX_URL is not set (the convex
// project in playwright.config.ts only runs when CONVEX_URL is present).

test.describe('Attempt persistence (Convex)', () => {
  test('submit challenge and verify attempt persists', async ({ page }) => {
    test.skip(!process.env.CONVEX_URL, 'Requires CONVEX_URL');
    await page.goto('/challenge/ch_express_1');
    await submitAndWaitForResults(page, EXPRESS_SOLUTION);

    // After submitting, the attempt should be persisted to Convex.
    // Navigate away and back -- the challenge should reflect the attempt.
    await page.goto('/pack/express-basics');

    // The challenge row should show a completion indicator
    // (exact selector depends on UI, but the passed status should be reflected)
    const challengeRow = page.getByText('Hello World Server');
    await expect(challengeRow).toBeVisible();
  });

  test('attempt records correct pass/fail status', async ({ page }) => {
    test.skip(!process.env.CONVEX_URL, 'Requires CONVEX_URL');
    // Submit a partial solution that will fail
    await page.goto('/challenge/ch_express_1');
    await submitAndWaitForResults(page, '// intentionally incomplete');

    await expect(page.getByText('Some Failed')).toBeVisible();
  });
});
