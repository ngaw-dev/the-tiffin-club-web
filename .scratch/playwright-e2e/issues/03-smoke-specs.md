# 03: Smoke specs — key pages load clean

**What to build:** Each key public page — home, checkout, orders, and sign-in — loads with HTTP 200, no console errors, and no uncaught page errors when visited as a guest against the configured backend.

**Blocked by:** 01 (console/page-error harness and webServer wiring).

**Status:** done

- [ ] `/`, `/checkout`, `/orders`, `/sign-in` each return 200
- [ ] Each visit records zero console errors / page errors after allowlist filtering
- [ ] `npx playwright test` passes end to end locally
