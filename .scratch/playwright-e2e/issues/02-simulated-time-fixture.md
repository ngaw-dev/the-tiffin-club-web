# 02: Simulated-time injection helper (X-Simulated-Time)

**What to build:** A reusable Playwright fixture that intercepts browser requests to `/api/v1/**` and stamps them with `X-Simulated-Time` set to a configurable instant (default: a fixed mid-Ordering-Window time, Pacific/Auckland). Any spec using it gets deterministic time-based behaviour from the real backend — ordering window state, today's menu, token expiry. Non-production backends only (the header is ignored in production).

**Blocked by:** 01 (Playwright scaffold).

**Status:** done

- [ ] Fixture injects `X-Simulated-Time` on all `/api/v1/**` requests via route interception, without app code changes
- [ ] Simulated instant is configurable per test; default is mid-window (e.g. 10:00 NZDT)
- [ ] A spec asserts the home page's Ordering Window badge shows the open state at the pinned instant
