# Stripe Billing Integration Decision

## Status

Accepted for sandbox implementation on 2026-07-15. Production promotion remains
gated on the checks in this document and the paid-plan launch runbook.

## Context

ClipStitchr needs hosted subscription Checkout, a hosted customer portal,
one-time creation-credit refills, signed webhook synchronization, and a fast
server-side entitlement projection. Stripe must remain the commerce source of
truth, while ordinary product and generation requests must not depend on a
live Stripe API call.

The integration also needs to preserve ClipStitchr's app-owned rules:

- `starter`, `pro`, and `agency` are the only subscription plan keys;
- the browser never supplies a trusted Stripe Price ID;
- only `invoice.paid` creates a paid monthly usage period;
- refill grants are created only after a confirmed one-time payment;
- duplicate or out-of-order webhook deliveries cannot repeat grants or move an
  entitlement backward;
- refund and dispute handling preserves immutable usage history; and
- Convex remains the runtime source for entitlements, credits, allowances,
  product limits, and generation policy.

## Sources Reviewed

The decision was revalidated against current primary sources on 2026-07-15:

- [Convex Stripe component](https://www.convex.dev/components/stripe)
- [get-convex/stripe source](https://github.com/get-convex/stripe)
- [Stripe-hosted subscription Checkout](https://docs.stripe.com/payments/checkout/build-subscriptions?payment-ui=stripe-hosted)
- [Stripe customer portal](https://docs.stripe.com/customer-management)
- [Configure the customer portal](https://docs.stripe.com/customer-management/configure-portal)
- [Integrate the customer portal](https://docs.stripe.com/customer-management/integrate-customer-portal)
- [Subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks)
- [Stripe webhook handling](https://docs.stripe.com/webhooks)
- [Customer portal configuration API](https://docs.stripe.com/api/customer_portal/configurations/object)

The package selected for implementation is `@convex-dev/stripe@0.1.6`,
published 2026-07-10. Its peer ranges accept this app's installed Convex
`1.38.0` and React `19.2.4`. It currently depends on Stripe's Node SDK
`22.2.1`; the installed Stripe SDK pins API version `2026-05-27.dahlia`.

## Decision

Use `@convex-dev/stripe@0.1.6` as the hosted Checkout, customer mapping,
customer portal, Stripe-object synchronization, and raw-body signature
verification foundation.

Add a thin ClipStitchr-owned layer for the responsibilities the component does
not own:

1. A server-only catalog maps stable plan or refill keys to sandbox or live
   Product and Price IDs. Checkout accepts only those stable keys.
2. A current `billingEntitlements` projection stores the owner-safe runtime
   plan state in Convex.
3. A `stripeWebhookEvents` table deduplicates every custom webhook effect by
   Stripe event ID.
4. App-owned event ordering compares Stripe event creation time and object
   state before changing the current entitlement projection.
5. `invoice.paid` creates monthly usage periods and grants. Successful refill
   PaymentIntents create refill grants only when they reference a
   server-recorded Checkout intent for the exact allowlisted Price. Refund and
   dispute events persist source-specific holds, revoke unspent refill or
   invoice-linked monthly grants, and place the account in billing review. If
   an adverse event arrived before its grant, a won dispute or failed refund
   replays the same idempotent grant path from authoritative Stripe context.
6. A reconciliation action reads Stripe only for support and recovery. Normal
   requests read the Convex projection.

## Why the Component Needs an App-Owned Event Table

The component's default handlers upsert synchronized Stripe records and are
safe to replay for those records. Its custom `events` and `onEvent` callbacks
run after default processing, but the component source does not persist a
processed Stripe event ID for application callbacks. ClipStitchr grants and
revocations therefore require their own event-ID claim inside the same Convex
transaction as the application effect.

If a ClipStitchr callback fails, the endpoint returns an error so Stripe can
retry. The component's synchronized upserts may run again; the ClipStitchr
event claim makes the usage or entitlement effect exactly-once.

## Checkout and Portal Boundaries

- Subscription Checkout uses `mode: "subscription"` and an allowlisted
  recurring Price. The action also lists the customer's authoritative Stripe
  subscriptions and refuses Checkout while any nonterminal subscription
  exists. Before Stripe session creation, an atomic owner-scoped Convex claim
  supplies the Stripe idempotency key. Concurrent requests therefore reuse one
  session, while a competing plan cannot open beside an in-flight Checkout.
- Refill Checkout uses `mode: "payment"` and the allowlisted one-time refill
  Price.
- Both attach server-created `ownerId`, catalog key, and operation metadata.
- Success and cancel URLs are allowlisted application URLs. A redirect never
  activates access.
- The portal customer comes from the authenticated owner's server-owned
  mapping. The browser cannot provide a customer ID.
- The sandbox portal configuration exposes only the three allowlisted plan
  prices, payment-method updates, invoice history, period-end cancellation,
  and plan updates.
- Portal updates use proration for upgrades. The configuration schedules
  decreasing item amounts at period end. Because the requested sandbox catalog
  uses separate Products, the browser lifecycle test must prove Stripe applies
  cross-product downgrades at period end. A failed proof blocks production
  promotion and requires an explicit catalog decision; the app must not fake a
  downgrade or silently change the catalog model.

## Event Destination

Use a Stripe snapshot event destination pinned to `2026-05-27.dahlia` and send
only the events used by the component or ClipStitchr:

- `customer.created`, `customer.updated`, `customer.deleted`
- `customer.subscription.created`, `customer.subscription.updated`,
  `customer.subscription.deleted`
- `checkout.session.completed`
- `invoice.created`, `invoice.finalized`, `invoice.finalization_failed`,
  `invoice.updated`, `invoice.paid`, `invoice.payment_succeeded`,
  `invoice.payment_failed`
- `payment_intent.succeeded`, `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`, `charge.dispute.closed`
- `refund.failed`

The Convex component validates the raw request body with the endpoint's Stripe
signing secret before either its default synchronization or ClipStitchr's
custom handler runs.

## Entitlement and Grant Semantics

- An active paid subscription is `active`.
- Cancel-at-period-end stays `active` until the paid period ends.
- A failed renewal enters a 72-hour `grace` period only when the entitlement
  already records a confirmed paid invoice for the same Stripe subscription. A
  replacement subscription does not inherit the old subscription's paid
  history. An initial invoice failure remains `inactive` and cannot unlock
  onboarding or generation.
- Grace is anchored to the first failure. Retry failures and subscription
  updates preserve that original deadline, even after it expires.
- Recovered payment returns the entitlement to `active`.
- Ended, unpaid after grace, or incomplete-expired subscriptions are
  `inactive`.
- The current projection compares every subscription, paid-invoice, and
  invoice-failure transition against one cross-family source clock. At equal
  Stripe-second timestamps, terminal deletion wins over paid state, paid state
  wins over failure, and failure wins over a subscription-only state. Stripe
  event IDs are identifiers, not clocks. Same-second subscription create/update
  events are refreshed from Stripe before projection. Same-second paid invoices
  compare subscription identity, billing-period bounds, and monotonic plan
  movement instead of sorting event IDs.
- A paid upgrade can apply immediately. It grants only the positive,
  time-prorated difference in monthly creation credits after the related
  invoice is paid.
- A downgrade takes effect on the next renewal and receives the new plan's
  normal monthly grant only when that renewal invoice is paid.
- Monthly grants are unique by Stripe subscription and billing-period start.
- Refill grants are unique by successful PaymentIntent and expire after 12
  months. The PaymentIntent and resulting grant retain the purchasing Stripe
  subscription ID, so a replacement subscription cannot reactivate the old
  refill. Legacy unbound refill rows fail closed. Refills never increase the
  shared Clipr and Swapr video allowance.
- Subscription events for a different subscription ID cannot overwrite the
  current projection. A paid invoice may adopt a replacement only after the
  current subscription ends; a second paid subscription while access is still
  current is blocked from granting and flagged for review.
- Refund and dispute holds are durable per charge and adverse source. A won
  dispute resolves only its dispute hold, so another open refund or dispute
  continues to block billing. Adverse events delivered before their grant
  prevent that grant from being created until the adverse state is resolved.
  Recovery retrieves the expanded paid invoice or PaymentIntent and validates
  the stored refill Checkout before replaying the idempotent grant. A closing
  event delivered before its opening event persists a resolved tombstone so
  the older opening event cannot revoke or strand credits later.

## Mode and Credential Safety

`CLIPSTITCHR_STRIPE_MODE` must be explicitly `test` or `live`. The Stripe
secret-key prefix, webhook event `livemode` flag, Product IDs, and Price IDs
must match that mode. A mismatch fails closed.

Sandbox and live IDs, portal configurations, webhook secrets, and event
destinations are separate. No sandbox script or browser verification may read,
modify, or switch Stripe live mode. Secrets stay in environment or secret
management and are never written to repository files, logs, client props, or
analytics.

## Alternatives Considered

### Direct Stripe SDK Only

Rejected. It would duplicate maintained customer mapping, Checkout, portal,
record synchronization, and signature verification code without improving the
app-owned entitlement model.

### Stripe as the Runtime Entitlement Store

Rejected. It adds a network dependency and Stripe latency to every product or
generation action, and it cannot express ClipStitchr's reservation, refill
expiry, queue, and support rules by itself.

### Component Tables as the Only Entitlement Store

Rejected. Synchronized Stripe objects are commerce records, not the atomic
usage and generation policy projection the application needs.

## Consequences

The integration remains small at the Stripe boundary and explicit at the
product boundary. Webhook callbacks, grants, usage, and runtime policy are
testable without contacting Stripe. The tradeoff is additional durable state,
reconciliation code, and a required sandbox proof for hosted portal downgrade
behavior before live billing.

## Production Promotion Gates

- Sandbox Product, Price, portal, and event-destination IDs are captured in the
  deployment secret inventory, not source control.
- Checkout, activation, renewal, upgrade, scheduled downgrade, cancellation,
  failed payment and recovery, refill, refund, dispute, and duplicate webhook
  tests pass.
- Webhook lag, failed processing, billing review, and reconciliation alerts are
  configured.
- Tax, invoices, receipts, support policy, and legal copy receive human review.
- A separate live-mode catalog is created and validated. Sandbox IDs or keys
  must fail in live mode and live IDs or keys must fail in sandbox mode.
