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

Existing Convex auth variables still apply:

- `NEXT_PUBLIC_CONVEX_URL` in Next.js.
- `CLERK_JWT_ISSUER_DOMAIN` in the Convex deployment.

Optional Replicate model overrides:

- `REPLICATE_UPLOAD_ANALYSIS_MODEL_ID` defaults to `openai/gpt-4.1-mini` for
  avatar/photo image analysis and video poster fallback analysis.
- `REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID` defaults to
  `google/gemini-3-flash` for full-video UGC/demo action analysis.

## Enforcement Map

| Surface | Enforcement Point | Limit |
| --- | --- | --- |
| R2 upload signed URL | `POST /api/r2/upload-url` | 2,000/hour/user, burst 500 |
| R2 upload bytes | `POST /api/r2/upload-url` | 10 GB/day/user; 500 GB/30 days/user |
| R2 download signed URL | `POST /api/r2/download-url` | 5,000/hour/user, burst 1,000 |
| R2 deletes | `POST /api/r2/delete-objects` | 2,000 objects/hour/user, burst 500 |
| Upload image metadata analysis | `POST /api/uploads/analyze` for avatar/photo images and video fallback posters | 300/hour/user, burst 100; 10,000/30 days/user; global 6,000/hour |
| Upload video action analysis | `POST /api/uploads/analyze` for UGC/demo videos | 60/hour/user, burst 20; 1,500/30 days/user; global 1,000/hour. Gemini full-video analysis runs first for videos up to 100 MB; OpenAI poster analysis is the fallback when Gemini fails or the video exceeds the analysis size cap. |
| Swapr photo expansion | `POST /api/swapr/photos/expand` | 10/hour/user, burst 5; 20/day/user; 375/30 days/user; global 300/hour |
| Swapr video job create | `POST /api/swapr/jobs` | 2/hour/user, burst 2; 5/day/user; 500 estimated output seconds/30 days/user; global 300/hour |
| Swapr job polling | `GET /api/swapr/jobs/{id}` | 600/minute/user, burst 150 |
| Swapr job cancellation | `POST /api/swapr/jobs/{id}/cancel` | 100/hour/user, burst 20 |
| Swapr output proxy | `GET /api/swapr/output` | 1,000/hour/user, burst 200 |
| Avatar photo generation | `POST /api/avatars/photos/generate` | 15 generated images/hour/user, burst 10; 25 generated images/day/user; 500 generated images/30 days/user; global 1,000 generated images/hour |
| Avatar cascade delete | `DELETE /api/avatars/{id}` | 100/hour/user, burst 20 |
| Convex record saves | `avatars.save`, `videoClips.save`, `photoAssets.save`, `stitches.save` | 3,000/hour/user, burst 500 |
| Convex metadata updates | `avatars.update`, `updateMetadata` mutations | 5,000/hour/user, burst 1,000 |
| Convex poster updates | `updatePoster` mutations | 1,000/hour/user, burst 300 |
| Convex record deletes | `remove` mutations | 2,000/hour/user, burst 500 |

## Client Batch Caps

Client upload controls enforce batch sizes before any processing, signed URL
request, R2 upload, or Convex save starts:

| Surface | Client Cap | Reason |
| --- | --- | --- |
| Photo upload without AI expansion | 100 files at once | Each photo creates 3 R2 objects and 1 metadata analysis request, fitting under the R2 upload, analysis, and Convex-save burst limits. |
| Photo upload with AI expansion | 1 file at once | Each source image may trigger paid outpainting before it is saved, so the UI keeps this workflow explicitly one-at-a-time. |
| Video upload | 20 files at once | Each video usually creates 1 normalized video object, 1 poster object, and 1 Gemini video analysis request, fitting under the R2 upload, video-analysis, and Convex-save burst limits. |
| Stitchr UGC batch | 20 selected UGC videos at once | Each selected UGC creates one stitched output with the selected demo, usually 1 stitch video object, 1 stitch poster object, and 1 Convex stitch save. The batch fits under the R2 upload and Convex-save burst limits while keeping browser encoding sequential. |

These caps reduce partial batches and orphaned R2 objects. They do not replace
server-side rate limits: prior usage in the same window can still cause a `429`
before expensive work is started.

## Replicate Ownership

Swapr video predictions are recorded in Convex after creation. Poll, cancel, and
output proxy routes must prove the prediction belongs to the authenticated user
before calling Replicate or fetching an output URL.

Avatar photo generation is rate-limited by requested output image count before
calling Replicate. The GPT Image 2 model accepts up to 10 outputs in one
prediction, but ClipStitchr runs one prediction per generated avatar photo so
each output can receive a unique prompt variant and avoid grid/contact-sheet
results. Each prediction is recorded as an `avatar-photo` Replicate job.
Generation speed profiles may run those one-image predictions concurrently:
Creator runs 1 at a time, Pro runs up to 2, and Studio runs up to 4. This
concurrency does not loosen the image-count rate limit; the full requested count
is consumed before any Replicate prediction is created.

Upload video analysis is rate-limited separately from avatar/photo image
analysis because it can upload the normalized video to Replicate and ask Gemini
for a chronological action breakdown. The route consumes the video-analysis
limit before creating the Gemini prediction. If Gemini fails, or if the
normalized video is larger than 100 MB, the route falls back to the existing
OpenAI image-analysis path using the generated poster image when one is
available.

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

Client save flows that write multiple R2 objects for one logical asset request
all signed URLs before any `PUT` starts. That keeps a rate-limit rejection on
one object from leaving a partially uploaded photo, video, Swapr output, or
stitch object group in R2.

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
