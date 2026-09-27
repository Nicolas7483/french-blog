import { defineConfig, devices } from '@playwright/test';

// Tests run against the built site in dist/. Run `npm run build` first.
export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4321',
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node scripts/serve.mjs 4321',
    url: 'http://localhost:4321/',
    reuseExistingServer: !process.env.CI,
  },
});
