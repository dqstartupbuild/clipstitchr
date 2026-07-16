# Account and Billing Communications

## What It Does

ClipStitchr sends account, subscription, payment, and credit service messages
through a dedicated transactional-email outbox. These messages are separate
from marketing consent and from Stripe invoices.

The feature covers:

- one welcome message after the first verified account email is known;
- plan activation, paid plan changes, renewals, and payment recovery;
- cancellation scheduling, cancellation reversal, and plan end;
- initial and renewal payment failures; and
- successful 2,000-credit refills.

Subscription, payment, and credit changes also create a deduplicated dashboard
notification. Stripe remains responsible for invoices, receipts, tax details,
payment methods, and hosted subscription management. ClipStitchr service
emails never reproduce an invoice number, charged amount, or receipt link.

## Account Email Source

The canonical account email is keyed by the immutable Clerk user subject.
`POST /webhooks/clerk` accepts only signed `user.created`, `user.updated`, and
`user.deleted` events. The handler uses Clerk's official webhook verifier,
requires the bounded `svix-id`, caps the raw body at 64 KiB, and passes only the
verified primary email plus bounded account names into an idempotent Convex
mutation.

Clerk delivery is eventually consistent, so the dashboard also calls the
authenticated `accountEmail/syncCurrentAccountContact:syncCurrentAccountContact`
mutation once per loaded session. It trusts only the Clerk identity attached to
the Convex session, requires both the `email` claim and a boolean
`email_verified: true` claim, consumes owner and global sync limits, and uses
the same welcome communication key. This safely backfills existing users and
closes the timing gap before a new Clerk webhook endpoint is configured.

A later verified email change clears an earlier delivery suppression for the
old address. Account deletion clears stored name and email data and cancels
pending account-email operations. Marketing contacts and consent are never
used to decide whether a service message may send.

## Durable Delivery

Billing and Clerk mutations insert `accountEmailOperations` in the same Convex
transaction that records the related product state. A scheduled internal action
then:

1. requires the exact account-email readiness gate and all four template IDs;
2. claims the operation with a four-minute lease;
3. rechecks the current verified account email and suppression state;
4. consumes per-owner, global, and shared Loops capacity;
5. sends with `addToAudience: false` and a provider idempotency key;
6. records acceptance, bounded retry, or dead-letter state; and
7. reconciles delivery, bounce, and complaint evidence from signed Loops
   webhooks when one operation can be linked without guessing.

Retries stop after seven actual provider attempts. An ambiguous result cannot
be replayed after Loops' 24-hour idempotency window. Disabled or incomplete
configuration holds work instead of dropping it. A later verified account sync
resumes held work.

## Event Matrix

| Source transition | Email | In-app notification |
| --- | --- | --- |
| First verified account contact | Account created | No |
| First paid invoice | Subscription status with plan and credits | Billing |
| Paid plan change | Subscription status with effective plan and credit adjustment | Billing |
| Normal renewal | Credits updated with monthly grant and expiry | Credit |
| Paid recovery from grace | Subscription status | Billing |
| Cancel at period end enabled or reversed | Subscription status | Billing |
| Confirmed plan end or customer deletion | Subscription status | Billing |
| Initial or renewal payment failure | Payment alert, with grace date when applicable | Billing |
| Confirmed refill grant | Credits updated with 12-month expiry | Credit |
| Checkout redirect, duplicate, stale, or ignored event | None | None |

One paid invoice creates one combined message. Activation does not produce a
second credits email, and a renewal does not produce a duplicate payment
receipt.

## Loops Templates

The source-controlled LMX templates are:

```text
web/email/loops/templates/account-created.lmx
web/email/loops/templates/subscription-status.lmx
web/email/loops/templates/credits-updated.lmx
web/email/loops/templates/payment-alert.lmx
```

`web/email/loops/templates/email-confirmation.lmx` keeps the existing marketing
confirmation message in the same ClipStitchr visual system and uses
`support@followusai.com` for replies. Account and billing service mail still
uses only the four dedicated templates above.

Every send injects the current first-name fallback, dashboard URL, anchored
billing Settings URL, and `support@followusai.com`. Event-specific variables
come only from server-owned copy functions. The browser cannot choose a
template, recipient, subject, message, plan, credit amount, or URL.

Required Convex environment values for account service-mail delivery:

```text
LOOPS_ACCOUNT_EMAIL_ENABLED
LOOPS_ACCOUNT_CREATED_TRANSACTIONAL_ID
LOOPS_SUBSCRIPTION_STATUS_TRANSACTIONAL_ID
LOOPS_CREDITS_UPDATED_TRANSACTIONAL_ID
LOOPS_PAYMENT_ALERT_TRANSACTIONAL_ID
```

`CLERK_WEBHOOK_SIGNING_SECRET` is additionally required when the optional
near-real-time Clerk lifecycle webhook is configured. The authenticated
dashboard sync is the supported fallback when the Clerk token supplied to
Convex includes `email` and boolean `email_verified` claims. Configure either
that verified claim mapping or the signed webhook before enabling account
service mail.

The existing explicit deployment/team checks, `LOOPS_API_KEY`, development
recipient allowlist, and signed Loops webhook configuration still apply.
`LOOPS_ACCOUNT_EMAIL_ENABLED` is intentionally independent from the paused
marketing send gate, so service mail can be released without starting a
marketing Workflow.

## File Tree

```text
web/
  app/_components/dashboard/AccountContactSync.tsx
  convex/accountEmail/
    handleClerkWebhookRequest.ts
    reconcileClerkUserEvent.ts
    syncCurrentAccountContact.ts
    enqueueAccountEmailOperation.ts
    processAccountEmailOperation.ts
    reconcileAccountEmailWebhookEvidence.ts
    createInvoicePaidCommunication.ts
    createSubscriptionTransitionCommunication.ts
    createPaymentFailureCommunication.ts
    createRefillCommunication.ts
  email/loops/templates/
  lib/clipstitchr/email/loops/
```

## Source References

- [Clerk webhook verification](https://clerk.com/docs/reference/backend/verify-webhook)
- [Clerk user synchronization](https://clerk.com/docs/guides/development/webhooks/syncing)
- [Loops transactional email](https://loops.so/docs/api-reference/send-transactional-email)
- [Loops webhook payloads](https://loops.so/docs/webhooks)
- `docs/features/billing/paid-plans-and-usage.md`
- `docs/operations/email/integration.md`
