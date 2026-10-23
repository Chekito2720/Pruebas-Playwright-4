import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  retries: 1,
  workers: 2,
  outputDir: 'target/test-results',
  reporter: [['list'], ['html', { outputFolder: 'target/report', open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'https://the-internet.herokuapp.com',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 12_000,
    navigationTimeout: 40_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium' }],
});
