import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test('can open settings dialog and change feedback level', async ({ page }) => {
    await page.goto('/');

    // Open settings via the gear button in the header
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Feedback Level')).toBeVisible();

    // Change feedback level to L1
    await page.getByRole('dialog').getByRole('combobox').first().click();
    await page.getByRole('option', { name: /L1/ }).click();

    // Close dialog
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Reopen and verify the selection persisted
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // The combobox should show L1 as selected
    await expect(page.getByRole('dialog').getByRole('combobox').first()).toContainText('L1');
  });

  test('keybindings selection persists', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Settings' }).click();

    // Find the keybindings dropdown (second combobox in dialog)
    const keybindingsSelect = page.getByRole('dialog').getByRole('combobox').nth(1);
    await keybindingsSelect.click();
    await page.getByRole('option', { name: 'Vim' }).click();

    // Close and reopen
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('dialog').getByRole('combobox').nth(1)).toContainText('Vim');
  });
});
