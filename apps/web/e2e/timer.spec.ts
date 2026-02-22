import { test, expect } from '@playwright/test';
import { waitForEditorReady, setEditorContent } from './helpers';

test.describe('Timer', () => {
  test('timer starts on editor change and shows non-zero value', async ({ page }) => {
    await page.goto('/challenge/ch_express_1');
    await waitForEditorReady(page);

    // Timer should show 00:00 initially
    await expect(page.getByText('00:00')).toBeVisible();

    // Type in the editor to trigger the timer
    await setEditorContent(page, '// trigger timer');

    // Timer should tick away from 00:00 within a few seconds
    await expect(page.getByText('00:00')).not.toBeVisible({ timeout: 5000 });
  });

  test('timer value displayed in results banner after submission', async ({ page }) => {
    await page.goto('/challenge/ch_express_1');
    await waitForEditorReady(page);

    // Type to start the timer, then submit
    await setEditorContent(page, "import express from 'express';\nexport default express();");

    // Wait for timer to tick past 00:00 before submitting
    await expect(page.getByText('00:00')).not.toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: 'Run' }).click();
    await page.getByText('All Passed').or(page.getByText('Some Failed')).waitFor({ timeout: 15000 });

    // Results banner should show a time value (format: MM:SS)
    // Since we waited ~1.5s, it should show at least 00:01
    const timePattern = page.locator('.font-mono').filter({ hasText: /\d{2}:\d{2}/ });
    await expect(timePattern.first()).toBeVisible();
  });
});
