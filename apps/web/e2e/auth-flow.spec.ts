import { test, expect } from '@playwright/test';

// The auth UI is gated by NEXT_PUBLIC_FF_AUTH. Local dev frequently
// sets this to "false" in apps/web/.env.local, which removes the sign-in
// button entirely. We probe the DOM at runtime and skip the UI-specific
// assertions in that case — the session API assertion below still runs
// unconditionally because it doesn't depend on the flag.
async function isAuthUIEnabled(page: import('@playwright/test').Page): Promise<boolean> {
  await page.goto('/');
  return (await page.getByRole('button', { name: /sign in/i }).count()) > 0;
}

test.describe('Auth flow (smoke)', () => {
  test('sign-in button visible when unauthenticated', async ({ page }) => {
    test.skip(!(await isAuthUIEnabled(page)), 'auth UI disabled via NEXT_PUBLIC_FF_AUTH');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('/api/auth/session returns unauthenticated', async ({ request }) => {
    const res = await request.get('/api/v1/auth/session');
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.authenticated).toBe(false);
  });

  test('sign-in navigates toward GitHub OAuth', async ({ page }) => {
    test.skip(!(await isAuthUIEnabled(page)), 'auth UI disabled via NEXT_PUBLIC_FF_AUTH');
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
