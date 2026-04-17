import { test, expect } from '@playwright/test';
import {
  setEditorContent,
  getEditorContent,
  waitForEditorReady,
  getChallengeSlug,
  challengePath,
} from './helpers';

let challengeSlug: string;

test.beforeAll(async () => {
  challengeSlug = await getChallengeSlug('express-basics', 1);
});

test.describe('Draft persistence', () => {
  test('typed content is restored after navigating away and back', async ({ page }) => {
    await page.goto(challengePath('express-basics', challengeSlug));
    await waitForEditorReady(page);

    await setEditorContent(page, "import express from 'express';\n// draft in progress\n");

    // Wait for draft save debounce (500ms) + margin
    await page.waitForTimeout(1000);

    // Navigate away
    await page.goto('/catalog');
    await expect(page.getByText('Express Basics')).toBeVisible();

    // Navigate back
    await page.goto(challengePath('express-basics', challengeSlug));
    await waitForEditorReady(page);

    // Verify draft content is restored
    const content = await getEditorContent(page);
    expect(content).toContain('draft in progress');
  });
});
