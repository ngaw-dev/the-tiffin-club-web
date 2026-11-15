# GET /orders/{token} is missing `customer` — Delivery address can't render

Status: needs-triage
Type: bug
Found by: `e2e/fulfilment.spec.ts` › guest delivery order renders correctly on /orders

## What happens

`POST /api/v1/orders` returns the full order including `customer`:

```json
"customer": {
  "name": "E2E curl",
  "email": "e2e-curl@test.nz",
  "phone": null,
  "address": "1 E2E Street",
  "suburb": "Te Aro"
}
```

But `GET /api/v1/orders/{manage_token}` for the same order omits `customer`
entirely. Verified against `https://the-tiffin-club-api.ddev.site/api/v1` on
2026-11-16 with a freshly placed delivery order.

## Impact

- `components/order-card.tsx` only renders the **Delivery address** row when
  `order.customer?.address` exists, so delivery orders never show their address
  on `/orders`.
- The "Order placed!" banner also skips the customer name
  (`selected.customer?.name`) for the same reason.
- Pickup orders are unaffected: their address comes from `/settings`
  (`pickup_address`), not from the order.

## Evidence

- POST response: `customer` present (see above).
- GET `/orders/1932c205…dbba4e` (same order): no `customer` key — only
  `manage_token`, `status`, `fulfilment`, `delivery_notes`, `items`, `total`,
  `payment`, `placed_at`, `expires_at`.
- e2e failure: `e2e/fulfilment.spec.ts` waits for `getByText("Delivery address")`
  which never appears (snapshot shows the order card without the row and the
  banner without a name).

## Fix (backend repo)

Include `customer` (name, email, phone, address, suburb) in the GET
`/orders/{manage_token}` response, matching the POST response shape. The
frontend (`lib/api.ts` Order type) and the e2e test already expect it.

## Frontend workaround

`e2e/fulfilment.spec.ts` currently skips the Delivery-address assertions with a
comment pointing here; restore them once this is fixed.

## Comments

- 2026-11-16: Filed during e2e bring-up. Pickup half of the suite passes; the
  delivery journey passes except for the address-row assertions.
