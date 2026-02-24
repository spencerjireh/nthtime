import { test, expect } from '@playwright/test';
import { setEditorContent, getEditorContent, waitForEditorReady, getChallengeId } from './helpers';

let challengeId: string;

test.beforeAll(async () => {
  challengeId = await getChallengeId('express-basics', 1);
});

test.describe('Draft persistence', () => {
  test('typed content is restored after navigating away and back', async ({ page }) => {
    await page.goto(`/challenge/${challengeId}`);
    await waitForEditorReady(page);

    await setEditorContent(page, "import express from 'express';\n// draft in progress\n");

    // Wait for draft save debounce (500ms) + margin
    await page.waitForTimeout(1000);

    // Navigate away
    await page.goto('/');
    await expect(page.getByText('Challenge Packs')).toBeVisible();

    // Navigate back
    await page.goto(`/challenge/${challengeId}`);
    await waitForEditorReady(page);

    // Verify draft content is restored
    const content = await getEditorContent(page);
    expect(content).toContain('draft in progress');
  });
});
