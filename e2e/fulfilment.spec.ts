import { expect, test, type Page } from "@playwright/test";
import { capturePageErrors } from "./helpers/page-errors";
import {
  DEFAULT_SIMULATED_TIME as SIMULATED_TIME,
  injectSimulatedTime,
} from "./helpers/simulated-time";
import { fakeAddress, fakeGuest, seedFaker } from "./helpers/fake-guest";

// Cached settings fetched once per worker via Playwright's request context:
// one request, keeps the backend's rate limiter quiet, and X-Simulated-Time
// pins the backend instant just like the page-route helper does.
let settingsCache: { delivery_suburbs: string[]; pickup_address: string } | null = null;

async function getSettings(page: Page) {
  // Same base the app itself uses (lib/api.ts); .env.local points it at the
  // ddev backend. Falls back to the app's relative default.
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
  settingsCache ??= await page.request
    .get(`${base.replace(/\/$/, "")}/settings`, {
      headers: { "x-simulated-time": SIMULATED_TIME },
    })
    .then((res) => res.json())
    .then((body) => body.data);
  return settingsCache;
}

// Fulfilment journeys at a pinned simulated instant mid Ordering Window:
// the same guest loop through pickup and through delivery, asserting the
// checkout form shows the right fields and /orders renders the right
// Fulfilment details for each.
for (const fulfilment of ["pickup", "delivery"] as const) {
  test(`guest ${fulfilment} order renders correctly on /orders`, async ({ page }) => {
    const problems = capturePageErrors(page);
    seedFaker(test.info().title);
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
    const guest = fakeGuest();
    await page.getByLabel("Name").fill(guest.name);
    await page.getByLabel(/Email/).fill(guest.email);

    if (fulfilment === "delivery") {
      await page.getByRole("button", { name: "Delivery" }).click();
      // Address/suburb fields appear only for delivery
      await expect(page.getByLabel("Delivery address")).toBeVisible();
      await page.getByLabel("Delivery address").fill(fakeAddress());

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
      // TODO(.scratch/orders-api/issues/01): GET /orders/{token} omits
      // `customer`, so the Delivery address row can't render. Assert the row
      // once the backend includes it.
      await expect(page.getByRole("tab", { name: "Out for delivery" })).toBeVisible();
    }

    // Manage Token remembered
    const stored = await page.evaluate(() => localStorage.getItem("tiffin_orders_v1"));
    expect(stored).toContain(token);

    expect(problems).toEqual([]);
  });
}
