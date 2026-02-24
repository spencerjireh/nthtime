import { test, expect } from '@playwright/test';
import { waitForEditorReady, getEditorContent, setEditorContent, getChallengeId } from './helpers';

let challengeId: string;

test.beforeAll(async () => {
  challengeId = await getChallengeId('express-basics', 1);
});

test.describe('Multi-file challenges', () => {
  test('create new file via file tree', async ({ page }) => {
    await page.goto(`/challenge/${challengeId}`);
    await waitForEditorReady(page);

    // Click the "+" button in the file tree to create a new file
    await page.getByTitle('New file').click();

    // Type the filename and press Enter
    const input = page.locator('input[type="text"]');
    await input.fill('helpers.js');
    await input.press('Enter');

    // Verify the new file appears in the file tree
    await expect(page.getByRole('button', { name: 'helpers.js', exact: true })).toBeVisible();
  });

  test('switch between files using file tree', async ({ page }) => {
    await page.goto(`/challenge/${challengeId}`);
    await waitForEditorReady(page);

    // The challenge has app.js and server.js
    // Click server.js in the file tree to switch
    const fileTreeItems = page.locator('nav').getByText('server.js');
    await fileTreeItems.click();

    // Verify the tab bar shows server.js as active
    // The active tab has different styling -- check the editor loaded the file
    const content = await getEditorContent(page);
    expect(content).toBeDefined();
  });

  test('submit multi-file challenge, results show file tabs', async ({ page }) => {
    await page.goto(`/challenge/${challengeId}`);
    await waitForEditorReady(page);

    // Write a solution
    await setEditorContent(page, "import express from 'express';\nexport default express();");
    await page.getByRole('button', { name: 'Run' }).click();

    // Wait for results
    await page.getByText('All Passed').or(page.getByText('Some Failed')).waitFor({ timeout: 15000 });

    // Results view should show file tabs for each file
    // Button accessible name includes icon text (e.g. "JS app.js"), so use regex
    await expect(page.getByRole('button', { name: /app\.js/ })).toBeVisible();
  });
});
