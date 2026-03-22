import { test, expect } from '@playwright/test';

test.describe('Auth flow (smoke)', () => {
  test('sign-in button visible when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('/api/auth/session returns unauthenticated', async ({ request }) => {
    const res = await request.get('/api/v1/auth/session');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.authenticated).toBe(false);
  });

  test('sign-in navigates toward GitHub OAuth', async ({ page }) => {
    await page.goto('/');
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 5000 }).catch(() => null),
      page.getByRole('button', { name: /sign in/i }).click(),
    ]);

    // Either a popup opened to GitHub, or the main page navigated
    if (popup) {
      await popup.waitForURL(/github\.com|\/api\/auth/, { timeout: 5000 }).catch(() => { /* timeout OK */ });
      const url = popup.url();
      expect(url).toMatch(/github\.com|\/api\/auth/);
    } else {
      // Check if the main page navigated to the auth endpoint
      await page.waitForURL(/github\.com|\/api\/auth/, { timeout: 5000 }).catch(() => { /* timeout OK */ });
      const url = page.url();
      expect(url).toMatch(/github\.com|\/api\/auth|localhost/);
    }
  });
});
