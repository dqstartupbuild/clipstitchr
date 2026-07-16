# Plan Entitlements, Stripe, and Worker Queue Architecture

**Status:** Implemented in test/development mode

**Last reviewed:** July 16, 2026

## Purpose

This document is the implementation contract for paid ClipStitchr plans. Use it
when adding Stripe subscriptions, plan enforcement, creation credits, AI video
allowances, daily-draft limits, generation priority, or plan-based concurrency.

The implementation must keep three concerns separate:

1. Stripe owns customers, prices, subscriptions, invoices, and payments.
2. Convex owns the app entitlement and usage state used by every request.
3. The provider and media queues own execution order, leases, retries, and
   worker capacity.

Do not call Stripe during ordinary product requests. Do not trust the browser
to identify a plan, price, speed tier, balance, or queue priority.

## Related Documents

- `docs/architecture/creation-credit-system.md`
- `docs/product/strategy/offer.md`
- `docs/product/strategy/monetization-and-usage-budget.md`
- `docs/operations/evaluations/stripe.md`
- `docs/operations/evaluations/workpool.md`
- `docs/operations/security/rate-limits.md`
- `docs/operations/reliability/worker-dispatch-recovery.md`
- `docs/operations/deployment/automation-deployment.md`

Revalidate the current Stripe, Convex Stripe component, and Cloud Run APIs at
implementation time. The architecture in this document does not depend on a
specific package version.

## Current State

The app now has an app-owned Stripe entitlement projection, immutable usage
ledger, ordered credit grants, usage reservations, owner generation slots, and
one weighted provider/media scheduling layer. Server-owned plan policy controls
product limits, daily drafts, Clipr and Swapr video allowances, paid creation
costs, concurrency, and queue priority. Legacy direct-execution endpoints are
retired so paid work cannot bypass the queue.

Stripe test products, prices, portal behavior, event destination, and the
development Convex environment are configured. Live objects and production
environment values remain intentionally unconfigured. See
`docs/operations/billing/stripe-test-mode-and-production-promotion.md`.

## Goals

- Enforce the exact Starter, Pro, and Agency limits on the server.
- Make duplicate requests, webhook retries, and worker retries idempotent.
- Reserve usage before expensive work so simultaneous jobs cannot overspend.
- Return reservations after failed or canceled work.
- Give higher plans more queue preference without starving Starter jobs.
- Limit end-to-end active generations per owner and per shared provider.
- Keep the current domain job tables as the durable product record.
- Preserve authorization and rate limits separately from entitlements.
- Make support adjustments and billing decisions auditable.
- Measure queue wait separately from third-party provider duration.

## Non-Goals

- Do not bill by database or R2 storage.
- Do not use Stripe usage-based metering for the first implementation.
- Do not let Stripe become the runtime feature-gating database.
- Do not promise a fixed generation time.
- Do not make lower plans produce intentionally unusable output.
- Do not count downloading an existing stitch as new usage.
- Do not charge standalone photo credits for Clipr's required scene still.
- Do not replace durable ClipStitchr job state with Workpool-only state.

## Canonical Plan Policy

Use these stable internal keys everywhere:

```ts
type PlanKey = "starter" | "pro" | "agency";
```

Do not retain `creator` or `studio` as billing-plan aliases. If a migration must
read them, map them at one compatibility boundary and store only the canonical
key afterward.

| Policy                                       |    Starter |        Pro |           Agency |
| -------------------------------------------- | ---------: | ---------: | ---------------: |
| Monthly price                                |        $39 |        $99 |             $399 |
| Products                                     |          1 |          3 |               10 |
| Monthly creation credits                     |      2,000 |      8,000 |           20,000 |
| Combined successful Clipr + Swapr videos     |          3 |         10 |               50 |
| Products with daily drafts                   |          0 |          1 |               10 |
| Simultaneous active AI generations per owner |          1 |          2 |                4 |
| Queue weight                                 |          1 |          3 |                5 |
| Queue label                                  |   Standard |   Priority | Highest priority |
| Stitch creation                              | 10 credits | 10 credits |        Unlimited |
| Swipr generation                             | 20 credits | 20 credits |       20 credits |
| Standalone avatar/background/expansion photo | 25 credits | 25 credits |       25 credits |

An active AI generation means one end-to-end job that has acquired a generation
slot and has not reached a terminal state. Waiting for a provider prediction or
media finalization still occupies the slot. A queued job that has not acquired
a slot does not.

Stitchr previewing and editing are included. A successful new stitch costs 10
credits on Starter or Pro whether it came from Normal, Longr, Batch, or a daily
draft. Ten new stitches cost 100 credits. Exporting or downloading an existing
stitch costs zero credits. Agency stitch creation bypasses creation-credit
deduction.

Clipr and Swapr share the plan's successful-video allowance. Reserve one video
before work begins and commit it only after a successful final video is saved.
Release it after failure or cancellation. A Clipr scene still required by the
video pipeline is part of that reservation and never consumes separate photo
credits.

## Decision: Stripe Is the Commerce Source, Not the Entitlement Runtime

Use the Convex Stripe component as the default hosted Checkout, customer
portal, Stripe record synchronization, and signed-webhook foundation after its
current API and maintenance status are revalidated.

ClipStitchr must own an app-level entitlement projection. Ordinary generation,
product, upload, and automation requests read Convex only. This avoids a Stripe
network dependency on every product action and gives workers one consistent
authorization source.

### Server-Side Stripe Catalog

Define an allowlisted catalog keyed by `PlanKey`. Each deployment maps the key
to its Stripe Product and recurring Price IDs.

The browser may request `starter`, `pro`, or `agency`. It must never submit an
arbitrary Stripe Price ID that the server trusts.

Webhook subscription snapshots must derive `PlanKey` from that configured Price
allowlist. Subscription metadata may identify the owner and corroborate the
catalog entry, but a valid-looking metadata `planKey` must never rescue an
unknown Price.

Define the 2,000-credit refill as a separate allowlisted one-time Price. Refill
Checkout and payment confirmation require canonical paid Stripe access: stored
active state, a current paid period, and no billing review. A temporary support
override cannot make an inactive subscription eligible. A confirmed refill
payment grants credits but never changes the Clipr + Swapr video allowance.
Consume monthly plan credits before refill credits, then use the refill grants
with the earliest expiry first. Each refill grant expires 12 months after
purchase. An already-granted refill remains spendable while the paid
subscription is active or inside its valid payment grace window, but refill
Checkout and refill payment acceptance still require canonical active paid
access. Bind each refill grant to that Stripe subscription. A replacement
subscription cannot reactivate it, and legacy refill rows without a binding
fail closed. Preserve its ledger history after expiration or cancellation.
Persist a server-created Checkout intent with the exact refill Price before
returning the hosted URL. The successful PaymentIntent must reference that
record, so copied metadata and a matching amount cannot manufacture credits.

### Checkout

1. Authenticate the Clerk owner.
2. Rate-limit Checkout creation per owner and globally.
3. Validate the requested `PlanKey` against the server catalog.
4. Reuse or create the Stripe customer idempotently.
5. List that customer's Stripe subscriptions and fail closed if any
   nonterminal subscription already exists.
6. Create hosted Checkout with `ownerId` and `planKey` metadata.
7. Return only the hosted Checkout URL.
8. Do not activate access from the success redirect.

### Customer Portal

1. Authenticate the owner.
2. Rate-limit portal-session creation.
3. Look up the server-owned Stripe customer mapping.
4. Create the portal session with an allowlisted return URL.
5. Never accept another customer's Stripe ID from the browser.

### Webhooks

- Verify the Stripe signature before reading the event.
- Store or rely on component-level event idempotency by Stripe event ID.
- Process duplicate and out-of-order deliveries safely across subscription,
  paid-invoice, and invoice-failure event families. Use event time first and a
  monotonic transition priority for equal-second events so deletion cannot be
  undone by paid state and paid state cannot be undone by failure. Never sort
  Stripe event IDs as chronology. Refresh subscription create/update events
  from Stripe, and compare same-second paid invoices by subscription, period,
  and plan semantics.
- Update the app entitlement projection in one idempotent mutation.
- Send purchase analytics only after webhook-backed paid activation.
- Never activate a plan from client metadata alone.

At minimum, handle subscription creation/update/deletion, Checkout completion,
successful invoice payment, failed invoice finalization, failed invoice
payment, one-time refill payment, refund, dispute, and chargeback events
relevant to the selected Stripe API version.

### Subscription-to-Entitlement Mapping

Use these runtime entitlement states:

```ts
type EntitlementState = "active" | "grace" | "inactive";
```

- Paid and active subscription: `active`.
- Runtime access also requires server time to fall inside the recorded paid
  period. A missing, malformed, future, or ended paid period fails closed even
  when the stored projection still says `active`.
- Cancel-at-period-end: remain `active` through the paid period end. Treat both
  Stripe's `cancel_at_period_end` flag and a concrete future `cancel_at`
  timestamp as this state.
- Past due after at least one confirmed paid invoice for the same Stripe
  subscription: `grace` for 72 hours by default.
- The first failure owns the grace deadline. Retries and later subscription
  updates cannot extend it or reopen an expired grace window.
- Initial invoice failure with no confirmed payment: remain `inactive`.
- Payment recovered during grace: return to `active`.
- Grace expired, unpaid, incomplete-expired, or ended subscription: `inactive`.
- Support override: explicit app-owned state with actor, reason, and expiry.

Confirm the 72-hour grace decision before launch. Keep it in one policy constant
instead of scattering it through webhook handlers.

Do not silently delete an entitlement. Preserve the last Stripe subscription,
plan, period, source event, and change history for support and audit.

## App-Owned Convex Data

Names may be adapted to the final schema, but the responsibilities must remain
separate.

The exact grant allocation, reservation lifecycle, operation integration, and
credit acceptance tests are defined in
`docs/architecture/creation-credit-system.md`.

### `billingEntitlements`

One current projection per owner:

- `ownerId`
- `planKey`
- `state`
- `stripeCustomerId`
- `stripeSubscriptionId`
- `stripePriceId`
- `currentPeriodStart`
- `currentPeriodEnd`
- `cancelAtPeriodEnd`
- `graceEndsAt`
- optional support override fields
- `sourceEventId`
- `version`
- `createdAt`
- `updatedAt`

Required indexes:

- unique by owner;
- unique by Stripe subscription;
- by state and period end for reconciliation.

### `stripePaymentHolds`

Store one durable refund or dispute hold per Stripe charge and adverse source.
Each row records the owner, customer, optional PaymentIntent and invoice, source
event clock, open or resolved status, and resolution event. Recompute billing
review from every open owner hold; never clear customer-wide review because one
unrelated dispute closed. Persist resolved tombstones for out-of-order closure
events. When an open hold suppressed the original grant, retrieve the paid
invoice or PaymentIntent, validate the recorded Checkout where applicable, and
replay the stable idempotent grant only after that hold resolves.

### `usagePeriods`

One immutable-policy snapshot per owner and Stripe billing period:

- `ownerId`
- `periodKey`
- `planKeySnapshot`
- period start and end
- creation credits granted, reserved, consumed, and adjusted
- video allowance granted, reserved, consumed, and adjusted
- timestamps

The snapshot prevents a later code change from rewriting what the customer
bought for an already-open billing period.

### `usageLedgerEntries`

Append-only audit entries:

- `ownerId`
- `periodKey`
- `resource`: `creation_credit` or `ai_video`
- `entryType`: grant, reserve, commit, release, adjustment, refill, expiry,
  refund, or reversal
- positive quantity plus signed available, reserved, and consumed deltas
- operation/tool
- domain job ID
- idempotency key
- optional expiry for refill credits
- actor/source
- reason
- created timestamp

Never update a committed entry to change history. Add a compensating entry.

### `creditGrants` and `usageReservationAllocations`

Implement these supporting tables as specified in
`docs/architecture/creation-credit-system.md`. They are required to spend
monthly credits before refill credits, honor different expiration dates, and
return the exact grant allocations after failed work.

### `usageReservations`

One active reservation per billable operation:

- owner and plan-period identity;
- domain job and idempotency key;
- resource and amount;
- state: reserved, committed, released, or expired;
- reservation expiry;
- created, committed, released, and updated timestamps.

The reserve mutation must atomically verify entitlement, calculate available
balance, insert the reservation, and increment the period's reserved total.

The commit and release mutations must be idempotent. A recovery job must release
expired reservations whose domain jobs cannot still complete. If a late worker
returns after a release, it must not create unbilled output silently. It should
either reacquire usage atomically or fail finalization and alert operations.

### `generationSlots`

Use a durable end-to-end slot rather than treating a short worker lock as user
concurrency:

- `ownerId`
- `domainJobId`
- `tool`
- `planKeySnapshot`
- `state`: waiting, active, released, or expired
- acquired and released timestamps
- heartbeat/expiry fields
- idempotency key

The worker claim mutation acquires a slot only when the owner's active count is
below the plan policy. The slot remains active while waiting on Replicate,
Apify, ElevenLabs, or media finalization. Terminal success, failure, or
cancellation releases it.

### `workerQueueEntries`

Add one scheduling record for each provider or media unit of work. Keep the
existing domain job as the product source of truth.

- `worker`: provider or media
- `sourceKind`: provider job, media job, or automation task
- `sourceId`
- `ownerId`
- `tool` or job type
- `planKeySnapshot`
- `queueLane`: starter, pro, or agency
- `status`: queued, running, waiting, completed, failed, or canceled
- `generationSlotId` when applicable
- lock and attempt fields
- created and updated timestamps

Required indexes:

- by worker, status, lane, and created time;
- by owner and status;
- by source kind and source ID;
- by lock expiry for recovery.

This unified scheduling table prevents provider jobs from permanently jumping
ahead of automation tasks merely because they live in a different table.

## Product and Daily-Draft Enforcement

### Products

The authenticated Convex product-creation mutation must count products owned by
the user before insertion and reject the write when the plan limit is reached.
API-route or UI checks are helpful messaging but are not enforcement.

On downgrade, keep existing products readable. Block new products while the
owner remains above the new limit. Require the owner to archive products before
enabling additional daily drafts or creating another product.

### Daily Drafts

The mutation that enables daily drafts must enforce the number of enabled
products. The daily planner must re-check entitlement and the current enabled
count before creating work.

On downgrade, retain the earliest enabled products up to the new limit and
disable the rest with an auditable reason. Starter disables all daily drafts.

### No Storage Entitlement

Storage safeguards remain internal abuse and cost controls. Do not expose
storage capacity as a paid plan field or reject an upgrade solely because of a
marketing storage quota.

## Usage Enforcement by Operation

| Operation                       | Before work                                      | On success                           | On failure/cancel   |
| ------------------------------- | ------------------------------------------------ | ------------------------------------ | ------------------- |
| New Starter/Pro stitch          | Reserve 10 credits                               | Commit after the new stitch is saved | Release             |
| New Agency stitch               | Verify active entitlement; no credit reservation | Record zero-cost usage metric        | No credit action    |
| Swipr generation                | Reserve 20 credits                               | Commit after saved result            | Release             |
| Standalone photo operation      | Reserve 25 credits                               | Commit after saved image             | Release             |
| Clipr or Swapr video            | Reserve 1 combined video                         | Commit after final saved video       | Release             |
| Clipr required scene still      | Covered by active Clipr reservation              | No separate commit                   | No separate release |
| Existing stitch export/download | Authorization and rate limit only                | No usage charge                      | No usage charge     |

Browser-local Stitchr rendering needs a server-issued reservation before
rendering begins. The saved stitch finalization commits it. Abandoned browser
work is released by cancellation or expiry reconciliation.

Provider and media workers must re-check that the reservation and generation
slot are still valid before the first expensive provider call and before final
asset persistence.

## Queue Priority Decision

Use weighted fair scheduling, not strict priority.

Weights:

- Agency: 5
- Pro: 3
- Starter: 1

Maintain a per-worker scheduling cursor over a nine-position cycle containing
five Agency positions, three Pro positions, and one Starter position. At each
claim:

1. Finish or reclaim an already-started finalization whose lock expired.
2. Read the oldest claimable head from each plan lane.
3. Select the next non-empty lane from the weighted cycle.
4. Skip an owner whose generation-slot limit is full.
5. Atomically acquire the queue lease and generation slot.
6. Advance the cursor.

Add aging so a queued Pro job waiting more than 3 minutes or a Starter job
waiting more than 5 minutes takes the next available claim. Make thresholds
configuration constants and revise them from production wait-time data.

Do not query only the first ten global jobs and stop when those owners are at
their concurrency cap. Query lane heads or maintain the unified queue entry so
an eligible job behind a blocked owner can still run.

Within a lane, use created time for FIFO behavior. Retried work keeps its
original queue age unless the retry is intentionally delayed by provider
backoff.

## Generation Speed Decision

Public copy should say `Standard`, `Priority processing`, and `Highest priority`
rather than promising a fixed number of minutes.

Generation speed has three different components:

1. Queue wait controlled by ClipStitchr.
2. Provider model/mode controlled partly by ClipStitchr.
3. Provider execution time controlled by the third party.

Plan differentiation must primarily use queue preference and active-generation
capacity. All plans should produce the same final dimensions and review flow.
Do not intentionally make Starter output unusable.

Replace client-selected `GenerationSpeedTier` with a server-only
`getPlanGenerationProfile(planKey)` decision. A missing or invalid entitlement
must fail closed instead of defaulting to Agency behavior.

Provider-specific fast modes may be selected for Pro and Agency only after
quality, duration, and cost parity are measured. The profile may contain model
settings, but the browser must not control it. Clipr, Swapr, avatar photos,
Swipr, daily automation, and all retry paths must resolve the same server-owned
profile.

## Concurrency Decision

Enforce both owner and global/provider limits:

- owner slot limits: 1 Starter, 2 Pro, 4 Agency;
- one configurable global active limit per provider/model;
- one configurable global active limit for provider worker work;
- one configurable global active limit for media worker work.

One owner slot follows generation from provider work through media
finalization. During handoff it remains active for the owner but is temporarily
capacity-neutral. The claimant assigns that same slot to the media worker only
after the independent media and per-tool caps have room. Media-only work also
acquires a media slot before processing.

Rate limits control how often work can be requested. Generation slots control
how many expensive jobs can be active. Queue weights control who runs next.
These mechanisms are complementary and must not replace one another.

Use Convex mutations for atomic slot acquisition. Never count in a Next.js
route and then enqueue separately because two simultaneous requests could both
pass.

## Cloud Run Worker Capacity

Keep the first plan-aware implementation on the existing provider and media
Cloud Run Jobs.

Current deployments use one task and each container processes three jobs
sequentially. The first rollout should keep one task per execution and allow the
dispatcher to start additional bounded executions when backlog requires it.
Every execution uses the same atomic queue claim, so capacity does not decide
priority; the queue does.

Replace the single global 15-second launch-coalescing decision with a
demand-aware launch state that records:

- queued count per worker and lane;
- running execution estimate;
- last launch time;
- desired execution count;
- global maximum executions;
- cooldown and recovery launch timestamps.

Premium backlog may request additional capacity sooner, but all workers still
claim through weighted fair scheduling.

Do not increase Cloud Run `--tasks` above one until continuation scheduling is
made task-aware. With multiple tasks, every task currently could request its own
continuation and over-dispatch. If tasks are increased later, set explicit
parallelism and use one execution-level continuation leader.

Keep worker code idempotent because Cloud Run retries and overlapping
executions can occur. Provider/model global limits must be below vendor and
project quotas.

If measured Cloud Run startup latency prevents a meaningful priority benefit,
evaluate a continuously available Cloud Run Service or managed work pool for
the lightweight provider orchestrator. Keep FFmpeg/media processing in bounded
worker infrastructure.

## Downgrades, Cancellation, and Adjustments

- Upgrades take effect after webhook-confirmed positive prorated payment. Grant
  only the positive prorated allowance difference and key it to the invoice's
  subscription billing period so replayed events remain idempotent.
- Downgrades take effect at the next paid billing period.
- Cancel-at-period-end retains access through the paid period.
- Refill credits remain usable while the entitlement is active or inside its
  valid payment grace window, subject to their 12-month expiry, and become
  unavailable when the entitlement becomes inactive.
- Immediate cancellation releases queued work that has never started. An
  already-running provider job and its queued media continuation may finish
  only when usage was validly reserved and the continuation carries the
  inherited provider lifecycle slot.
- A downgrade never deletes products or completed assets.
- If the user is over the new product limit, block new products until they
  archive enough existing products.
- Disable daily drafts above the new limit deterministically and notify the
  owner.
- Support adjustments use append-only ledger entries with actor, reason, and
  idempotency key.
- Refunds and chargebacks persist separate per-charge source holds, reverse
  unused refill and invoice-linked monthly grants where possible, and flag a
  negative or disputed account for support review. Resolving one dispute does
  not clear another hold. Do not silently delete ledger history.

## Security and Abuse Protection

- Derive `ownerId` from Clerk for user actions.
- Treat worker secrets and Stripe webhook signatures as separate trust
  boundaries.
- Validate plan keys and Stripe prices against a server allowlist.
- Rate-limit Checkout, portal, refill Checkout, and expensive product actions.
- Keep per-user and global provider rate limits even after entitlements exist.
- Gate signed R2 URLs separately from billing.
- Validate reservation ownership in every worker transition.
- Store no Stripe secret, webhook secret, customer ID, or plan authority in
  public environment variables.
- Return `429` with retry timing for HTTP rate limits and a distinct plan-limit
  response for entitlement exhaustion.
- Do not reveal another customer's balance, queue position, or subscription.
- Update `docs/operations/security/rate-limits.md` in the implementation.

## Observability

Record these server-side metrics by plan, tool, provider, and outcome without
including personal content:

- queue wait duration;
- generation-slot wait duration;
- provider duration;
- media-finalization duration;
- total completion duration;
- active slots and queue depth;
- worker launches and cold-start delay;
- reservation commits, releases, and expiries;
- provider cost per successful output;
- retries and terminal failures;
- aged-job priority overrides;
- upgrade, downgrade, grace, and entitlement-sync events.

Set alerts for stuck reservations, expired locks, negative balances, webhook
lag, queue wait thresholds, repeated worker dispatch failure, and provider quota
errors.

Marketing may claim priority only after production metrics show that Pro and
Agency have materially lower queue wait at normal load. Do not describe third-
party provider duration as guaranteed.

## Required Implementation Files

Follow the repository's atomic one-file, one-purpose rule. Exact names may
change to match nearby patterns, but keep these responsibilities separate.

### Shared plan policy

```text
web/lib/clipstitchr/billing/types/PlanKey.ts
web/lib/clipstitchr/billing/types/EntitlementState.ts
web/lib/clipstitchr/billing/planPolicies.ts
web/lib/clipstitchr/billing/getPlanPolicy.ts
web/lib/clipstitchr/billing/getPlanGenerationProfile.ts
web/lib/clipstitchr/billing/getStripePriceForPlan.ts
```

### Stripe and entitlement synchronization

```text
web/convex/stripe/createCheckoutSession.ts
web/convex/stripe/createPortalSession.ts
web/convex/stripe/syncEntitlementFromSubscription.ts
web/convex/stripe/grantConfirmedCreditRefill.ts
web/convex/stripe/reconcileEntitlements.ts
web/convex/billing/getCurrentEntitlement.ts
web/convex/billing/applySupportOverride.ts
```

Register the Stripe component in `web/convex/convex.config.ts` and the signed
webhook endpoint in `web/convex/http.ts` if those remain the current component
integration points.

### Usage

```text
web/convex/usage/getCurrentUsage.ts
web/convex/usage/reserveCreationCredits.ts
web/convex/usage/reserveAiVideo.ts
web/convex/usage/commitReservation.ts
web/convex/usage/releaseReservation.ts
web/convex/usage/grantMonthlyAllowance.ts
web/convex/usage/grantCreditRefill.ts
web/convex/usage/reconcileExpiredReservations.ts
```

### Product limits and automation

```text
web/convex/products/assertProductLimit.ts
web/convex/automation/assertDailyDraftProductLimit.ts
web/convex/automation/reconcileDailyDraftsAfterPlanChange.ts
```

### Queue and concurrency

```text
web/convex/workerQueue/enqueueWorkerQueueEntry.ts
web/convex/workerQueue/claimNextWorkerQueueEntry.ts
web/convex/workerQueue/acquireGenerationSlot.ts
web/convex/workerQueue/releaseGenerationSlot.ts
web/convex/workerQueue/reconcileExpiredGenerationSlots.ts
web/convex/workerQueue/getWeightedQueueLane.ts
web/convex/workerQueue/requestWorkerCapacity.ts
```

Update provider and media workers to claim the unified queue entry, validate its
domain record and usage reservation, and finalize both records idempotently.

### User interface

```text
web/app/_components/settings/SettingsSubscriptionPanel.tsx
web/app/_components/settings/PlanUsageSummary.tsx
web/app/_components/settings/ManageSubscriptionButton.tsx
web/app/_components/settings/CreditRefillButton.tsx
web/app/_components/dashboard/PlanLimitMessage.tsx
```

Do not expose queue internals. Show plain messages such as `1 of 2 generations
active` and `This job will start when a generation slot is available.`

## Implementation Sequence

### Phase 1: Policy and schema

- Add canonical plan policy and types.
- Add app-owned entitlement, usage, reservation, generation-slot, and unified
  queue tables and indexes.
- Add read-only admin/support diagnostics.
- Add migrations and backfills with paid enforcement disabled.

### Phase 2: Stripe test-mode synchronization

- Revalidate and install the Convex Stripe component.
- Configure test products, recurring prices, refill price, portal, and webhook.
- Add allowlisted Checkout and portal actions.
- Synchronize webhook state into `billingEntitlements`.
- Exercise duplicates, out-of-order events, failures, cancellation, and grace.

### Phase 3: Shadow entitlement and usage accounting

- Resolve the server-side plan on every paid surface.
- Calculate reservations and limits without blocking users.
- Compare shadow ledger results with provider jobs and invoices.
- Fix mismatches before enabling enforcement.

### Phase 4: Product, daily-draft, credit, and video enforcement

- Enforce product and daily-draft limits in Convex mutations.
- Enable atomic credit and video reservations.
- Integrate every manual, batch, automation, retry, and finalization path.
- Add clear plan-limit responses and usage UI.

### Phase 5: Queue priority and generation slots

- Enqueue unified scheduling records.
- Enable 1, 2, and 4 owner generation-slot limits.
- Enable weighted 5:3:1 lane selection and aging.
- Add global provider/model and worker limits.
- Run in shadow-selection mode before the new claimant becomes authoritative.

### Phase 6: Demand-aware Cloud Run capacity

- Replace global launch coalescing with bounded demand-aware dispatch.
- Measure worker startup, queue wait, and provider duration.
- Tune execution caps and aging thresholds.
- Keep a rollback flag for the previous dispatcher and FIFO claimant.

### Phase 7: Production billing launch

- Promote Stripe test configuration to live mode deliberately.
- Verify price allowlists, portal configuration, webhook secret, and tax setup.
- Complete legal, privacy, refund, cancellation, and support review.
- Run checkout-to-entitlement and refill-to-ledger smoke tests.
- Enable paid enforcement gradually and monitor every plan.

## Migration and Rollback

- Backfill existing authenticated owners with a temporary, expiring internal
  override while billing is in shadow mode.
- Do not infer a paid plan from a client setting or old speed-tier field.
- Snapshot current queued jobs as the global capability ceiling during the
  transition.
- New queue entries may dual-write beside current job tables before workers
  claim from them.
- Compare old FIFO selection with proposed weighted selection in logs.
- Use separate feature flags for entitlement enforcement, usage reservation,
  queue selection, generation slots, and demand-aware dispatch.
- Rollback must stop new enforcement without deleting ledger or entitlement
  history.
- Never roll back by granting Agency defaults to missing entitlements in
  production.

## Verification Requirements

### Stripe

- Approved plan key creates only its matching allowlisted Price.
- Arbitrary Price IDs and another owner's customer IDs are rejected.
- Checkout redirect alone does not activate access.
- Signed webhook activates the correct entitlement once.
- Duplicate and out-of-order events remain idempotent.
- Portal access is owner-scoped.
- Failed payment, recovery, grace expiry, cancellation, refund, and dispute
  produce the documented state.
- Refill payment grants exactly 2,000 expiring credits once.

### Plan limits

- Starter, Pro, and Agency enforce 1, 3, and 10 products.
- Daily drafts enforce 0, 1, and 10 enabled products.
- Downgrades preserve assets and block only disallowed new work.
- Monthly periods reset once at the Stripe period boundary.

### Usage

- Concurrent reservations cannot overspend a balance or video allowance.
- One new Starter/Pro stitch commits 10 credits.
- A ten-stitch batch commits 100 credits only for successful stitches.
- Daily-draft stitches use the same rule.
- Existing-stitch downloads use zero credits.
- Agency stitches use zero credits while Swipr and standalone photos still
  consume credits.
- Clipr required photos never double-charge.
- Failed and canceled jobs release reservations.
- Late completion after release cannot silently create unbilled output.

### Queue and concurrency

- Starter, Pro, and Agency cannot exceed 1, 2, and 4 active generation slots.
- Queued work does not consume an active slot.
- Weighted selection approximates 1:3:5 under sustained mixed backlog.
- Starter and Pro aging prevents starvation.
- One owner at its slot limit does not block eligible jobs behind it.
- Provider jobs cannot permanently starve automation tasks.
- Multiple workers cannot claim the same queue entry or slot.
- Expired worker locks and slots recover idempotently.
- Global provider caps remain enforced under multiple Cloud Run executions.

### Operations

- Rate-limit documentation matches every new billing and usage endpoint.
- Worker deployment and rollback commands are updated.
- Metrics distinguish queue wait, provider duration, and finalization duration.
- Production smoke tests cover one job for every paid provider surface.

## Launch Gates

Do not enable live paid checkout until all of these are true:

- provider costs have been validated against the plan margin budgets;
- every expensive surface uses server-owned entitlement and usage checks;
- Stripe webhook processing is signed, idempotent, and monitored;
- Checkout and portal creation are rate-limited;
- product, credit, video, and daily-draft tests pass;
- plan concurrency and queue priority are enforced server-side;
- refund, cancellation, grace, and downgrade behavior has been approved;
- the Terms and Privacy pages match production billing behavior;
- support can inspect entitlements, reservations, and ledger history;
- rollback flags and worker rollback instructions have been tested.

## Consequences

### Positive

- Paid limits are consistent across UI, routes, Convex, and workers.
- Simultaneous work cannot overspend credits or video allowances.
- Pro and Agency receive measurable queue benefits without strict starvation.
- Stripe outages do not block every ordinary product request.
- Usage and support decisions are auditable.
- Existing provider and media workers remain usable.

### Negative

- The implementation adds several durable tables and reconciliation jobs.
- Every billable workflow must adopt reservation and terminal-release logic.
- Queue scheduling and worker capacity require production tuning.
- Support needs tools for overrides, disputes, and stuck reservations.
- Multiple feature flags and a shadow rollout increase implementation time.

### Risks and Mitigations

- **Webhook lag:** Keep Checkout pending until Convex receives confirmed state.
- **Duplicate provider output:** Require domain and usage idempotency keys.
- **Starter starvation:** Use weighted fairness plus aging.
- **Premium claim without measurable benefit:** Measure queue wait before
  marketing priority.
- **Overspend from simultaneous requests:** Reserve usage atomically in Convex.
- **Worker over-dispatch:** Keep one Cloud Run task initially and bound desired
  executions globally.
- **Client plan spoofing:** Derive every policy from server-owned entitlement.
- **Stuck usage:** Reconcile reservation, job, lock, and generation-slot expiry.

## Decisions to Confirm Before Live Billing

The architecture is implementation-ready, but these business decisions require
explicit approval before production:

- the general refund policy outside the 10k Organic Views Challenge;
- supported tax jurisdictions and whether Stripe Tax is enabled;
- final global provider/model concurrency ceilings after quota review;
- whether an Agency support override can temporarily exceed 4 active
  generations.

The implemented billing decisions are a 72-hour payment-failure grace period,
immediate paid upgrades with a positive prorated allowance delta, and
downgrades at the next renewal. Changing any of these requires a coordinated
policy, portal, webhook, copy, and test update.

Any changed decision should update this document, the offer and monetization
documents, Terms, tests, and server policy in the same implementation.
