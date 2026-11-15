# 01: Playwright scaffold with Chromium and dev-server wiring

**What to build:** Running `npx playwright test` locally executes Playwright specs against the Next.js app on Chromium. The Playwright config starts the dev server automatically (with `NEXT_PUBLIC_API_BASE_URL` inherited from the environment so the same backend local dev uses is hit), and every spec gets a helper that records console errors and uncaught page errors (with an allowlist for known Clerk noise, initially empty) so specs can fail when the page misbehaves.

**Blocked by:** None (can start immediately).

**Status:** done

- [ ] Playwright installed as a dev dependency with Chromium browser; `playwright.config.ts` at repo root
- [ ] `e2e/` directory holds the specs; tests are excluded from lint/build
- [ ] Dev server starts via Playwright's `webServer` before tests and is torn down after
- [ ] A console/page-error capture helper exists and fails specs on real errors, with an allowlist for known noise
- [ ] A placeholder spec against the home page passes locally
