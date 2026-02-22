import { test, expect } from '@playwright/test';
import { setEditorContent, getEditorContent, waitForEditorReady } from './helpers';

test.describe('Draft persistence', () => {
  test('typed content is restored after navigating away and back', async ({ page }) => {
    await page.goto('/challenge/ch_express_1');
    await waitForEditorReady(page);

    await setEditorContent(page, "import express from 'express';\n// draft in progress\n");

    // Wait for draft save debounce (500ms) + margin
    await page.waitForTimeout(1000);

    // Navigate away
    await page.goto('/');
    await expect(page.getByText('Challenge Packs')).toBeVisible();

    // Navigate back
    await page.goto('/challenge/ch_express_1');
    await waitForEditorReady(page);

    // Verify draft content is restored
    const content = await getEditorContent(page);
    expect(content).toContain('draft in progress');
  });
});
