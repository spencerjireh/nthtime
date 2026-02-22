import { test, expect } from '@playwright/test';
import { waitForEditorReady, setEditorContent } from './helpers';

/**
 * Each test sets a feedback level via the settings dialog, then submits
 * a partial solution (that should fail some assertions) to verify
 * the correct level of detail is shown in the results view.
 */

async function setFeedbackLevel(page: import('@playwright/test').Page, optionLabel: RegExp) {
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('dialog').getByRole('combobox').first().click();
  await page.getByRole('option', { name: optionLabel }).click();
  await page.keyboard.press('Escape');
}

async function submitPartialSolution(page: import('@playwright/test').Page) {
  await waitForEditorReady(page);
  // Submit a minimal solution that likely fails some assertions
  await setEditorContent(page, '// partial solution\nconst app = {};');
  await page.getByRole('button', { name: 'Run' }).click();
  await page.getByText('All Passed').or(page.getByText('Some Failed')).waitFor({ timeout: 15000 });
}

test.describe('Feedback levels', () => {
  test('L0: only banner visible, no pass/fail badges', async ({ page }) => {
    await page.goto('/');
    await setFeedbackLevel(page, /L0/);

    await page.goto('/challenge/ch_express_1');
    await submitPartialSolution(page);

    // Banner always shown
    await expect(page.getByText('All Passed').or(page.getByText('Some Failed'))).toBeVisible();

    // At L0, no individual assertion pass/fail badges
    await expect(page.getByText('[pass]')).not.toBeVisible();
    await expect(page.getByText('[fail]')).not.toBeVisible();
  });

  test('L1: pass/fail badges visible', async ({ page }) => {
    await page.goto('/');
    await setFeedbackLevel(page, /L1/);

    await page.goto('/challenge/ch_express_1');
    await submitPartialSolution(page);

    // At L1, pass/fail badges should be visible
    const badges = page.getByText('[pass]').or(page.getByText('[fail]'));
    await expect(badges.first()).toBeVisible();
  });

  test('L4: Diff button visible', async ({ page }) => {
    await page.goto('/');
    await setFeedbackLevel(page, /L4/);

    await page.goto('/challenge/ch_express_1');
    await submitPartialSolution(page);

    // At L4, the Diff button should be visible
    await expect(page.getByText('Diff')).toBeVisible();
  });
});
