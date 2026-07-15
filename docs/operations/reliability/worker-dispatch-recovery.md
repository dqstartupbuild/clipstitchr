# Worker Dispatch Recovery

ClipStitchr provider and media workers use coalesced Convex dispatch instead of
an always-on 10-minute Cloud Scheduler sweep.

## Current Model: Coalesced Follow-Up And Delayed Recovery

When provider or media work is created, Convex writes the durable job first, then
requests a Cloud Run Job launch through `web/convex/workerLaunch.ts`.

The launch request does three things:

1. Schedules the primary Cloud Run launch immediately, unless another launch for
   the same worker was requested within the last 15 seconds.
2. When an immediate launch is coalesced, schedules a short 3-second follow-up
   launch unless one was already requested in the same coalescing window.
3. Schedules one delayed recovery launch 10 minutes after the primary launch
   target, unless a recovery launch for the same worker was requested within the
   last 10 minutes.

The coordination record lives in the `workerLaunchState` table and stores:

- `lastRequestedAt`: last immediate launch request used for 15-second
  coalescing.
- `lastCoalescedFollowupRequestedAt`: last short follow-up request used to keep
  coalesced one-shot workers from waiting for the recovery window.
- `lastRecoveryRequestedAt`: last delayed recovery request used for 10-minute
  recovery coalescing.

Delayed provider follow-ups, such as polling after a provider prediction is
created, still use their explicit delay. Their recovery launch is scheduled 10
minutes after that delayed launch target.

Hook Lab uses this explicit path for asynchronous Apify Actor runs. While the
Actor is nonterminal, the provider worker stores the run and dataset IDs,
releases its claim lock, and calls `providerJobs.markProviderStatus` with a
30-second `continuationDelayMs`. Convex bounds explicit continuation delays to
1 second through 10 minutes. Correctness remains in the durable provider job;
the worker process does not sleep while waiting for Apify.

Before starting an Actor, Hook Lab atomically records
`providerRunRequestedAt`. Recovery always reuses a recorded run and treats an
ambiguous start response as operator-visible failure instead of risking a
second paid Actor start. An explicit user retry may clear the marker. Generated
writing, image, and video object checkpoints similarly let reclaimed Idea-use
jobs resume after their last completed provider step.

## Queue Drain Behavior

Cloud Run worker jobs run bounded batches with `--once --max-jobs=3`. A bounded
batch keeps one execution from monopolizing provider spend or media processing.

If a worker exits because it processed exactly `maxJobs`, it asks Convex for a
continuation launch through a worker-secret-only mutation:

- Media: `web/convex/mediaWorkerLaunch.ts`
- Provider: `web/convex/providerWorkerLaunch.ts`

Continuation launches are delayed by `workerContinuationDelayMs` in
`web/convex/workerContinuationDelayMs.ts`. This gives large bursts a controlled
drain path without waking workers all day when no jobs exist.

## What This Recovers

- Missed dispatches: the immediate Cloud Run launch failed, timed out, or was
  skipped during a deploy or transient platform issue.
- Stale locks: a worker claimed a job, then crashed or timed out before marking
  it complete or failed.
- Queued leftovers: a bounded worker run hit `maxJobs` while more work was
  likely still queued.

Correctness still comes from Convex job claiming. Overlapping Cloud Run
executions are safe because each worker must atomically claim queued or stale
running work before processing it.

## Operational Guidance

After this model is deployed, the every-10-minute Cloud Scheduler worker sweep is
no longer the primary recovery path. It can be paused, deleted, or changed to a
slow disaster-recovery sweep such as hourly or every six hours.

Keep a slow sweep only if you want an external safety net for rare cases where
Convex scheduled functions or Cloud Run dispatch are unavailable for an extended
period. Manual user actions should not wait for that sweep.

## Source References

```text
web/convex/workerLaunch.ts
web/convex/schema.ts
web/convex/mediaWorkerLaunch.ts
web/convex/providerWorkerLaunch.ts
web/convex/workerContinuationDelayMs.ts
web/services/media-worker/runMediaWorker.mjs
web/services/provider-worker/runProviderWorker.ts
web/services/provider-worker/hookLab/waitForHookLabApifyRun.ts
```

## Future Option: Queue-Based Dispatch

A larger-scale future shape can replace Convex scheduled launch requests with a
dedicated queue system such as Google Cloud Tasks, Pub/Sub, or a Cloud Run
service with push-based work delivery.

Possible Cloud Tasks shape:

1. Next.js or Convex creates the durable provider or media job.
2. The backend enqueues a Cloud Tasks message containing only a job ID, worker
   kind, and idempotency key.
3. Cloud Tasks calls a private Cloud Run service endpoint.
4. The service claims the job from Convex, processes one bounded unit of work,
   and returns success only after the job state is safely updated.
5. Cloud Tasks owns retry timing, exponential backoff, dead-letter handling, and
   rate limits.

Possible Pub/Sub shape:

1. Job creation publishes a message to a provider or media topic.
2. A Cloud Run service subscribed to the topic receives push messages.
3. The service claims the Convex job before doing any expensive work.
4. Pub/Sub retries unacknowledged messages and can route repeated failures to a
   dead-letter topic.

Benefits:

- Better high-volume dispatch than scheduled sweeps.
- Native retry and backoff controls.
- Clear dead-letter queues for repeated failures.
- Easier per-worker concurrency control.
- Less custom continuation logic in the worker scripts.

Tradeoffs:

- More infrastructure to deploy, secure, and monitor.
- Requires private Cloud Run service endpoints or IAM-authenticated push
  handlers.
- Requires strict idempotency because queues can deliver messages more than
  once.
- Convex still needs to remain the source of truth for job state, ownership,
  attempts, locks, and completed outputs.

Migration triggers:

- Worker queues regularly exceed what bounded continuation launches can drain.
- Cloud Run Job startup overhead becomes a meaningful part of latency.
- You need richer retry policies, dead-letter queues, or per-worker concurrency
  limits.
- Provider or media workloads need separate scaling policies by job type.

Before migrating, keep the existing Convex job tables and claim mutations. The
queue should replace launch orchestration, not the durable job ledger.
