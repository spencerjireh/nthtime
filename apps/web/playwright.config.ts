import { defineConfig, devices } from '@playwright/test';

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL;

if (!SPRING_BOOT_URL && process.env.CI) {
  throw new Error('SPRING_BOOT_URL is required for E2E tests');
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
    command: `SPRING_BOOT_URL=${SPRING_BOOT_URL || 'http://localhost:8080'} npx nx dev @nthtime/web -- --port 3000`,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
