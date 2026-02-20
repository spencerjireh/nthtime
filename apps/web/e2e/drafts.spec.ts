import { test, expect, Page } from '@playwright/test';

/** Set Monaco editor content via the browser's Monaco API. */
async function setEditorContent(page: Page, content: string) {
  await page.evaluate((c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = (window as any).monaco?.editor?.getEditors?.()?.[0];
    if (editor) editor.setValue(c);
  }, content);
}

/** Read Monaco editor content via the browser's Monaco API. */
async function getEditorContent(page: Page): Promise<string> {
  return page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = (window as any).monaco?.editor?.getEditors?.()?.[0];
    return editor?.getValue() ?? '';
  });
}

test.describe('Draft persistence', () => {
  test('typed content is restored after navigating away and back', async ({ page }) => {
    await page.goto('/challenge/ch_express_1');
    await page.waitForSelector('.monaco-editor');

    await setEditorContent(page, "import express from 'express';\n// draft in progress\n");

    // Wait for draft save debounce (500ms) + margin
    await page.waitForTimeout(1000);

    // Navigate away
    await page.goto('/');
    await expect(page.getByText('Challenge Packs')).toBeVisible();

    // Navigate back
    await page.goto('/challenge/ch_express_1');
    await page.waitForSelector('.monaco-editor');

    // Verify draft content is restored
    const content = await getEditorContent(page);
    expect(content).toContain('draft in progress');
  });
});
