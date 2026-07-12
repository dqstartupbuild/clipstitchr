# Hook Lab Ideas

Status: implemented and deployed with reversible legacy compatibility.

Date: July 12, 2026.

## Implementation Status

The core redesign is implemented:

- `/dashboard/hooks` now has **Ideas** and **Review** views.
- The Idea composer accepts text, supported TikTok or Instagram links, or an
  owned Stitch.
- Ideas, uses, variants, and independent hook-review options have dedicated
  Convex records and indexed, cursor-paginated reads.
- Text reuse is gated by exact/adapt rules and an `0.82` normalized-similarity
  ceiling. Visual analysis stores a structured creative beat instead of a
  shot-for-shot recipe.
- Each of the five possible variant indexes has a deterministic hook treatment
  and visual direction. Convex atomically reserves generated hook wording,
  rejects sibling overlap, and allows bounded safe rewrites before failing a
  version that cannot become distinct.
- Idea analysis and use run through durable provider jobs. Final Stitch
  assembly runs through a durable media job.
- Template rows remain intact. Deterministic, secret-gated backfills create
  recipe Ideas, while Stitchr and automation can fall back to legacy Template
  IDs during the rollback window.
- Templates are gone from Library navigation, and legacy Template URLs redirect
  to Hook Lab Ideas.
- Stitch cards save reusable setups as Ideas, and the dual-read Stitchr and
  automation controls describe those recipe records as saved setup Ideas.
- The public Privacy Policy and Terms now explain temporary social-post
  processing, retained attribution/Idea data, lawful-use responsibility, and
  the prohibition on identity or shot-for-shot cloning.

The production backend rollout completed on July 12, 2026:

- Convex schema and functions deployed to `prod:whimsical-ptarmigan-764`.
- The additive backfills created 5 recipe Ideas from 5 Templates, 7 Ideas from
  saved winning hooks, and 240 independent Review options from 30 plans.
- Migration verification reported zero missing Template recipes and matching
  expected/actual Review-option counts.
- Provider and media Cloud Run Jobs deployed from commit `345bd86a` with image
  tag `hook-lab-345bd86a`.
- The provider execution `clipstitchr-provider-worker-lz4lz` and media
  execution `clipstitchr-media-worker-m68r7` both passed their production
  `--check` smoke tests.

The following bounded behavior and rollback notes remain relevant:

- The current UI reactively shows status and partial failures for the use
  started in that browser session, then links to Library Stitches when an
  output is ready. It does not yet restore the latest use after a page reload
  or deep-link to the exact completed Stitch.
- The default Clockworks TikTok Actor is called with video downloads enabled.
  A capped one-item live run returned usable temporary video media on July 12,
  2026; changing the Actor or its input requires repeating that smoke check.
- Legacy automation Template allocations keep their old Template IDs and work
  through the compatibility resolver; they are not rewritten to Idea IDs in
  the initial migration.
- Imported social video is copied to a MIME-named, owner-private temporary R2
  object for multimodal analysis. That object and worker scratch are deleted in
  `finally` paths. Provider-generated image/video R2 inputs are deleted with
  best-effort cleanup after successful media finalization and after the final
  failed attempt.

Automated coverage includes the utility/SSRF/Apify/adapter layer, selected UI
cards, provider writing parsers, media-input parsing, all three route surfaces,
Convex domain and migration behavior, current-use progress, provider recovery,
independent Review mutations, successful media-finalizer persistence, and
terminal temporary-input cleanup.

## Outcome

Hook Lab becomes the place where a user turns something worth repeating into a
new, product-relevant Stitch.

The durable object is an **Idea**. An Idea can learn from pasted text, a public
TikTok or Instagram post, a generated hook, or an existing ClipStitchr Stitch.
It can contain any combination of:

- a reusable text pattern
- a repeatable visual creative beat
- a Stitch assembly recipe

The primary action is **Use idea**. It creates one ready-to-review Stitch by
default. A nearby quantity control supports 1, 3, or 5 variations without
turning the default workflow into a batch form.

This design replaces the standalone Templates feature. Existing Templates are
migrated into Ideas sourced from their original Stitches.

## Why This Changes

The current Hook Lab combines three different jobs:

1. Users paste hooks into product memory.
2. Users review generated hook batches.
3. Accepting a generated hook can silently create a Template.

Those jobs do not form a clear user workflow. Raw examples can also be repeated
verbatim even though the writing prompt says they should only teach taste and
emotional pattern. Generated options are stored inside a parent plan, which
makes feedback appear batch-wide even when the backend can update an individual
option. Templates then live elsewhere in the Library and preserve a Stitch
setup without representing the reusable creative idea behind it.

The new model gives the user one understandable loop:

1. Save something worth learning from.
2. Let ClipStitchr identify what makes it reusable.
3. Use it to create a new Stitch for the active product.
4. Review every generated hook independently.
5. Save the ideas that deserve another use and reject the ones that do not.

## Confirmed Product Decisions

- The page remains named **Hook Lab**.
- Its primary job is creating repeatable content ideas.
- Users can start with pasted text, a public TikTok or Instagram link, or an
  existing ClipStitchr Stitch.
- Link Ideas are saved immediately and analyzed in the background.
- Imported third-party video files are deleted after analysis.
- Saved source data includes the canonical link, attribution metadata,
  thumbnail, extracted text, and structured creative-beat analysis.
- The visual goal is to repeat the creative beat, not clone a source video
  shot-for-shot.
- The writing model decides whether exact text is already relevant or needs to
  be adapted, subject to the hard safeguards in this document.
- **Use idea** creates a ready-to-review Stitch.
- Product-level default avatar and demo selections keep the main action to one
  click. Missing defaults are requested only when needed.
- One output is generated by default; users may request 3 or 5 variations.
- Every hook is reviewed on its own card. **Use**, **Save idea**, and **Not for
  me** affect only that hook.
- Templates are replaced by Ideas and removed from the Library navigation.
- Ideas are shared across products by default and can be locked to one product.

## Approaches Considered

### 1. Unified Ideas in Hook Lab — selected

One Idea model owns optional text, visual, and Stitch-recipe capabilities.
Templates become migrated Ideas. Generated winners can become Ideas explicitly.
This creates one mental model and one reusable-content destination.

Trade-off: the migration touches Hook Lab, Templates, Stitchr, automation
preferences, provider work, and Library navigation. A staged, dual-read
migration is required.

### 2. Keep Templates and Hook Lab separate

Hook Lab would learn text and visual patterns while Templates continued to save
exact Stitch setups.

This has less migration risk, but users would still have to understand whether
something belongs in Hook Lab or Templates. It also leaves visual creative
beats stranded between Hook Lab and Clipr.

### 3. Put Templates in a nested Hook Lab section

This would move the existing cards without changing the underlying models.

It improves navigation but does not solve verbatim hook reuse, batch-level
feedback, or the difference between an exact setup and a repeatable idea.

## Information Architecture

`/dashboard/hooks` remains the Hook Lab route and has two top-level views.

### Ideas — default

This view contains:

- a universal **Add an idea** composer
- shared/current-product filters
- status and capability filters
- search
- the Idea grid

The universal composer has one text field with the plain-language prompt:

> Paste a hook or a public TikTok or Instagram link

The composer detects text versus supported URLs. A separate **Choose a Stitch**
button opens an owner-scoped Stitch picker. Users do not choose an import type
before pasting.

### Review

This view is a flat, paginated inbox of generated hook cards. It supports:

- Needs review, Saved, and Not for me filters
- active-product and all-product filters
- source Stitch and generation-date context
- one independent feedback state per hook

No parent batch card exposes an Accept or Reject action. Batch identity can
appear as quiet metadata, but it never controls feedback.

### Writing preferences

Goal, tone, and explicit phrases to avoid remain useful, but they are supporting
preferences rather than the main page content. A **Writing preferences** button
opens a focused panel.

The raw **Hooks to learn from** textarea is retired. Saved Ideas become the
canonical positive memory. Existing rejected examples migrate into the avoid
list and remain editable as individual entries.

## Add Idea Workflows

### Pasted text

1. The user pastes one hook and selects **Save idea**.
2. The Idea card appears immediately with an **Analyzing** state.
3. Background analysis extracts the text pattern, semantic slots, emotional
   purpose, cadence, niche-specific terms, and exact-reuse constraints.
4. The card becomes **Ready** and shows a plain-language summary of what will be
   repeated.

Text-only Ideas also receive a simple visual-beat suggestion so **Use idea** can
still create a UGC opening. The suggestion is derived from the hook and active
product context and can be edited later.

### TikTok or Instagram link

1. The user pastes a supported public post URL and selects **Save idea**.
2. ClipStitchr canonicalizes the URL and creates the Idea before paid work.
3. A durable analysis job imports public metadata and a temporary video URL.
4. The worker validates the media type, size, redirects, and duration, then
   stages a MIME-named copy in the owner's private temporary R2 prefix. Gemini
   reads that copy through a short-lived signed URL while extracting the source
   text and creative beat.
5. ClipStitchr saves a private thumbnail copy, canonical source metadata,
   attribution, structured analysis, and provider provenance.
6. The local working file and temporary R2 video are deleted in a `finally`
   cleanup path whether analysis succeeds or fails.

Only public TikTok and Instagram post/reel URLs are supported initially.
Profiles, feeds, searches, private posts, deleted posts, slideshows, live videos,
and arbitrary media URLs are out of scope. A failed import remains visible with
**Try again** and **Paste the text instead** actions.

### Existing Stitch

1. The user chooses one owned Stitch.
2. ClipStitchr creates an Idea with the source Stitch reference and assembly
   recipe.
3. Existing UGC analysis, overlay text, trims, timing, playback rates, audio
   flags, text style, caption, and demo relationship seed the Idea.
4. If the saved UGC metadata is not detailed enough, background analysis reads
   the owned source clip through a short-lived signed URL. The worker streams
   the response with a 60-second timeout and enforces the byte cap against the
   downloaded body instead of trusting saved client metadata.

The primary **Use idea** path still creates a fresh opening with the active
product's default avatar and uses its default demo. Ideas with a source Stitch
also expose **Use original setup** in the overflow menu. That secondary action
preserves the exact old Template behavior without making it the default mental
model.

## Idea Card

Each card has one purpose: explain the reusable idea and let the user use it.

The card shows:

- generated name
- thumbnail or source-Stitch poster
- source label and attribution link
- Ready, Analyzing, Generating, Needs attention, or Failed state
- Text pattern, Creative beat, and Saved setup capability chips
- Shared or product-locked scope
- a short **What ClipStitchr will repeat** summary
- last-used date and use count

The primary footer contains a quantity selector and **Use idea**. Rename, edit,
change scope, retry, use original setup, archive, and delete live in the overflow
menu.

Deleting an Idea never deletes its source Stitch, generated Stitches, clips, or
product assets. An Idea cannot be deleted while Hook Lab is analyzing it or
making outputs from it; the confirmation explains that the user can delete it
after the work finishes. Archiving is preferred when the Idea has use history.

## Product Scope and Defaults

Ideas use one of two scopes:

- `shared`: available to every product owned by the user
- `product`: available only to one owned product

The default Hook Lab filter shows shared Ideas plus Ideas locked to the active
product. An **All ideas** filter can show other product-locked Ideas, but their
use action remains unavailable until that product is active.

Each product gains:

- a default avatar ID
- a default demo clip ID

**Use idea** starts immediately when both defaults are valid and owned by the
user. When either is missing, a small preflight dialog asks only for the missing
selection and offers to save it as the product default. It does not repeat the
full Clipr or Stitchr setup flow.

## Use Idea Workflow

1. The client sends the Idea ID, active product ID, and variation count.
2. The server verifies Idea access, scope compatibility, product ownership,
   default-avatar ownership, and default-demo ownership.
3. All required per-user and global quotas are reserved before jobs are
   created. A request for 5 variations reserves 5 writing, avatar-video, media,
   and storage units where applicable.
4. One durable use record is created with one child variant per requested
   output.
5. Each variant decides whether to reuse or adapt the source wording.
6. Each variant builds a product-specific visual prompt from the creative beat
   and creates a fresh UGC opening with the default avatar.
7. The opening is normalized and saved to the Hook/UGC Library.
8. The worker pairs the opening with the default demo, applies the assembly
   recipe and generated overlay, and creates a saved Stitch.
9. Every output links back to its Idea, use record, and variant index.
10. Durable use and variant rows record progress and completion. The current
    Idea card reacts to each variant and links to Library Stitches when an
    output is ready. Restoring that panel after reload and opening the exact
    completed Stitch directly are still pending.

For 3 or 5 variations, each index selects a different required hook treatment
and bounded visual direction while retaining the same creative beat. Generated
wording is atomically compared with already-reserved siblings. Overlap triggers
bounded safe adaptation attempts; a version fails instead of accepting a
duplicate. Merely changing punctuation or camera micro-movement does not count
as a variation.

## What “Repeat the Creative Beat” Means

Creative-beat analysis captures:

- the opening visual state
- the ordered action or reaction beats with approximate timing
- the emotional turn
- facial expression and body gesture at a non-identifying level
- shot size, framing, and camera movement
- pacing and transition into the demo
- important objects or interactions described generically
- the payoff the visual creates for the text hook
- elements that must not be copied

It does not retain or reproduce:

- the source creator's identity or likeness
- sensitive inferred traits
- distinctive clothing, room decor, logos, or background details unless the
  user owns them and explicitly adds them later
- watermarks, captions, usernames, audio, or music from the source
- a frame-by-frame shot list intended to create a near-duplicate

The output prompt uses the user's chosen avatar and active product context. It
preserves the emotional/action structure while changing the person, scene
details, product relevance, and small performance choices.

## Text Learning and Exact-Reuse Rules

The source hook is never sent to generation as an unlabeled “winning example.”
Analysis first converts it into a structured blueprint containing:

- source text
- reusable pattern
- semantic slots and expected slot meanings
- emotional job
- cadence and length
- source niche
- product-specific or creator-specific tokens
- unresolved visual references
- claims that require support
- exact-reuse constraints

The exact-versus-adapt decision happens per use because a shared Idea may be
relevant to one product and wrong for another.

Exact wording is allowed only when all of these are true:

- the sentence is complete in the generated visual context
- every “this,” “that,” blank, placeholder, person, or object has a clear visual
  referent
- the wording fits the active product, audience, and selected demo
- it contains no source creator name, competing brand, unrelated niche noun, or
  unsupported claim
- it does not depend on a source-specific caption, audio, trend, or comment
- it reads naturally as a short overlay
- for third-party sources, it is short and generic enough that reuse will not
  make the output feel copied

If any gate is uncertain, the model adapts the pattern.

For example, `If your boyfriend looks like this…` may be reused only when the new
visual supplies a clear boyfriend-related referent and the product context makes
the line natural. Otherwise the blueprint is filled or rewritten, such as `If
your pull-ups look like this…` or another product-appropriate realization of the
same call-out pattern.

A hook from another niche is reduced to its function before generation. The
system learns the call-out, curiosity gap, confession, contrast, or payoff
structure and fills it with the active product's audience reality.

### Similarity safeguard

The generated result is compared with the normalized source text after the
model responds.

- If the decision was `reuse`, the system verifies every exact-reuse gate was
  returned with evidence.
- If the decision was `adapt`, an exact match or excessive phrase overlap
  triggers one constrained rewrite.
- If the rewrite still fails, a deterministic slot-filled fallback is used or
  the variant is marked failed. The source text is never silently returned as
  an adapted result.

The use record stores `reused` or `adapted` and a short reason. This supports
debugging and future quality measurement without exposing prompt mechanics in
the main UI.

### Structured prompt memory

Ready, non-archived Idea blueprints now replace raw winning-hook examples in
Stitchr writing prompts. Each read considers up to 24 current-product Ideas and
24 shared Ideas, then selects at most 8. Product-scoped patterns rank first,
followed by use count and recent use/update time.

The prompt formatter includes the reusable pattern, semantic slots, emotional
job, cadence, source niche, product-specific tokens, unresolved references,
claims requiring support, and exact-reuse constraints. It intentionally omits
the blueprint's `sourceText`; source text stays on the Idea for similarity and
audit decisions, not copy-and-paste prompt memory.

The same bounded structured memory feeds manual Stitchr text generation,
on-demand Batch planning, and daily Stitchr automation. Batch/automation task
snapshots capture the selected blueprints so an in-flight job does not change
meaning when Ideas are edited later.

## Hook Review Cards

Generated hook options are normalized into independent records. Each card owns
its own status and actions.

### Use

Makes that hook active on its associated Stitch. It does not save the hook as
future memory and does not affect sibling options.

### Save idea

Creates a new Idea from that hook. If the option is linked to a finished Stitch,
the new Idea also receives its creative beat and assembly recipe. Exact duplicate
saves are idempotent.

### Not for me

Adds only that hook and its normalized pattern to the product's avoid memory.
It does not reject its parent plan or other variants. The action supports Undo.

The old plan-level Accept and Reject controls are removed. Accepting a hook no
longer creates a Template automatically.

When a regenerated plan puts different hook wording at an existing rank, that
row returns to **Needs review** and drops its old Idea link, review timestamp,
and rejection reason. Rank reuse never makes a new hook inherit feedback from
the hook it replaced.

## Conceptual Data Model

### `hookLabIdeas`

Core fields:

- owner ID and stable public ID
- name and status
- source type: text, social link, Stitch, generated hook, or migrated Template
- source platform, canonical URL, author attribution, source post ID, and
  source-created date when available
- private thumbnail R2 object
- shared/product scope and optional product ID
- original extracted text
- optional text blueprint
- optional creative beat
- optional Stitch assembly recipe
- source Stitch ID and source Template ID when applicable
- use count, last-used timestamp, created timestamp, and updated timestamp
- analysis model, prediction ID, prompt version, and analysis version
- failure code and safe user-facing failure message

Large structured sections should use dedicated Convex validators and matching
TypeScript types. UI capability chips are derived from section presence rather
than stored separately.

### `hookLabIdeaUses`

One record represents one press of **Use idea** and stores:

- owner, Idea, and product IDs
- requested variation count
- snapshot IDs for the default avatar and demo
- status, progress, failure state, and timestamps
- idempotency key

### `hookLabIdeaVariants`

One record per requested output stores:

- use ID and zero-based variant index
- exact/adapt decision and reason
- generated hook and caption
- visual prompt summary
- provider job and prediction IDs
- generated UGC clip ID
- finished Stitch ID
- independent status and failure state

### `stitchrHookOptions`

Hook variants move out of the parent plan array into individual rows with:

- parent plan ID and rank
- hook, angle, and reason
- selected state
- review state and timestamps
- linked Idea ID when saved

`stitchrHookPlans` remains the generation envelope for shared caption, source
clip, product, automation, and provider context. It no longer owns batch-wide
feedback.

### Product additions

Products gain optional `defaultAvatarId` and `defaultDemoClipId`. Ownership and
current existence are checked whenever the defaults are read; stale IDs behave
as missing defaults.

## Provider and Worker Design

The feature reuses the durable provider-worker and media-worker architecture.
It must not keep a Vercel request open while Apify, video analysis, avatar video
generation, or Stitch finalization runs.

Two provider job types are added:

- `hook-lab-idea-analysis`
- `hook-lab-idea-use`

The analysis job uses a source adapter selected by canonical hostname:

- TikTok adapter
- Instagram adapter
- owned Stitch adapter
- pasted text adapter

Adapters return one internal normalized source shape. Actor-specific field names
never enter Convex documents or UI code.

The existing `clockworks/tiktok-scraper` integration supports TikTok metadata
and downloadable video when `shouldDownloadVideos` is enabled. A capped
one-item run verified that contract on July 12, 2026. The TikTok adapter still
accepts several documented media-field shapes and fails safely if none are
present. The Actor ID remains environment configuration, not a UI or schema
value.

Apify Actor runs start asynchronously. The run request sets
`waitForFinish=0`, `timeout=180`, `maxItems=1`, and the configured
`maxTotalChargeUsd`; platform input also requests only one result. The worker
stores the run and dataset IDs, releases its lock, and requests a 30-second
continuation until the run reaches a terminal state. A synchronous route is not
the durability boundary for Hook Lab. The create and retry routes therefore
return `202` after queueing work; Apify and Replicate calls occur later in the
Cloud Run provider worker, not inside the Vercel request.

A successful saved Actor run and dataset are reused on ordinary analysis retry,
so a retry does not imply that a new Actor run should appear. The reused run ID
is attached to the new provider job for lineage. If the imported media cannot
be downloaded or is no longer usable, the Idea receives
`source_video_unavailable`; the next explicit retry clears the stale Actor
provenance and starts a fresh capped import.

The existing upload-video analysis pipeline already analyzes full video over
time and creates timestamped action breakdowns. Hook Lab reuses its signed-R2
video input pattern with a dedicated prompt and parser that output a creative
beat instead of upload-library metadata. Replicate prediction IDs are attached
to the provider job as soon as prediction creation succeeds, before polling.
A transient checkpoint failure does not abandon the already-paid prediction;
the completed Idea write records the ID again after polling.

## Temporary Media Handling

- Accept only canonical public TikTok and Instagram URLs.
- Never fetch a user-supplied arbitrary media URL directly.
- Read the media URL only from the validated adapter result.
- Authenticate only exact Apify key-value-store record URLs when an Actor
  returns private media. Recompute request headers after every redirect so the
  Apify bearer token is never forwarded to another host.
- Require HTTPS and validate redirects, content type, byte length, and maximum
  duration before analysis.
- Reject local, private, link-local, loopback, and cloud-metadata network ranges
  at every redirect to prevent SSRF.
- Cap imported videos at the existing full-video analysis size limit and add a
  conservative duration cap for this feature.
- Store transient media under a purpose-specific, owner-private temporary R2
  key whose extension matches the validated MIME type, plus a worker-local
  temporary file for duration and thumbnail processing.
- Give Gemini only a short-lived signed R2 read URL. Owned Stitch video follows
  the same full-stream validation and fresh signed-URL path.
- Delete transient media in success, failure, timeout, and cancellation paths.
  Temporary R2 deletion gets three attempts with a 10-second abort timeout per
  attempt. Exhaustion emits a sanitized, job-correlated worker error without
  replacing the real analysis outcome or launching another paid prediction.
- Copy only the bounded thumbnail into the owner's private R2 prefix.
- Do not persist source audio or music.
- Keep the user-facing Privacy Policy and Terms aligned with the implemented
  temporary processing, retained attribution, and lawful-use responsibility.

Deletion here means ClipStitchr does not retain the downloaded video. External
processors may temporarily process inputs under their own service terms. The
Privacy Policy and Terms disclose this behavior and must stay aligned with any
provider or retention change.

## Template Migration

Migration is staged and reversible.

### Stage 1: backfill

- Create one Idea for each owned Template.
- Preserve its source Stitch ID, source Template ID, name, trims, sequence,
  playback rates, audio flags, overlay style, caption, and clip references.
- Lock the migrated Idea to the source Stitch's product when one exists;
  otherwise keep it shared.
- Use a deterministic migration ID so rerunning the backfill is safe.
- Do not delete the Template row.

### Stage 2: dual read

- Hook Lab reads migrated Ideas.
- Stitchr and automation resolve an Idea recipe first and fall back to the old
  Template during the compatibility window.
- Existing automation Template selections keep their legacy IDs and resolve
  through the Idea-first, Template-fallback compatibility helper.
- New saves write Ideas only.

### Stage 3: switch navigation

- Remove Templates from the Library tabs.
- Redirect `/dashboard/templates` and `library?tab=templates` to
  `/dashboard/hooks?view=ideas`.
- Replace the Stitchr Template picker with a focused **Start from an idea**
  picker that shows only Ideas containing an assembly recipe.

### Stage 4: retire legacy data

After production verification and a rollback window, remove old Template
mutations, types, UI, automation fields, and finally the `stitchTemplates`
table. This cleanup is a separate change from the initial migration.

## Rate Limits and Abuse Protection

The final limits and verification steps are maintained in
`docs/backend/rate-limits.md`. The configured initial limits are:

| Operation | Per user | Global | Enforcement point |
| --- | --- | --- | --- |
| Social link import | 15/day, burst 3 | 300/day | Before Apify run creation |
| Idea AI analysis | 30/day, burst 5 | 1,000/day | Before Replicate analysis |
| Use idea | 10 variants/day, burst 5, plus existing writing, avatar still/video, R2, and Stitchr media limits multiplied by 1, 3, or 5 | Existing shared provider buckets | Reserve before child jobs are created |
| Generated asset saves | 20 objects/day, burst 10 | 2,000/day | Reserve the normalized opening video and poster per requested variant; the editable Stitch is metadata-only |
| Idea metadata writes | Existing Convex record-save/update limits | Existing global Convex limits | At the owning mutation |

Social-link analysis consumes both the social import and Idea analysis limits.
Text and owned-Stitch analysis consume only Idea analysis. Retrying a provider
failure with the same idempotency key must not consume the quota twice unless a
new paid provider run is actually created.

Each social analysis attempt may create one bounded temporary R2 video object
after the route has reserved both analysis and social-import quota. It has no
separate user-facing storage bucket because the existing per-user/global
provider limits, 100 MiB hard cap, deterministic job-scoped key, and mandatory
`finally` deletion bound its cost and lifetime.

HTTP routes return `429` with `Retry-After` and simple copy. Rate limits never
replace ownership, product-scope, or source-asset authorization checks.

## Reliability and Failure Behavior

- Creating an Idea is durable before any provider call.
- Job dispatch is idempotent by owner, source, and request key.
- Canonical social URLs prevent duplicate imports of the same source post.
- Every stage records safe progress and provider provenance.
- Reused terminal Actor runs and newly created Replicate predictions are
  attached to the current provider job, so support can distinguish import from
  analysis failures without storing source URLs or captions.
- Worker continuation and delayed recovery follow the existing provider-worker
  pattern.
- Deterministic model-input and terminal import errors skip the immediate
  three-attempt retry loop. Transient network, provider availability, and
  rate-limit failures remain retryable.
- A failed analysis does not delete the Idea card.
- One failed variant does not fail successful siblings in a 3- or 5-variation
  request.
- Quota reservation and refund behavior is explicit for jobs that fail before a
  paid call begins.
- Temporary-media cleanup runs independently of final status persistence.
- Thumbnail creation removes its partial local file when ffmpeg or file reading
  fails, and analysis waits for the thumbnail task to settle before cleanup.
- If thumbnail copying fails after analysis, the Idea may complete without a
  thumbnail rather than losing the analysis.
- If Stitch finalization fails after UGC generation, the generated UGC remains
  owned and reusable, and Retry resumes from finalization.

## Scale and Performance

The initial target is hundreds of Ideas and thousands of review options per
workspace.

- Use indexed, cursor-paginated Convex queries; do not load every Idea or hook
  plan into the browser.
- Query shared plus active-product Ideas with separate indexed reads and merge a
  bounded page server-side.
- Search a normalized bounded field or dedicated search index rather than
  filtering the full workspace client-side.
- Keep thumbnails bounded and lazy-loaded.
- Limit prompt memory to the most relevant saved text Ideas, not every Idea.
- Rank prompt memory by product scope, explicit saves, real use history,
  recency, and later performance data.
- Keep analysis and generation asynchronous; optimistic cards should render in
  the first successful mutation response.

## Long-Term Campaign Learning

Every generated Stitch carries Idea lineage from the beginning. This makes
future learning possible without redesigning the content model.

When scheduled-post analytics are available, Hook Lab can later show:

- how many times an Idea was used
- which products used it
- median and best performance by platform
- which hook adaptations were posted
- whether repeated uses are showing creative fatigue

Performance data should inform ranking and recommendations, not silently rewrite
an Idea or declare a universal winner. Saves, rejections, product context, and
real post outcomes are separate signals.

The first release only stores lineage and use counts. Automated performance
ranking and fatigue recommendations are later capabilities and require their own
feature documentation.

## Analytics

The implementation emits these consent-aware PostHog events without source
text, social URLs, usernames, captions, or provider payloads:

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

Properties may include source type, platform enum, capability flags, scope,
variation count, status, duration bucket, and error category. They must not
include user copy or direct identifiers. Analysis and use completion/failure
events are emitted by consent-aware client subscriptions only when Hook Lab
observes the transition. A tab-session claim prevents duplicate events from
rerenders or remounts; events are not queued or backfilled without consent.

## Accessibility and Copy

- All status changes use text in addition to color.
- Progress is announced through a polite live region.
- The quantity control has an explicit **Number of versions** label.
- Idea cards and review cards preserve logical keyboard order.
- Overflow actions are reachable without hover.
- Thumbnails have source-aware alt text without guessing identity.
- Buttons use the agreed plain-language labels: **Save idea**, **Use idea**,
  **Use**, and **Not for me**.

Recommended page copy:

> Save a line, post, or past Stitch. Hook Lab learns what made it work and turns
> it into a fresh Stitch for your product.

Recommended empty-state copy:

> See something worth trying? Paste the line or link here. Hook Lab will learn
> the idea without copying the post.

## Testing Strategy

The lists below are the rollout verification matrix. Automated coverage now
includes utilities/adapters/similarity, selected cards, provider-writing and
media-input parsers, all three route surfaces, default/use/variant Convex
domains, both Idea backfills, current-use progress, provider analysis
continuation and recovery, failed social-temp cleanup, independent Review
mutations, successful finalizer persistence, and terminal generated-input
cleanup.

### Unit coverage

- URL detection and canonicalization
- TikTok and Instagram adapter normalization
- private-network and redirect rejection
- text-blueprint parsing
- creative-beat parsing
- exact-versus-adapt gates
- similarity safeguard and fallback
- product-scope checks
- default asset validation
- variation quota calculation
- independent hook feedback transitions
- Template-to-Idea conversion

### Convex coverage

- owner-scoped indexed reads
- shared plus product-locked pagination
- idempotent Idea creation and migration
- independent hook-option writes
- Idea use and variant state transitions
- stale product-default behavior
- automation compatibility reads

### Route and worker coverage

- authentication before all work
- rate limiting before Apify and Replicate
- actor success, timeout, failure, and malformed dataset output
- authenticated private Apify media with authorization stripped on redirect
- signed-R2 video input for social and owned-Stitch analysis
- Actor and Replicate provider-ID lineage on the current provider job
- deterministic-versus-transient provider retry classification
- temporary-media deletion on every terminal path
- cleanup exhaustion preserving the original analysis result and prediction
- thumbnail failure fallback
- video size/type/duration enforcement
- one, partial, and total variant failures
- provider continuation and idempotent retries
- ready-to-review Stitch creation and lineage

### UI coverage

- universal composer text, URL, and Stitch paths
- optimistic analyzing cards
- missing-default preflight
- one-hook-per-card behavior
- sibling hooks remaining unchanged after every action
- 1, 3, and 5 variation selection
- shared and product-locked filters
- failed import retry and paste-text fallback
- Template redirects and removed Library tab
- keyboard and screen-reader behavior

### Migration verification

- Template count equals migrated-Idea count per owner
- every recipe field survives conversion
- existing automation selections resolve
- old Template links redirect safely
- backfill reruns create no duplicates
- rollback can restore old reads before legacy deletion

Production verification on July 12, 2026 recorded:

- `templateCount: 5`
- `migratedTemplateIdeaCount: 5`
- `missingTemplateRecipeCount: 0`
- `hookPlanCount: 30`
- `expectedHookOptionCount: 240`
- `hookOptionCount: 240`

## Proposed Atomic File Tree

The exact implementation may reuse existing atomic helpers, but new files
should follow this responsibility split.

```text
web/
  app/
    dashboard/hooks/
      HookLabPageClient.tsx
    _components/hooks/
      HookLabViewTabs.tsx
      HookLabIdeaComposer.tsx
      HookLabIdeaGrid.tsx
      HookLabIdeaCard.tsx
      HookLabIdeaStatusBadge.tsx
      HookLabIdeaCapabilityChips.tsx
      HookLabIdeaUseControls.tsx
      HookLabIdeaDefaultsDialog.tsx
      HookLabIdeaStitchPicker.tsx
      HookLabReviewGrid.tsx
      HookLabReviewCard.tsx
      HookLabWritingPreferencesDialog.tsx
    api/hook-lab/ideas/
      route.ts
      createHookLabIdeaRoute.ts
      listHookLabIdeasRoute.ts
      [id]/retry/route.ts
      [id]/use/route.ts
  convex/
    hookLabIdeas/
      create.ts
      get.ts
      list.ts
      update.ts
      archive.ts
      remove.ts
      completeAnalysisFromProvider.ts
      failAnalysisFromProvider.ts
    hookLabIdeaUses/
      create.ts
      get.ts
      updateVariantFromProvider.ts
    stitchrHookOptions/
      listReview.ts
      select.ts
      saveAsIdea.ts
      markNotForMe.ts
      undoFeedback.ts
    migrations/
      migrateStitchTemplatesToHookLabIdeas.ts
  lib/clipstitchr/
    types/
      HookLabIdea.ts
      HookLabIdeaStatus.ts
      HookLabIdeaSourceType.ts
      HookLabIdeaScope.ts
      HookLabTextBlueprint.ts
      HookLabCreativeBeat.ts
      HookLabStitchRecipe.ts
      HookLabIdeaUse.ts
      HookLabIdeaVariant.ts
      HookLabImportedSource.ts
    server/hookLab/
      canonicalizeHookLabSourceUrl.ts
      getHookLabSourcePlatform.ts
      createHookLabTextAnalysisPrompt.ts
      parseHookLabTextAnalysis.ts
      createHookLabVideoAnalysisPrompt.ts
      parseHookLabVideoAnalysis.ts
      createHookLabUsePrompt.ts
      parseHookLabUseOutput.ts
      decideHookLabExactTextReuse.ts
      assertHookLabAdaptedText.ts
      createHookLabImportedSource.ts
      createHookLabTikTokSource.ts
      createHookLabInstagramSource.ts
      createHookLabStitchSource.ts
      createHookLabRemoteVideoRequestHeaders.ts
      deleteHookLabTemporaryVideo.ts
      fetchHookLabRemoteVideo.ts
      getValidatedHookLabR2VideoUrl.ts
      dispatchHookLabIdeaAnalysis.ts
      dispatchHookLabIdeaUse.ts
    hooks/
      useHookLabIdeas.ts
      useHookLabIdeaActions.ts
      useHookLabIdeaActionFeedback.ts
      useCreateHookLabIdeaFromValue.ts
      useCreateHookLabIdeaFromStitchSelection.ts
      useCreateHookLabIdeaFromHookOption.ts
      useUpdateHookLabIdea.ts
      useArchiveHookLabIdea.ts
      useRemoveHookLabIdea.ts
      useRetryHookLabIdeaAnalysis.ts
      useStartHookLabIdeaUseAction.ts
      useHookLabReviewOptions.ts
  services/provider-worker/hookLab/
    analyzeHookLabOwnedSource.ts
    analyzeHookLabSocialSource.ts
    createHookLabIdeaAnalysis.ts
    createHookLabVideoThumbnail.ts
    deleteHookLabTemporarySourceVideo.ts
    getHookLabAnalysisErrorIsRetryable.ts
    getHookLabAnalysisSourceContext.ts
    pickHookLabAnalysisSourceFields.ts
    recordHookLabAnalysisPrediction.ts
    saveHookLabTemporarySourceVideo.ts
```

Route files only authenticate, parse, delegate, and format responses. Provider,
parser, adapter, mutation, component, hook, type, and validator responsibilities
remain isolated in their own files. `useHookLabIdeaActions.ts` is only a public
composition boundary; each action and its activity state live in the focused
hook named above.

## Delivery Phases

### Phase 1: fix the current trust failures — implemented

- normalize hook options into independent review rows
- ship one-hook-per-card Review
- remove parent Accept/Reject actions
- strengthen text adaptation output and similarity safeguards
- stop automatic Template creation from feedback

### Phase 2: unify Templates and Ideas — implemented with compatibility

- add the Idea model and Ideas view
- add product defaults
- save Ideas from text, generated hooks, and existing Stitches
- backfill and dual-read Templates
- remove Templates from Library navigation

### Phase 3: social import and creative-beat analysis — implemented in code

- add TikTok and Instagram adapters
- add durable Apify analysis jobs
- enforce temporary-media deletion and new limits
- produce structured creative beats and thumbnails

### Phase 4: one-click ready drafts — implemented

- create Idea use/variant lineage
- generate default-avatar UGC openings
- create 1, 3, or 5 server-owned Stitch variants
- surface per-variant progress and partial failures for the current browser
  session

Restoring the latest use after reload and supporting an exact completed-Stitch
deep link remain follow-up navigation polish; they do not block one-click draft
creation or current-session review.

### Phase 5: campaign learning — lineage implemented; ranking remains later

- join Idea lineage to posted analytics
- rank relevant Ideas using actual use and performance signals
- design fatigue guidance as a separately documented capability

Each phase must update this document, the current Hook Lab documentation,
`project-scope.md`, product copy, analytics documentation, and rate-limit
documentation to match what is actually shipped.

## Source References

Local implementation references:

- `project-scope.md`
- `docs/features/stitchr-hook-lab.md`
- `docs/stitchr-batch-hook-planning.md`
- `docs/backend/provider-automation-workflows.md`
- `docs/backend/rate-limits.md`
- `web/lib/clipstitchr/server/createStitchrHookGenerationPrompt.ts`
- `web/lib/clipstitchr/server/formatHookLabPromptMemory.ts`
- `web/convex/hookLabIdeas/getHookLabPromptBlueprints.ts`
- `web/lib/clipstitchr/server/createUploadVideoAnalysisPrompt.ts`
- `web/lib/clipstitchr/server/createUploadVideoAnalysisOutputText.ts`
- `web/lib/clipstitchr/server/apify/runApifyActorDataset.ts`
- `web/lib/clipstitchr/server/tiktok/createTikTokScraperUrlInput.ts`
- `web/convex/stitchrHookPlans.ts`
- `web/convex/schema.ts`

External references checked for this design:

- [Apify Run Actor API](https://docs.apify.com/api/v2/act-runs-post)
- [Apify dataset items API](https://docs.apify.com/api/v2/dataset-items-get)
- [Apify webhook integration](https://docs.apify.com/integrations/webhooks)
- [Clockworks TikTok Scraper](https://apify.com/clockworks/tiktok-scraper)
- [Apify Instagram Scraper](https://apify.com/apify/instagram-scraper)

The Actor pages are runtime dependencies, not permanent contracts. Before each
production rollout, fixture-test the selected actor input/output shapes and
verify current pricing, media availability, retention, and terms.

## Decision Log

| Decision | Alternatives | Reason |
| --- | --- | --- |
| Keep the name Hook Lab | Ideas, Idea Lab | Preserves the existing product concept while expanding its job. |
| Make Ideas the default view | Review first, preferences first | Creating reusable concepts is the primary user outcome. |
| Use one flexible Idea model | Separate hook, visual, and Template models | A user should not decide which internal system owns their inspiration. |
| Replace Templates | Keep separate, nest unchanged | Templates are a subset of repeatable ideas and caused navigation ambiguity. |
| Keep Review separate inside Hook Lab | Mix cards into Ideas | Generated candidates and durable reusable Ideas have different lifecycles. |
| One hook per card | Nested options, batch selection | Feedback must never accidentally affect siblings. |
| Save Ideas explicitly | Accept creates Template automatically | The user should understand when durable memory is created. |
| Shared by default, optionally product-locked | Always shared, always locked | Supports cross-niche inspiration without losing product control. |
| Product default avatar and demo | Ask every use, AI selects assets | Makes the primary action one click and remains predictable. |
| One version by default | Always three, per-Idea default | Controls cost and review load while keeping variation available. |
| AI decides reuse versus adaptation with hard gates | Always adapt, ask each time | Honors already-relevant copy without allowing placeholders or niche leakage. |
| Repeat the creative beat | Shot-for-shot clone, loose inspiration | Preserves what made the idea useful without producing a near-copy. |
| Delete imported video after analysis | Retain privately, user choice | Minimizes storage, privacy, and source-content risk. |
| Use durable async jobs | Synchronous API request | Apify, multimodal analysis, video generation, and stitching exceed reliable request lifetimes. |
| Keep Idea lineage on every output | Add analytics linkage later | Enables long-term campaign learning without a future data migration. |

## Non-Goals

- downloading or archiving third-party social videos
- reposting imported media
- cloning a creator's likeness, identity, voice, room, wardrobe, or exact shots
- importing private or login-gated posts
- supporting arbitrary social networks in the first release
- automatically declaring an Idea a winner from one post
- silently rewriting saved Ideas from performance data
- replacing Stitchr's review and editing controls
- generating more than five variants from one Hook Lab action
