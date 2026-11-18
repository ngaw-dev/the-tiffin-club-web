import { expect, request, test, type Page } from "@playwright/test";
import { capturePageErrors } from "./helpers/page-errors";
import { DEFAULT_SIMULATED_TIME, injectSimulatedTime } from "./helpers/simulated-time";
import { fakeGuest, seedFaker } from "./helpers/fake-guest";

// Orders page (/orders) guest surface, complementing journey.spec (full
// happy path) and fulfilment.spec (pickup/delivery detail): empty state,
// URL-token recovery without localStorage, the placed banner, and the
// manual "ordered on another device" lookup.

/** Place a minimal pickup order and return its manage token + email used. */
async function placePickupOrder(page: Page): Promise<{ token: string; email: string }> {
  seedFaker(test.info().title);
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

  const guest = fakeGuest();
  await page.getByLabel("Name").fill(guest.name);
  await page.getByLabel(/Email/).fill(guest.email);
  await page.getByRole("button", { name: /Place pickup order/i }).click();

  await expect(page).toHaveURL(/\/orders\?token=[0-9a-f]{64}&placed=1/, { timeout: 15_000 });
  return { token: new URL(page.url()).searchParams.get("token")!, email: guest.email };
}

test("fresh visitor sees the empty state with lookup entry point", async ({ page }) => {
  const problems = capturePageErrors(page);
  await injectSimulatedTime(page);

  await page.goto("/orders");
  await expect(page.getByRole("heading", { name: "Your orders" })).toBeVisible();
  await expect(page.getByText("Nothing here yet.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "No order found" })).toBeVisible();
  await expect(
    page.getByText(
      "We couldn't find an order on this device. Use the lookup below with your manage token and contact details.",
    ),
  ).toBeVisible();
  // Button asChild → renders as a link
  await expect(page.getByRole("link", { name: "Browse today's menu" })).toBeVisible();

  // Guest lookup entry point is offered
  await expect(
    page.getByRole("button", { name: "Ordered on another device? Find your order" }),
  ).toBeVisible();

  expect(problems).toEqual([]);
});

test("URL token shows the order even with no stored tokens, banner only with placed=1", async ({
  page,
}) => {
  const problems = capturePageErrors(page);
  await injectSimulatedTime(page);

  const { token } = await placePickupOrder(page);

  // Simulate a fresh device: no localStorage, plain URL token (no placed flag)
  await page.evaluate(() => localStorage.clear());
  await page.goto(`/orders?token=${token}`);

  await expect(page.getByRole("heading", { name: "Your orders" })).toBeVisible();
  await expect(page.getByText("Track each tiffin from kitchen to doorstep.")).toBeVisible();
  await expect(page.getByText("CONFIRMED").first()).toBeVisible();
  // No placed flag in the URL → no celebration banner
  await expect(page.getByRole("heading", { name: "Order placed!" })).toHaveCount(0);

  // Same token with placed=1 shows the banner
  await page.goto(`/orders?token=${token}&placed=1`);
  await expect(page.getByRole("heading", { name: "Order placed!" })).toBeVisible();

  // Detail card is visible alongside the list row
  await expect(page.getByText("Pickup address").first()).toBeVisible();

  expect(problems).toEqual([]);
});

test("lookup form recovers an order placed on another device", async ({ page }) => {
  const problems = capturePageErrors(page);
  await injectSimulatedTime(page);

  const { token, email } = await placePickupOrder(page);

  // Fresh device: no storage, no URL token
  await page.evaluate(() => localStorage.clear());
  await page.goto("/orders");
  await expect(page.getByRole("heading", { name: "No order found" })).toBeVisible();

  await page.getByRole("button", { name: "Ordered on another device? Find your order" }).click();
  await page.getByLabel("Manage token").fill(token);
  await page.getByLabel("Email or phone").fill(email);
  await page.getByRole("button", { name: "Find order" }).click();

  // Order appears in the list and is auto-selected in the detail pane
  await expect(page.getByText("Track each tiffin from kitchen to doorstep.")).toBeVisible();
  await expect(page.getByText("CONFIRMED").first()).toBeVisible();

  expect(problems).toEqual([]);
});

test("lookup with wrong details shows an error and stays empty", async ({ page }) => {
  const problems = capturePageErrors(page);
  await injectSimulatedTime(page);

  await page.goto("/orders");
  await expect(page.getByRole("heading", { name: "No order found" })).toBeVisible();

  await page.getByRole("button", { name: "Ordered on another device? Find your order" }).click();
  await page.getByLabel("Manage token").fill("0".repeat(64));
  await page.getByLabel("Email or phone").fill("nobody@thetiffinclub.co.nz");
  await page.getByRole("button", { name: "Find order" }).click();

  await expect(page.getByText("No order found for those details.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "No order found" })).toBeVisible();

  // The API's 404 surfaces as a console resource error — expected here.
  expect(problems).toEqual([
    "console.error: Failed to load resource: the server responded with a status of 404 ()",
  ]);
});

test("pickup order shows the pickup address on /orders", async ({ page }) => {
  const problems = capturePageErrors(page);
  await injectSimulatedTime(page);

  const { token } = await placePickupOrder(page);

  // Fresh device, plain URL token
  await page.evaluate(() => localStorage.clear());
  await page.goto(`/orders?token=${token}`);

  await expect(page.getByText("Pickup address").first()).toBeVisible();

  expect(problems).toEqual([]);
});

test("delivery order shows the delivery address on /orders", async ({ page }) => {
  const problems = capturePageErrors(page);
  await injectSimulatedTime(page);

  const { token } = await placePickupOrder(page);

  // Fresh device, plain URL token
  await page.evaluate(() => localStorage.clear());

  // .scratch/orders-api/issues/01: GET /orders/{token} omits `customer`, so
  // the Delivery address row can't render from a live response yet. Augment
  // the real response with the customer block (matching the POST response
  // shape) to cover the frontend rendering; drop this route once the backend
  // includes customer and assert against the live response.
  const DELIVERY_ADDRESS = "12 Mockelivery Grove";
  // route.fetch() goes through Node's fetch, which rejects the ddev backend's
  // self-signed cert (context-level ignoreHTTPSErrors doesn't apply to it), so
  // the upstream call is made through a request context built with
  // ignoreHTTPSErrors instead. That bypasses injectSimulatedTime's handler, so
  // the header must be re-stamped here — without it the backend reads the
  // order at real time and the order day is past (410 Gone).
  const api = await request.newContext({ ignoreHTTPSErrors: true });
  await page.route(/\/api\/v1\/orders\//, async (route) => {
    const headers = { ...route.request().headers(), "x-simulated-time": DEFAULT_SIMULATED_TIME };
    const response = await api.fetch(route.request().url(), {
      method: route.request().method(),
      headers,
      maxRedirects: 0,
    });
    const body = await response.json();
    if (body?.data) {
      body.data.fulfilment = "delivery";
      body.data.customer = {
        ...fakeGuest(),
        phone: null,
        address: DELIVERY_ADDRESS,
        suburb: "Te Aro",
      };
    }
    return route.fulfill({ response, json: body });
  });

  await page.goto(`/orders?token=${token}`);
  await expect(page.getByText("Delivery address")).toBeVisible();
  await expect(page.getByText(DELIVERY_ADDRESS).first()).toBeVisible();

  expect(problems).toEqual([]);
});
