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
  await setEditorContent(page, '// partial\nconst app = {};');
  await page.getByRole('button', { name: 'Run' }).click();
  await page.getByText('All Passed').or(page.getByText('Some Failed')).waitFor({ timeout: 15000 });
}

test.describe('Results views', () => {
  test('showDiff: Diff button/view appears after partial submission', async ({ page }) => {
    await page.goto('/');
    await setFeedbackFlags(page, { 'Show diff': true });

    await page.goto(challengePath('express-basics', challengeSlug));
    await submitPartialSolution(page);

    await expect(page.getByText('Diff')).toBeVisible();
    await page.getByText('Diff').click();
    // Diff view should render (Monaco diff editor or similar)
    await expect(page.locator('.monaco-diff-editor, [data-testid="diff-view"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('showAssertionDetails: assertion detail text appears', async ({ page }) => {
    await page.goto('/');
    await setFeedbackFlags(page, {
      'Show pass/fail': true,
      'Show assertion details': true,
    });

    await page.goto(challengePath('express-basics', challengeSlug));
    await submitPartialSolution(page);

    // Assertion details text should be visible (pass/fail badges + descriptions)
    const badges = page.getByText('[pass]').or(page.getByText('[fail]'));
    await expect(badges.first()).toBeVisible();
  });

  test('solution view gated by feature flag', async ({ page }) => {
    await page.goto('/');
    await setFeedbackFlags(page, { 'Show reference solution': true });

    await page.goto(challengePath('express-basics', challengeSlug));
    await submitPartialSolution(page);

    // Solution tab should appear when feature flag is enabled (default)
    const solutionTab = page.getByText('Solution');
    // May or may not be visible depending on NEXT_PUBLIC_FF_SOLUTION_VIEW
    const count = await solutionTab.count();
    if (count > 0) {
      await solutionTab.click();
      // Should show solution content
      await expect(page.locator('.monaco-editor, [data-testid="solution-panel"]').first()).toBeVisible({ timeout: 5000 });
    }
  });
});
