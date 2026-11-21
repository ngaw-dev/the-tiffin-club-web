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

Warm-cream paper + terracotta accent palette (Hallmark "Counter" redesign,
2026-11-21). Every colour is `oklch` and tinted toward warm hues (chroma kept
above zero so no neutral reads grey-blue). shadcn CSS variables live in
`app/globals.css`; a matching Hallmark token set (paper/ink scale, type ramp,
spacing, easings) lives in `app/tokens.css`.

| Token                             | Light (`oklch`)             | Dark (`oklch`)              | Usage                          |
| --------------------------------- | --------------------------- | --------------------------- | ------------------------------ |
| `--background` / `--foreground`   | `97.3% 0.008 85` / `24% 0.012 70` | `17% 0.008 70` / `91% 0.012 80` | Page (warm cream paper / ink) |
| `--card`                          | `99% 0.003 85`              | `20% 0.01 70`               | Card surfaces                  |
| `--primary`                       | terracotta `55% 0.14 35`    | brighter `66% 0.14 40`      | CTAs, active states, brand     |
| `--primary-foreground`            | warm white `98% 0.004 85`   | ink `24% 0.012 70`          | Text on primary                |
| `--secondary`                     | cream `94.6% 0.011 85`      | `23% 0.012 70`              | Secondary buttons, chips       |
| `--muted` / `--muted-foreground`  | `93% 0.012 85` / `46% 0.02 75` | `23% 0.012 70` / `70% 0.02 70` | Muted chrome, captions     |
| `--accent` (veg)                  | green `48% 0.07 170`        | `65% 0.09 170`              | Veg dots, "open now"           |
| `--destructive`                   | red `48% 0.19 27`           | `62% 0.19 25`               | Cancelled, errors, non-veg dot |
| `--border` / `--input`            | `88% 0.008 85` / ink 16%    | foreground 14% / 18%        | Rules and inputs               |
| `--ring`                          | = `--primary`               | = dark `--primary`          | Focus rings                    |
| `--radius`                        | `0.5rem`                    | —                           | Base radius (sm/md/lg derived) |

Extra Hallmark utilities in `app/tokens.css`: `--color-paper/-2/-3`,
`--color-ink/-2`, `--color-muted`, `--color-rule`, `--color-accent(-ink)`,
`--color-focus`, `--color-error`, `--color-success` (`50% 0.12 150`), plus
spacing (`--space-3xs…4xl`), durations, z-index, and `.shell` container.

### Typography

- **Fraunces** (serif) for display headings; **Inter** for body. Geist Mono
  where available for codes/order IDs.
- Fluid type ramp in `tokens.css`: `--text-display` (clamp 2.75→5.25rem),
  `--text-display-s`, `--text-section`, `--text-title`, `--text-lead`, down to
  `--text-xs`. Tabular numerals via `.ttc-num` for prices/times.

### Spacing & Shape

- `--radius: 0.5rem` base (sm/md/lg/xl derived); `--radius-card: 0.75rem`,
  `--radius-pill` for chips/badges.
- `--shadow-card`: single subtle 1px shadow; cart/checkout surfaces elevate.
- Motion: `--dur-micro` 120ms / `--dur-short` 220ms / `--dur-long` 420ms with
  custom easings in `tokens.css`; `prefers-reduced-motion` respected globally
  in `globals.css`.

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
- Tailwind CSS v4, tokens mapped through `@theme inline` in `app/globals.css`
  plus a `@theme static` Hallmark token block in `app/tokens.css`.
- Dark palette declared as `--dk-*` variables in `:root` and mapped into roles
  by the `.dark` class.

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
**Added 2026-11-15:** accordion.

**Custom components:** `ordering-status-banner`, `menu-item-card`,
`checkout-sheet` (Sheet), `sign-in` (Tabs login/register), `home-client` (page
shell), `cancel-order-dialog`, `order-store` (localStorage token memory).
**Removed 2026-11-15:** `order-status` (dialog) — replaced by the `/order` page.
**Lib:** `lib/api.ts` (axios client, envelope unwrap, ApiError), `lib/types.ts`
(api.md shapes), `lib/format.ts` (cents→NZD, HH:MM), `lib/cart-context.tsx`
(cart state, qty 1–20), `lib/utils.ts` (cn).

## Decision Log

| Date       | Decision                                                                                                                                                                  | Rationale                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 2026-11-14 | Initialized DESIGN.md from `globals.css` baseline                                                                                                                         | Retroactive codification                                                                    |
| 2026-11-14 | Primary palette: warm orange                                                                                                                                              | Appetite appeal, energy; green reserved for veg                                             |
| 2026-11-14 | On-demand ordering only, no subscriptions                                                                                                                                 | Product scope decision                                                                      |
| 2026-11-14 | shadcn/ui + @shadcnblocks premium blocks as component source of truth                                                                                                     | Consistency, speed, premium quality                                                         |
| 2026-11-14 | Single-page home: menu + cart + checkout in Sheet, order lookup via dialog; axios client unwrapping API envelope                                                          | api.md is guest-first; one page covers the whole storefront                                 |
| 2026-11-14 | Warm-orange `oklch` tokens in `globals.css` (light+dark), `.75rem` radius                                                                                                 | Implements the palette decision as shadcn CSS variables                                     |
| 2026-11-15 | Guest order memory: today's manage tokens in localStorage (`lib/order-store.ts`); `/order` page fetches orders live by token (URL token as fallback)                      | Guests lost orders on refresh/close; server stays source of truth, no cached PII            |
| 2026-11-15 | Cancellation is a demoted text link + confirmation dialog, hidden past cutoff/expiry                                                                                      | Prevent accidental one-click cancels                                                        |
| 2026-11-15 | Find-order modal removed; header "My order" links to `/order`, manual token+contact lookup lives on that page                                                             | Modals lose state and aren't shareable; one home for order management                       |
| 2026-11-15 | Global pointer-cursor rule in `globals.css` (`button:not(:disabled)`, `[role=button]`, `select`, `summary`, `label[for]`); disabled stays default                         | Tailwind v4 reset defaults buttons to `cursor: default`; one rule beats per-element classes |
| 2026-11-15 | All raw form controls/buttons replaced with shadcn primitives (Input, Textarea, Select, Button, Label, Card, Accordion); `min-h-11` overrides preserve 44px touch targets | Skill mandate: never hand-roll primitives shadcn provides; a11y tap-target floor kept       |
| 2026-11-21 | Hallmark "Counter" redesign: warm-cream paper + terracotta palette, Fraunces display / Inter body, `oklch` tokens in `globals.css` + Hallmark token block in `app/tokens.css`, dark palette via `.dark` role mapping, `--radius: 0.5rem` | Replaces the 2026-11-14 orange/`#EA580C` baseline; editorial warmth kept appetite-friendly  |
