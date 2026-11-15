# 04: Journey spec — Today's Menu → Tiffin → checkout → Placed order visible on /orders

**What to build:** The core guest loop under test at a pinned simulated instant mid-Ordering-Window: Today's Menu renders on the home page, items are added to a Tiffin, checkout places the order against the real backend (order comes back immediately `confirmed` with a Manage Token), and the redirect lands on `/orders?token=…&placed=1` showing the Placed order, with the Manage Token remembered in the `tiffin_orders_v1` localStorage store so the order survives a later visit. Uses glossary vocabulary in names/assertions (Tiffin, Placed, Manage Token, Ordering Window — never "cart", "cutoff" where "Ordering Window closes_at" is meant).

**Blocked by:** 02 (simulated-time fixture), 03 (strict-console harness).

**Status:** done

- [ ] At the pinned instant, home shows Today's Menu and an open Ordering Window badge
- [ ] Adding a Main Meal and an Extra to the Tiffin and proceeding to checkout works
- [ ] Placing the order returns 201 and redirects to `/orders?token=…&placed=1`
- [ ] The Placed order is visible on /orders and its Manage Token is in `tiffin_orders_v1`
