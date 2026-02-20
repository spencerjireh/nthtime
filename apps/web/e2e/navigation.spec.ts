import { test, expect, Page } from '@playwright/test';

const EXPRESS_SOLUTION = [
  "import express from 'express';",
  'const app = express();',
  "app.get('/api/hello', (req, res) => {",
  "  res.json({ message: 'Hello World' });",
  '});',
  'export default app;',
].join('\n');

/** Set Monaco editor content via the browser's Monaco API. */
async function setEditorContent(page: Page, content: string) {
  await page.evaluate((c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = (window as any).monaco?.editor?.getEditors?.()?.[0];
    if (editor) editor.setValue(c);
  }, content);
}

test.describe('Navigation', () => {
  test('pack slug threads through challenge URL', async ({ page }) => {
    await page.goto('/pack/express-basics');
    await page.getByText('Hello World Server').click();
    await expect(page).toHaveURL(/\/challenge\/ch_express_1\?pack=express-basics/);
  });

  test('results navigation shows Back to pack and Retry', async ({ page }) => {
    await page.goto('/challenge/ch_express_1?pack=express-basics');
    await page.waitForSelector('.monaco-editor');

    await setEditorContent(page, EXPRESS_SOLUTION);
    await page.getByRole('button', { name: 'Run' }).click();
    await expect(page.getByText('All Passed').or(page.getByText('Some Failed'))).toBeVisible({
      timeout: 15000,
    });

    await expect(page.getByRole('link', { name: 'Back to pack' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });

  test('Back to pack returns to pack page', async ({ page }) => {
    await page.goto('/challenge/ch_express_1?pack=express-basics');
    await page.waitForSelector('.monaco-editor');

    await setEditorContent(page, EXPRESS_SOLUTION);
    await page.getByRole('button', { name: 'Run' }).click();
    await expect(page.getByText('All Passed').or(page.getByText('Some Failed'))).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole('link', { name: 'Back to pack' }).click();
    await expect(page).toHaveURL('/pack/express-basics');
    await expect(page.getByText('Hello World Server')).toBeVisible();
  });

  test('header logo navigates to catalog', async ({ page }) => {
    await page.goto('/pack/express-basics');
    await page.getByRole('link', { name: 'nthtime' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Challenge Packs')).toBeVisible();
  });
});
