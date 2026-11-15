import { expect, test } from "@playwright/test";
import { injectSimulatedTime } from "./helpers/simulated-time";
import { capturePageErrors } from "./helpers/page-errors";

// Ticket 02: at a pinned mid-window instant the backend reports the Ordering
// Window open and the home page badge says so. Requires today's menu to be
// published on the configured backend.
test("Ordering Window badge is open at simulated mid-window time", async ({ page }) => {
  const problems = capturePageErrors(page);
  await injectSimulatedTime(page);
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.getByText("Ordering open", { exact: false }).first()).toBeVisible();
  expect(problems).toEqual([]);
});
