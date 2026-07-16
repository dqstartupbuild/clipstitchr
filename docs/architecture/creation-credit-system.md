# Creation Credit System

**Status:** Proposed

**Last reviewed:** July 15, 2026

## Purpose

This document is the implementation contract for ClipStitchr creation credits.
Use it when building the Convex ledger, Stripe credit refills, plan-period
grants, usage reservations, usage displays, support adjustments, or charging
integration for Stitchr, Swipr, standalone photo generation, Clipr, and Swapr.

This document refines the credit portions of
`docs/architecture/plan-entitlements-stripe-and-worker-queues.md`. If the two
documents conflict, update both in the same change before implementation.

## Related Documents

- `docs/architecture/plan-entitlements-stripe-and-worker-queues.md`
- `docs/product/strategy/offer.md`
- `docs/product/strategy/monetization-and-usage-budget.md`
- `docs/operations/evaluations/stripe.md`
- `docs/operations/security/rate-limits.md`
- `docs/operations/reliability/worker-dispatch-recovery.md`

## Decision Summary

ClipStitchr will use an app-owned, append-only credit ledger in Convex.

- Stripe confirms subscription payments and one-time refill purchases.
- Convex grants, reserves, commits, releases, expires, and reports credits.
- Every billable output receives its own idempotent reservation.
- A credit is committed only after the promised output is durably saved.
- Failed or canceled work releases its reservation.
- Monthly plan credits are spent before refill credits.
- Monthly credits expire at the end of their Stripe billing period.
- Refill credits expire 12 months after purchase and work only while a paid
  subscription is active.
- Downloading, editing, previewing, retrying the same job, or deleting an asset
  never creates a second charge or a refund.
- Clipr and Swapr videos use a separate combined video allowance, not creation
  credits.

Do not implement credits as one mutable number on a user record. A single
balance cannot safely explain expiration, refill ordering, refunds, concurrent
reservations, or historical support questions.

## Decision Drivers

- Concurrent requests must never overspend an account.
- Stripe webhook retries must never grant credits twice.
- Provider and worker retries must never charge twice.
- Failed work must return the exact reserved amount.
- Monthly and refill credits have different expiration rules.
- Support must be able to explain every balance change.
- Existing browser-local and worker-backed creation paths must share one rule.
- Agency's unlimited stitches must not accidentally make Swipr or photos free.
- Credit enforcement must remain separate from authorization and rate limits.

## Canonical Credit Policy

### Monthly grants

| Plan | Monthly creation credits | Grant expiry |
| --- | ---: | --- |
| Starter | 2,000 | Current Stripe period end |
| Pro | 8,000 | Current Stripe period end |
| Agency | 20,000 | Current Stripe period end |

Monthly credits do not roll over. A successful renewal creates one new grant
for the new Stripe billing period. An old monthly grant expires at its recorded
period end even if unused.

### Refill grants

| Refill | Price | Credits | Grant expiry |
| --- | ---: | ---: | --- |
| Creation-credit refill | $29 | 2,000 | 12 months after confirmed purchase |

Refills are available only to active paid subscribers. A refill does not add
Clipr or Swapr videos and does not extend a subscription.

Monthly credits are consumed first. When more than one refill grant is
available, consume the refill with the earliest expiration first.

If a subscription becomes inactive, refill credits become unavailable. Keep
their immutable grant and ledger history. If the product later decides that a
reactivated subscriber may recover an unexpired refill, that must be approved
and documented before implementation. Do not infer that behavior from Stripe.

During the configured payment-failure grace period, already-granted monthly and
refill credits remain spendable, but the user cannot buy another refill and no
new monthly grant is created without a successful invoice. If the grace period
is disabled before launch, the account becomes inactive immediately instead.

### Operation costs

| Operation | Resource | Cost | Successful output boundary |
| --- | --- | ---: | --- |
| New Starter or Pro stitch | Creation credits | 10 | New `stitches` record and its finished media are durably saved |
| New Agency stitch | Metered event only | 0 | Same boundary, recorded for cost analytics |
| Swipr generation | Creation credits | 20 | New generated `swipes` result is durably saved |
| Standalone avatar photo | Creation credits | 25 | New generated `photoAssets` result is durably saved |
| Standalone AI background | Creation credits | 25 | New generated background asset is durably saved |
| Standalone photo expansion | Creation credits | 25 | New expanded `photoAssets` result is durably saved |
| Clipr video | AI-video allowance | 1 | Final Clipr `videoClips` result is saved and job is completed |
| Swapr video | AI-video allowance | 1 | Final Swapr `videoClips` result is saved and job is completed |
| Clipr required scene still | Included in Clipr | 0 | Never receives a separate creation-credit reservation |

The following actions cost zero credits:

- Stitchr previewing and editing;
- exporting or downloading an existing stitch;
- opening, editing, or reposting an existing Swipr result;
- downloading an existing generated photo or video;
- using an already-owned avatar photo in Clipr;
- uploading user media;
- importing an included Pexels or library asset;
- Hook Lab, clip scoring, metadata analysis, and ordinary Convex writes;
- retries belonging to the same logical generation;
- provider or worker recovery for the same logical generation.

Deleting an output does not return credits. A deliberate regeneration that
creates a new output is a new billable operation.

## Separate AI-Video Allowance

The Clipr and Swapr allowance uses the same reservation lifecycle but a
different resource:

```ts
type UsageResource = "creation_credit" | "ai_video";
```

| Plan | Combined successful Clipr + Swapr videos per period |
| --- | ---: |
| Starter | 3 |
| Pro | 10 |
| Agency | 50 |

Never convert creation credits into AI videos or AI videos into creation
credits. The refill product grants only `creation_credit`.

One Clipr request reserves one `ai_video` before its required scene photo is
generated. That reservation covers the still, avatar motion, voice, lip sync,
music, and final media work for the same Clipr job. Commit only when the final
video is saved. Release the reservation if any required stage fails or the job
is canceled.

One Swapr request reserves one `ai_video` before the first paid provider call.
Commit when the final Swapr video is saved. Release it on terminal failure or
cancellation.

## Considered Designs

### One mutable balance on the entitlement

Rejected. It is simple to display but cannot reliably track monthly expiration,
12-month refills, reservation ownership, webhook duplication, or audit history.

### Stripe usage-based billing

Rejected for the first implementation. Credits are prepaid product capacity,
not postpaid metered invoices. Stripe remains the payment source while Convex
owns runtime usage.

### Deduct only after success

Rejected. Two concurrent requests could both see the same available balance,
complete expensive provider work, and then discover that only one can be
charged.

### Deduct permanently before work

Rejected. It makes failed providers and canceled jobs consume credits and
creates avoidable support disputes.

### Reserve before work, commit on success, release on failure

Selected. It prevents overspending while preserving the promise that only
successful output consumes credits.

## Source of Truth and Projections

The immutable ledger is the audit source. Grant and period totals are
transactional projections used for fast reservation and display.

Every mutation that changes reserved or consumed usage must update all of the
following in one Convex transaction:

1. the affected grant or period projection;
2. the reservation and its allocations;
3. an append-only ledger entry;
4. the related domain job reference when that relationship changes.

Never patch or delete a committed ledger entry. Correct mistakes with a new
compensating adjustment or reversal.

## Convex Data Model

The broader plan architecture already requires `usagePeriods`,
`usageLedgerEntries`, and `usageReservations`. Add the two grant-allocation
tables below so monthly and refill funds can be spent in the correct order.

### `usagePeriods`

One plan-policy snapshot per owner and Stripe billing period:

- `ownerId`
- `periodKey`
- `planKeySnapshot`
- `stripeSubscriptionId`
- `stripeInvoiceId`
- `periodStart`
- `periodEnd`
- `creationCreditsGranted`
- `creationCreditsReserved`
- `creationCreditsConsumed`
- `creationCreditsAdjusted`
- `aiVideosGranted`
- `aiVideosReserved`
- `aiVideosConsumed`
- `aiVideosAdjusted`
- `grantEventId`
- `createdAt`
- `updatedAt`

Required indexes:

- by owner and period key;
- by Stripe subscription and period start;
- by Stripe invoice;
- by period end for expiration and reconciliation.

There must be at most one period for an owner and Stripe subscription period.
Convex indexes are not unique constraints, so the creating mutation must query
with `.unique()` and use a deterministic `periodKey`.

### `creditGrants`

One spendable source of creation credits:

- `ownerId`
- `grantId`
- `grantType`: `monthly`, `refill`, or `support`
- optional `periodKey`
- `amountGranted`
- `amountReserved`
- `amountConsumed`
- `amountRevoked`
- `spendPriority`
- `availableFrom`
- `expiresAt`
- `requiresActiveSubscription`
- `status`: `available`, `exhausted`, `expired`, or `revoked`
- optional `stripeInvoiceId`, `stripePaymentIntentId`, and `stripeChargeId`
- `sourceEventId`
- `createdAt`
- `updatedAt`

Required indexes:

- by owner, status, spend priority, and expiry;
- by grant ID;
- by Stripe payment intent;
- by source event ID;
- by expiry for reconciliation.

Use priority `0` for the current monthly grant, `5` for support grants, and `10`
for refill grants. Within the same priority, spend the grant with the earliest
`expiresAt` first. Every support grant needs an expiry; default it to the
current billing-period end when support does not select a shorter one.

Available amount for one grant is:

```text
amountGranted - amountReserved - amountConsumed - amountRevoked
```

Do not store a separately editable `availableAmount` field.

### `usageReservations`

One reservation per billable output:

- `ownerId`
- `reservationId`
- `idempotencyKey`
- `resource`: `creation_credit` or `ai_video`
- `operation`: `stitch`, `swipr`, `avatar_photo`, `background_photo`,
  `photo_expansion`, `clipr_video`, or `swapr_video`
- `amount`
- `state`: `reserved`, `committed`, `released`, or `expired`
- `planKeySnapshot`
- optional `periodKey`
- optional `batchId`
- `domainKind`
- `domainId`
- optional provider, media, and automation job IDs
- `expiresAt`
- optional `committedAt` and `releasedAt`
- optional release reason
- `createdAt`
- `updatedAt`

Required indexes:

- by owner and state;
- by idempotency key;
- by resource, state, and expiry;
- by domain kind and domain ID;
- by batch ID.

The idempotency key is unique by application contract. Every reserve mutation
must query it with `.unique()` before inserting.

### `usageReservationAllocations`

One row for each grant used by a creation-credit reservation:

- `ownerId`
- `reservationId`
- `grantId`
- `amount`
- `state`: `reserved`, `committed`, or `released`
- `createdAt`
- `updatedAt`

Required indexes:

- by reservation ID;
- by grant ID and state;
- by owner and reservation ID.

AI-video reservations allocate directly to the active `usagePeriods` record and
do not create grant-allocation rows.

### `usageLedgerEntries`

Append-only events:

- `ownerId`
- `ledgerEntryId`
- `idempotencyKey`
- `resource`
- `entryType`: `grant`, `reserve`, `commit`, `release`, `expire`, `adjust`,
  `revoke`, or `reverse`
- positive `quantity`
- signed `availableDelta`
- signed `reservedDelta`
- signed `consumedDelta`
- optional `periodKey`, `grantId`, and `reservationId`
- `operation`
- `domainKind`
- optional `domainId` and `batchId`
- `source`: `stripe_webhook`, `user_action`, `worker`, `reconciler`, or
  `support`
- optional support actor and reason
- `createdAt`

Required indexes:

- by owner and creation time;
- by idempotency key;
- by reservation ID;
- by grant ID;
- by Stripe source identifiers when present.

Use these delta conventions:

| Entry | Available delta | Reserved delta | Consumed delta |
| --- | ---: | ---: | ---: |
| Grant 10 | +10 | 0 | 0 |
| Reserve 10 | -10 | +10 | 0 |
| Commit 10 | 0 | -10 | +10 |
| Release 10 | +10 | -10 | 0 |
| Expire or revoke 10 unused | -10 | 0 | 0 |

Adjustments and reversals record the actual signed effect in each projection.
Keep `entryType` and positive `quantity` so a support timeline does not have to
infer the business event from delta signs alone.

## Grant Creation

### Initial subscription and renewal

Create the period and monthly credit grant only from a verified Stripe event
that proves payment for the relevant period.

Use a deterministic idempotency key:

```text
monthly-grant:{stripeSubscriptionId}:{periodStart}
```

The mutation must:

1. map the Stripe Price ID through the server allowlist;
2. derive the plan and period from synchronized Stripe data;
3. return the existing period if its key already exists;
4. create the immutable plan-policy snapshot;
5. create exactly one monthly `creditGrants` row;
6. grant the plan's AI-video allowance in `usagePeriods`;
7. append grant ledger entries;
8. expire any previous monthly grant whose period has ended.

Do not grant from the Checkout success redirect. Do not grant from
client-supplied plan metadata.

### Credit refill

Create a refill grant only after a verified, successful one-time Stripe
payment. Use:

```text
refill-grant:{stripePaymentIntentId}
```

Before granting, verify that:

- the Price ID is the allowlisted $29 refill Price;
- the Stripe customer maps to the authenticated ClipStitchr owner;
- the owner has an active paid entitlement;
- the payment is successful and not already granted.

Set `amountGranted` to 2,000, `availableFrom` to the confirmed-payment time,
`expiresAt` to exactly 12 months later, and
`requiresActiveSubscription` to `true`.

Do not add any AI-video allowance. Do not extend the current billing period.

### Upgrade and downgrade

The general plan architecture intentionally leaves proration timing for final
business approval. The credit implementation must isolate that policy in one
function instead of embedding it in webhook handlers.

Required interface:

```ts
getPlanChangeCreditAdjustment(previousPlan, nextPlan, period, effectiveAt)
```

Until the policy is approved, do not grant an upgrade difference in production.
Downgrades scheduled for the next renewal require no current-period credit
reduction. Never revoke already-consumed monthly credits because of a plan
change.

## Reservation Algorithm

All balance checks and reservations happen in one authenticated Convex mutation.

For a creation-credit operation:

1. Resolve `ownerId` from Clerk or the trusted worker-owned domain record.
2. Verify the entitlement is active or in an explicitly allowed grace state.
3. Look up the reservation by idempotency key.
4. If it exists, return its current state without allocating again.
5. Load eligible grants ordered by `spendPriority`, then `expiresAt`.
6. Exclude expired, revoked, exhausted, future, and subscription-ineligible
   grants.
7. Calculate each grant's unreserved amount.
8. If the total is below the operation cost, throw a structured insufficient-
   credit error without creating the domain job.
9. Create the reservation and one or more allocation rows.
10. Increment `amountReserved` on each selected grant.
11. Append reserve ledger entries.
12. Create or link the domain job in the same mutation whenever possible.

For an AI-video operation, use the same flow against the active period's
`aiVideosGranted`, `aiVideosReserved`, `aiVideosConsumed`, and
`aiVideosAdjusted` totals.

Do not read a balance in a Next.js route and reserve later. That creates a race.

## Commit Algorithm

Commit only from the mutation that durably saves the promised output or from an
atomic helper called inside that mutation.

1. Load the reservation by idempotency key or reservation ID.
2. Verify that it belongs to the domain output being saved.
3. If already committed, return success without changing totals.
4. If released or expired, attempt the documented late-finalization recovery.
5. For each creation-credit allocation, move the amount from reserved to
   consumed on its grant.
6. Mark allocation rows and the reservation committed.
7. Append commit ledger entries.
8. Save the domain output and committed reservation relationship atomically.

For AI-video usage, move one unit from reserved to consumed in the period.

The application must never commit because a provider prediction says
`succeeded` if the final asset has not been persisted successfully.

## Release Algorithm

Release on terminal failure, user cancellation before completion, rejected
provider output that produces no deliverable, or abandoned browser work.

1. Load the reservation.
2. If committed or already released, return its current state.
3. Decrement each grant or period reserved total.
4. Mark allocations and reservation released.
5. Append release ledger entries with a stable reason.

A retry of the same logical job reuses the released reservation only by
atomically reacquiring the required usage. A new user-requested regeneration
uses a new idempotency key and a new reservation.

## Expiration and Recovery

Reservation expiry makes work eligible for reconciliation. It must not blindly
release a reservation while a domain job can still complete.

Initial policy constants:

- browser-local Stitchr reservation: 2 hours;
- queued or worker-backed creation reservation: 24 hours;
- extend a running worker-backed reservation from the job heartbeat;
- reconcile expired candidates at least every 15 minutes.

The reconciler must inspect the domain job:

- completed output with reserved usage: commit;
- terminal failed or canceled job: release;
- active job with a valid lock or heartbeat: extend;
- missing or abandoned job: release and alert if provider spend occurred;
- inconsistent committed output and released reservation: alert and place the
  output in billing-review state.

If a browser finishes after its reservation was released, the final save may
atomically reacquire credits. If reacquisition fails, do not create the stitch
record. Clean up any orphaned upload through the existing R2 compensation path.

## Idempotency Keys

Keys identify one logical output, not one HTTP request or worker attempt.

```text
stitch:{ownerId}:{stitchId}
stitch-batch:{ownerId}:{batchRunId}:{outputId}
stitch-daily:{ownerId}:{automationTaskId}:{outputId}
swipr:{ownerId}:{swipeId}
avatar-photo:{ownerId}:{photoId}
background-photo:{ownerId}:{photoId}
photo-expansion:{ownerId}:{photoId}
clipr-video:{ownerId}:{cliprJobId}
swapr-video:{ownerId}:{swaprJobId}
```

Provider prediction IDs and Cloud Run attempt IDs are not billing idempotency
keys because they can change during retry.

## Domain Reservation References

Add an optional `usageReservationId` to every billable domain record during the
shadow rollout, then require it when enforcement is enabled:

- `stitches` for a newly created billable stitch;
- `swipes` for a generated Swipr result;
- `photoAssets` for a standalone generated photo;
- `cliprJobs` for the Clipr AI-video reservation;
- the final Swapr-owned `videoClips` or its source job;
- `providerJobs`, `mediaJobs`, and `automationTasks` when they carry the work.

Also store `usageReservationId` on the unified queue entry described in the
parent plan architecture. The same reservation ID must survive provider retry,
media handoff, worker recovery, and final output persistence.

A domain record may reference only one reservation for its promised output. A
batch contains separate output records and separate reservations joined by
`batchId`.

## Tool Integration Map

### Manual Stitchr, Normal, and Longr

- Reserve 10 credits before rendering or uploading the new finished stitch.
- Pass the reservation ID through the browser export session and save request.
- Commit inside `web/convex/stitches.ts` only on the new-record branch.
- Updating an existing stitch must not reserve or commit again.
- Exporting or downloading a saved stitch is free.
- Agency still creates an idempotent zero-cost usage event for analytics.

### Stitchr batch

- Create one 10-credit reservation per planned output, not one irreversible
  charge for the whole batch.
- A batch of 10 attempts reserves 100 credits across 10 reservations.
- Commit each output independently when `saveFromMediaWorker` inserts its new
  stitch.
- Release only the failed or canceled output reservations.
- The existing task/output idempotency key in `web/convex/stitchrBatch.ts`
  should be the basis for the billing key.

### Daily-draft Stitchr

- Reserve 10 credits for every stitch task before it enters paid execution.
- Three successful daily stitches consume 30 credits.
- Commit in the same successful save path used by manual and batch Stitchr.
- Release failed, skipped, or canceled tasks.
- Do not create tasks that cannot reserve usage.
- Agency daily stitches create zero-cost usage events.

### Swipr

- Reserve 20 credits before the first generated-copy or generated-asset step.
- Commit only when a new generated swipe is inserted in `web/convex/swipes.ts`.
- `save`, `saveFromAutomation`, and `saveFromProvider` must share the same
  atomic commit helper.
- Editing or saving the same swipe ID again does not charge again.
- Imported library backgrounds do not consume credits by themselves.

### Standalone photos

- Reserve 25 credits per requested output before creating the provider job.
- The route at `web/app/api/avatars/photos/generate/route.ts` must call a Convex
  mutation that reserves and creates the provider job atomically.
- Commit when the new generated asset is inserted through
  `web/convex/photoAssets.ts`.
- `save`, `saveFromAutomation`, and `saveFromProvider` must use the shared
  commit helper when the source is billable generation.
- User uploads and included library imports are free.
- A multi-image request uses one reservation per requested image so partial
  success commits only successful outputs.

### Clipr

- Reserve one AI-video unit in `cliprJobs.createQueued`,
  `createQueuedFromAutomation`, or `createQueuedFromProvider` before work starts.
- Do not create a separate 25-credit reservation for the required scene still.
- Store the AI-video reservation ID on the Clipr job or its unified queue entry.
- Commit in `finalizeWithClip` or `finalizeWithClipFromMediaWorker` when the
  final `videoClips` record and completed Clipr state are saved.
- Every Clipr fail and cancel mutation must release the same reservation.

### Swapr

- Reserve one AI-video unit before the first provider job is created.
- Store the reservation through provider and `swapr-finalization` media jobs.
- Commit only when the final swap `videoClips` asset is saved.
- Release on terminal provider failure, media-finalization failure, or user
  cancellation.
- A provider or media retry reuses the original reservation.

## Required Atomic Implementation Files

Exact paths may adapt to nearby repository structure, but keep each purpose in
one file.

### Types and policy

```text
web/lib/clipstitchr/usage/types/UsageResource.ts
web/lib/clipstitchr/usage/types/CreditGrantType.ts
web/lib/clipstitchr/usage/types/UsageOperation.ts
web/lib/clipstitchr/usage/types/UsageReservationState.ts
web/lib/clipstitchr/usage/creationCreditCosts.ts
web/lib/clipstitchr/usage/getCreationCreditCost.ts
web/lib/clipstitchr/usage/getUsageReservationExpiry.ts
web/lib/clipstitchr/usage/createUsageIdempotencyKey.ts
```

Reuse or move the existing pricing constants so marketing and enforcement read
one canonical policy. Never maintain a second hand-copied cost table.

### Grants and periods

```text
web/convex/usage/grantMonthlyAllowance.ts
web/convex/usage/grantCreditRefill.ts
web/convex/usage/expireCreditGrants.ts
web/convex/usage/getEligibleCreditGrants.ts
web/convex/usage/getCurrentUsagePeriod.ts
web/convex/usage/getPlanChangeCreditAdjustment.ts
```

### Reservations and ledger

```text
web/convex/usage/reserveCreationCredits.ts
web/convex/usage/reserveAiVideo.ts
web/convex/usage/commitUsageReservation.ts
web/convex/usage/releaseUsageReservation.ts
web/convex/usage/reacquireUsageReservation.ts
web/convex/usage/appendUsageLedgerEntry.ts
web/convex/usage/reconcileExpiredUsageReservations.ts
```

### Read models and support

```text
web/convex/usage/getCurrentUsage.ts
web/convex/usage/getUsageHistory.ts
web/convex/usage/applyCreditAdjustment.ts
web/convex/usage/revokeCreditGrant.ts
web/convex/usage/getUsageSupportDetail.ts
```

### Domain integration helpers

```text
web/convex/usage/commitStitchUsage.ts
web/convex/usage/commitSwiprUsage.ts
web/convex/usage/commitPhotoUsage.ts
web/convex/usage/commitCliprVideoUsage.ts
web/convex/usage/commitSwaprVideoUsage.ts
```

Domain save mutations call these focused helpers inside the same Convex
transaction. Do not add credit math directly to every save file.

## User-Facing Read Model

`getCurrentUsage` should return only owner-safe display data:

```ts
type CurrentUsage = {
  planKey: "starter" | "pro" | "agency";
  entitlementState: "active" | "grace" | "inactive";
  creationCredits: {
    available: number;
    reserved: number;
    monthlyRemaining: number;
    refillRemaining: number;
    monthlyResetsAt: string;
    nextRefillExpiryAt?: string;
  };
  aiVideos: {
    consumed: number;
    reserved: number;
    limit: number;
    resetsAt: string;
  };
};
```

Display `available` as the amount the user can start spending now. Reserved
credits may be shown separately as `In use` when jobs are active. Do not show a
balance that includes expired, revoked, future, or inactive-subscription refill
grants.

Suggested plain-language errors:

- `You need 10 credits to create this stitch. You have 6 available.`
- `Your current plan includes 10 Clipr or Swapr videos this month.`
- `These credits are already being used by a generation in progress.`
- `Your subscription needs attention before you can use refill credits.`

## Error Contract

Use structured server codes so browser, CLI, automation, and workers behave the
same way:

```text
SUBSCRIPTION_REQUIRED
SUBSCRIPTION_INACTIVE
INSUFFICIENT_CREATION_CREDITS
AI_VIDEO_ALLOWANCE_REACHED
USAGE_RESERVATION_EXPIRED
USAGE_RESERVATION_CONFLICT
USAGE_RECONCILIATION_REQUIRED
```

Entitlement exhaustion is not a rate limit. Do not return `429` for it. Keep
rate-limit errors and plan-limit errors distinct.

The error payload may include the required amount, currently available amount,
period reset time, and refill availability. It must not expose ledger rows,
Stripe IDs, or another owner's information.

## Refunds, Disputes, and Support Adjustments

### Refill refund or dispute

- Locate the grant by Stripe payment intent or charge.
- Revoke its unused amount idempotently.
- Never rewrite its original grant or committed-spend entries.
- If consumed credits exceed the amount that can be revoked, set a billing
  review flag and prevent further credit spending until support resolves it.
- Do not create a negative user-visible available balance.

### Subscription refund or chargeback

- Follow the entitlement decision in the parent billing architecture.
- Revoke remaining current-period monthly credits when access becomes inactive.
- Preserve committed usage and completed assets for audit and policy handling.
- Do not silently delete user assets as a credit operation.

### Support credit

Support adjustments require:

- authenticated support authorization;
- signed whole-credit amount;
- reason;
- ticket or incident reference;
- idempotency key;
- expiration, defaulting to the current billing-period end;
- recorded actor and timestamp.

Use a support grant for added spendable credits. Use a compensating ledger entry
and grant revocation for removal. Never directly edit a displayed balance.

## Security and Abuse Protection

- Derive the owner from Clerk for user actions.
- Trusted worker mutations must derive the owner and reservation from the
  server-owned domain job, not worker-supplied arbitrary IDs.
- Verify Stripe signatures before processing grants or revocations.
- Allowlist every Stripe Price ID.
- Rate-limit refill Checkout creation per owner and globally.
- Keep provider, generation, R2, and Convex rate limits in addition to credits.
- Validate reservation ownership again at commit and release.
- Never accept credit cost, plan, grant, balance, or allowance from the browser.
- Never expose Stripe secrets or internal ledger details to the client.
- Update `docs/operations/security/rate-limits.md` with every new action and
  enforcement point.

## Observability and Reconciliation

Track by plan, operation, and result:

- credits granted, reserved, committed, released, expired, and revoked;
- AI videos reserved, committed, and released;
- reservation age and expiry;
- refill purchase-to-grant webhook delay;
- duplicate idempotency hits;
- late-finalization reacquisition;
- ledger versus projection mismatch;
- grants with negative calculated availability;
- completed output without committed usage;
- committed usage without a durable output;
- support adjustments and billing-review holds.

Run a scheduled reconciliation that independently recalculates grant and period
totals from ledger and reservation records. It should alert first. Automatic
repair must use compensating entries and must never edit history silently.

## Migration and Rollout

### Phase 1: Schema and policy

- Add validators, tables, indexes, and canonical costs.
- Add read-only support diagnostics.
- Keep enforcement disabled.

### Phase 2: Shadow ledger

- Create shadow periods and grants for internal test accounts.
- Calculate every reservation, commit, and release without blocking work.
- Compare expected usage with actual saved outputs.
- Cover manual, batch, daily automation, CLI, provider-worker, and media-worker
  paths.

### Phase 3: Stripe test mode

- Grant monthly credits from paid test invoices.
- Grant refills from test PaymentIntents.
- Test duplicate, delayed, and out-of-order webhooks.
- Test refund, dispute, cancellation, and reactivation handling.

### Phase 4: Enforce one surface at a time

Recommended order:

1. standalone avatar and photo generation;
2. Swipr;
3. manual Stitchr;
4. Stitchr batch and daily drafts;
5. Clipr allowance;
6. Swapr allowance;
7. CLI and every retry/recovery path.

Do not enable a surface until all of its create, success, failure,
cancellation, retry, and recovery paths carry the same reservation.

### Phase 5: Production billing

- Backfill no artificial paid balance from the old speed-tier setting.
- Give approved beta accounts explicit expiring support grants or entitlement
  overrides.
- Enable live Stripe grants behind a feature flag.
- Monitor reconciliation and support views before broad rollout.

Rollback may disable new enforcement and reservations. It must not delete
periods, grants, reservations, or ledger history.

## Verification Requirements

### Grants

- Starter, Pro, and Agency receive exactly 2,000, 8,000, and 20,000 credits.
- One paid Stripe period creates one monthly grant exactly once.
- Monthly grants expire at period end and do not roll over.
- One paid refill grants exactly 2,000 credits once.
- Refill credits expire exactly 12 months after purchase.
- Monthly credits are selected before refill credits.
- Earlier-expiring refills are selected before later-expiring refills.
- Refill grants never increase AI-video allowance.
- Checkout redirects and unsigned webhooks cannot grant credits.

### Reservations

- Concurrent requests cannot reserve more than the available amount.
- A duplicate idempotency key returns the original reservation.
- Allocation across multiple grants preserves exact totals.
- Failed and canceled work returns every reserved allocation.
- A worker retry does not create a new charge.
- Reservation reconciliation does not release an active heartbeating job.
- Late completion cannot silently create an unbilled output.

### Stitchr

- One new Starter or Pro stitch commits 10 credits.
- Updating, exporting, or downloading it commits zero additional credits.
- Ten successful batch outputs commit 100 credits.
- A ten-output batch with seven successes commits 70 and releases 30.
- Three successful daily drafts commit 30 credits.
- Agency stitches commit zero credits but record usage metrics.

### Swipr and photos

- One new Swipr generation commits 20 credits.
- Editing the same Swipr result does not charge again.
- One standalone generated photo commits 25 credits.
- User-uploaded and included library photos cost zero.
- Partial multi-photo success commits only successful outputs.

### Clipr and Swapr

- Clipr and Swapr share the plan's 3, 10, or 50 video allowance.
- Clipr's required scene still creates no credit reservation.
- Existing avatar photos do not charge again when used by Clipr.
- A final saved video commits one allowance unit.
- Failure or cancellation releases the unit.
- Provider and media retries do not consume another unit.

### Adjustments and display

- Deleting an output does not refund usage.
- Support adjustments are append-only and attributed.
- Refill refunds revoke only available grant value automatically.
- Displayed available, reserved, monthly, and refill totals match ledger state.
- Inactive subscription refill credits are excluded from available balance.
- Ledger and projection reconciliation produces no unexplained difference.

## Launch Gates

Do not enable credit enforcement until:

- all expensive creation paths reserve before work;
- all terminal paths commit or release idempotently;
- Stripe grants are signed and idempotent;
- monthly and refill expiration tests pass;
- batch partial-success tests pass;
- Clipr required photos are proven not to double-charge;
- support can inspect grants, reservations, ledger, and related domain jobs;
- scheduled reconciliation and alerts are running;
- rate-limit documentation is current;
- the Terms and pricing copy match the implemented behavior;
- the unresolved upgrade-proration and reactivation policies are approved.

## Consequences

### Positive

- Users pay only for successful promised output.
- Concurrent work cannot overspend credits or video allowance.
- Monthly and refill expiration remain explainable.
- Retries, webhooks, and workers are safely idempotent.
- Support can trace every credit from purchase to output.
- The same rules cover browser, automation, CLI, and workers.

### Negative

- Every generation path must carry a reservation ID end to end.
- Grant allocations and projections add schema and reconciliation work.
- Browser-local Stitchr needs expiry and orphan-upload handling.
- Support requires billing-review and adjustment tools.

### Risks and Mitigations

- **Double charge:** Use one logical-output idempotency key across all retries.
- **Overspend:** Reserve and create the domain job in one Convex mutation.
- **Lost credits after failure:** Release from every terminal path and reconcile.
- **Double grant:** Key Stripe grants by subscription period or PaymentIntent.
- **Incorrect refill ordering:** Allocate monthly first, then earliest expiry.
- **Clipr photo double-charge:** Carry only the Clipr AI-video reservation.
- **Projection drift:** Recalculate from immutable records and alert.
- **Late browser save:** Reacquire atomically or reject and clean orphaned media.

## Decisions Still Requiring Approval

The agreed credit policy is implementable as written. These two edge policies
remain tied to unresolved billing decisions in the parent architecture:

- whether a mid-period paid upgrade grants prorated incremental credits;
- whether an unexpired refill becomes available again after a canceled account
  later starts a new paid subscription.

Keep both behind focused policy functions. Do not let webhook handlers or UI
code choose the behavior implicitly.
