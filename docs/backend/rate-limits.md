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

## Enforcement Map

| Surface | Enforcement Point | Limit |
| --- | --- | --- |
| R2 upload signed URL | `POST /api/r2/upload-url` | 100-/hour/user, burst 30 |
| R2 upload bytes | `POST /api/r2/upload-url` | 2 GB/day/user |
| R2 download signed URL | `POST /api/r2/download-url` | 120/hour/user, burst 30 |
| R2 deletes | `POST /api/r2/delete-objects` | 100 objects/hour/user, burst 25 |
| Upload metadata analysis | `POST /api/uploads/analyze` | 30/hour/user, burst 5; global 600/hour |
| Swapr photo expansion | `POST /api/swapr/photos/expand` | 5/hour/user, burst 2; global 60/hour |
| Swapr video job create | `POST /api/swapr/jobs` | 3/hour/user, burst 2; 10/day/user; global 30/hour |
| Swapr job polling | `GET /api/swapr/jobs/{id}` | 120/minute/user, burst 30 |
| Swapr job cancellation | `POST /api/swapr/jobs/{id}/cancel` | 30/hour/user, burst 5 |
| Swapr output proxy | `GET /api/swapr/output` | 30/hour/user, burst 10 |
| Avatar photo generation | `POST /api/avatars/photos/generate` | 20 generated images/hour/user, burst 10; 30 generated images/day/user; global 200 generated images/hour |
| Convex record saves | `avatars.save`, `videoClips.save`, `photoAssets.save`, `stitches.save` | 30/hour/user, burst 10 |
| Convex metadata updates | `avatars.update`, `updateMetadata` mutations | 120/hour/user, burst 30 |
| Convex poster updates | `updatePoster` mutations | 60/hour/user, burst 15 |
| Convex record deletes | `remove` mutations | 100/hour/user, burst 20 |

## Replicate Ownership

Swapr video predictions are recorded in Convex after creation. Poll, cancel, and
output proxy routes must prove the prediction belongs to the authenticated user
before calling Replicate or fetching an output URL.

Avatar photo generation is rate-limited by requested output image count before
calling Replicate. The GPT Image 2 model accepts up to 10 outputs in one
prediction, but ClipStitchr runs one prediction per generated avatar photo so
each output can receive a unique prompt variant and avoid grid/contact-sheet
results. Each prediction is recorded as an `avatar-photo` Replicate job.

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
