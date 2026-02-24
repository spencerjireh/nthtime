import { defineConfig, devices } from '@playwright/test';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL && process.env.CI) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is required for E2E tests');
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: `NEXT_PUBLIC_CONVEX_URL=${CONVEX_URL} npx nx dev @nthtime/web -- --port 3000`,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
