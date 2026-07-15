import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  use: {
    baseURL: 'http://127.0.0.1:1420',
    channel: 'msedge',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://127.0.0.1:1420',
    reuseExistingServer: true,
  },
});
