import { defineConfig } from "@playwright/test";

const browserTestPort = 3107;
const browserTestBaseUrl = `http://localhost:${browserTestPort}`;

export default defineConfig({
  testDir: "./browser-tests",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  outputDir: "test-results",
  use: {
    baseURL: browserTestBaseUrl,
    browserName: "chromium",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        viewport: { height: 1000, width: 1440 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        hasTouch: true,
        isMobile: true,
        viewport: { height: 844, width: 390 },
      },
    },
  ],
  webServer: {
    command: `npm run dev -- --hostname localhost --port ${browserTestPort}`,
    env: {
      NEXT_DIST_DIR: ".next-browser-tests",
      SOCIAL_BROWSER_TEST_MODE: "1",
    },
    reuseExistingServer: false,
    timeout: 180_000,
    url: `${browserTestBaseUrl}/browser-tests/social-publishing`,
  },
});
