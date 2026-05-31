# ClipStitchr Automation Plan

Reviewed: 2026-05-31

## Purpose

ClipStitchr should be able to create new draft content for a user every day
without requiring an open browser tab. Users can still manually run Stitchr,
Swapr, Clipr, avatar photo generation, and Swipr, but the daily automatic runs
use their own automation budgets and durable background jobs.

The first automated daily target is:

| Tool | Automatic daily output |
| --- | --- |
| Stitchr | 3 UGC-to-Demo stitch videos per user per day |
| Swapr | 1 Swapr video per user per day |
| Clipr | 1 Clipr generation per user per day |
| Avatar photos | 1 generated avatar photo per avatar per day |
| Swipr | 1 Swipe carousel generation per user per day |

Automated outputs are saved as drafts in the existing library surfaces. The
automation system must not publish externally or post to social platforms unless
a separate explicit publishing feature is added later.

## Product Behavior

Automation is an assistive overnight content supply, not a replacement for the
manual tools. A user should be able to wake up to new drafts while still keeping
full manual control during the day.

Required behavior:

- Automation can be enabled or disabled by the user.
- Each tool can be enabled or disabled independently.
- The app uses one global generation window; users do not configure timezone or
  preferred generation hours.
- Automation creates drafts only.
- Manual generation limits remain unchanged.
- Automatic generation uses separate automation limits.
- Every automatic run has a visible queued, running, completed, skipped, or
  failed state.
- Skipped runs store a reason, such as missing UGC, missing Demo, missing
  avatar, missing product, automation disabled, daily automation budget used, or
  global provider budget unavailable.

## Architecture Decision

Daily automation must run through durable backend jobs.

The browser Media Bunny flow remains useful for manual preview and browser-local
export, but it cannot power background generation because it depends on an open
tab, browser codecs, and in-memory state. Automatic media rendering should use
the server-side media worker and FFmpeg path described in
`docs/backend/server-side-media-processing.md`.

Target flow:

```text
Scheduler or cron
  -> automation planner finds eligible users
  -> planner creates daily automation runs with idempotency keys
  -> planner creates tool-specific automation tasks
  -> provider executor runs AI/provider tasks when needed
  -> media worker runs FFmpeg media jobs when needed
  -> finalizers upload outputs to R2
  -> finalizers create library records in Convex
  -> dashboard shows drafts and automation status
```

Use Convex as the durable ledger. Use Cloud Scheduler, Convex cron, or another
small scheduler only to trigger planning. Do not put long video rendering,
provider waits, or multi-step finalization inside a request handler.

## Required Tables

Add automation-specific Convex tables. Keep them separate from user-triggered
jobs so rate limits, status, recovery, and analytics do not become ambiguous.

### `automationPreferences`

One row per user.

Minimum fields:

- `ownerId`
- `enabled`
- `enabledTools`
- `productSelectionMode`
- `selectedProductIds`
- `avatarSelectionMode`
- `selectedAvatarIds`
- `createdAt`
- `updatedAt`

Tool keys should include `stitchr`, `swapr`, `clipr`, `avatar-photo`, and
`swipr`.

### `automationRuns`

One row per user, automation date, and tool.

Minimum fields:

- `ownerId`
- `id`
- `automationDate`
- `tool`
- `status`
- `idempotencyKey`
- `inputSnapshot`
- `dailyLimit`
- `attempt`
- `startedAt`
- `completedAt`
- `skippedAt`
- `failedAt`
- `error`
- `createdAt`
- `updatedAt`

Recommended idempotency key:

```text
ownerId + automationDate + tool + automationPreferenceVersion
```

For avatar photo generation, include `avatarId` in the key because the limit is
one automatic photo per avatar per day.

### `automationTasks`

One row per unit of actual work inside a run.

Minimum fields:

- `ownerId`
- `id`
- `runId`
- `tool`
- `taskType`
- `status`
- `stage`
- `idempotencyKey`
- `inputSnapshot`
- `outputAssetIds`
- `providerJobIds`
- `mediaJobIds`
- `attempt`
- `lockedBy`
- `lockedUntil`
- `error`
- `createdAt`
- `updatedAt`
- `completedAt`

Stitchr has one run per day with three render tasks. Avatar photo generation has
one run per avatar per day with one provider task.

### `automationPairHistory`

Used by Stitchr to avoid repeating the same UGC and Demo pairing too often.

Minimum fields:

- `ownerId`
- `ugcClipId`
- `demoClipId`
- `lastUsedAt`
- `useCount`
- `recentUseWindowKey`
- `lastOutputStitchId`
- `createdAt`
- `updatedAt`

Indexes:

- by `ownerId`, `ugcClipId`, `demoClipId`
- by `ownerId`, `lastUsedAt`

## Automation Limits

Automation limits are separate from manual limits. They protect daily background
spend and keep a user's automatic jobs from consuming the quotas they expect to
use manually.

Initial per-user limits:

| Limit | Value |
| --- | --- |
| Automatic Stitchr outputs | 3/day/user |
| Automatic Swapr outputs | 1/day/user |
| Automatic Clipr outputs | 1/day/user |
| Automatic avatar photos | 1/day/avatar |
| Automatic Swipr outputs | 1/day/user |
| Queued or running automation tasks | 10/user |
| Automation retries | 2/task |

Initial global limits:

| Limit | Value |
| --- | --- |
| Automatic Stitchr outputs | Configured deployment cap/day |
| Automatic Swapr outputs | Configured deployment cap/day |
| Automatic Clipr outputs | Configured deployment cap/day |
| Automatic avatar photos | Configured deployment cap/day |
| Automatic Swipr outputs | Configured deployment cap/day |
| Provider cost units | Configured deployment cap/day |
| Concurrent media renders | Worker capacity based |

Implementation requirement:

- Add automation-specific Convex rate limit buckets.
- Consume automation buckets before provider calls, media job creation, R2
  output writes, or final Convex asset saves.
- Do not consume manual `POST /api/swapr/jobs`, `POST /api/clipr/jobs`,
  `POST /api/avatars/photos/generate`, `POST /api/swipr/backgrounds/generate`,
  or manual Stitchr limits for scheduled automation.
- Continue to enforce ownership and authorization separately from automation
  budgets.
- Update `docs/backend/rate-limits.md` when these limits are implemented.

Automation should still use global provider and infrastructure caps. Separate
manual and automation buckets prevent automated jobs from using manual user
quotas; they do not remove spend protection.

## Stitchr Automation

Daily output: 3 finished UGC-to-Demo stitch drafts.

Source requirements:

- At least one eligible saved UGC-compatible clip.
- At least one eligible saved Demo clip.
- Source videos must already be normalized and stored in R2.
- Optional product filtering should prefer demos linked to the selected product.
- Exclude clips deleted, failed, or missing R2 objects.

Rendering:

- Create `stitchr-export` media jobs with source clip IDs, copied trim ranges,
  text overlay settings, audio flags, playback rates, and music settings.
- Render in the server media worker with FFmpeg.
- Save outputs as `stitches` records with an automation source marker.
- Do not require Media Bunny or an open browser.

### Pair Selection Algorithm

The planner should choose pairs using weighted randomness with repetition
penalties, not pure random selection.

For each eligible UGC and Demo pair:

1. Load `automationPairHistory`.
2. Start with a base score of `1`.
3. Add freshness weight for UGC clips and Demos that have not been used recently.
4. Penalize exact UGC+Demo pairs used recently.
5. Heavily penalize the pair used in the previous daily run.
6. Penalize high lifetime `useCount`.
7. Prefer unused exact pairs when available.
8. Select up to three pairs without repeating the same exact pair in the same
   daily run.

Suggested scoring:

```text
score =
  base
  + unusedPairBonus
  + ugcFreshnessBonus
  + demoFreshnessBonus
  - exactPairRecentPenalty
  - previousRunPenalty
  - useCountPenalty
```

Then sample from the weighted scores. If there are fewer than three unique
eligible pairs, create as many as possible and mark the rest skipped with a
clear reason.

History update must happen only after the stitch task reaches a final saved
asset state. Failed render attempts should not make the pair look used.

## Swapr Automation

Daily output: 1 Swapr video draft.

Source requirements:

- At least one eligible avatar photo.
- At least one eligible UGC-compatible or Demo reference video, depending on the
  configured Swapr mode.
- Required consent and ownership metadata must be present.

Execution:

- Create a Swapr automation task with a source snapshot.
- Consume automatic Swapr daily budget before provider work.
- Start provider prediction from a durable executor, not from a browser request.
- Store provider prediction ID before waiting for completion.
- Copy provider output to R2 from a finalizer.
- Create a `swapr-finalization` media job when normalization is needed.
- Save the final result as a UGC-compatible `videoClips` record with
  `swaprMetadata` and an automation source marker.

## Clipr Automation

Daily output: 1 Clipr generation draft.

Source requirements:

- One eligible product with enrichment metadata.
- One eligible avatar with at least one usable avatar photo.
- A default or selected voice.
- User automation preferences enable Clipr.

Execution:

- Create a Clipr automation task with product, avatar, avatar photo, voice,
  duration, hook, music, and prompt snapshots.
- Consume automatic Clipr daily budget before provider work.
- Run script planning and provider generation through durable provider tasks.
- Store provider prediction IDs before waiting for completion.
- Copy avatar still, avatar video, and optional music outputs to R2 server-side.
- Create `clipr-finalization` media jobs for final video normalization.
- Save the final result as a Clipr `videoClips` record with `cliprMetadata` and
  an automation source marker.

## Avatar Photo Automation

Daily output: 1 generated avatar photo per avatar.

Source requirements:

- Avatar is eligible and selected by automation preferences.
- Avatar has at least one existing source photo.
- Consent requirements are satisfied.

Execution:

- Create one avatar-photo automation run per avatar per automation date.
- Consume automatic avatar-photo budget for that avatar before provider work.
- Generate one prompt variant from the avatar description, wardrobe style, and
  recent generated-photo history.
- Store provider prediction ID before waiting for completion.
- Copy the generated image and thumbnail to R2 server-side.
- Save a `photoAssets` record linked to the avatar.
- Mark the run complete only after the photo asset exists.

The avatar-photo automation limit is per avatar, not just per user. A user with
three eligible avatars can receive up to three automatic avatar photos per day,
one for each avatar, subject to global automation caps.

## Swipr Automation

Daily output: 1 Swipe carousel draft.

Source requirements:

- One eligible product or saved product context.
- At least one eligible shared Swipr background, generated Swipr background, or
  configured background-generation preference.

Execution:

- Create a Swipr automation task with product and background snapshots.
- Consume automatic Swipr daily budget before provider work.
- If a new AI background is needed, use automation-specific Swipr background
  budget and save the background server-side.
- Generate slide text from the product context and hidden hook/template system.
- Save editable `swipes` state with slides, background references, and poster.
- Render the poster server-side or through a media/image worker so the draft is
  visible in the library without opening the browser.

Swipr export to a ZIP can remain manual/browser-local. Automation only needs to
create a saved editable Swipe draft and preview poster.

## Scheduling

Planning should run at least hourly and create work during the global
automation window.

Initial global window:

```text
09:00 UTC through 13:00 UTC
```

The production deployment can override this with
`AUTOMATION_GLOBAL_WINDOW_START_UTC` and
`AUTOMATION_GLOBAL_WINDOW_END_UTC`. These remain operator settings, not user
preferences.

Recommended schedule:

- Cloud Scheduler or Convex cron triggers the automation planner every hour.
- Planner pages through eligible users in bounded batches.
- Planner creates idempotent runs for the current UTC automation date.
- Planner enqueues tasks only when daily automation budgets are available.
- Executors claim tasks with leases.
- Stale locks are released by scheduled recovery.

Planner safeguards:

- Do not create duplicate runs for the same idempotency key.
- Do not queue more than the per-user active automation cap.
- Stop creating work when global automation budgets are exhausted.
- Store skipped runs instead of silently doing nothing.

## Draft Visibility

Add a dashboard automation surface that shows:

- today's generated drafts;
- queued and running tasks;
- skipped reasons;
- failures with retry status;
- the next scheduled global generation window;
- per-tool enabled or disabled state.

Generated drafts should also appear in existing library tabs:

- Stitchr outputs in Stitches.
- Swapr outputs in Swaps and reusable UGC-compatible views.
- Clipr outputs in Clips and reusable UGC-compatible views.
- Avatar photos in Avatars.
- Swipr drafts in saved Swipes.

## Data Marking

Every generated asset should include automation provenance.

Add metadata where appropriate:

- `source: "automation"` or equivalent typed field.
- `automationRunId`
- `automationTaskId`
- source asset IDs used.
- source snapshot summary.
- provider model IDs and prediction IDs.
- created automation date.

This lets the app explain why a draft exists, lets support debug failures, and
lets future selection logic avoid repetitive results.

## Failure And Retry Policy

Each task can retry twice for retryable infrastructure or provider failures.

Retryable:

- provider timeout;
- temporary provider 5xx;
- R2 transient upload/download failure;
- media worker crash after the task was leased;
- stale worker lock.

Not retryable without changed inputs:

- missing source asset;
- deleted avatar or product;
- unsupported media file;
- provider prompt/content rejection;
- ownership validation failure;
- automation disabled before the task starts.

Retries must be idempotent. Duplicate provider webhooks, duplicated task
dispatches, and recovery polling must return the existing completed output
instead of creating duplicates.

## Implementation Phases

### Phase 1: Automation Ledger And Preferences

- Add `automationPreferences`, `automationRuns`, `automationTasks`, and
  `automationPairHistory`.
- Add tool validators and status validators.
- Add user-facing automation settings.
- Add automation-specific daily rate limit buckets.
- Update `docs/backend/rate-limits.md`.

### Phase 2: Stitchr Autopilot

- Implement eligible UGC/Demo discovery.
- Implement weighted pair selection and pair history.
- Create three daily `stitchr-export` media tasks.
- Render with the FFmpeg media worker.
- Save completed stitches as drafts.

Stitchr is the best first tool because its inputs are already durable saved
clips and it does not require provider generation.

### Phase 3: Avatar Photo And Swipr Autopilot

- Move avatar photo generation finalization fully server-side.
- Add one-photo-per-avatar daily automation.
- Add Swipr draft generation using existing product and background systems.
- Save editable Swipes and posters as drafts.

### Phase 4: Swapr Autopilot

- Move Swapr provider execution and finalization to durable worker tasks.
- Add one automatic Swapr output per day.
- Normalize provider output through the media worker.
- Save reusable UGC-compatible clips.

### Phase 5: Clipr Autopilot

- Split Clipr route-local provider orchestration into durable tasks.
- Add one automatic Clipr output per day.
- Finalize provider outputs and video normalization server-side.
- Save reusable Clipr clips.

## Open Decisions

The open product decisions are answered in `open-automation.md`.

## Required References

- `project-scope.md`
- `coding-guidelines.md`
- `docs/backend/rate-limits.md`
- `docs/backend/server-side-media-processing.md`
- `docs/backend/media-worker-deployment.md`
- `docs/backend/provider-automation-workflows.md`
- `docs/backend/durable-workflows.md`
