# Design System — The Tiffin Club (Food Delivery App)

This file is the single source of truth for design decisions. The
`ux-development` skill keeps it current: read it before designing, append to it
after.

## Brand & Tone

- **Product:** on-demand food delivery app (no subscription plans).
- **Tone:** warm, appetizing, trustworthy. Friendly but not childish. Food
  photography is the hero; UI stays warm-neutral and lets imagery sell.
- **Users:** busy professionals & students ordering meals quickly, mostly on
  mobile. Optimize for fast re-ordering and glanceable info.

## Design Tokens

### Colors

Primary palette is warm orange (appetite appeal); fresh green reserved for
veg indicators. Defined as shadcn CSS variables (`oklch`), light and dark:

| Token | Light (approx) | Dark (approx) | Usage |
|---|---|---|---|
| `--primary` | orange ~`#EA580C` | brighter orange ~`#FB923C` | CTAs, active states, brand |
| `--primary-foreground` | white | near-black | Text on primary |
| `--secondary` | warm brown/neutral | darker warm neutral | Secondary buttons, chips |
| `--accent` (veg) | green ~`#16A34A` | green ~`#4ADE80` | Veg indicator dots, "open now" |
| `--destruct` | red | red | Cancelled, errors, non-veg dot |
| `--success` | green | green | Delivered, order confirmed |
| `--warning` | amber | amber | Delayed, "closing soon" |
| `--background` / `--foreground` | warm white / warm near-black | `#0a0a0a` / `#ededed` | Page |
| `--muted` / `--border` / `--ring` | shadcn `neutral` scale | same scale | Standard chrome |

### Typography

- Geist Sans (already configured); Geist Mono for codes/order IDs.
- Scale: large appetite-driven display headings for sections, medium card
  titles, comfortable readable body for menus/descriptions.

### Spacing & Shape

- Radii: soft — `rounded-lg` (0.75rem) for cards/buttons, `rounded-xl`+ for
  hero images and modals.
- Shadows: subtle on meal cards; elevate cart/checkout surfaces.
- Motion: short (150–200ms) easings; respect `prefers-reduced-motion`.

## Styling System

- **shadcn/ui is the component library — always use it for building components**
  (never hand-roll primitives shadcn provides).
  - Style: `new-york` · Base color: `neutral` · Icons: `lucide`
  - Aliases: `@/components/ui` (ui), `@/components` (components), `@/lib/utils`,
    `@/hooks`
- **Premium blocks: use https://www.shadcnblocks.com first.** Before hand-building
  any page-level section (hero, menu grid, pricing, dashboard, footer, auth
  screens), search `@shadcnblocks` and add via
  `npx shadcn add @shadcnblocks/<name>` (auth via `SHADCNBLOCKS_API_KEY`).
  Custom composition only when no suitable block exists.
- Tailwind CSS v4, tokens mapped through `@theme inline` in `app/globals.css`.
- Dark mode follows `prefers-color-scheme` via `:root` variable overrides.

## UI Conventions (food delivery)

- **Veg/non-veg:** standard square-outline dot indicators (green = veg,
  red/brown = non-veg) on every dish card and menu row.
- **Spice level:** badge or chili icons on dish cards.
- **Dish cards:** image (with skeleton while loading + fallback), name, price,
  rating, prep/delivery time, veg dot, add-to-cart button.
- **Order tracking timeline:** placed → confirmed → preparing → out for
  delivery → delivered, with status colors (warning → primary → success).
- **Checkout flow:** cart (Sheet drawer on mobile) → address selection →
  delivery slot picker → payment → confirmation.
- **States:** loading skeletons for all food imagery; friendly empty states
  ("No restaurants open near you yet"); error toasts via Sonner.
- **Mobile-first:** bottom-friendly CTAs, sticky add-to-cart bar on dish pages.

## Component Inventory

**shadcn/ui installed (2026-11-14):** button, badge, card, dialog, input, label,
radio-group, select, separator, sheet, skeleton, sonner, tabs, textarea.

**Custom components:** `ordering-status-banner`, `menu-item-card`,
`checkout-sheet` (Sheet), `order-status` (status dialog + find-order lookup +
cancel), `sign-in` (Tabs login/register), `home-client` (page shell).
**Lib:** `lib/api.ts` (axios client, envelope unwrap, ApiError), `lib/types.ts`
(api.md shapes), `lib/format.ts` (cents→NZD, HH:MM), `lib/cart-context.tsx`
(cart state, qty 1–20), `lib/utils.ts` (cn).

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-11-14 | Initialized DESIGN.md from `globals.css` baseline | Retroactive codification |
| 2026-11-14 | Primary palette: warm orange | Appetite appeal, energy; green reserved for veg |
| 2026-11-14 | On-demand ordering only, no subscriptions | Product scope decision |
| 2026-11-14 | shadcn/ui + @shadcnblocks premium blocks as component source of truth | Consistency, speed, premium quality |
| 2026-11-14 | Single-page home: menu + cart + checkout in Sheet, order lookup via dialog; axios client unwrapping API envelope | api.md is guest-first; one page covers the whole storefront |
| 2026-11-14 | Warm-orange `oklch` tokens in `globals.css` (light+dark), `.75rem` radius | Implements the palette decision as shadcn CSS variables |
