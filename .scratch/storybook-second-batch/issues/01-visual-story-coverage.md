# 01: Second batch — visual-testing stories for custom components

**What to build:** Visual-testing stories (one state per story, light + dark via the existing Theme toolbar) for the remaining custom components, in the existing central `stories/` directory. Scope: remaining primitives (badge, separator, skeleton, textarea, accordion, radio-group, avatar, sheet, stepper), marketing blocks (hero296, accordion-group-2, stepper-icons-1, accordion-indicator), and domain components (OrderCard, FulfilmentStepper, OrderingStateBadge) with Order fixtures named in glossary language. Deferred: site-header / footer-contact (Clerk / react-query coupling). No Chromatic or test-runner — local visual review only.

**Status:** ready-for-human

- [ ] `stories/fixtures/orders.ts` with Order fixtures (Placed / Confirmed / Ready for pickup / Out for delivery / Completed / Cancelled, pickup + delivery)
- [ ] Stories for all 9 remaining primitives
- [ ] Stories for 4 marketing blocks (mobile-viewport story for hero296 and sheet)
- [ ] Stories for OrderCard, FulfilmentStepper, OrderingStateBadge
- [ ] `pnpm build-storybook` passes with no errors
