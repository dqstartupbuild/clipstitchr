# Workpool Evaluation

Reviewed: 2026-05-22

## Initial Request And Instructions

The request was to evaluate whether ClipStitchr can benefit from the Convex
Workpool component, without implementing it yet. If useful, create a Markdown
document explaining the recommendation; otherwise, say no and explain why.

No package has been installed and no application code has been changed.

## Component Evaluated

- Package: `@convex-dev/workpool`
- Current npm latest verified on 2026-05-22: `0.4.6`
- Current alpha tag verified on 2026-05-22: `0.4.7-alpha.1`
- Peer dependencies shown by npm: `convex ^1.31.7` and
  `convex-helpers ^0.1.94`
- ClipStitchr currently uses `convex ^1.38.0`, which satisfies the Convex peer
  range. `convex-helpers` is not currently listed in `web/package.json`, so an
  implementation should confirm whether npm installs it automatically or add it
  explicitly.

Workpool is a Convex component for running Convex actions, mutations, and
queries through named queues with configurable parallelism. It supports action
retries with backoff and jitter, completion callbacks, cancellation, status
queries, and monitoring logs.

## Decision

Yes. ClipStitchr can benefit from Workpool, and it is more directly useful to
the current backend direction than the Agent component.

The best use is not the current browser-local Stitchr or Longr export path.
The best use is provider orchestration and finalization: Clipr provider steps,
Swipr background generation, avatar photo generation, private sound imports,
Swapr finalization, provider recovery jobs, and future autopilot tasks.

Workpool should be treated as queue and concurrency infrastructure. It should
not become the source of truth for ClipStitchr job state. The app should keep
durable domain job records such as `cliprJobs`, `replicateJobs`, and any future
`providerJobs`, `automationRuns`, `automationTasks`, or `mediaJobs`. Store the
Workpool work ID on those records when useful, then use Workpool status as
execution metadata.

## Why It Fits ClipStitchr

ClipStitchr already has the exact problem Workpool is designed to reduce:
paid, slow, third-party provider work competes with user-facing requests unless
it is moved into controlled queues.

Existing docs identify several fragile paths:

- `docs/operations/reliability/durable-workflows.md` says provider work must not depend on the
  browser staying open.
- `docs/operations/automation/provider-workflows.md` calls for provider tasks,
  finalizers, retries, queueing, and future autopilot runs.
- `docs/operations/security/rate-limits.md` already gates expensive surfaces before
  provider calls.
- `web/convex/cliprJobs.ts` has durable user-facing Clipr job state, but the
  provider orchestration still runs through route-local server helpers.
- `web/convex/replicateJobs.ts` records Swapr and avatar photo prediction
  status, but it does not yet own full server-side finalization.

Workpool fits between rate-limited job creation and provider execution:

```text
User starts expensive work
  -> authenticate and authorize
  -> consume user and global rate limits
  -> create or update durable ClipStitchr job record
  -> enqueue idempotent provider/finalizer action into a Workpool
  -> action calls provider or copies output to R2
  -> onComplete updates the durable job record
  -> UI observes ClipStitchr job state from Convex
```

## Best First Uses

### Provider finalization pool

Create a low-to-moderate concurrency pool for copying completed provider
outputs into R2 and creating final Convex records. This is the safest first
adoption because finalizers can be made idempotent around fields like
`finalizedAt`, final asset IDs, output object keys, and provider prediction IDs.

Good candidates:

- Avatar photo output copy and `photoAssets` creation.
- Swipr generated background copy, metadata persistence, and
  `swiprBackgrounds.save` equivalent.
- Private sound upload/import object copy to owner R2 prefixes.
- Swapr output copy and creation of a final UGC-style clip.

### Clipr provider pool

Clipr currently performs multiple provider steps in one request-owned flow:
hook/script generation, avatar still generation, avatar video generation, and
optional sound selection. Workpool can split those into idempotent actions
with bounded provider concurrency.

This would reduce the chance that a burst of Clipr jobs overwhelms Replicate or
starves other app traffic.

### Autopilot task pool

Future autopilot should enqueue per-user tasks rather than doing all provider
work inside a daily planner. Workpool is a good fit for early autopilot because
it can bound concurrency and provide retry behavior without introducing Cloud
Tasks immediately.

If autopilot becomes large or needs external runtimes, Cloud Tasks and Cloud
Run may still be the stronger production executor. Workpool can still be used
for the Convex-side planner and dispatch layer.

### Worker launch coalescing

Workpool should not run video encoding. Convex Actions have execution limits,
and ClipStitchr's media docs correctly point toward a separate worker for
FFmpeg-style work.

Workpool can still help with a small dispatch action that coalesces or throttles
Cloud Run Job launches after media jobs are created. The actual encoding should
remain in the external worker.

## What It Does Not Solve

Workpool does not replace rate limits. ClipStitchr still needs the Convex Rate
Limiter component and the documented per-user/global limits before provider
calls, signed URL creation, R2 writes, and expensive job creation.

Workpool does not replace authorization. Ownership checks must still happen
before enqueueing work and again before finalizing outputs.

Workpool does not make non-idempotent actions safe. Retry should be disabled by
default and enabled only for actions that can safely run more than once. For
provider calls, that means storing provider IDs, idempotency keys, output object
keys, and final asset IDs before or during each step so retries return existing
results instead of creating duplicates.

Workpool does not provide full step-level workflow replay by itself. If one
large action performs four provider calls and fails on the fourth, retrying the
action retries the whole action unless the action is carefully idempotent. For
long multi-step flows, either keep explicit step state in ClipStitchr tables or
evaluate Convex's Workflow component later. Convex's Workflow component builds
on Workpool and is aimed at resumable multi-step execution.

Workpool should not run heavy media rendering. Server-side video rendering
belongs in the planned media worker, Cloud Run Job, Cloudflare Container, or
similar runtime.

Workpool status should not be the only user-facing job state. By default,
Workpool status has a retention TTL. ClipStitchr needs durable product state
for completed, failed, skipped, recovered, and finalized assets.

## Recommended Adoption Shape

Use a small number of named pools rather than one pool per feature:

- `providerWorkpool`: low concurrency for paid provider calls.
- `providerFinalizerWorkpool`: moderate concurrency for output copies and
  database finalization.
- `automationWorkpool`: low concurrency for future autopilot tasks.
- Optional `maintenanceWorkpool`: low concurrency for recovery and cleanup.

Do not create many pools. The Workpool README calls out component overhead, and
ClipStitchr does not need a separate queue for every route.

Set `retryActionsByDefault: false` at first. Enable retry per action only after
the action has an explicit idempotency contract.

Use `onComplete` to patch ClipStitchr's durable job records, not to hide
business state inside the Workpool component.

Store useful execution fields on the app job record:

- `workId`
- `providerPredictionId`
- `idempotencyKey`
- `attempt`
- `stage`
- `status`
- `outputObjects`
- `finalAssetIds`
- `error`
- `completedAt`
- `finalizedAt`

## Rollout Plan

1. Pick one non-media provider finalization flow as the pilot. Swipr generated
   background finalization or avatar photo finalization are good candidates.
2. Add the Workpool component to `web/convex/convex.config.ts` with one
   finalizer pool.
3. Create one internal action that can safely retry or safely no-op when the
   final asset already exists.
4. Add an `onComplete` mutation that updates the relevant ClipStitchr job
   record with success, failure, or cancellation.
5. Keep all existing rate-limit checks before enqueueing and before expensive
   provider calls.
6. Add focused tests for idempotency, duplicate completion, retryable failure,
   permanent failure, and canceled work.
7. Update `docs/operations/security/rate-limits.md` when the implementation changes
   enforcement points, active job caps, retry behavior, or environment
   variables.

## Current Repo Note

`docs/operations/media/server-side-processing.md` describes `mediaJobs` and a media
worker as current implementation pieces, but the inspected working tree does
not currently include `web/convex/mediaJobs.ts`, media job validators, a
`web/services/media-worker` entry point, or a `media-worker` script in
`web/package.json`. Before implementing Workpool around media dispatch,
reconcile that documentation with the active branch.

This does not change the Workpool recommendation. It means the first Workpool
pilot should target provider/finalizer work that already has visible job tables
or can get a narrow job table as part of the implementation.

## Recommendation

Adopt Workpool when the next backend task is moving paid provider work out of
request-owned or browser-owned flows.

It should come before the Agent component, because it addresses current
reliability and cost-control problems. It can also support later RAG, LLM
cache, or Agent workflows by providing bounded execution for provider calls.

It should not be installed just to have a queue. Install it when there is a
specific idempotent provider action or finalizer ready to move behind a pool.

## Sources

- npm package: https://www.npmjs.com/package/@convex-dev/workpool
- GitHub repository: https://github.com/get-convex/workpool
- Convex component page: https://www.convex.dev/components/workpool
- Convex components usage docs: https://docs.convex.dev/components/using
- Convex actions docs: https://docs.convex.dev/functions/actions
- Convex workflows docs: https://docs.convex.dev/agents/workflows
