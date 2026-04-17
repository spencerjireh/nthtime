import { test, expect } from '@playwright/test';
import {
  submitAndWaitForResults,
  EXPRESS_SOLUTION,
  getChallengeSlug,
  getEditorContent,
  challengePath,
} from './helpers';

let challengeSlug: string;

test.beforeAll(async () => {
  challengeSlug = await getChallengeSlug('express-basics', 1);
});

test.describe('Challenge drill loop', () => {
  test('renders 3-panel layout with prompt and editor', async ({ page }) => {
    await page.goto(challengePath('express-basics', challengeSlug));
    // Prompt panel
    await expect(page.getByText('Create a basic Express.js server')).toBeVisible();
    // Editor panel -- file tab visible (use first() since both FileTree and TabBar render a button)
    await expect(page.getByRole('button', { name: 'app.js', exact: true }).first()).toBeVisible();
    // Toolbar
    await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
  });

  test('submit reference solution and see results', async ({ page }) => {
    await page.goto(challengePath('express-basics', challengeSlug));
    await submitAndWaitForResults(page, EXPRESS_SOLUTION);
  });

  test('retry returns to editor', async ({ page }) => {
    await page.goto(challengePath('express-basics', challengeSlug));
    await submitAndWaitForResults(page, EXPRESS_SOLUTION);

    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
    await expect.poll(() => getEditorContent(page)).toBe(EXPRESS_SOLUTION);
  });
});
