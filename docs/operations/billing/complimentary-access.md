# Complimentary Paid-Plan Access

## Purpose

This runbook grants one existing Clerk account a normal Starter, Pro, or Agency
subscription at $0. It does not add a free tier and does not bypass
ClipStitchr's Stripe-owned billing lifecycle.

The safe mechanism is a private, single-redemption Stripe coupon for 100% off,
applied directly to a normal subscription that uses the canonical monthly
Price. The signed subscription and invoice webhooks then create the same
entitlement, monthly grants, limits, queue priority, cancellation behavior, and
audit history as a paid subscription.

## Non-Negotiable Rules

- Use the canonical Starter, Pro, or Agency Price for the selected Stripe mode.
  Never create or attach a separate $0 Price.
- Create a unique coupon for one approved Clerk account. Set `percent_off=100`,
  `duration=forever`, and `max_redemptions=1`.
- Scope the coupon to the selected canonical plan Product with
  `applies_to.products` where the Stripe surface supports it.
- Do not create a Promotion Code. Apply the coupon directly while creating the
  subscription so the customer cannot share or self-redeem a code.
- Create the subscription with `ownerId=<Clerk subject>` and
  `planKey=<starter|pro|agency>` in subscription metadata in the same request
  that attaches the canonical Price and coupon.
- Store `userId=<Clerk subject>` in Stripe Customer metadata before creating the
  subscription.
- Treat signed `customer.subscription.created` or
  `customer.subscription.updated` plus signed `invoice.paid` processing as the
  only proof of access. A successful Dashboard or API response is not proof.
- Never edit `billingEntitlements`, `usagePeriods`, `creditGrants`,
  `usageReservations`, or `usageLedgerEntries` in Convex.
- Never use a support override for indefinite complimentary access. Overrides
  are narrow, expiring incident-recovery tools.
- Never paste, print, log, commit, or send a Stripe secret key. Use the Stripe
  Dashboard or an approved server-side operator environment that already
  receives the key as a protected secret.

Stripe coupons do not provide a customer-ID allowlist. Customer scoping comes
from creating one coupon per recipient, allowing one redemption, applying it
server-side to that recipient's subscription, omitting a Promotion Code, and
recording the Clerk subject in metadata. Product scoping is an additional
guard, not a replacement for those controls.

## Required Inputs

Record these before changing Stripe:

- approval or ticket reference;
- exact Clerk subject, not only the email address;
- selected plan: `starter`, `pro`, or `agency`;
- mode: Stripe test or live;
- canonical Product and recurring Price IDs for that mode;
- the matching Stripe Customer, or approval to create one; and
- operator identity and intended access duration.

The mode must be consistent end to end. A test coupon and Customer can be used
only with the test Price and test webhook destination. Live access requires the
canonical live Product and Price from the production deployment inventory.

## Preflight

1. Open the existing Clerk account and copy its immutable subject.
2. Verify the requested plan and approval against that subject.
3. Search Stripe in the correct mode for a Customer whose metadata contains
   `userId=<Clerk subject>`. Confirm identity using the account email as a
   secondary signal only.
4. If a matching Customer exists, reuse it. If none exists, create one with the
   Clerk account email and `userId=<Clerk subject>` metadata.
5. If a Customer exists without that metadata, update it before continuing.
6. Confirm the Customer has no active, incomplete, trialing, paused, past-due,
   or scheduled ClipStitchr subscription. Stop and reconcile duplicates rather
   than creating a second subscription.
7. Confirm the selected Price ID is the canonical allowlisted monthly Price for
   the plan and mode. Its Product must match the coupon's product scope.
8. Confirm the mode's signed webhook destination is healthy and subscribes to
   `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`, and `invoice.paid`.

## Create the Private Coupon

Create one coupon for this recipient with:

```text
percent_off: 100
duration: forever
max_redemptions: 1
applies_to.products: [canonical plan Product ID]
name: Complimentary access
metadata.ownerId: <Clerk subject>
metadata.planKey: <starter|pro|agency>
metadata.purpose: complimentary-access
metadata.approvalRef: <ticket or approval reference>
```

Do not create a Promotion Code for the coupon and do not put its ID in customer
communications. A short `redeem_by` window may be added when operations policy
requires it; this limits new redemption and does not replace
`max_redemptions=1`.

## Create the Subscription Atomically

Create the normal subscription in one request with all of these fields:

```text
customer: <matching Stripe Customer ID>
items[0].price: <canonical monthly Price ID>
discounts[0].coupon: <private 100%-off coupon ID>
metadata.ownerId: <Clerk subject>
metadata.planKey: <starter|pro|agency>
```

The Price, coupon, `ownerId`, and `planKey` must be present in the same
subscription-create request. Do not create an unlabelled subscription and patch
its metadata later. Do not attach the coupon at the Customer level because that
can unintentionally affect other subscriptions.

When using an operator script, the equivalent server-only shape is:

```ts
await stripe.customers.update(customerId, {
  metadata: { userId: clerkSubject },
});

const coupon = await stripe.coupons.create({
  applies_to: { products: [canonicalProductId] },
  duration: "forever",
  max_redemptions: 1,
  metadata: {
    approvalRef,
    ownerId: clerkSubject,
    planKey,
    purpose: "complimentary-access",
  },
  name: "Complimentary access",
  percent_off: 100,
});

await stripe.subscriptions.create({
  customer: customerId,
  discounts: [{ coupon: coupon.id }],
  items: [{ price: canonicalPriceId }],
  metadata: { ownerId: clerkSubject, planKey },
});
```

The script must load its Stripe key from an approved secret store. It must not
accept the key as a command argument or print the request, environment, Stripe
client, or response object.

## Required Webhook Proof

Do not announce or use the access until all checks pass:

1. Stripe shows one subscription using the canonical plan Price, the private
   coupon, and the exact `ownerId` and `planKey` metadata.
2. The coupon shows one redemption and no Promotion Code.
3. The Customer metadata contains the exact Clerk subject as `userId`.
4. The signed `customer.subscription.created` event is processed successfully.
   A later signed `customer.subscription.updated` is also acceptable when it is
   the authoritative subscription event.
5. The zero-total initial invoice reaches `paid`, and its signed `invoice.paid`
   event is processed successfully. Subscription state alone does not grant the
   monthly allowance.
6. Convex support diagnostics show an active entitlement for the Clerk subject,
   the correct canonical Stripe Customer, subscription, and Price, and no
   billing-review flag.
7. The new `usagePeriods` record, monthly `creditGrants` row, and grant ledger
   entry were created by the signed `invoice.paid` event.
8. Settings shows the selected plan and its ordinary limits.

The 100% discount changes invoice amount only. It does not change plan policy.
Starter, Pro, and Agency receive their normal monthly credits, shared Clipr and
Swapr video allowance, product limit, daily-draft limit, active-generation
limit, queue priority, and per-operation costs. Every later zero-total renewal
must still produce and process `invoice.paid` before the new month's grants are
available.

## Test-Mode Rehearsal

Rehearse the exact flow before the first live grant or after any billing change:

1. Choose an existing test Clerk account and record its subject.
2. Use only the canonical Stripe test Product and Price.
3. Create a unique test coupon with the same percentage, duration, redemption,
   Product scope, and metadata.
4. Create the test subscription with the coupon, Price, and subscription
   metadata in one request.
5. Confirm the signed subscription event and zero-total `invoice.paid` event are
   processed.
6. Confirm the exact plan grants and every plan limit in Settings and through at
   least one allowed and one rejected limit operation.
7. Cancel the test subscription and confirm the signed cancellation event makes
   access inactive according to the chosen cancellation timing.
8. Preserve non-secret event, invoice, subscription, and entitlement-history
   IDs as rehearsal evidence. Remove test-only clutter after evidence capture;
   never copy test IDs into live mode.

## Cancellation, Revocation, and Conversion

For immediate revocation, cancel the subscription immediately in Stripe and
wait for the signed `customer.subscription.deleted` event to make the
entitlement inactive. For access through the current month, set cancellation at
period end and verify the signed subscription update and displayed end date.

Do not revoke access by editing Convex or by applying an inactive support
override. Do not merely remove the coupon: that can create a future paid invoice
for a person who never agreed to be charged. Converting complimentary access to
a paid subscription requires explicit customer consent, a valid payment method,
approved customer-facing terms, and a separate documented billing change.

Canceling the subscription does not erase prior grants, consumption, invoices,
or ledger history. That history is required for reconciliation and audit.

## Audit Evidence

Store the following in the approved operator record without secret keys or
unnecessary personal data:

- approval reference, operator, timestamp, and Stripe mode;
- Clerk subject and selected plan;
- Stripe Customer, coupon, subscription, Price, invoice, and processed event
  IDs;
- confirmation that the coupon is 100% off forever, has one redemption, is
  Product-scoped, and has no Promotion Code;
- entitlement-history event IDs and the resulting plan/state;
- usage-period key, monthly grant ID, and grant ledger entry ID;
- Settings evidence for the plan and limits; and
- cancellation timing, cancellation event ID, and final inactive state when
  access ends.

If any metadata, mode, Price, event, or grant does not match, stop. Cancel the
incorrect subscription if necessary, preserve the evidence, and use the normal
Stripe reconciliation path. Never repair a complimentary subscription by
directly editing billing or usage tables.

## Stripe References

- [Create a coupon](https://docs.stripe.com/api/coupons/create)
- [Create a subscription](https://docs.stripe.com/api/subscriptions/create)
- [Update a customer](https://docs.stripe.com/api/customers/update)
- [Subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks)

## Related ClipStitchr Documents

- `docs/operations/billing/stripe-test-mode-and-production-promotion.md`
- `docs/features/billing/paid-plans-and-usage.md`
- `docs/architecture/stripe-billing-integration-decision.md`
- `docs/architecture/plan-entitlements-stripe-and-worker-queues.md`
- `docs/architecture/creation-credit-system.md`
