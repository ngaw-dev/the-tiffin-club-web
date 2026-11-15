import { expect, test } from "@playwright/test";
import { capturePageErrors } from "./helpers/page-errors";
import { injectSimulatedTime } from "./helpers/simulated-time";

// Ticket 04: the core guest journey at a pinned simulated instant mid
// Ordering Window — Today's Menu → Tiffin → checkout → Placed order (API
// status `confirmed`) visible on /orders via its Manage Token.
test("guest orders today's meal and sees it Placed on /orders", async ({ page }) => {
  const problems = capturePageErrors(page);
  await injectSimulatedTime(page);

  // Today's Menu renders with the Ordering Window open
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Today's Menu" })).toBeVisible();
  await expect(page.getByText("Ordering open").first()).toBeVisible();

  // Add the Main Meal and one Extra to the Tiffin
  const main = page.getByRole("heading", { level: 3 }).first();
  const mainName = (await main.textContent())!.trim();
  await page.getByRole("button", { name: `Increase Quantity of ${mainName}` }).click();

  // Checkout link shows the Tiffin total once an item is added
  await expect(page.getByRole("link", { name: /Checkout/ })).toBeVisible();
  await page.getByRole("link", { name: /Checkout/ }).click();
  await expect(page).toHaveURL(/\/checkout/);

  // Fill guest details (pickup needs just a name + contact)
  await page.getByLabel("Name").fill("E2E Journey");
  await page.getByLabel(/Email/).fill("e2e-journey@thetiffinclub.co.nz");

  await page.getByRole("button", { name: /Place pickup order/i }).click();

  // Order Placed: redirect to /orders?token=…&placed=1 with the order visible
  await expect(page).toHaveURL(/\/orders\?token=[0-9a-f]{64}&placed=1/, {
    timeout: 15_000,
  });
  const token = new URL(page.url()).searchParams.get("token")!;
  await expect(page.getByRole("heading", { name: "Order placed!" })).toBeVisible();
  await expect(page.getByText("CONFIRMED").first()).toBeVisible();

  // Manage Token remembered in the guest store (survives reload)
  const stored = await page.evaluate(() => localStorage.getItem("tiffin_orders_v1"));
  expect(stored).toContain(token);

  expect(problems).toEqual([]);
});
