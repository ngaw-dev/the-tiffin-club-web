# The Tiffin Club API — Reference

Base URL: `/api/v1`. All responses are JSON.

## Conventions

### Envelope

Every response uses the same envelope:

```json
// success
{ "success": true, "message": "...", "data": { ... } }

// error
{ "success": false, "message": "...", "errors": { "field": ["..."] } }
```

### Status codes

| Code | Meaning                                                                |
| ---- | ---------------------------------------------------------------------- |
| 200  | OK                                                                     |
| 201  | Created (order placed, account registered)                             |
| 401  | Missing/invalid bearer token                                           |
| 404  | Not found (also used for every order-lookup failure, so nothing leaks) |
| 410  | Order manage token expired (past 23:59:59 on the order day)            |
| 422  | Validation failed — `errors` maps field → messages                     |
| 429  | Rate limited (account register/login: 10/min)                          |

### Money & times

- All amounts are **cents** (`1600` = $16.00).
- All dates/times are computed in `Pacific/Auckland`. Timestamps are ISO-8601; menu/ordering times are `HH:mm`.

### Domain notes

- An order is linked to a **Customer** resolved from the submitted email/phone (find-or-create; when both match different customers, the email match wins). Email is stored lowercase, phone digits-only. Name, address and suburb live on the customer — the API always returns the customer's current details.
- The **manage token** returned at placement is the sole handle to view/edit/cancel an order.
- Orders can be edited or cancelled by the customer only until the day's **cutoff time**.
- Placing an order fires an `OrderPlaced` event after the transaction commits; a queued listener sends the confirmation email. Both outcomes (sent, skipped-no-email) are recorded in the order's internal audit trail (`order_updates`, actor `system`) — internal only, not exposed via the API.

---

## Store

### `GET /settings`

Public store settings. Read-only.

**Response `data`:**

```json
{
  "delivery_suburbs": ["Te Aro", "..."],
  "order_cutoff_time": "11:00",
  "pickup_start_time": "17:00",
  "pickup_end_time": "19:00",
  "store_phone": "021 123 4567",
  "store_phone_alternate": "04 555 1234",
  "store_email": "hello@thetiffinclub.co.nz"
}
```

## Menu

### `GET /menu/today`

Today's published menu plus the ordering window. Clients never compute open/closed themselves — use `data.ordering.state`.

**Response `data` (menu published):**

```json
{
  "status": "open",
  "date": "2026-11-15",
  "main": { "name": "Butter Chicken", "description": "...", "price": 1600 },
  "extras": [{ "name": "Garlic Naan", "description": null, "price": 400 }],
  "ordering": {
    "state": "open",
    "open": true,
    "closing_soon": false,
    "opens_at": "09:00",
    "closes_at": "11:00"
  }
}
```

`ordering.state`: `open` | `opening_later` | `closing_soon` | `closed`.

**Response `data` (no menu published yet):**

```json
{ "status": "coming_soon", "main": null, "extras": [] }
```

---

## Orders

### Order object

Returned by every order endpoint (place, lookup, show, update, cancel):

```json
{
  "manage_token": "<64 hex chars>",
  "status": "confirmed",
  "fulfilment": "delivery",
  "customer": {
    "name": "Amol W",
    "email": "amol@example.com",
    "phone": "0211234567",
    "address": "12 Cuba Street",
    "suburb": "Te Aro"
  },
  "delivery_notes": "Knock twice",
  "items": [{ "name": "Butter Chicken", "quantity": 2, "unit_price": 1600, "line_total": 3200 }],
  "total": 3600,
  "payment": "pay_in_person",
  "placed_at": "2026-11-15T10:00:00+13:00",
  "expires_at": "2026-11-15T23:59:59+13:00"
}
```

| Field            | Notes                                                                                                                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`         | `placed` \| `confirmed` \| `ready_for_pickup` \| `out_for_delivery` \| `completed` \| `cancelled` — orders are returned as `confirmed` immediately on placement (auto-confirm; manual staff confirmation to come) |
| `fulfilment`     | `pickup` \| `delivery`                                                                                                                                                                                            |
| `customer`       | Live customer details at read time (not a placement snapshot) — absent if the relation isn't eager-loaded                                                                                                         |
| `delivery_notes` | Free-text notes for the driver (e.g. access instructions)                                                                                                                                                         |
| `total`          | Server-computed at menu prices, cents                                                                                                                                                                             |
| `expires_at`     | The manage token's lifetime ends here — 23:59:59 on the order day                                                                                                                                                 |

### `POST /orders`

Place a guest order for today's menu. Returns **201** with the order object — **`manage_token` is only returned here**; store it.

**Request:**

```json
{
  "fulfilment": "delivery",
  "name": "Amol W",
  "email": "amol@example.com",
  "phone": "0211234567",
  "address": "12 Cuba Street",
  "suburb": "Te Aro",
  "delivery_notes": "Knock twice",
  "items": [
    { "id": 3, "quantity": 2 },
    { "id": 4, "quantity": 1 }
  ]
}
```

Rules:

- `name` — required. Stored on the customer, updated to the latest submitted value on every order.
- `email` / `phone` — at least one required (both optional individually). Email lowercased, phone digits-only.
- `address`, `suburb`, `delivery_notes` — optional. Address/suburb stored on the customer as their delivery default.
- `suburb` — required when `fulfilment=delivery`; must be in `delivery_suburbs` from `GET /settings`.
- `items.*.id` — must exist on **today's** menu; `quantity` 1–20.

Side effects:

- Resolves the **customer** (find-or-create by email, then phone; email match wins on conflict) and updates their name/address/suburb to the submitted values.
- Fires `OrderPlaced` (after commit). Customers with an email are sent a **confirmation email** (queued, async): order summary, fulfilment details, the cutoff deadline, and the manage deep link — the token is in the email body, so mailbox access equals order control (same trust as lookup). Phone-only customers receive nothing out-of-band. Both outcomes are appended to the order's internal audit trail.
- The order's initial `status` is **`confirmed`** (auto-confirmed; manual staff confirmation to come).

Errors:

- `422` with `items.*.id` / `suburb` / `email` / `phone` / `ordering` (`"The ordering window is closed."`).

### `POST /orders/lookup`

Knowledge-based lookup: manage token + the email or phone used at checkout — matched against the customer's **current** email/phone (both live values). Every failure (unknown token, expired token, wrong contact) answers identically with **404**.

**Request:**

```json
{ "token": "<64 hex>", "email": "amol@example.com" }
```

(`email` and `phone` are interchangeable; at least one required.)

### `GET /orders/{token}`

View an order by manage token. **200** with the order object; **404** unknown token; **410** token expired.

### `PATCH /orders/{token}`

Edit an order before cutoff. All fields `sometimes`; item ids validated against the order's own menu.

**Request:** any subset of

```json
{
  "fulfilment": "pickup",
  "delivery_notes": "Leave at door",
  "items": [{ "id": 3, "quantity": 1 }]
}
```

Applied fields: `fulfilment`, `delivery_notes`, `items`. Changing `fulfilment` to `delivery` does **not** re-validate a suburb (validate client-side against `GET /settings`). Errors: `422` (validation / off-menu items), **410** (expired), and `422` with `ordering` after cutoff.

> ⚠️ Known gap: the request still _accepts_ `name`, `address`, `suburb` (validated then silently ignored — these now live on the customer). Email/phone are already rejected.

### `DELETE /orders/{token}`

Cancel an order before cutoff. **200** with the order object (`status: "cancelled"`). After cutoff only staff may cancel (not exposed via this API). **410** expired, **404** unknown.

---

## Account (Clerk)

Sign-in is handled by Clerk; the API never stores a Clerk identifier. Requests carry `Authorization: Bearer <clerk jwt>`. The JWT is verified locally against Clerk's JWKS (issuer, `azp` origin allow-list, expiry) and **must** carry `email_verified: true`. The verified email maps to the `customers` row (see `docs/adr/0001-clerk-email-only-linking.md`). Missing/invalid token → **401**. Requires `CLERK_ISSUER` and `CLERK_ALLOWED_ORIGINS` (comma-separated) in `.env`.

### `GET /my-account`

The signed-in customer. **Creates** the row from the JWT name + email on first request.

**200 `data`:**

```json
{
  "name": "Amol W",
  "email": "amol@example.com",
  "phone": "0211234567",
  "address": "12 Cuba Street",
  "suburb": "Te Aro"
}
```

### `PATCH /my-account`

Update contact/delivery details. All fields optional (`name`, `phone`, `address`, `suburb`); `suburb` must be in the delivery list, `phone` unique. Invalid → **422**.

### `GET /my-orders`

Every order on the email-matched customer row — guest history included — newest first. No row yet → `data: []` (never creates one).

### Authenticated order placement

`POST /orders` stays public for guests. With a Bearer token present, the payload `email` (when given) must match the JWT email, else **422**; an invalid-but-present token → **401**. The order links to the email-matched customer as usual.
