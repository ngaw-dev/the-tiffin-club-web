---
name: ux-development
description: >-
  Generic UI/UX development workflow for any web project. Use when designing or
  building user interfaces, UX flows, wireframes, design systems, design tokens,
  component styling, layouts, responsive behavior, or visual/brand design. Also
  use when reviewing UI for accessibility, states, or consistency.
---

# UI/UX Development

A stack-agnostic workflow for designing and building user interfaces. It assumes
design happens incrementally alongside development, not upfront.

## 0. Retroactive onboarding (always do this first)

Never assume a greenfield project. Before any design work:

1. Inventory what already exists: global stylesheets, design tokens/CSS
   variables, component library usage, existing pages/routes, and any
   `DESIGN.md`.
2. If `DESIGN.md` is missing or stale, seed/update it from the current codebase
   (tokens, fonts, colors, component inventory) so it reflects reality.
3. Treat existing patterns as the baseline. Evolve them deliberately via the
   decision log — never introduce a competing pattern silently.

## 1. Discovery before pixels

Before designing any screen or flow, establish (ask if unknown):

- Who are the users and what is their context (device, urgency, expertise)?
- What is the primary goal of this screen/flow? The single next action?
- Brand tone: playful vs. formal, dense vs. airy, bold vs. quiet?
- Constraints: content structure, real copy, deadlines, tech limits.

Prefer content-first design: real labels and information architecture before
visual polish. Never ship lorem ipsum or placeholder copy in a finished UI.

## 2. Tokens first

Define values once, as variables in the project's styling system (CSS custom
properties, Tailwind theme, styled-components theme, etc.):

- Color palette (background, foreground, primary, secondary, accent, semantic
  success/warning/danger)
- Typography scale (limited set of sizes/weights, clear hierarchy)
- Spacing scale (base unit and multiples)
- Radii, shadows, borders, motion durations/easings

Rules:

- No magic numbers in components — every color/size/spacing comes from a token.
- New token needs → add to the token layer and record in `DESIGN.md`, don't
  inline.
- Support the color scheme the project targets (light/dark) at the token level.

## 3. Component-driven design

- **Always use shadcn/ui for building components.** Prefer adding components
  via the shadcn CLI (respecting the project's `components.json` — style,
  aliases, icon library) over hand-rolling primitives. Only build custom
  components when composing/shadcn primitives cannot achieve the design.
- **Keep `components/ui/**` at the current registry version.** shadcn blocks and
  demos (e.g., `@shadcnblocks` examples in `components/`) rely on the modern
  component internals: `data-slot="..."` attributes (hover/glide effects query
  `[data-slot="accordion-item"]` etc.), Tailwind v4 variants like
  `in-aria-expanded:` and `not-last:`, and current default classes
  (`border-b last:border-b-0`). If a component in `components/ui/` is an older
  forwardRef-style version without these, replace it wholesale via the CLI (or
  from the reference repo) rather than patching classes — stale components
  silently break blocks that depend on those internals.
- **Premium blocks first:** before hand-building any page-level section (hero,
  pricing, dashboard, footer, menu grid, auth screen), search the project's
  configured registries (e.g., `@shadcnblocks`) and add a block via the CLI
  (`npx shadcn add @shadcnblocks/<name>`, auth via env key). Custom code is the
  last resort.
- Follow the project's configured shadcn conventions: named style, base color,
  CSS variables, and icon library (e.g., lucide) for all icons.
- Compose screens from these primitives instead of one-off styling.
- **Migrate raw elements, don't add new ones.** When touching a file that still
  uses raw `<input>`, `<textarea>`, `<select>`, `<label>`, or hand-styled
  `<button>`s, replace them with the shadcn equivalents in the same change —
  raw controls are technical debt, not a pattern to extend. If the needed
  primitive isn't installed (check `components/ui/`), add it via
  `npx shadcn@latest add <name>` rather than hand-rolling. Custom composites
  (e.g. selectable option cards with `aria-pressed`) are acceptable only when
  no primitive combination fits.
- **Tap-target floor: `min-h-11` (44px).** shadcn defaults to `h-9`; override
  with `min-h-11` (plus the project's `rounded-lg`) via className when adopting
  primitives — never accept shadcn's default sizing on primary interactive
  controls.
- **Never add per-element `cursor-pointer` classes.** The pointer cursor is
  applied globally in `app/globals.css` (`button:not(:disabled)`,
  `[role="button"]:not(:disabled)`, `select`, `summary`, `label[for]`); disabled
  controls intentionally stay `cursor: default`.
- Every interactive element gets all relevant states: default, hover,
  focus-visible, active, disabled, loading, empty, and error where applicable.
- Mobile-first: design the smallest layout, then enhance at defined
  breakpoints. Never let content overflow or truncate meaninglessly.
- Progressive disclosure: primary action prominent, advanced options secondary.
- Provide feedback: loading indicators, optimistic updates where safe, clear
  success/error messaging.

## 4. Accessibility (non-negotiable)

- **No modals/dialogs/sheets/popovers by default.** Prefer dedicated pages,
  routes, or inline expandable sections. Only use an overlay when the user
  explicitly asks for one (e.g., "put this in a modal"), and confirm if unsure.
  This applies to confirmations, forms, detail views, and "success" states —
  route to a page instead.

- Semantic HTML first (`button` for actions, `a` for navigation, proper
  heading hierarchy, landmarks).
- Full keyboard operability; visible `:focus-visible` styling.
- Color contrast meets WCAG AA (4.5:1 body text, 3:1 large text/UI).
- Never rely on color alone to convey state — pair with icon, text, or pattern.
- ARIA only where semantics fall short. Alt text for meaningful images.
- Respect `prefers-reduced-motion` for non-essential animation.

## 5. Consistency loop with DESIGN.md

- **Before** designing: read `DESIGN.md` for tokens, patterns, and past
  decisions. Follow them.
- **After** designing: append new decisions to the log in `DESIGN.md` with a
  short rationale (date, decision, why). Update the component inventory and
  token tables when they change.

## 6. Lint & format with ox (required)

This repo uses **oxlint** and **oxfmt** — not ESLint/Prettier:

- After writing code, run `pnpm lint:ox` (oxlint) and fix all warnings/errors.
- Format with `pnpm format` (oxfmt); `pnpm format:check` verifies. Never
  hand-format to another style — oxfmt output is canonical.
- Config lives in `.oxlintrc.json`; extend it rather than adding inline
  disables.
- **Generated/vendor components (e.g., `components/ui/**` shadcn) are
  excluded** from lint/format via `ignorePatterns` in `.oxlintrc.json` and
  `.oxfmtrc.json` — never hand-edit or re-lint them; regenerate via the CLI
  instead.

## 7. Pre-completion gate (strict)

Do not call UI work done until every item passes:

- [ ] Responsive: verified at mobile, tablet, and desktop widths
- [ ] States: hover, focus-visible, disabled, loading, empty, error handled
- [ ] Tokens: no hardcoded colors/sizes/spacing outside the token layer
- [ ] Accessibility: semantic markup, keyboard operable, AA contrast, visible
      focus
- [ ] Consistency: matches `DESIGN.md` tokens and existing patterns
- [ ] Primitives: no raw form controls or hand-styled buttons introduced;
      anything touched was migrated to shadcn with `min-h-11` sizing
- [ ] Content: real copy, no placeholders, no dead-end screens or flows
- [ ] Lint & format: `pnpm lint:ox` clean, `pnpm format:check` passes
- [ ] Decision log: new/changed decisions recorded in `DESIGN.md`

If an item cannot pass, say so explicitly and record why in `DESIGN.md`.
