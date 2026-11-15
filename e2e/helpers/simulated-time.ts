import type { TestInfo } from "@playwright/test";

// api.md: X-Simulated-Time on any /api/v1 request makes the backend treat
// that instant as "now" (ordering window, today's menu, token expiry).
// Non-production backends only.
export type SimTimeFixture = (isoInstant: string) => Promise<void>;

// shortcut: fixed instant, assumes a published menu for that date on the backend
const DEFAULT_SIMULATED_TIME = "2026-11-16T21:00:00+13:00"; // mid Ordering Window (09:00–23:00 NZ)

/** Intercept /api/v1/** from the browser and stamp X-Simulated-Time. */
export async function injectSimulatedTime(
  page: import("@playwright/test").Page,
  isoInstant: string = DEFAULT_SIMULATED_TIME,
): Promise<void> {
  await page.route(/\/api\/v1\//, (route) => {
    const headers = route.request().headers();
    headers["x-simulated-time"] = isoInstant;
    return route.continue({ headers });
  });
}
