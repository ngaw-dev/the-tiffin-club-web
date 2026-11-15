import { expect, test, type Page } from "@playwright/test";
import { capturePageErrors } from "./helpers/page-errors";
import { injectSimulatedTime } from "./helpers/simulated-time";

// Cached settings fetched once per worker from inside the page: reuses the
// app's trusted context (ddev cert) and the simulated-time route, and keeps
// request count low so the backend's rate limiter stays quiet.
let settingsCache: { delivery_suburbs: string[]; pickup_address: string } | null = null;

async function getSettings(page: Page) {
  settingsCache ??= await page.evaluate(async () => {
    const res = await fetch("/api/v1/settings");
    return (await res.json()).data;
  });
  return settingsCache;
}

// Fulfilment journeys at a pinned simulated instant mid Ordering Window:
// the same guest loop through pickup and through delivery, asserting the
// checkout form shows the right fields and /orders renders the right
// Fulfilment details for each.
for (const fulfilment of ["pickup", "delivery"] as const) {
  test(`guest ${fulfilment} order renders correctly on /orders`, async ({ page }) => {
    const problems = capturePageErrors(page);
    await injectSimulatedTime(page);
    const settings = await getSettings(page);

    // Build the Tiffin: the Main Meal
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Today's Menu" })).toBeVisible();
    const main = page
      .getByRole("region", { name: "Today's Menu" })
      .getByRole("heading", { level: 3 })
      .first();
    const mainName = (await main.textContent())!.trim();
    await page.getByRole("button", { name: `Increase Quantity of ${mainName}` }).click();
    await page.getByRole("link", { name: /Checkout/ }).click();
    await expect(page).toHaveURL(/\/checkout/);

    // Guest details; delivery adds required address + suburb
    await page.getByLabel("Name").fill(`E2E ${fulfilment}`);
    const email = `e2e-${fulfilment}@thetiffinclub.co.nz`;
    await page.getByLabel(/Email/).fill(email);

    if (fulfilment === "delivery") {
      await page.getByRole("button", { name: "Delivery" }).click();
      // Address/suburb fields appear only for delivery
      await expect(page.getByLabel("Delivery address")).toBeVisible();
      await page.getByLabel("Delivery address").fill("1 E2E Street");

      const suburb = settings.delivery_suburbs[0];
      await page.getByRole("combobox", { name: "Suburb" }).click();
      // Radix Select options animate in; the first suburb is the active
      // option already, so confirm by keyboard.
      await page.keyboard.press("Enter");
      await expect(page.getByRole("combobox", { name: "Suburb" })).toContainText(suburb);
    } else {
      await expect(page.getByLabel("Delivery address")).toHaveCount(0);
    }

    await page.getByRole("button", { name: new RegExp(`Place ${fulfilment} order`) }).click();

    // Order Placed: banner wording differs by fulfilment
    await expect(page).toHaveURL(/\/orders\?token=[0-9a-f]{64}&placed=1/, {
      timeout: 15_000,
    });
    const token = new URL(page.url()).searchParams.get("token")!;
    await expect(page.getByRole("heading", { name: "Order placed!" })).toBeVisible();
    await expect(page.getByText(new RegExp(`Pay in person at ${fulfilment}\\.`))).toBeVisible();

    // Detail card: fulfilment row, address row, distinctive status tab.
    // The UI renders the lowercase fulfilment value (capitalized via CSS),
    // so match the raw value, not "Pickup"/"Delivery".
    await expect(page.getByText(fulfilment, { exact: true }).first()).toBeVisible();
    if (fulfilment === "pickup") {
      await expect(page.getByText("Pickup address")).toBeVisible();
      await expect(page.getByText(settings.pickup_address).first()).toBeVisible();
      await expect(page.getByRole("tab", { name: "Ready for pickup" })).toBeVisible();
    } else {
      await expect(page.getByText("Delivery address")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Out for delivery" })).toBeVisible();
    }

    // Manage Token remembered
    const stored = await page.evaluate(() => localStorage.getItem("tiffin_orders_v1"));
    expect(stored).toContain(token);

    expect(problems).toEqual([]);
  });
}
