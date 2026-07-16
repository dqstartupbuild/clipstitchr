# Paid Plans and Usage

## Status

Implemented in Stripe test mode and the development Convex deployment on
July 16, 2026. Live-mode promotion is intentionally not part of this change.

## What Customers Get

ClipStitchr has three paid monthly plans. Plan names and limits are server-owned
policy, so a browser or worker cannot substitute a different price or limit.

| Plan    | Price | Products | Monthly credits | Clipr + Swapr videos | Daily-draft products | Active creations | Queue               |
| ------- | ----: | -------: | --------------: | -------------------: | -------------------: | ---------------: | ------------------- |
| Starter |   $39 |        1 |           2,000 |                    3 |                    0 |                1 | Standard            |
| Pro     |   $99 |        3 |           8,000 |                   10 |                    1 |                2 | Priority processing |
| Agency  |  $399 |       10 |          20,000 |                   50 |                   10 |                4 | Highest priority    |

Starter and Pro stitches cost 10 credits. Agency stitches are unlimited, but
each completed Agency stitch is still recorded as a zero-cost usage event.
Swipr costs 20 credits. A standalone avatar photo, generated background, or
photo expansion costs 25 credits. Clipr and Swapr each reserve one unit from a
shared video allowance. A Clipr scene still is included in that video and never
receives a separate photo charge.

The one-time refill costs $29 and adds 2,000 creation credits. A refill requires
canonical paid Stripe access: the stored entitlement must be active, its paid
period must include the current time, and billing review must be clear. A
temporary support override cannot qualify an otherwise inactive subscription.
The refill expires 12 months after payment and never adds videos. Monthly
credits are spent first. Refill grants are then spent in expiry order, with the
earliest expiry first.

## Customer Experience

Settings shows the current plan, entitlement state, exact plan comparison,
creation-credit balance, monthly and refill split, video use, active-generation
slots, refill expiry, and recent usage. The entitlement query exposes
`canBuyRefill`, computed on the Convex server from canonical paid Stripe access.
The UI uses that boolean instead of re-creating billing eligibility from display
state.

- A customer without a managed subscription chooses Starter, Pro, or Agency and
  completes Stripe-hosted Checkout. Before opening a new session, the server
  checks Stripe's customer subscriptions directly and rejects any nonterminal
  subscription that the local projection has not seen yet.
- An existing customer opens Stripe's hosted customer portal to change the
  plan, update payment details, view invoices, or cancel.
- A paid upgrade applies immediately after Stripe confirms the positive
  prorated invoice. ClipStitchr keys the adjustment to the invoice billing
  period and grants only the positive prorated credit difference. Replayed
  invoice events cannot grant that difference twice.
- A downgrade is scheduled for the next renewal. The current plan and limits
  remain in place until that renewal is paid.
- Cancel-at-period-end remains active through the paid period end. Stripe may
  express that schedule with either `cancel_at_period_end` or a concrete
  `cancel_at` timestamp; both project to the same customer-facing behavior.
- A failed renewal or invoice-finalization failure enters a 72-hour grace
  period. Existing credits remain usable during grace, but refills are
  unavailable. Recovery returns the account to active. Unpaid expiry becomes
  inactive.
- Grace is only for a previously paid subscription. If the first invoice fails,
  the account remains inactive and product setup stays locked until a signed
  paid invoice arrives. The first failure fixes the grace deadline; retries and
  later subscription updates cannot extend or reopen it. Subscription-only
  events for a different subscription cannot replace the current mapping. Only
  that replacement subscription's paid invoice can adopt it after the current
  subscription has ended.
- Refill confirmation must match a server-recorded Checkout intent and the
  exact allowlisted one-time Price, not only PaymentIntent metadata and amount.
- Refunds and disputes create source-specific payment holds, preserve the
  ledger, revoke unused refill or invoice-linked monthly grants, and place the
  affected billing state into review. Resolving one dispute cannot clear a
  separate refund or dispute hold. If the adverse event arrived before the
  original grant, a won dispute or failed refund securely replays that monthly
  or refill grant from Stripe's invoice or PaymentIntent and the recorded
  Checkout. Replays use stable IDs, so retries cannot duplicate credits.

Checkout and portal redirects never activate a plan. Only signed Stripe
webhooks update the Convex entitlement projection.

Every entitlement-changing Stripe event shares one monotonic ordering rule.
Older events cannot replace newer state. When Stripe creates distinct events in
the same second, deletion outranks paid state and paid state outranks payment
failure. Subscription create/update payloads are refreshed from Stripe, and
paid invoices use subscription, billing-period, and plan meaning rather than
event-ID sorting, so delivery order cannot change the final access decision.

All user-triggered plan-limit and usage decisions use Convex server time.
Client timestamps cannot keep an expired entitlement or refill grant active,
extend a reservation, backdate a completion, or change product and daily-draft
limit enforcement. Worker-secret and internal flows preserve timestamps that
were created by the trusted server-side pipeline.

## Usage Lifecycle

Every paid creation uses the same durable sequence:

1. Authenticate and confirm an active or grace entitlement.
2. Enforce the product, daily-draft, owner-concurrency, and rate-limit rules.
3. Reserve the required credits or video allowance in Convex before paid work.
4. Queue the durable provider or media job with the reservation attached.
5. Commit usage only when the promised output is durably saved.
6. Release the reservation after a terminal failure or cancellation.
7. Reacquire the same logical reservation during a retry without charging
   twice.

The save mutation must present the reservation's exact resource, operation,
original domain kind and ID, and browser-or-worker provenance. Convex verifies
that binding before returning either a still-reserved or already-committed row,
and stores the commit domain on first success so a committed reservation cannot
be replayed across creations.

Already-granted monthly and refill credits remain spendable while an account is
active or inside its valid payment grace window. Buying another refill still
requires canonical active paid access, so grace never enables refill Checkout.
Refills remain bound to the Stripe subscription that bought them; replacing the
subscription does not revive an old refill, and legacy unbound refill rows fail
closed.
Once a worker reservation is linked to queue work, a browser or API client
cannot release it; terminal queue, worker, and reconciliation paths own that
lifecycle. When billing becomes inactive, queued work that never started is
canceled and its reservation is released. A provider-to-media continuation
that already carries the provider lifecycle's slot is allowed to finish.
Queue linkage records the deterministic queue-entry ID, not only a timestamp.
Another queue cannot reuse that reservation, and enqueue rejects committed
reservations. Legacy reserved rows with no prior linkage can be attributed to
their first queue; rows with ambiguous legacy linkage fail closed.

Batch Stitchr reserves each selected output independently. If the account can
fund only part of the batch, it starts the funded subset and reports the rest.
Downloading, editing, or exporting an existing output does not create a new
charge.

## Queue Behavior

Provider and media work share a durable plan-aware queue. Queue weights are
Starter 1, Pro 3, and Agency 5. Pro jobs receive an aging override after three
minutes and Starter jobs after five minutes, so lower plans cannot starve.

The claimant considers only the oldest eligible entry for each owner before
choosing a plan lane. This prevents one owner with a large backlog from blocking
other owners. Active generation slots enforce the per-owner plan limits across
the complete provider-to-media lifecycle. A provider handoff keeps the same
owner slot alive, releases provider capacity, and assigns that slot to the media
worker only when media capacity is available. Normal media work also acquires a
media slot before it starts. Global provider and media caps are counted
independently and default to 50 each, while optional per-tool caps protect shared
third-party capacity.

## Downgrade Reconciliation

Plan limits apply when the scheduled downgrade becomes effective. Products over
the new limit stay readable and editable. New product creation and restoration
remain blocked until the owner chooses which products to archive. ClipStitchr
does not make that choice automatically. Daily drafts are disabled beyond the
new plan's allowance.

The reconciliation records make the over-limit state and daily-draft changes
idempotent and support-readable. Media, historical usage, and product data
remain intact.

The usage history describes each ledger transition directly. A reservation is
shown as credits or videos held, a commit as used, a release as returned, a
revocation as removed, and a reversal as restored. A held row followed by a
used row is one creation moving through its lifecycle, not two charges.

## Support Operations

Support diagnostics return the owner's entitlement, effective state, grant
balances, usage periods, reservations, generation slots, queue entries, and
recent ledger records. Support can:

- reconcile the current Stripe subscription into Convex;
- apply a temporary active, grace, or inactive override with actor, reason, and
  expiry; and
- reconcile stranded queue entries, reservations, and slots.

These operations require `BILLING_SUPPORT_OPERATOR_SECRET`. The secret is
server-only, independent from worker and rate-limit secrets, and every override
is written to entitlement history.

## Implementation Map

```text
web/
  app/_components/settings/
    BillingPlanComparison.tsx
    BillingReturnNotice.tsx
    BillingUsageHistory.tsx
    BillingUsageSummary.tsx
    SettingsSubscriptionPanel.tsx
  convex/
    billing/                     entitlement reads, support, billing limits
    stripe/                      checkout, portal, webhook effects, reconcile
    usage/                       grants, reservations, ledger, repair
    workerQueue/                 fair claiming, slots, caps, retries
    products/                    product-limit reconciliation and restoration
    automation/                  daily-draft limit and reconciliation
    schema.ts                    durable billing, usage, slot, and queue tables
  lib/clipstitchr/
    billing/                     canonical policy and Stripe catalog validation
    usage/                       shared operation/resource types and costs
    hooks/useBillingWorkspace.ts customer-facing billing actions and reads
  services/
    provider-worker/             provider claims and persisted stage recovery
    media-worker/                media claims and terminal usage handling
```

The main durable tables are `billingEntitlements`,
`billingEntitlementHistory`, `billingCheckoutSessions`,
`stripeWebhookEvents`, `stripePaymentHolds`, `usagePeriods`, `creditGrants`, `usageReservations`,
`usageReservationAllocations`, `usageLedgerEntries`, `generationSlots`, and
`workerQueueEntries`.

## Source References

- `docs/operations/billing/complimentary-access.md`
- `docs/architecture/plan-entitlements-stripe-and-worker-queues.md`
- `docs/architecture/creation-credit-system.md`
- `docs/architecture/stripe-billing-integration-decision.md`
- `docs/operations/billing/stripe-test-mode-and-production-promotion.md`
- `docs/operations/security/rate-limits.md`
- [Stripe-hosted Checkout](https://docs.stripe.com/payments/checkout)
- [Stripe customer portal](https://docs.stripe.com/customer-management)
- [Stripe subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks)
- [Convex Stripe component](https://www.convex.dev/components/stripe)
