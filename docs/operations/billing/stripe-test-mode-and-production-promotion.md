# Stripe Test Mode and Production Promotion

## Purpose

This runbook records the exact Stripe boundary for ClipStitchr paid plans. It is
for test verification, incident recovery, and a later deliberate production
promotion. Do not copy test IDs, signing secrets, customers, subscriptions, or
portal configurations into live mode.

## Current Test Workspace

The Stripe test workspace contains four products:

| Catalog key              | Product name                       | Lookup key                                | Price behavior |
| ------------------------ | ---------------------------------- | ----------------------------------------- | -------------- |
| `starter`                | ClipStitchr Starter                | `clipstitchr_test_starter_monthly`        | $39 monthly    |
| `pro`                    | ClipStitchr Pro                    | `clipstitchr_test_pro_monthly`            | $99 monthly    |
| `agency`                 | ClipStitchr Agency                 | `clipstitchr_test_agency_monthly`         | $399 monthly   |
| `creation-credit-refill` | ClipStitchr Creation Credit Refill | `clipstitchr_test_creation_credit_refill` | $29 one time   |

Actual Product IDs, Price IDs, endpoint IDs, portal configuration IDs, and
secrets live in the deployment environment or secret inventory. They are not
source-controlled.

The test portal configuration:

- exposes only the three current monthly prices;
- allows payment-method updates and invoice history;
- invoices plan upgrades immediately with prorations;
- schedules a decrease for the end of the paid period;
- keeps the billing-cycle anchor unchanged; and
- schedules cancellation at period end without a cancellation proration; and
- links to `https://clipstitchr.com/terms` and
  `https://clipstitchr.com/privacy` from the hosted portal.

The test event destination is the development Convex HTTP endpoint at
`/stripe/webhook`, uses Stripe API `2026-05-27.dahlia`, and subscribes only to:

- `checkout.session.completed`
- `customer.created`, `customer.updated`, `customer.deleted`
- `customer.subscription.created`, `customer.subscription.updated`,
  `customer.subscription.deleted`
- `invoice.created`, `invoice.finalized`, `invoice.finalization_failed`,
  `invoice.updated`, `invoice.paid`, `invoice.payment_succeeded`,
  `invoice.payment_failed`
- `payment_intent.succeeded`, `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`, `charge.dispute.closed`
- `refund.failed`

## Required Environment

Configure these in Convex for the deployment that receives the webhook:

```text
CLIPSTITCHR_STRIPE_MODE
CLIPSTITCHR_APP_URL
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PORTAL_CONFIGURATION_ID
STRIPE_STARTER_PRODUCT_ID
STRIPE_STARTER_PRICE_ID
STRIPE_PRO_PRODUCT_ID
STRIPE_PRO_PRICE_ID
STRIPE_AGENCY_PRODUCT_ID
STRIPE_AGENCY_PRICE_ID
STRIPE_CREATION_CREDIT_REFILL_PRODUCT_ID
STRIPE_CREATION_CREDIT_REFILL_PRICE_ID
BILLING_SUPPORT_OPERATOR_SECRET
```

`CLIPSTITCHR_STRIPE_MODE` is mandatory. The secret-key prefix, Product and Price
livemode flags, and webhook event `livemode` flag must all match it. Any mismatch
fails closed. `CLIPSTITCHR_APP_URL` must be HTTPS except for localhost in test
mode.

## Test Verification

Use a signed-in development account and Stripe test payment methods. Never use
real card or customer data.

1. Open Settings and record the starting entitlement, balances, and usage.
2. Choose Starter and complete hosted Checkout.
3. Wait for the signed webhook, then confirm Starter, 2,000 credits, three
   videos, one product, and one active-generation slot.
4. Buy the $29 refill. Confirm 2,000 refill credits were added, an expiry is
   visible, and the video limit is still three.
5. Open the portal and upgrade to Pro. Confirm Stripe invoices the positive
   proration immediately, the paid webhook changes the plan, and Convex grants
   only the positive prorated credit difference.
6. Schedule Pro to Starter. Confirm the portal shows the future change while
   Settings stays Pro until renewal.
7. Cancel at period end. Confirm the account stays active through the displayed
   period end whether Stripe supplies `cancel_at_period_end` or a concrete
   `cancel_at` timestamp.
8. In test mode, simulate `invoice.payment_failed` and
   `invoice.finalization_failed`. Confirm each current event starts a 72-hour
   grace deadline with existing balance access, blocked refills, and no new
   monthly grant. Also fail an initial invoice for an account with no prior paid
   invoice and confirm it remains inactive with onboarding still locked.
   Deliver another failure after the first deadline and confirm the deadline is
   unchanged and expired grace does not reopen.
9. Simulate payment recovery. Confirm the entitlement returns to active without
   duplicating the monthly grant.
10. Send the same event twice and send older subscription and invoice-failure
    events after newer paid state. Send paid and failure events with the same
    Stripe-second timestamp, then deliver them in both orders. Confirm one event
    effect and no backward entitlement movement. Repeat with deletion followed
    by an older paid invoice. Pay a replacement subscription, then deliver a
    newer update and deletion for the old subscription and confirm they cannot
    replace it. Attempt a second paid subscription while the first is current
    and confirm no second grant is created and billing review is raised.
11. Refund both a refill charge and a monthly invoice charge. Confirm unspent
    refill and invoice-linked monthly capacity is revoked and the original
    ledger remains visible. Deliver the adverse event before its grant and
    confirm the later webhook cannot create that grant until recovery. Fail the
    refund and confirm exactly one skipped grant is replayed.
12. Create and close a test dispute. Confirm billing review blocks new paid work,
    and closure or reconciliation clears only that dispute's hold. Keep a
    second dispute or refund open and confirm review remains required. Deliver
    the won closure before the opening event and confirm the older opening event
    cannot reopen review or revoke credits. For both a monthly charge and a
    refill, open the dispute before the paid event, then win it and confirm the
    skipped grant appears exactly once.
13. Exercise a paid creation, a failure, and a retry. Confirm reserve, release,
    reacquire, and one final commit.
14. Exercise an over-limit batch. Confirm only the funded subset starts.
15. Cancel an account with both queued and running work. Confirm never-started
    queue entries and reservations are canceled while an already-started
    provider-to-media continuation can finish.

For browser test cards use Stripe's published test data. The ordinary success
card is `4242 4242 4242 4242`, with any future expiry, any CVC, and any postal
code. Do not store that form data in ClipStitchr.

## Test Evidence to Capture

Record the date and mode, but do not paste secrets or customer personal data.
Capture:

- the Settings plan and usage states after each transition;
- the Stripe test Checkout and portal result;
- event delivery success and event IDs;
- the related entitlement-history rows, grant IDs, and ledger entries;
- the proration invoice amount and scheduled downgrade effective date;
- duplicate and out-of-order results;
- the exact test, typecheck, lint, and build commands; and
- desktop and narrow-viewport Settings screenshots after the anti-slop audit.

## Reconciliation and Recovery

When Stripe and Convex disagree:

1. Stop manual edits and identify the Stripe customer, subscription, newest
   event, and current Convex entitlement.
2. Read support diagnostics for grants, periods, reservations, slots, queue
   entries, and recent ledger history.
3. Retry the failed signed event when it is still the authoritative update.
4. Otherwise run the billing reconciliation action with the operator secret,
   actor, and reason. Reconciliation reads the current Stripe subscription and
   writes a new entitlement-history record.
5. Run usage reconciliation for stale queue entries, reservations, or slots.
6. Apply a time-bounded support override only when a customer needs temporary
   access while the commerce state is being corrected.
7. Remove or let the override expire after the root cause is resolved.

Never mutate or delete a committed ledger entry. Correct usage with a
compensating support adjustment or grant revocation/restoration.

For a paid mid-period upgrade, reconcile against the invoice's subscription
billing period, not the period on a short proration line item. The repair path
keeps one canonical monthly grant and merges any historical duplicate
proration grants with compensating ledger entries. It never rewrites the
original ledger rows.

## Worker Dispatch Credential Recovery

Convex dispatches the provider and media Cloud Run Jobs with a dedicated Google
service-account key. If the JWT signature is rejected, rotate that key without
placing the private key in a command argument, shell history, log, or ticket:

1. Create a new key into a permission-restricted temporary JSON file.
2. Extract `client_email` and pipe `private_key` to the matching Convex
   environment variables through standard input. Never pass the private key as
   a positional CLI value.
3. Invoke the authenticated `workerDispatch:runWorkerFromApi` smoke path for
   both `provider` and `media`. Confirm each call returns a Cloud Run execution
   operation.
4. Execute each Cloud Run Job with `--args=--check --wait`.
5. Delete the superseded service-account key only after both dispatch and job
   checks pass, then securely remove the temporary file.

The provider worker must claim the unified queue through the nested Convex
module path
`workerQueue/claimNextWorkerQueueEntry:claimNextWorkerQueueEntry`. The focused
reference test protects that exact generated function name. A newly deployed
Convex schema does not update an existing Cloud Run image, so rebuild and
redeploy every worker whose code changed before production promotion. This
test-mode implementation intentionally did not deploy either production job.

For browser-local Stitchr verification, use an origin allowed by the R2 CORS
policy. The development policy allows `http://localhost:3000`; a different
local port is useful for proving reservation release on a blocked fetch, but it
cannot prove the successful browser render path.

## Exact Production Promotion

Promotion is a new live catalog and deployment configuration, not a mode switch
on the test objects.

1. Complete every test-verification step above and archive the evidence.
2. Obtain human approval for prices, refund policy, cancellation language,
   taxes, invoices, receipts, customer emails, terms, privacy copy, and support
   handling.
3. Confirm webhook-lag, processing-failure, billing-review, reconciliation, and
   queue-cap alerts have owners and escalation paths.
4. In Stripe live mode, create four new Products with `environment=live` and
   the matching `catalog_key` metadata. Create the four exact Prices with
   `environment=live` plus `plan_key` on subscriptions or `catalog_key` on the
   refill. Use `clipstitchr_live_starter_monthly`,
   `clipstitchr_live_pro_monthly`, `clipstitchr_live_agency_monthly`, and
   `clipstitchr_live_creation_credit_refill` as lookup keys.
5. Create a new live portal configuration. Allowlist only the three new live
   subscription prices. Configure immediate prorated upgrades, period-end
   decreases, unchanged billing anchors, payment updates, invoice history, and
   period-end cancellation. Set the business-profile Terms and Privacy URLs to
   the two public ClipStitchr legal pages before opening the portal.
6. Create a new live event destination pointing to the production Convex
   `/stripe/webhook` URL. Pin it to `2026-05-27.dahlia` and select exactly the
   event list in this runbook.
7. Store the live secret key and live endpoint signing secret in the production
   secret manager. Record the new live Product, Price, and portal IDs in the
   production deployment inventory. Do not reuse any test value.
8. Set the production Convex variables with
   `CLIPSTITCHR_STRIPE_MODE=live` and the public production HTTPS app URL. Set
   all catalog IDs, the portal ID, Stripe secrets, and a fresh billing-support
   operator secret in one controlled change.
9. Deploy code and schema through the normal production review path. Do not
   deploy workers solely for catalog values because workers read the app-owned
   plan projection, but do deploy both jobs when shared queue code changed and
   deploy the affected job whenever its worker code changed. Run the nested
   queue-reference test and both Cloud Run `--check` executions against the
   newly built images before continuing.
10. Before opening sales, run one internal live subscription Checkout with a
    real approved company payment method, confirm the signed live webhook and
    entitlement, then immediately validate portal access, invoice delivery, and
    period-end cancellation behavior.
11. Verify ordinary generation reads Convex without a Stripe call, charges the
    expected resource once, and honors product, daily-draft, owner, global, and
    tool caps.
12. Enable customer access gradually. Watch webhook failures, entitlement lag,
    checkout volume, queue waits by plan, reservations, and billing-review
    flags during the launch window.

## Rollback

If live verification fails before public launch, disable new billing entry
points in the application release and deactivate the new live Prices. Keep the
webhook destination enabled long enough to finish already-created sessions,
payments, refunds, and cancellations. Do not delete customers, subscriptions,
events, grants, or ledger history.

If a failure happens after subscriptions exist:

1. Keep signed webhooks and reconciliation online.
2. Block new Checkout and refill sessions, but leave portal access available.
3. Apply narrow, expiring support overrides only for affected customers.
4. Fix or roll back application code through the normal deployment path.
5. Reconcile each affected subscription and usage state before reopening sales.

## Related Documents

- `docs/operations/billing/complimentary-access.md`
- `docs/features/billing/paid-plans-and-usage.md`
- `docs/architecture/stripe-billing-integration-decision.md`
- `docs/architecture/plan-entitlements-stripe-and-worker-queues.md`
- `docs/architecture/creation-credit-system.md`
- `docs/operations/security/rate-limits.md`
