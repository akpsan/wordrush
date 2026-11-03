/**
 * End-to-end tests: real flows in a real browser, at phone and desktop sizes.
 * Uses the installed Chrome (no browser download). Run: npm run e2e
 */
import { defineConfig, devices } from '@playwright/test';

const PORT = 5287;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: 'chrome',
    // Stable screenshots: the app turns animations off under reduced motion.
    contextOptions: { reducedMotion: 'reduce' },
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.001 },
  },
  projects: [
    { name: 'phone', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium', channel: 'chrome' } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: true,
  },
});
