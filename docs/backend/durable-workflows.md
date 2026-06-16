# Durable Media Workflows

ClipStitchr must treat long-running media work as durable jobs, not as client
component state. A user should be able to navigate within the dashboard,
refresh, close the tab, or temporarily lose network without losing completed
external work.

## Current Failure Mode

The app still has two kinds of work:

- Worker-owned work: manual Swapr, manual Clipr, video upload normalization plus
  analysis, avatar photo generation, and daily automation now create durable
  Convex jobs before provider/media work starts.
- Browser/request-owned work: photo preparation, legacy image analysis, Swipr
  background generation/analysis, standalone text suggestions, existing-asset
  music regeneration, product enrichment, Swapr photo expansion, and Stitchr
  composition still depend on the current request or browser session.

The fragile part is the handoff after a provider finishes. If Replicate succeeds
but the browser refreshes before the client downloads the output, uploads it to
R2, and saves the Convex record, the prediction can be visible in Convex while
the user-facing asset never appears in the library.

Replicate API outputs are not permanent. Their documentation says prediction
input/output files created through the API are removed after a short retention
window, so ClipStitchr must copy provider outputs into R2 promptly.

References:

- Replicate webhooks: https://replicate.com/docs/webhooks
- Replicate webhook setup and `completed` events: https://replicate.com/docs/topics/webhooks/setup-webhook
- Replicate webhook retries and idempotency: https://replicate.com/docs/topics/webhooks/receive-webhook
- Replicate data retention: https://replicate.com/docs/topics/predictions/data-retention

## Target Mental Model

Every expensive or long-running operation should have a durable job record before
the expensive work begins.

The browser is allowed to start work and show progress, but it should not be the
only place that knows how to finish the workflow.

The durable job owns:

- `id`
- `ownerId`
- `type`
- `status`
- `stage`
- `progress`
- input object references or source asset IDs
- output object references
- provider prediction IDs when applicable
- enough user-selected metadata to create the final asset
- `error`
- `createdAt`
- `updatedAt`
- `completedAt`
- `finalizedAt`

The UI subscribes to jobs and renders state from Convex. It should be safe for
the UI to disappear and come back later.

## Workflow Classes

### Provider Jobs

Examples:

- Avatar photo generation
- Swapr video generation
- Clipr engagement clip generation

Provider jobs should be finalized by a server-side path, not by the client.

Recommended flow:

1. User starts the job.
2. Next.js/Convex checks auth, ownership, and rate limits.
3. Server creates a Convex job with all finalization metadata.
4. Server creates the Replicate prediction with a `completed` webhook.
5. The webhook verifies Replicate's signature.
6. The webhook updates the job status.
7. If the prediction succeeded, the webhook downloads the output immediately.
8. The webhook uploads output objects to R2.
9. The webhook creates the final `photoAssets` or `videoClips` record.
10. The webhook marks the job finalized.

The finalizer must be idempotent. Duplicate webhooks, polling retries, or a user
clicking "recover" should not create duplicate final assets. The job record
should store `finalizedAt` and final asset IDs, and the finalizer should return
the existing result when those fields are already present.

Polling can still exist for UI progress, but polling should not be required to
save the completed output.

### Browser Media Jobs

Examples:

- Upload normalization
- Poster generation
- Stitchr composition
- Swapr output post-processing when normalization remains browser-side

Browser media jobs cannot safely continue after a refresh unless their inputs
are already persisted somewhere durable.

There are two viable models:

1. Server-worker model:
   - Upload raw source files to R2 first.
   - Create a durable job that references those raw objects.
   - A backend worker performs normalization, poster capture, stitching, and R2
     writes.
   - The UI only observes progress.

2. Browser-resume model:
   - Persist raw source files and queue state in a local durable store such as
     OPFS or IndexedDB before processing.
   - A dashboard-level worker resumes queued work after reload.
   - Final outputs still upload to R2 and save Convex records.

The server-worker model is the stronger long-term architecture because it
survives tab close and device switch. The browser-resume model is useful only if
we intentionally keep Media Bunny processing local and accept that a different
device cannot resume the work.

## Current Flow Matrix

| Workflow | Current behavior | Durable target |
| --- | --- | --- |
| Avatar photo generation | Worker-owned. The route uploads the source image to R2, creates an `avatar-photo-generation` provider job, and the provider worker saves final `photoAssets`. | Add webhook-triggered finalization and retry controls; current worker polling already removes browser-close loss. |
| Swapr generation | Worker-owned. The route validates saved R2 inputs, creates a `manual-swapr` provider job, and the provider/media workers create the final saved Swapr clip. | Add webhook-triggered finalization and operational retry controls; current worker polling already removes browser-close loss. |
| Photo upload | Browser prepares photo, uploads objects, and saves Convex metadata. Refresh can stop before completion. | Upload original source to a durable job first, then finalize from a recoverable source. |
| Video upload normalization | Worker-owned after the raw source upload and `upload-normalization` job creation. The media worker normalizes, captures the poster, saves the clip, and creates the upload-analysis provider job. | Add resumable/multipart source uploads if close-before-upload durability becomes required. |
| Stitchr composition | Inputs are durable saved clips, but each stitch job is browser-local. Refresh stops work, including multi-UGC batches that have not finished saving every output. Optional music is durable because uploaded shared music objects and editable settings live on the saved stitch. | Create a stitch job with selected UGC clip IDs, demo clip ID, trim ranges, per-output overlay configs, and optional music settings, then process in a backend worker or resumable browser queue. |
| Longr composition | Inputs are durable saved clips, but the combined long-form render is browser-local. Refresh stops the build before the final Long, poster, and Convex record are saved. | Create a Longr job with ordered source clip IDs and trim ranges, then process in a backend worker or resumable browser queue. |
| Clipr generation | Worker-owned. `POST /api/clipr/jobs` creates a queued `cliprJobs` record and `manual-clipr` provider job. The provider worker handles text/still/video work and the media worker saves the final Clipr clip with any selected shared music. | Add webhook-triggered provider completion and richer user-visible retry/recover controls. |

## Recovery Requirements

Any recovery path must have enough metadata to create the final record without
asking the user to remember what happened.

For avatar photo generation, each job needs:

- `avatarId`
- source photo ID
- generated variant metadata
- model ID
- prediction ID
- output URL
- final photo asset ID after finalization

For Swapr, each job needs:

- source photo ID
- source video clip ID
- mode
- orientation
- prompt
- sound setting
- model ID
- prediction ID
- output URL
- final video clip ID after finalization

For Clipr, each job needs:

- saved product ID and product snapshot
- selected avatar ID and resolved most recent avatar photo ID
- selected voice ID and duration target
- hidden hook style/template IDs and filled variables
- generated hook, script, and scene plan
- provider prediction IDs or request IDs for each scene
- intermediate scene R2 object references
- optional music prompt, provider prediction ID, R2 object reference, enabled
  flag, and export volume
- final video/poster R2 object references
- final video clip ID after finalization

For Stitchr, each job needs:

- selected UGC clip IDs
- Demo clip ID
- copied trim ranges
- per-output text overlay settings
- final stitch IDs after finalization

For upload normalization, each job needs:

- raw source R2 object or local durable source reference
- target asset type
- generated object keys
- final clip/photo ID after finalization

## Implementation Phases

### Phase 1: Stop Provider Output Loss

- Provider job records now cover manual Swapr, manual Clipr, manual avatar
  photos, and upload-video analysis with finalization metadata before worker
  execution starts.
- Add Replicate `completed` webhooks for avatar and Swapr predictions.
- Verify Replicate webhook signatures.
- Add idempotent finalizers that copy provider outputs to R2 and create final
  asset records.
- Add a dashboard "recover pending jobs" action that calls the same finalizers
  for succeeded, unfinalized jobs.

### Phase 2: Persist Job State in the UI

- A dashboard banner now lists active provider/media jobs from Convex.
- Add a full dashboard job tray that lists failed and recently completed jobs.
- Replace page-local progress as the source of truth with Convex job status.
- Keep page progress components as views over durable job state.

### Phase 3: Make Browser Media Work Recoverable

- Decide between server-worker media processing and browser-resume processing.
- Server-worker processing is implemented for video upload normalization, manual
  Swapr finalization, and manual Clipr finalization. Extend the same model to
  Stitchr/Longr rendered exports when server-rendered outputs become required.
- If browser-resume processing is chosen, explicitly allow a transient local job
  store and implement resume-on-load.

### Phase 4: Cleanup and Expiration

- Delete abandoned raw input objects after success, cancellation, or expiration.
- Add retention policies for failed jobs.
- Document limits and cleanup schedules in `docs/backend/rate-limits.md`.

## Product Behavior

Users should see generated or processed work as jobs:

- Running jobs remain visible after navigation.
- Refreshing the page reloads job status from Convex.
- Completed jobs appear in the relevant library automatically.
- Failed jobs show a retry or recover action when the inputs are still
  available.
- The app warns before refresh only for work that is still truly non-resumable.

Until the durable model is implemented for every workflow, the app should be
honest about which operations are non-resumable and should avoid starting paid
provider work unless the provider output can be finalized without the browser.
