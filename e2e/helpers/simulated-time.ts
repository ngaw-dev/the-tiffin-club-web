import type { TestInfo } from "@playwright/test";

// api.md: X-Simulated-Time on any /api/v1 request makes the backend treat
// that instant as "now" (ordering window, today's menu, token expiry).
// Non-production backends only.
export type SimTimeFixture = (isoInstant: string) => Promise<void>;

// shortcut: fixed date, assumes a published menu for that date on the backend.
// Seconds jitter per process: the backend rate limiter keys by simulated
// instant, so a fresh bucket every run; 21:00 stays mid Ordering Window.
const RUN_JITTER = String(Date.now() % 60).padStart(2, "0");
export const DEFAULT_SIMULATED_TIME = `2026-11-16T21:00:${RUN_JITTER}+13:00`;

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
