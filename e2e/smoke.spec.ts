import { expect, test } from "@playwright/test";
import { capturePageErrors } from "./helpers/page-errors";

// Ticket 03: key guest pages load 200 with no console/page errors.
for (const path of ["/", "/checkout", "/orders", "/sign-in"]) {
  test(`${path} loads clean`, async ({ page }) => {
    const problems = capturePageErrors(page);
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("body")).toBeVisible();
    expect(problems).toEqual([]);
  });
}
