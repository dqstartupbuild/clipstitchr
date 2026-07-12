# Stitchr Hook Lab

Hook Lab turns a useful line, public post, generated hook, or past Stitch into
an Idea that can be used again without copying the original word for word or
shot for shot.

Status: implemented and deployed. Production migrations and both worker smoke
checks completed on July 12, 2026.

The complete product decisions and design rationale live in
`docs/features/hook-lab-ideas.md`. This document is the shorter implementation
and operations reference.

## User Experience

`/dashboard/hooks` has two views:

- **Ideas** is the default workspace. One composer accepts pasted text or a
  supported TikTok or Instagram URL, and **Choose a Stitch** selects an owned
  Stitch. Users can search and filter shared or product Ideas, edit their name
  and scope, archive or delete them, retry failed analysis, and request 1, 3,
  or 5 new Stitches.
- **Review** is a paginated inbox of independent generated-hook cards. **Use**
  selects only that hook, **Save idea** creates a reusable Idea, and **Not for
  me** adds only that line to the active product's avoid examples. Feedback can
  be undone.

Writing preferences remain product-level. Goal, tone, and rejected examples
are edited from Hook Lab and continue to guide Stitchr writing.

Using an Idea needs a default avatar and Demo clip for the active product. Hook
Lab asks for missing defaults before it starts provider work. The Idea card
reactively shows current-session variant progress and partial failures, then
links to Library Stitches when an output is ready. Restoring the latest use
after reload and linking directly to the exact completed Stitch remain
follow-up work.

## Durable Data

The Convex schema uses one table per durable concept:

- `hookLabIdeas` stores the source, scope, status, structured text blueprint,
  creative beat, optional Stitch recipe, attribution, provenance, and use
  count.
- `hookLabIdeaUses` records each 1-, 3-, or 5-variation request.
- `hookLabIdeaVariants` owns one generated hook, provider/media state, generated
  clip, final Stitch, and failure state per requested variation.
- `stitchrHookOptions` normalizes generated hook choices out of the legacy
  `stitchrHookPlans.hookOptions` array so selection and feedback are truly
  independent.
- `products.defaultAvatarId` and `products.defaultDemoClipId` store Hook Lab
  defaults. Reads re-check ownership and treat deleted assets as missing.

Idea and Review reads are indexed and cursor-paginated. The default Ideas scope
merges shared Ideas with Ideas for the active product on the server.

Every Hook Lab-generated video clip and Stitch carries Idea, use, and variant
lineage. The first release records that lineage and use counts; performance
ranking and creative-fatigue recommendations are not implemented.

## Routes and Authorization

Authenticated Next.js routes start expensive workflows:

- `POST /api/hook-lab/ideas` creates the durable Idea before analysis, reserves
  analysis quota, creates a provider job, and returns `202`. Idempotent requests
  may return an already-existing Idea/job state instead of duplicating work.
- `POST /api/hook-lab/ideas/[id]/retry` creates a new durable analysis job for
  an owned failed Idea.
- `POST /api/hook-lab/ideas/[id]/use` validates scope and defaults, reserves all
  variation-weighted limits, creates the use and variants, and then creates one
  provider job per variant.

Convex queries and mutations separately enforce owner and product access.
Rate-limit checks do not replace those checks. HTTP rate-limit failures return
`429` with `Retry-After` and plain-language copy. If a new Idea already exists
when analysis dispatch fails, it moves to `needs_attention` so the card exposes
a safe retry path.

## Text and Visual Reuse

Analysis stores structured text fields instead of raw prompt memory. Exact text
can be reused only when the model's exact-reuse gates all pass. Otherwise the
writer adapts the emotional pattern and product-specific slots. Adapted output
is compared with normalized source text and rejected when similarity exceeds
`0.82`; a deterministic fallback keeps the workflow useful when model output
is too close.

Social and video sources also produce a structured creative beat: opening
frame, subject action, camera behavior, pacing, text timing, transition, and
what should not be copied. It is a repeatable rhythm, not a shot list.

Stitchr writing reads at most eight ready, non-archived text blueprints from
the active product and shared Ideas. Product-scoped, frequently used, and
recently used patterns rank first. Prompts receive only structured pattern,
slot, cadence, claim, and safety fields—not `sourceText`. Manual text, Batch,
and daily automation use the same bounded memory, and durable task snapshots
keep in-flight generation stable.

## Provider Workflow

Two provider job types use the existing `stitchr` worker capability:

- `hook-lab-idea-analysis`
- `hook-lab-idea-use`

Social analysis starts an Apify Actor asynchronously. The run URL sets
`waitForFinish=0`, `timeout=180`, `maxItems=1`, and a bounded
`maxTotalChargeUsd`; Actor input also asks for one item. The provider worker
stores the Actor run and dataset IDs, releases the lock, and requests a
30-second continuation until the Actor reaches a terminal state. Platform
adapters translate Actor-specific fields into one internal source shape.

Before the external start request, Convex atomically records
`providerRunRequestedAt`. A recorded Actor run is always reused. If the start
response is ambiguous, automatic recovery does not launch a second paid run;
an explicit user retry may clear the marker and start again. Idea-use variants
also checkpoint generated writing, image, and video object metadata so a stale
worker claim can resume without repeating completed provider work.

The Instagram default is `apify/instagram-scraper`. The default TikTok setting
is `clockworks/tiktok-scraper`; Hook Lab explicitly enables video downloads in
its one-post Actor input. A capped live run verified a temporary video URL on
July 12, 2026. Both outputs remain isolated behind platform adapters so an
Actor contract change fails safely instead of leaking provider fields into the
rest of the product.

The provider worker validates every imported media redirect, DNS result,
content type, byte count, and duration. It rejects credentials, non-HTTPS URLs,
unexpected ports, private/link-local/loopback/reserved addresses, and cloud
metadata destinations. Imported video is worker-local only. A bounded thumbnail
may be copied to the owner's private R2 prefix; the temporary video and local
thumbnail are deleted in `finally` paths.

Idea use generates fresh overlay writing, an avatar still, and an eight-second
reaction opening. It then creates a `hook-lab-variant-finalization` media job.
Variant indexes map to five deterministic hook/visual directions. Convex
atomically rejects sibling wording overlap, and the provider worker makes
bounded safe adaptation attempts before failing a duplicate version.
The media worker normalizes the opening to 1080x1920, creates its poster, saves
the reusable Hook/UGC clip, assembles an editable Stitch with the default Demo
and recipe, records lineage, and removes transient generated R2 objects after a
successful save. Worker scratch directories are always removed.

## Environment

The provider worker requires its existing Convex, provider, and R2 credentials
plus `APIFY_TOKEN`. Hook Lab-specific settings are:

| Variable | Default | Purpose |
| --- | --- | --- |
| `HOOK_LAB_TIKTOK_ACTOR_ID` | `clockworks/tiktok-scraper` | Video-download-enabled TikTok Actor; smoke-test again when changing it |
| `HOOK_LAB_INSTAGRAM_ACTOR_ID` | `apify/instagram-scraper` | Instagram Actor |
| `HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD` | `0.5` | Maximum Actor-run charge; code keeps it within Apify's supported `0.5` to `2` range |
| `HOOK_LAB_IMPORTED_VIDEO_MAX_BYTES` | `104857600` | Imported video cap; code cannot exceed 100 MiB |
| `HOOK_LAB_VIDEO_MAX_DURATION_SECONDS` | `180` | Imported duration cap; code cannot exceed 180 seconds |
| `HOOK_LAB_TEXT_MODEL_ID` | shared `TEXT_WRITING_MODEL_ID` | Optional analysis/writing override |
| `PROVIDER_WORKER_FFPROBE_PATH` | `ffprobe` | Duration inspection binary |

`PROVIDER_WORKER_TOOLS` does not need a new value when it already includes
`stitchr`. The provider and media workers were deployed from commit `345bd86a`
with image tag `hook-lab-345bd86a`.

## Migration and Rollback

Three secret-gated, paginated migrations are intentionally additive:

- `migrations/migrateStitchTemplatesToHookLabIdeas:migrateStitchTemplatesToHookLabIdeas`
  creates deterministic recipe Ideas without deleting Templates.
- `migrations/migrateWinningHooksToHookLabIdeas:migrateWinningHooksToHookLabIdeas`
  creates product-scoped Ideas from saved winning examples.
- `migrations/migrateStitchrHookOptions:migrateStitchrHookOptions` creates the
  independent Review rows from existing plans.

Each migration caps a page at 50 and uses `RATE_LIMIT_API_SECRET`. Run pages
until `isDone` is true, carrying `continueCursor` forward. Then query
`migrations/getHookLabMigrationStatus:getHookLabMigrationStatus` and verify:

- Template and migrated-Template Idea counts match.
- `missingTemplateRecipeCount` is zero.
- actual and expected hook-option counts match.

The status query reads at most 10,000 rows from each legacy/new collection. For
larger workspaces, use paginated operator counts instead of treating its capped
totals as complete.

Legacy `stitchTemplates`, plan arrays, Template mutations, and automation
Template allocations remain available for rollback. Recipe reads prefer an
Idea and fall back to the old Template. Existing automation allocation IDs are
not rewritten in this rollout.

The July 12, 2026 production run created 5 migrated Template Ideas and 7 Ideas
from saved winning hooks. Verification found 5 Templates, 5 migrated Template
Ideas, zero missing recipes, 30 hook plans, and 240 expected/actual Review
options.

Templates no longer appear in Library navigation. `/dashboard/templates` and
`/dashboard/library?tab=templates` redirect to
`/dashboard/hooks?view=ideas`.

## Rate Limits

Hook Lab reserves limits before paid or storage-creating work:

- social import: 15/day/user, burst 3; 300/day globally
- Idea analysis: 30/day/user, burst 5; 1,000/day globally
- Idea use: 10 variants/day/user, burst 5, counted by requested variation
- generated asset saves: 20 objects/day/user, burst 10; 2,000/day globally,
  counted as the normalized opening video and poster per variation. The
  editable Stitch is a Convex record, not a rendered R2 object.

Idea use also reserves the existing writing, avatar still, generated-video
seconds, shared provider-spend, R2, and Convex save limits for all requested
variants before any child job is created. Analysis also consumes the shared
provider-spend guard. Idempotency keys keep retries from reserving the same paid
work twice.

The authoritative enforcement map and verification steps are in
`docs/backend/rate-limits.md`.

## Analytics and Privacy

Implemented consent-aware events are:

- `hook_lab_idea_created`
- `hook_lab_idea_analysis_started`
- `hook_lab_idea_analysis_completed`
- `hook_lab_idea_analysis_failed`
- `hook_lab_idea_used`
- `hook_lab_idea_use_completed`
- `hook_lab_idea_use_failed`
- `hook_lab_hook_used`
- `hook_lab_hook_saved_as_idea`
- `hook_lab_hook_marked_not_for_me`

They must never include source text, URLs, usernames, captions, or provider
payloads, or Idea/use/variant/Stitch/product/provider IDs. Lifecycle completion
and failure events come from consent-aware live browser transitions, are
claimed once per tab session, and are not queued or backfilled without consent.

The July 12, 2026 Privacy Policy and Terms explain temporary Apify/AI
processing, the limited source data retained with an Idea, lawful-use
responsibility, and the ban on identity or shot-for-shot cloning. Update both
pages whenever providers, retention, or source handling changes.

## Verification

The July 12, 2026 production rollout completed these release gates:

1. Deployed the additive Convex schema and functions before the web release.
2. Ran all three migrations and verified matching Template, recipe, and Review
   counts.
3. Added `APIFY_TOKEN` through Secret Manager and bound it only to the worker
   service account.
4. Deployed both Cloud Run Job images with tag `hook-lab-345bd86a`.
5. Passed provider execution `clipstitchr-provider-worker-lz4lz` and media
   execution `clipstitchr-media-worker-m68r7` with `--args=--check --wait`.
6. Verified one-item TikTok and Instagram Actor output contracts with capped
   live runs.

Keep these regression checks in future releases:

- Test text, owned-Stitch, Instagram, and the configured TikTok Actor path.
- Confirm rate-limit rejection occurs before Apify or Replicate work.
- Confirm imported social-video and thumbnail files are removed on success and
  terminal failure, worker scratch is always removed, and generated R2 inputs
  are removed after successful finalization or the final failed attempt.
- Confirm Template fallback and `/dashboard/templates` rollback compatibility.

Automated coverage includes 11 focused tests across the three HTTP route
surfaces and 15 Convex domain/migration tests, in addition to utility, adapter,
SSRF, parser, current-use progress, provider-continuation, failed-temp-cleanup,
selected-card, focused Review-mutation, successful media-finalizer persistence,
and terminal generated-input cleanup tests.

## Source References

- `docs/features/hook-lab-ideas.md`
- `docs/backend/rate-limits.md`
- `docs/backend/provider-automation-workflows.md`
- `docs/backend/server-side-media-processing.md`
- `web/app/api/hook-lab/ideas`
- `web/convex/hookLabIdeas`
- `web/convex/hookLabIdeaUses`
- `web/convex/hookLabIdeaVariants`
- `web/convex/hookLabIdeas/getHookLabPromptBlueprints.ts`
- `web/convex/stitchrHookOptions`
- `web/convex/migrations`
- `web/services/provider-worker/hookLab`
- `web/lib/clipstitchr/server/formatHookLabPromptMemory.ts`
- `web/services/media-worker/processHookLabVariantFinalization.mjs`
