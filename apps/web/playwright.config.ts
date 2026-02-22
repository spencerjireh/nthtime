import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mock',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3002',
      },
      testIgnore: /convex\//,
    },
    ...(process.env.CONVEX_URL
      ? [
          {
            name: 'convex',
            use: {
              ...devices['Desktop Chrome'],
              baseURL: 'http://localhost:3001',
            },
            testMatch: /convex\//,
          },
        ]
      : []),
  ],
  webServer: [
    {
      command: 'NEXT_PUBLIC_CONVEX_URL= npx nx dev @nthtime/web -- --port 3002',
      url: 'http://localhost:3002',
      reuseExistingServer: !process.env.CI,
    },
    // Second server for Convex-backed E2E tests (only starts when CONVEX_URL is set)
    ...(process.env.CONVEX_URL
      ? [
          {
            command: `NEXT_PUBLIC_CONVEX_URL=${process.env.CONVEX_URL} NEXT_PUBLIC_E2E_TEST_AUTH=true npx nx dev @nthtime/web -- --port 3001`,
            url: 'http://localhost:3001',
            reuseExistingServer: !process.env.CI,
          },
        ]
      : []),
  ],
});
