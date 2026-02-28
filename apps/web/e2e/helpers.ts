import type { Page } from '@playwright/test';

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080';

/** Set Monaco editor content via the browser's Monaco API. */
export async function setEditorContent(page: Page, content: string) {
  await page.evaluate((c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = (window as any).monaco?.editor?.getEditors?.()?.[0];
    if (editor) editor.setValue(c);
  }, content);
}

/** Read Monaco editor content via the browser's Monaco API. */
export async function getEditorContent(page: Page): Promise<string> {
  return page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = (window as any).monaco?.editor?.getEditors?.()?.[0];
    return editor?.getValue() ?? '';
  });
}

/** Wait for the Monaco editor to be mounted and ready. */
export async function waitForEditorReady(page: Page) {
  await page.waitForSelector('.monaco-editor');
}

/** Submit a solution and wait for the results banner to appear. */
export async function submitAndWaitForResults(page: Page, content: string) {
  await waitForEditorReady(page);
  await setEditorContent(page, content);
  await page.getByRole('button', { name: 'Run' }).click();
  await page.getByText('All Passed').or(page.getByText('Some Failed')).waitFor({ timeout: 15000 });
}

export const EXPRESS_SOLUTION = [
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

/** Resolve a challenge ID by pack slug and order number via Spring Boot API. */
export async function getChallengeId(packSlug: string, order: number): Promise<string> {
  const res = await fetch(`${SPRING_BOOT_URL}/api/packs/${encodeURIComponent(packSlug)}`);
  if (!res.ok) throw new Error(`Failed to fetch pack ${packSlug}: ${res.status}`);
  const data = await res.json();
  const challenge = data.challenges.find((c: { order: number }) => c.order === order);
  if (!challenge) throw new Error(`Challenge not found: ${packSlug} #${order}`);
  return challenge._id;
}
