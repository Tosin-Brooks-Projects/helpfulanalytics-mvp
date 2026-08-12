# Pricing rework + agency cap + auto-refresh

## Context
Current tiers create a gap: Pro ($99, up to 7 properties) jumps to Agency ($299, up to 30 properties) with no in-between, so e.g. a 10-property customer overpays. Separately, "agency"/"custom" accounts currently have no enforced property cap (`maxProperties: Infinity` in `config/subscriptions.ts`) — there's no way to control how many properties a manually-billed agency client can add.

## 1. Per-property pricing
- Replace Starter/Pro/Agency ladder with flat **$12/property/month**, self-serve, no long-term commitment.
- Show a struck-through reference price (e.g. ~~$29~~) next to $12 for marketing.
- Self-serve cap at **30 properties**; beyond that, "reach out for agency pricing" (matches old Agency tier cutoff).
- Implementation: Stripe subscription with a single per-unit Price, quantity = property count. Bump/reduce quantity via Stripe API when a property is added/removed in-app. Confirm-before-charge UX ("adding this property adds $12/mo to your bill").
- Decisions still open: immediate proration vs. next-cycle billing; minimum-1-property floor; free trial interaction; migration path for existing Starter/Pro/Agency subscribers.

## 2. Admin-settable property cap for agency/custom accounts
- Problem: accounts above the self-serve 30 cap (negotiated directly, e.g. Konetiq at 25 seats now, 50 next month) currently have **no limit at all** — `maxProperties: Infinity`.
- Fix: add an editable **max properties** field per account in the admin panel (`app/admin/users/page.tsx`), instead of a fixed tier-derived number. Lets us type in the actual agreed cap per client and have the product enforce it.
- Out of scope for now: full seat/org data model, self-serve multi-seat UI — this is a manual, admin-set cap only.

## 3. Automatic data refresh
- Goal: keep analytics data shown in the dashboard always up to date, without requiring a manual refresh.
- Needs scoping: where current data fetching/caching lives, how "stale" data currently gets, and whether refresh should be polling-based, on-focus, or push-based (webhooks/websockets from GA4 data source).
