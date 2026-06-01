# Rate Limits

ClipStitchr uses application-layer rate limits for operations that can create
storage cost, external API cost, or excessive backend churn. The source of truth
is the Convex Rate Limiter component, even when the protected operation starts
in a Next.js route handler.

## Goals

- Reject abusive requests before issuing R2 signed URLs.
- Reject expensive AI requests before calling Replicate.
- Bound user-driven Convex writes.
- Keep Replicate prediction polling and output proxying scoped to the user that
  created the prediction.
- Fail closed with `429` and a `Retry-After` header when a limit is exceeded.

## Component Setup

Install the component from `web/`:

```bash
npm install @convex-dev/rate-limiter
```

Register it in `web/convex/convex.config.ts`:

```ts
import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

const app = defineApp();

app.use(rateLimiter);

export default app;
```

Run Convex codegen/deploy after adding the component:

```bash
npx convex dev --once
```

## Environment Variables

`RATE_LIMIT_API_SECRET`

- Required in both the Next.js runtime environment and the Convex deployment
  environment.
- Used by server-only Next.js API routes when they call Convex rate-limit
  consume mutations.
- Must be a high-entropy random secret.
- Must not be prefixed with `NEXT_PUBLIC_`.

`INDEXNOW_SUBMIT_SECRET`

- Required in the Next.js runtime environment to use `POST /api/indexnow`.
- Authorizes manual sitemap-wide IndexNow submissions with either
  `Authorization: Bearer <secret>` or `x-indexnow-submit-secret: <secret>`.
- Must be a high-entropy random secret and must not match the public IndexNow
  verification key file.
- Must not be prefixed with `NEXT_PUBLIC_`.

TikTok Events API variables:

- `TIKTOK_EVENTS_API_ACCESS_TOKEN` enables server-side TikTok Events API
  forwarding from `POST /api/analytics/tiktok/events`.
- `TIKTOK_EVENTS_API_PIXEL_ID` optionally overrides the server-side
  `event_source_id`; when omitted, the server uses `NEXT_PUBLIC_TIKTOK_PIXEL_ID`
  or the app's default pixel ID.
- `TIKTOK_EVENTS_API_TEST_EVENT_CODE` optionally adds TikTok's test event code
  to Events API payloads during testing. Remove it for production attribution.

Existing Convex auth variables still apply:

- `NEXT_PUBLIC_CONVEX_URL` in Next.js.
- `CLERK_JWT_ISSUER_DOMAIN` in the Convex deployment.

Optional Replicate model overrides:

- `AVATAR_PHOTO_MODEL_ID` defaults to `openai/gpt-image-2` for avatar photo
  generation. Supported workflows include `openai/gpt-image-2` and
  `minimax/image-01`.
- `REPLICATE_UPLOAD_ANALYSIS_MODEL_ID` defaults to `openai/gpt-4.1-mini` for
  avatar/photo image analysis and video poster fallback analysis.
- `REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID` defaults to
  `google/gemini-3-flash` for full-video UGC/demo action analysis.
- `SWIPR_BACKGROUND_MODEL_ID` defaults to `openai/gpt-image-2` for Swipr AI
  background generation. Supported workflows include `openai/gpt-image-2`,
  `prunaai/p-image`, and `prunaai/wan-2.2-image`.
- `PRODUCT_ENRICHMENT_MODEL_ID` defaults to `openai/gpt-4.1` for hidden product
  strategy enrichment when saving products in Settings.
- `CLIPR_HOOK_MODEL_ID` defaults to `openai/gpt-4.1` for Clipr hook, script,
  Swipr auto-text, and Stitchr auto-text generation.
- Clipr avatar still generation uses `AVATAR_PHOTO_MODEL_ID`, the same model
  configuration and provider input path as avatar photo generation, but creates
  one source still before full-script avatar video generation.
- `CLIPR_AVATAR_VIDEO_MODEL_ID` defaults to `prunaai/p-video-avatar` for Clipr
  full-script avatar video and voice generation.
- `CLIPR_MUSIC_MODEL_ID` defaults to `stability-ai/stable-audio-2.5` for
  optional 60 second Clipr, Stitchr, and shared-library background music
  generation. Generated music is copied to the shared music library and, when
  attached to a user's output or generated from the picker, to the user's
  personal R2 prefix.
- `CLIPR_TTS_MODEL_ID` is legacy/reserved; Clipr voice selection is handled by
  `prunaai/p-video-avatar`.

## Enforcement Map

| Surface | Enforcement Point | Limit |
| --- | --- | --- |
| R2 upload signed URL | `POST /api/r2/upload-url` | 2,000/hour/user, burst 500 |
| R2 upload bytes | `POST /api/r2/upload-url` | 10 GB/day/user; 500 GB/30 days/user |
| R2 download signed URL | `POST /api/r2/download-url` | 5,000/hour/user, burst 1,000 |
| R2 batch image download signed URLs | `POST /api/r2/download-urls` | Uses the R2 download signed URL limit once per authenticated batch after validating every key belongs to the user and is a cacheable `poster.*` or `thumbnail.*` image. Requests are capped at 48 keys. |
| R2 deletes | `POST /api/r2/delete-objects` | 2,000 objects/hour/user, burst 500 |
| Shared Swipr background R2 upload signed URL | `POST /api/swipr/backgrounds/upload-url` | Uses the R2 upload signed URL and byte limits before creating a shared-background PUT URL |
| Shared Swipr background R2 download signed URL | `POST /api/swipr/backgrounds/download-url` | Uses the R2 download signed URL limit after validating the shared background exists |
| Shared music R2 download signed URL | `POST /api/music/download-url` | Uses the R2 download signed URL limit after validating the shared music track exists |
| Upload image metadata analysis | `POST /api/uploads/analyze` for avatar/photo images and video fallback posters | 300/hour/user, burst 100; 10,000/30 days/user; global 6,000/hour |
| Swipr background metadata analysis | `POST /api/swipr/backgrounds/analyze` | Uses the upload image metadata analysis limits before calling GPT-4.1 mini through Replicate |
| Upload video action analysis | `POST /api/uploads/analyze` for UGC/demo videos | 60/hour/user, burst 20; 1,500/30 days/user; global 1,000/hour. Gemini full-video analysis runs first for videos up to 100 MB; OpenAI poster analysis is the fallback when Gemini fails or the video exceeds the analysis size cap. |
| Swapr photo expansion | `POST /api/swapr/photos/expand` | 10/hour/user, burst 5; 20/day/user; 375/30 days/user; global 300/hour |
| Swapr video job create | `POST /api/swapr/jobs` | 2 Swapr batches/hour/user, burst 2; 5 Swapr batches/day/user; 500 estimated output seconds/30 days/user; technical provider segment guard 60 segments/hour/user and 180 segments/day/user; global 300 provider segments/hour. The Swapr page accepts source videos up to 90 seconds, cuts longer sources into provider-sized segments, and calls this route once per segment. Only segment 0 consumes the user-facing batch and monthly generated-seconds buckets using the full source duration; every segment still consumes the technical per-user segment guard and global provider bucket. The route accepts saved R2 media references only, consumes the R2 download signed URL limit for the photo and reference video segment, then creates short-lived R2 read URLs for Replicate. |
| Swapr job polling | `GET /api/swapr/jobs/{id}` | 600/minute/user, burst 150 |
| Swapr job cancellation | `POST /api/swapr/jobs/{id}/cancel` | 100/hour/user, burst 20 |
| Swapr output proxy | `GET /api/swapr/output` | 1,000/hour/user, burst 200 |
| Avatar photo generation | `POST /api/avatars/photos/generate` from the Avatars page or UGC clip avatar action | 15 generated images/hour/user, burst 10; 25 generated images/day/user; 500 generated images/30 days/user; global 1,000 generated images/hour |
| Swipr AI background generation | `POST /api/swipr/backgrounds/generate` | 20 images/hour/user, burst 8; 50 images/day/user; 500 images/30 days/user; global 1,000 images/hour |
| Swipr seeded background import | `POST /api/dev/swipr/backgrounds/seed` in development; future admin-only seed runner in production | Development route is unavailable outside `NODE_ENV=development`, imports at most 5 images/request, skips already-saved seed IDs, consumes the development seed-generation bucket before provider work, consumes R2 upload limits before storage work, and saves through `swiprBackgrounds.save`; production runner must be admin-only, batch-capped, checkpointed, and counted against shared provider, R2 upload, and Convex record-save protection before persistence |
| Public waitlist submission | `waitlist.submit` from `/sign-up` | 3/hour/normalized email, burst 3; shared global bucket 500/hour, burst 100 |
| TikTok Events API forwarding | `POST /api/analytics/tiktok/events` after marketing-cookie consent | 120/hour/client fingerprint, burst 30; shared global bucket 5,000/hour, burst 1,000 |
| IndexNow sitemap submission | `POST /api/indexnow` with `INDEXNOW_SUBMIT_SECRET` | Submits all public sitemap URLs only, excludes authenticated dashboard/API routes, requires a public `NEXT_PUBLIC_SITE_URL`, consumes 500 submitted URLs/hour/client fingerprint, burst 100; shared global bucket 5,000 submitted URLs/hour, burst 500 |
| Product enrichment | `POST /api/settings/products`, `PATCH /api/settings/products/{id}` | 100/hour/user, burst 20; 2,000/30 days/user; global 5,000/hour |
| Clipr job create | `POST /api/clipr/jobs` | 3/hour/user, burst 2; 8/day/user; 900 generated seconds/30 days/user; shared global provider bucket 10,000 units/hour, burst 2,000 |
| Clipr hook/script generation | `POST /api/clipr/jobs` and `POST /api/clipr/text` | 30/hour/user, burst 10; shared global provider bucket 10,000 units/hour, burst 2,000 |
| Clipr avatar still generation | `POST /api/clipr/jobs` before the full-script avatar video call | 20 images/hour/user, burst 6; global provider bucket counted once per still. After the still succeeds, the route consumes R2 upload byte limits before saving personal avatar-photo and thumbnail copies. |
| Clipr avatar video and voice generation | `POST /api/clipr/jobs` before calling `prunaai/p-video-avatar` | 600 estimated avatar seconds/hour/user, burst 180; global provider bucket counted by estimated seconds |
| Clipr music generation | `POST /api/clipr/jobs` when music is selected and `POST /api/clipr/music` when regenerating music for an existing Clip | 600 generated music seconds/hour/user, burst 180; 1,200 generated music seconds/day/user; shared global provider bucket counted by generated seconds. Each music file is fixed at 60 seconds. |
| Stitchr music generation | `POST /api/stitches/music` when creating or regenerating music for a saved stitch | 600 generated music seconds/hour/user, burst 180; 1,200 generated music seconds/day/user; shared global provider bucket counted by generated seconds. Each music file is fixed at 60 seconds. |
| Shared music generation | `POST /api/music/generate` from the shared music picker | 600 generated music seconds/hour/user, burst 180; 1,200 generated music seconds/day/user; shared global provider bucket counted by generated seconds. Each music file is fixed at 60 seconds. |
| Clipr job polling | Reserved Clipr polling route and Convex job refreshes | 600/minute/user, burst 150 |
| Clipr job cancellation | `cliprJobs.cancel` | 100/hour/user, burst 20 |
| Avatar cascade delete | `DELETE /api/avatars/{id}` | 100/hour/user, burst 20 |
| Convex record saves | `avatars.save`, `videoClips.save`, `photoAssets.save`, `products.create`, `stitches.save`, `swiprBackgrounds.save`, `sharedMusicTracks.save`, new `swipes.save` records | 3,000/hour/user, burst 500 |
| Convex metadata updates | `avatars.update`, `updateMetadata` mutations, `videoClips.updateCliprMusic`, `stitches.updateMusic`, `stitches.updateTextOverlay`, `stitches.updateRenderedVideo`, `products.update`, `cliprPreferences.setDefaultVoice`, existing `swipes.save` records | 5,000/hour/user, burst 1,000 |
| Convex poster updates | `updatePoster` mutations | 1,000/hour/user, burst 300 |
| Convex record deletes | `remove` mutations | 2,000/hour/user, burst 500 |
| Convex Clipr job writes | `cliprJobs.createQueued`, `cliprJobs.applyScriptPlan`, `cliprJobs.recordAvatarImageOutput`, `cliprJobs.recordAvatarVideoOutput`, `cliprJobs.markBrowserSaving`, `cliprJobs.finalizeWithClip` | 3,000/hour/user, burst 500 |

## Intentionally Not Rate-Limited

Aggregate library count reads through `libraryCounts.get` are authenticated,
read-only Convex queries backed by the Aggregate component. They do not create
storage, bandwidth, provider, or external API cost, so they are not
rate-limited.

Aggregate backfill mutations in `aggregateBackfills.ts` are operator-only
maintenance functions gated by `RATE_LIMIT_API_SECRET`, paginated, and
idempotent. They are intentionally not exposed in the UI and are not
rate-limited; operators should run them in bounded pages and stop when
`isDone` is `true`.

## Local-Only Workflows

Swipr carousel export is intentionally not rate-limited in the MVP because the
browser renders saved editable Swipe state into 9:16 PNG images with Canvas and
creates a local ZIP download. Saving a Swipe stores Convex metadata, slide text
overlay state, per-slide background references, a fallback background reference
for older Swipes, and one R2-backed poster image rendered from the first slide
with its text overlay. The poster upload consumes the normal R2 upload signed
URL and byte limits before `swipes.save`.

Stitchr Longr-mode rendering is browser-local and has no provider cost unless
the user opens the shared music picker and generates a new music track through
`POST /api/music/generate`. Saving the finished output stores a normal Stitch,
so it consumes the shared R2 upload limits and the shared Convex record-save
limit for `stitches.save`.

Swipr AI background generation is separate from export: it calls the selected
Replicate image model through `POST /api/swipr/backgrounds/generate`, consumes
the dedicated Swipr AI background limits before creating the prediction, and
streams the generated image back to the browser. `openai/gpt-image-2` requests
low-quality 2:3 generation by default for speed; the Pruna background models
request direct 9:16 output. The client then analyzes the generated image through
`POST /api/swipr/backgrounds/analyze`, uploads it through
`POST /api/swipr/backgrounds/upload-url`, and saves the shared background
metadata through `swiprBackgrounds.save`.

Uploaded Swipr backgrounds use the same analysis, shared R2 upload, and
`swiprBackgrounds.save` path. Shared backgrounds live under a shared R2 key
prefix and are downloadable by authenticated users through the Swipr background
download route after Convex validation. They are intentionally not user-deletable
through the shared background model.

The Swipr creation page can upload multiple photos in one browser selection and
generate one AI photo per current carousel image. There is no separate batch
endpoint: each generated photo calls `POST /api/swipr/backgrounds/generate` and
consumes the existing per-image Swipr AI background limits before provider work;
each uploaded or generated photo then consumes the existing image-analysis, R2
upload, and Convex record-save protections before persistence.

Seeded Swipr backgrounds are planned through the deterministic seed catalog in
`createSwiprBackgroundSeedPlans`. The seed metadata replaces the background
analysis call for those images, so the development seed route and future import
runner save the prefilled name, tags, description, and details directly after
generation/upload. The development route is batch-capped at five images and is
unavailable outside `NODE_ENV=development`; the production runner must be
admin-only, checkpointed, and batch-limited before creating provider predictions
or R2 objects.

Settings product creates and edits call Replicate GPT-4.1 through
`POST /api/settings/products` and `PATCH /api/settings/products/{id}` to infer
hidden product strategy metadata before saving the product to Convex. The route
consumes the product enrichment limit before creating the prediction, then
`products.create` consumes the shared Convex record-save limit or
`products.update` consumes the shared Convex metadata-update limit before the
database write. `products.remove` consumes the shared Convex record-delete limit.

The shared music picker searches `sharedMusicTracks`. Selecting an existing
track only creates an R2 download signed URL after Convex validation and uses
the normal R2 download limit. Generating a new picker track consumes the shared
music generation limits before the Replicate call, then consumes R2 upload bytes
for two copies of the generated audio: one under `shared/music/...` and one
under the user's personal music prefix. `sharedMusicTracks.save` consumes the
shared Convex record-save limit. Shared music objects are not user-deletable
through the personal R2 delete route.

Clipr browser final preparation is intentionally not separately rate-limited in
the MVP because the current simplified Clipr flow normalizes one generated
avatar video and saves it as a Clip rather than stitching multiple generated
scenes. The expensive surfaces are gated before work starts: job creation,
hook/script generation, avatar still generation, full-script avatar video
generation, optional music generation, R2 object creation, and Convex final
save. Clipr saves the normalized full avatar video directly as the final Clipr
clip. The generated avatar still is also saved as an avatar photo attached to
the selected avatar; the route consumes R2 upload byte limits before writing the
photo and thumbnail objects, and `photoAssets.save` consumes the shared Convex
record-save limit. Optional generated music is stored as a personal audio
object and as a shared library track; selecting an existing shared track skips
the music provider call. Music is mixed into a fresh downloadable file only when
the user exports/downloads. That export-time Media Bunny render is browser-local and is
not separately rate-limited. Saved Stitchr outputs use the same export-time
model: saving a stitch stores source clip references, trim ranges, text, source
audio flags, and music metadata in Convex without uploading a rendered stitch
video to R2. When a stitch has text, the browser renders and uploads one
text-aware stitch poster through the normal R2 upload limits and records it with
`stitches.save` or `stitches.updatePoster`; export-time stitching and music
mixing are browser-local and are not separately rate-limited. `POST /api/stitches/music` consumes the
Stitchr music limits before Replicate, then R2 upload limits for both personal
and shared copies. After script planning, Clipr
consumes the avatar-video limit and, when generated music is requested, the 60
second music-generation limit before creating the avatar still, so a rate-limit
rejection does not leave an image generated without the provider work that
follows.

The expanded hook libraries are local prompt resources, not new backend
operations. Swipr and Stitchr auto-text continue to use `POST /api/clipr/text`
and the existing Clipr hook/script generation rate limit before the provider
call.

## Client Batch Caps

Client upload controls enforce batch sizes before any processing, signed URL
request, R2 upload, or Convex save starts:

| Surface | Client Cap | Reason |
| --- | --- | --- |
| Photo upload without AI expansion | 100 files at once | Each photo creates 3 R2 objects and 1 metadata analysis request, fitting under the R2 upload, analysis, and Convex-save burst limits. |
| Photo upload with AI expansion | 1 file at once | Each source image may trigger paid outpainting before it is saved, so the UI keeps this workflow explicitly one-at-a-time. |
| Video upload | 20 files at once | Each video usually creates 1 normalized video object, 1 poster object, and 1 Gemini video analysis request, fitting under the R2 upload, video-analysis, and Convex-save burst limits. |
| Stitchr UGC batch | 20 selected UGC videos at once | Each selected UGC creates one editable stitch with the selected demo, copied trims, text, and audio settings. Creating the batch consumes Convex stitch saves and, when text is present, one stitch-poster R2 upload per output; export-time browser encoding runs only when the user downloads/exports. |
| Stitchr Longr-mode output | 1 finished Stitch at a time | Longr mode creates one browser-rendered 9:16 Stitch from the ordered sequence. The one-at-a-time cap limits browser encode work, output size, R2 upload bytes, and preview complexity. |

These caps reduce partial batches and orphaned R2 objects. They do not replace
server-side rate limits: prior usage in the same window can still cause a `429`
before expensive work is started.

## Replicate Ownership

Swapr video predictions are recorded in Convex after creation. Poll, cancel, and
output proxy routes must prove the prediction belongs to the authenticated user
before calling Replicate or fetching an output URL.

Avatar photo generation is rate-limited by requested output image count before
calling Replicate, including generation started from a UGC clip poster in the
Content Library. `openai/gpt-image-2` accepts up to 10 outputs in one
prediction, but ClipStitchr runs one prediction per generated avatar photo so
each output can receive a unique prompt variant and avoid grid/contact-sheet
results. The MiniMax Image-01 workflow is also one prediction per generated
image because ClipStitchr gives each output a unique prompt variant and one
source `subject_reference` image.
Each prediction is recorded as an `avatar-photo` Replicate job.
Generation speed profiles may run those one-image predictions concurrently:
Creator runs 1 at a time, Pro runs up to 2, and Studio runs up to 4. This
concurrency does not loosen the image-count rate limit; the full requested count
is consumed before any Replicate prediction is created.

Upload video analysis is rate-limited separately from avatar/photo image
analysis because it can send the normalized video to Gemini for a chronological
action breakdown. The client uploads the normalized video to R2 first, requests
a short-lived R2 download URL, and sends that URL to the analysis route so
Gemini receives a media URL with the stored object content type instead of a
Replicate Files URL. The route consumes the video-analysis limit before creating
the Gemini prediction. If Gemini fails, or if the normalized video is larger
than 100 MB, the route falls back to the existing OpenAI image-analysis path
using the generated poster image when one is available.

Swapr video generation is rate-limited both by job count and by estimated output
seconds. The route uses the source orientation limit as the estimate: image-led
jobs consume 10 seconds from the monthly budget and video-led jobs consume 30
seconds. This is a spend-control approximation until provider-side final
duration is stored in the job ledger.

Swapr speed profiles can override requested provider settings when a
`generationSpeedTier` is supplied. Creator maps to `Quality 1080p` with Match
Photo orientation; Pro and Studio map to `Fast 720p` with Match Photo
orientation. Match Photo keeps the faster 3-10 second source path and aligns
with ClipStitchr's normalized 9:16 output workflow.

Provider outputs must be finalized by a durable server-side path before they are
treated as saved user assets. See `docs/backend/durable-workflows.md` for the
job model, webhook requirements, and recovery behavior.

The output proxy requires both the prediction ID and the output URL. The URL must
match the latest stored output URL for that prediction. This prevents a signed-in
user from using the app as a generic Replicate output proxy.

## R2 Notes

The upload-byte budget uses the browser-provided blob size when requesting a
signed URL. This is useful quota accounting, but it is not a complete object-size
enforcement mechanism because the browser uploads directly to R2 after the URL is
issued. Keep signed URL lifetimes short and add orphan cleanup for objects that
were uploaded but never saved to Convex.

Library poster and thumbnail hydration should use `POST /api/r2/download-urls`
instead of many serial `POST /api/r2/download-url` calls. The batch route only
accepts user-owned `poster.*` and `thumbnail.*` keys, caps each request at 48
keys, and consumes the normal R2 download signed URL limit once after validation.
Clients should check persistent Cache Storage first and batch-sign only image
cache misses. Full video, photo, and audio blobs must continue to use the
single-object download helpers and should not be written to persistent browser
cache.

Client save flows that write multiple R2 objects for one logical asset request
all signed URLs before any `PUT` starts. That keeps a rate-limit rejection on
one object from leaving a partially uploaded photo, video, Swapr output, or
legacy rendered stitch object group in R2. Current Stitchr saves do not write
rendered stitch videos or posters to R2.

Avatar deletion is a confirmed destructive cascade. `DELETE /api/avatars/{id}`
is gated once by the avatar cascade delete limit, then deletes the avatar's R2
photo objects directly after owner-scope checks and before deleting Convex
photo records with `avatars.removeWithPhotos`. The related photo records are
not individually charged to `convexRecordDelete`, and the R2 cleanup is not
charged to `r2DeleteObjects`, so a confirmed avatar delete is not stranded by
per-photo or per-object delete limits.

## Verification

1. Run `npm ls @convex-dev/rate-limiter` from `web/`.
2. Run `npx convex dev --once` from `web/` and confirm generated API types
   include `components.rateLimiter`.
3. Run `npm run typecheck`.
4. Temporarily reduce one user limit to `rate: 1` and call the protected route or
   mutation twice as the same signed-in user.
5. Confirm the second call returns `429` with `Retry-After`.
6. Confirm R2 upload URL requests fail before any object is uploaded when the R2
   limit is exceeded.
7. Confirm Replicate create routes fail before `predictions.create` when the
   Replicate limit is exceeded.
8. Confirm polling, canceling, or proxying output for a prediction created by a
   different user is rejected.
