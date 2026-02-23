import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test('can open settings dialog and toggle feedback checkboxes', async ({ page }) => {
    await page.goto('/');

    // Open settings via the gear button in the header
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Feedback' })).toBeVisible();

    // Toggle "Show diff" checkbox (default off -> on)
    const showDiffCheckbox = page.getByRole('checkbox', { name: /Show diff/ });
    await expect(showDiffCheckbox).not.toBeChecked();
    await showDiffCheckbox.click();
    await expect(showDiffCheckbox).toBeChecked();

    // Close dialog
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Reopen and verify the checkbox is still checked (persisted)
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Show diff/ })).toBeChecked();
  });

  test('keybindings selection persists', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Settings' }).click();

    // Find the keybindings dropdown (first combobox in dialog, since feedback is now checkboxes)
    const keybindingsSelect = page.getByRole('dialog').getByRole('combobox').first();
    await keybindingsSelect.click();
    await page.getByRole('option', { name: 'Vim' }).click();

    // Close and reopen
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('dialog').getByRole('combobox').first()).toContainText('Vim');
  });
});
