import { test, expect, Page } from '@playwright/test';

/** Set Monaco editor content via the browser's Monaco API. */
async function setEditorContent(page: Page, content: string) {
  await page.evaluate((c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = (window as any).monaco?.editor?.getEditors?.()?.[0];
    if (editor) editor.setValue(c);
  }, content);
}

const EXPRESS_SOLUTION = [
  "import express from 'express';",
  '',
  'const app = express();',
  '',
  "app.get('/api/hello', (req, res) => {",
  "  res.json({ message: 'Hello World' });",
  '});',
  '',
  'export default app;',
].join('\n');

test.describe('Challenge drill loop', () => {
  test('renders 3-panel layout with prompt and editor', async ({ page }) => {
    await page.goto('/challenge/ch_express_1');
    // Prompt panel
    await expect(page.getByText('Create a basic Express.js server')).toBeVisible();
    // Editor panel -- file tab visible
    await expect(page.getByText('app.js')).toBeVisible();
    // Toolbar
    await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
  });

  test('submit reference solution and see results', async ({ page }) => {
    await page.goto('/challenge/ch_express_1');
    await page.waitForSelector('.monaco-editor');

    await setEditorContent(page, EXPRESS_SOLUTION);

    await page.getByRole('button', { name: 'Run' }).click();

    await expect(page.getByText('All Passed').or(page.getByText('Some Failed'))).toBeVisible({
      timeout: 15000,
    });
  });

  test('retry returns to editor', async ({ page }) => {
    await page.goto('/challenge/ch_express_1');
    await page.waitForSelector('.monaco-editor');

    await setEditorContent(page, EXPRESS_SOLUTION);
    await page.getByRole('button', { name: 'Run' }).click();
    await expect(page.getByText('All Passed').or(page.getByText('Some Failed'))).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
  });
});
