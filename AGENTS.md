# Repository Guidelines

## Project Structure & Module Organization

ClipStitchr is a browser-local Next.js MVP app under `web/`. The repository root contains project documentation:

- `project-scope.md` defines the MVP, target architecture, routes, data model, and video-processing decisions.
- `coding-guidelines.md` defines the required Atomic Code Splitting approach.
- `docs/references/media-bunny/guides.md` contains the full Media Bunny guide content. Read this first for Media Bunny workflows, recommended patterns, and conceptual guidance.
- `docs/references/media-bunny/api.md` contains the Media Bunny TypeScript API declarations. Use this as the source of truth for exact class names, option shapes, method signatures, and return types.

The app uses the planned Next.js shape from `project-scope.md`: app routes such as `/`, `/dashboard`, `/dashboard/library`, `/dashboard/hooks`, `/dashboard/stitchr`, `/dashboard/swapr`, `/dashboard/clipr`, and `/dashboard/swipr`; `/dashboard/library` is the authenticated Library with UGC, Demo, Swaps, Swipes, Stitches, Avatars, and Pexels tabs. Hook Lab at `/dashboard/hooks` has Ideas and Review views, and `/dashboard/templates` plus the legacy Library Templates query redirect to Hook Lab Ideas. `/dashboard/uploads`, `/dashboard/avatars`, and `/dashboard/stitches` still redirect to the relevant Library tab for compatibility. Durable metadata and media are backed by Convex and Cloudflare R2, browser video processing uses Media Bunny, uploads normalize to TikTok 9:16, poster images are generated for video preview default states, and Stitchr uses UGC-then-Demo sequencing for preview, stitching, and download. Stitchr supports selecting up to 20 UGC clips with one selected Demo clip; one shared text overlay is applied across the batch, and each selected UGC produces its own finished stitch.

## Media Bunny Implementation Guidance

For any Media Bunny-related change, read the relevant parts of these files before editing code:

- Start with `project-scope.md` to confirm product behavior, especially 9:16 normalization, UGC-then-Demo sequencing, and MVP exclusions.
- Read `docs/references/media-bunny/guides.md` for implementation patterns from the official guides, such as reading files, conversions, media sinks, media sources, output formats, and codec support checks.
- Use `docs/references/media-bunny/api.md` to verify exact imports, constructor options, method signatures, and types before writing TypeScript.

Use Media Bunny's `Conversion` API for single-upload normalization from one input file to one normalized 9:16 output. Do not use `Conversion` for UGC + Demo stitching; create a fresh `Output`, read both normalized clips with sinks, re-timestamp samples, and write them with media sources as described in `project-scope.md`.

## Build, Test, and Development Commands

Run app commands from `web/`. Prefer the package manager indicated by the committed lockfile.

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
```

## Google Cloud Run Worker Redeploys

Provider and media workers run as Google Cloud Run Jobs, not inside Vercel or
Convex. When worker code or shared backend code used by a worker changes,
redeploy both jobs from `web/` unless the change clearly affects only one
worker.

Default production values:

```bash
PROJECT_ID=clipstitchr
REGION=us-central1
TAG="<short-feature-name>-$(git rev-parse --short HEAD)"
REPOSITORY="$REGION-docker.pkg.dev/$PROJECT_ID/clipstitchr"
```

Build and push the provider worker:

```bash
cd web

docker build --platform linux/amd64 \
  -f services/provider-worker/Dockerfile \
  -t "$REPOSITORY/provider-worker:$TAG" \
  .

docker push "$REPOSITORY/provider-worker:$TAG"
```

Deploy the provider job with the existing production shape:

The provider deployment command assumes `clipstitchr-pexels-api-key` and
`clipstitchr-apify-token` exist in Secret Manager and grant
`140346842368-compute@developer.gserviceaccount.com` secret accessor access.
Create those secrets before deploying the Pexels-enabled Swipr and Hook Lab
social-import shape. Hook Lab explicitly enables video downloads for the
default Clockworks TikTok Actor; re-run the one-item social-import smoke check
before changing `HOOK_LAB_TIKTOK_ACTOR_ID` or the Actor input contract.

```bash
gcloud run jobs deploy clipstitchr-provider-worker \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --image "$REPOSITORY/provider-worker:$TAG" \
  --tasks 1 \
  --max-retries 1 \
  --cpu 2 \
  --memory 4Gi \
  --task-timeout 30m \
  --execution-environment gen2 \
  --service-account "140346842368-compute@developer.gserviceaccount.com" \
  --set-env-vars '^@^NEXT_PUBLIC_CONVEX_URL=https://whimsical-ptarmigan-764.convex.cloud@PROVIDER_WORKER_TOOLS=stitchr,swapr,clipr,avatar-photo,swipr@CLIPR_TTS_MODEL_ID=elevenlabs/v3@CLIPR_LIP_SYNC_MODEL_ID=pixverse/lipsync@TEXT_WRITING_MODEL_ID=anthropic/claude-sonnet-4.6@HOOK_LAB_TIKTOK_ACTOR_ID=clockworks/tiktok-scraper@HOOK_LAB_INSTAGRAM_ACTOR_ID=apify/instagram-scraper@HOOK_LAB_APIFY_MAX_TOTAL_CHARGE_USD=0.5@HOOK_LAB_IMPORTED_VIDEO_MAX_BYTES=104857600@HOOK_LAB_VIDEO_MAX_DURATION_SECONDS=180' \
  --set-secrets PROVIDER_WORKER_SECRET=provider-worker-secret:latest,REPLICATE_API_TOKEN=clipstitchr-replicate-api-token:latest,APIFY_TOKEN=clipstitchr-apify-token:latest,PEXELS_API_KEY=clipstitchr-pexels-api-key:latest,R2_ACCOUNT_ID=clipstitchr-r2-account-id:latest,R2_BUCKET_NAME=clipstitchr-r2-bucket-name:latest,R2_ACCESS_KEY_ID=clipstitchr-r2-access-key-id:latest,R2_SECRET_ACCESS_KEY=clipstitchr-r2-secret-access-key:latest
```

Build and push the media worker:

```bash
docker build --platform linux/amd64 \
  -f services/media-worker/Dockerfile \
  -t "$REPOSITORY/media-worker:$TAG" \
  .

docker push "$REPOSITORY/media-worker:$TAG"
```

Deploy the media job with the existing production shape:

```bash
gcloud run jobs deploy clipstitchr-media-worker \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --image "$REPOSITORY/media-worker:$TAG" \
  --tasks 1 \
  --max-retries 1 \
  --cpu 2 \
  --memory 4Gi \
  --task-timeout 30m \
  --execution-environment gen2 \
  --service-account "140346842368-compute@developer.gserviceaccount.com" \
  --set-env-vars NEXT_PUBLIC_CONVEX_URL="https://whimsical-ptarmigan-764.convex.cloud" \
  --set-secrets MEDIA_WORKER_SECRET=clipstitchr-media-worker-secret:latest,REPLICATE_API_TOKEN=clipstitchr-replicate-api-token:latest,R2_ACCOUNT_ID=clipstitchr-r2-account-id:latest,R2_BUCKET_NAME=clipstitchr-r2-bucket-name:latest,R2_ACCESS_KEY_ID=clipstitchr-r2-access-key-id:latest,R2_SECRET_ACCESS_KEY=clipstitchr-r2-secret-access-key:latest
```

Smoke-check the deployed images with one-off executions before calling the
redeploy complete:

```bash
gcloud run jobs execute clipstitchr-provider-worker \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --args=--check \
  --wait

gcloud run jobs execute clipstitchr-media-worker \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --args=--check \
  --wait
```

If the job shape changes, update this section and the matching deployment docs
in the same change. Do not commit secret values; keep secrets in Google Secret
Manager and reference them with `--set-secrets`.

## Coding Style & Naming Conventions

Follow `coding-guidelines.md`. This project requires one file, one purpose:

- One React component per file.
- One hook, utility, action, or helper per file.
- Keep shared types in dedicated files unless they are exclusively coupled to one export.
- Split any file whose name needs "and" to describe its contents.

Use TypeScript for application code. Prefer descriptive PascalCase component names, camelCase functions and hooks, and route/file names that match the feature they own.

## Testing Guidelines

Vitest is configured. Colocate or mirror tests near the unit under test and keep them scoped to the single-purpose file being verified. Use clear names such as `VideoClipCard.test.tsx`, `normalizeVideo.test.ts`, or `stitchVideos.test.ts`.

Cover browser storage, Media Bunny upload normalization, TikTok 9:16 output dimensions, generated poster image behavior, UGC-then-Demo stitching, Stitchr batch selection, shared text overlay export, download output, and route-level dashboard flows before treating the MVP as complete. Multiple text overlay layers and user-authored thumbnail generation/editing are out of scope.

## Commit & Pull Request Guidelines

Current history uses direct, imperative commit messages, for example `Initial commit: add project scope documentation`. Keep messages concise and specific: `Add dashboard upload panel`, `Document IndexedDB clip model`.

Pull requests should include a short summary, testing performed, linked issue or task when available, and screenshots or recordings for UI changes. Note any changes to architecture decisions in `project-scope.md`.

## ClipStitchr CLI Versioning

Every completed change to the shipped CLI package under
`packages/clipstitchr-cli` must include a Semantic Versioning bump. Use the
highest-impact change in the completed batch:

- **PATCH** (`x.y.Z`): backward-compatible bug fixes, UX or copy refinements,
  internal refactors, and dependency or build updates.
- **MINOR** (`x.Y.z`): backward-compatible commands, options, workflows, or
  other new user-facing capabilities.
- **MAJOR** (`X.y.z`): breaking command, option, output, exit-code, config,
  runtime, or automation-contract changes that require users to migrate.

Implement, document, test, and commit the CLI change first. Then update both
`packages/clipstitchr-cli/package.json` and
`packages/clipstitchr-cli/package-lock.json` in one final separate version-bump
commit. Preserve backward-compatible aliases when a CLI migration calls for
them. Do not create a tag or publish the package unless explicitly requested.

## Security & Configuration Tips

Do not commit uploaded media, generated videos, secrets, or local environment files. Browser video processing depends on Media Bunny and browser codec support; document any codec polyfills, worker/WASM assets, or response-header changes with the Media Bunny setup.

## Abuse Protection & Rate Limit Requirements

Any future feature that adds or changes a user-triggered backend operation must account for abuse and rate limiting before implementation is considered complete. This includes Next.js API routes, Convex queries/mutations/actions, signed R2 URL flows, Replicate or other paid external API calls, file/object download or proxy routes, generation jobs, polling endpoints, destructive operations, and any workflow that can create storage, compute, bandwidth, or third-party API cost.

Required workflow:

- Identify the abuse surface and cost before editing code.
- Add or update server-side rate limits before expensive work happens. For R2, gate signed URL creation. For Replicate or other external APIs, gate before the provider call. For Convex writes, gate the mutation/action itself.
- Enforce per-user limits for fairness and global limits for shared provider or spend protection when a shared resource is involved.
- Preserve authorization and ownership checks separately from rate limits; rate limits do not replace access control.
- Return a clear `429` response with retry timing for HTTP routes where a rate limit is exceeded.
- Update `docs/operations/security/rate-limits.md` whenever limits, enforcement points, environment variables, or verification steps change.
- If a backend operation is intentionally not rate-limited, document the reason in `docs/operations/security/rate-limits.md`.
- Kill the dev server after you finish all testing, never leave dev servers running unless explicitly requested.
