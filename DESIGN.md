# Design System — Living Document

This file is the single source of truth for design decisions. The
`ux-development` skill keeps it current: read it before designing, append to it
after.

> Baseline captured from the existing codebase (`app/globals.css`). Update as
> the system evolves.

## Brand & Tone

- **Tone:** TBD — decide and record here (e.g., warm/homey vs. minimal/modern).
- **Users:** TBD — primary personas and contexts.

## Design Tokens

### Colors (CSS custom properties, light → dark)

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | `#ffffff` | `#0a0a0a` | Page background |
| `--foreground` | `#171717` | `#ededed` | Default text |

_To define: primary, secondary, accent, success, warning, danger._

### Typography

| Token | Value | Usage |
|---|---|---|
| `--font-sans` | `var(--font-geist-sans)` | Body text |
| `--font-mono` | `var(--font-geist-mono)` | Code / monospace |

_To define: type scale (sizes/weights for h1–h4, body, small, caption)._

### Spacing & Shape

_To define: base spacing unit and scale, radii, shadows, borders, motion
durations/easings._

## Styling System

- **shadcn/ui is the component library — always use it for building
  components** (never hand-roll primitives that shadcn provides).
  - Style: `new-york` · Base color: `neutral` · Icons: `lucide`
  - Aliases: `@/components/ui` (ui), `@/components` (components), `@/lib/utils`,
    `@/hooks`
  - Extra registry: `@shadcnblocks` (`https://shadcnblocks.com/r/{name}`, needs
    `SHADCNBLOCKS_API_KEY`)
- Tailwind CSS (v4, via `@import "tailwindcss"`), tokens mapped through
  `@theme inline` in `app/globals.css`.
- Dark mode follows `prefers-color-scheme` via `:root` variable overrides.

## Component Inventory

_Track shadcn components added via the CLI (and any custom compositions), with
their states (default/hover/focus/disabled/loading/empty/error)._

_None yet._

## Decision Log

Append: date — decision — rationale.

| Date | Decision | Rationale |
|---|---|---|
| 2026-11-14 | Initialized DESIGN.md from existing `globals.css` baseline | Retroactive codification of current state |
