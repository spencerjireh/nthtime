import { test, expect } from '@playwright/test';
import {
  waitForEditorReady,
  setEditorContent,
  getChallengeSlug,
  challengePath,
} from './helpers';

let challengeSlug: string;

test.beforeAll(async () => {
  challengeSlug = await getChallengeSlug('express-basics', 1);
});

/**
 * Each test configures feedback flags via the settings dialog, then submits
 * a partial solution (that should fail some assertions) to verify
 * the correct detail is shown in the results view.
 */

async function setFeedbackFlags(
  page: import('@playwright/test').Page,
  flags: Record<string, boolean>,
) {
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Feedback' }).click();
  for (const [label, shouldBeChecked] of Object.entries(flags)) {
    const checkbox = page.getByRole('checkbox', { name: new RegExp(label) });
    const isChecked = await checkbox.isChecked();
    if (isChecked !== shouldBeChecked) {
      await checkbox.click();
    }
  }
  await page.keyboard.press('Escape');
}

async function submitPartialSolution(page: import('@playwright/test').Page) {
  await waitForEditorReady(page);
  // Submit a minimal solution that likely fails some assertions
  await setEditorContent(page, '// partial solution\nconst app = {};');
  await page.getByRole('button', { name: 'Run' }).click();
  await page.getByText('All Passed').or(page.getByText('Some Failed')).waitFor({ timeout: 15000 });
}

test.describe('Feedback flags', () => {
  test('all feedback off: only banner visible, no pass/fail badges', async ({ page }) => {
    await page.goto('/');
    await setFeedbackFlags(page, {
      'Show pass/fail': false,
      'Show hints': false,
      'Show assertion details': false,
      'Show diff': false,
      'Show reference solution': false,
    });

    await page.goto(challengePath('express-basics', challengeSlug));
    await submitPartialSolution(page);

    // Banner always shown
    await expect(page.getByText('All Passed').or(page.getByText('Some Failed'))).toBeVisible();

    // No individual assertion pass/fail badges
    await expect(page.getByText('[pass]')).not.toBeVisible();
    await expect(page.getByText('[fail]')).not.toBeVisible();
  });

  test('showPassFail on: pass/fail badges visible', async ({ page }) => {
    await page.goto('/');
    await setFeedbackFlags(page, {
      'Show pass/fail': true,
      'Show hints': false,
      'Show assertion details': false,
      'Show diff': false,
    });

    await page.goto(challengePath('express-basics', challengeSlug));
    await submitPartialSolution(page);

    // At showPassFail, pass/fail badges should be visible
    const badges = page.getByText('[pass]').or(page.getByText('[fail]'));
    await expect(badges.first()).toBeVisible();
  });

  test('showDiff on: Diff button visible', async ({ page }) => {
    await page.goto('/');
    await setFeedbackFlags(page, { 'Show diff': true });

    await page.goto(challengePath('express-basics', challengeSlug));
    await submitPartialSolution(page);

    // Diff button should be visible
    await expect(page.getByText('Diff')).toBeVisible();
  });
});
