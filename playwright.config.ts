import { defineConfig, devices } from "@playwright/test";

// Local-first e2e setup (see .scratch/playwright-e2e/issues/):
// Chromium only; the Next dev server is started via webServer and hits the
// same backend as local dev through NEXT_PUBLIC_API_BASE_URL.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  // Serialized: parallel workers hammer /menu/today + /settings and trip the
  // backend's rate limiter (429s).
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3100",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Inherit the surrounding environment (incl. NEXT_PUBLIC_API_BASE_URL
      // and Clerk keys) so the app under test is configured like local dev.
      ...process.env,
    },
  },
});
