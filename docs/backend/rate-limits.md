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

`AUTOMATION_WORKER_SECRET`

- Required in the Convex deployment and in any trusted scheduler or manual
  automation trigger that plans automatic daily generation.
- Authorizes worker-only automation mutations.
- Must be a high-entropy random secret.
- Must not be prefixed with `NEXT_PUBLIC_`.

`PROVIDER_WORKER_SECRET`

- Required in the Convex deployment and in the provider worker runtime.
- Authorizes provider-only automation task claiming, manual `providerJobs`
  claiming, Replicate job state writes, provider-owned library saves, and
  provider-created media finalization jobs.
- Must be different from `AUTOMATION_WORKER_SECRET` and `MEDIA_WORKER_SECRET`.
- Must be a high-entropy random secret.
- Must not be prefixed with `NEXT_PUBLIC_`.

`MEDIA_WORKER_SECRET`

- Required in the Convex deployment and in the media worker runtime.
- Authorizes media job claiming/finalization and media-worker-created provider
  jobs such as upload video analysis after normalization.
- Must be different from `AUTOMATION_WORKER_SECRET` and
  `PROVIDER_WORKER_SECRET`.
- Must be a high-entropy random secret.
- Must not be prefixed with `NEXT_PUBLIC_`.

Cloud Run worker dispatch variables in Convex:

- `CLOUD_RUN_PROJECT_ID`, `CLOUD_RUN_LOCATION`,
  `CLOUD_RUN_PROVIDER_WORKER_JOB`, and `CLOUD_RUN_MEDIA_WORKER_JOB` identify
  the bounded Cloud Run Jobs that drain provider and media queues.
- `CLOUD_RUN_DISPATCH_CLIENT_EMAIL` and `CLOUD_RUN_DISPATCH_PRIVATE_KEY`
  authorize Convex worker-dispatch actions to call the Cloud Run Jobs `:run`
  API. Scheduled worker launches use the internal action, and trusted API
  routes such as Stitchr Batch use the worker-secret public action after their
  own user-facing limits are consumed.
- The dispatch service account should have only the IAM needed to run the two
  worker jobs. Store the private key only in Convex env, not in the repository.

TikTok Events API variables:

- `TIKTOK_EVENTS_API_ACCESS_TOKEN` enables server-side TikTok Events API
  forwarding from `POST /api/analytics/tiktok/events`.
- `TIKTOK_EVENTS_API_PIXEL_ID` optionally overrides the server-side
  `event_source_id`; when omitted, the server uses `NEXT_PUBLIC_TIKTOK_PIXEL_ID`
  or the app's default pixel ID.
- `TIKTOK_EVENTS_API_TEST_EVENT_CODE` optionally adds TikTok's test event code
  to Events API payloads during testing. Remove it for production attribution.

Pexels API variables:

- `PEXELS_API_KEY` enables server-side Pexels photo search and query-pack
  import for Swipr.
- The key is sent from `POST /api/swipr/pexels/search`,
  `POST /api/swipr/pexels/import`, and from the provider worker's automatic
  Swipr draft path in the Pexels `Authorization` header.
- Keep it server-side only. Do not prefix it with `NEXT_PUBLIC_`.

Existing Convex auth variables still apply:

- `NEXT_PUBLIC_CONVEX_URL` in Next.js.
- `CLERK_JWT_ISSUER_DOMAIN` in the Convex deployment.

Optional Replicate model overrides:

- `AVATAR_PHOTO_MODEL_ID` defaults to `openai/gpt-image-2` for avatar photo
  generation. Supported workflows include `openai/gpt-image-2` and
  `minimax/image-01`.
- `REPLICATE_UPLOAD_ANALYSIS_MODEL_ID` defaults to `openai/gpt-5-mini` for
  avatar/photo image analysis, video poster fallback analysis, and clip score
  fallback analysis.
- `REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID` defaults to
  `google/gemini-3-flash` for full-video UGC/demo action and score analysis.
  `REPLICATE_UPLOAD_VIDEO_FALLBACK_MODEL_ID` defaults to
  `lucataco/qwen2-vl-7b-instruct:bf57361c75677fc33d480d0c5f02926e621b2caa2000347cb74aeae9d2ca07ee`
  and is tried only after the primary full-video model fails. Finished Stitch
  scoring uses this same full-video analysis lane when scoring rendered stitch
  videos. When both video models fail, or when no rendered Stitch video is
  available, Stitch Score uses the OpenAI poster/context fallback instead of
  sending raw source videos.
- `SWIPR_BACKGROUND_MODEL_ID` defaults to `openai/gpt-image-2` for Swipr AI
  background generation. Supported workflows include `openai/gpt-image-2`,
  `prunaai/p-image`, and `prunaai/wan-2.2-image`.
- `PRODUCT_ENRICHMENT_MODEL_ID` defaults to `openai/gpt-4.1` for hidden product
  strategy enrichment when saving products in Settings.
- `TEXT_WRITING_MODEL_ID` defaults to `anthropic/claude-sonnet-4.6` for Clipr
  hook, script, Swipr auto-text, and Stitchr auto-text generation. The legacy
  `CLIPR_HOOK_MODEL_ID` fallback is still read when the general writing model
  variable is unset. `anthropic/claude-opus-4.6` is supported for higher-cost
  writing tests.
- Clipr avatar still generation uses `AVATAR_PHOTO_MODEL_ID`, the same model
  configuration and provider input path as avatar photo generation, but creates
  one source still before the final avatar video generation.
- Clipr Script mode uses `prunaai/p-video-avatar` for full-script avatar video
  generation when `isCliprScriptModeEnabled` is `true`. When
  `CLIPR_TTS_MODEL_ID` is enabled, the provider worker passes generated speech
  audio into this avatar-video model instead of relying on its built-in voice
  catalog.
- Clipr Reaction and B-roll modes use `kwaivgi/kling-v3-video` by default.
  `CLIPR_VISUAL_VIDEO_MODEL_ID` can override to another supported model such as
  `google/veo-3.1`.
- Clipr Demo mode remains a backend-supported Seedance test path for generated
  demos. It sends one selected Demo clip as a `reference_videos` input and
  skips avatar still, voice, music, and lip-sync generation.
- `CLIPR_TTS_MODEL_ID` defaults to `elevenlabs/v3` for Clipr speech generation.
  Set it to `none` to fall back to the avatar-video model's built-in voice path
  during local testing.
- `CLIPR_LIP_SYNC_MODEL_ID` defaults to `pixverse/lipsync`. Supported values are
  `none`,
  `bytedance/latentsync:637ce1919f807ca20da3a448ddc2743535d2853649574cd52a933120e9b9e293`,
  and `pixverse/lipsync`. LatentSync runs as one pass. PixVerse uses two
  30 second provider-worker ffmpeg segments for the default 60 second Clipr jobs.
- Music is upload and shared-library selection only. Uploaded music is stored in
  the shared music pool, consumes the normal R2 upload byte limits and Convex
  record-save limits, and must only be uploaded by users who have the rights to
  share and use the track.
Firecrawl website import:

- `FIRECRAWL_API_KEY` is required in the Next.js runtime environment when users
  save a product with a website URL. The route calls Firecrawl's v2
  crawl endpoint server-side, imports markdown, summaries, and links from up to
  15 public landing pages on the site, passes the capped website context to
  product enrichment, and keeps that website context out of the user's saved
  product details.
- The key must not be prefixed with `NEXT_PUBLIC_`.

## Enforcement Map

| Surface | Enforcement Point | Limit |
| --- | --- | --- |
| R2 upload signed URL | `POST /api/r2/upload-url` | 2,000/hour/user, burst 500 |
| R2 upload bytes | `POST /api/r2/upload-url` | 10 GB/day/user; 500 GB/30 days/user |
| R2 download signed URL | `POST /api/r2/download-url` | 5,000/hour/user, burst 1,000. The browser caches single-object signed URLs in memory until shortly before expiry, so repeated previews/downloads of the same object do not immediately re-consume this limit. |
| Saved Stitch render creation | Browser Stitchr creation and render-on-demand from saved stitch cards | Uses R2 upload signed URL and byte limits for the saved MP4, R2 download signed URL limits for source media and saved render reads, and `convexMetadataUpdate` when saving or clearing `stitchObject`, `mimeType`, and `size`. Rendering itself is browser-side Media Bunny work, not provider work. |
| Quick Edit apply/reset | Clip and saved normal Stitch card actions after scoring | Uses `convexMetadataUpdate` before writing non-destructive edit metadata. No provider call, music generation, R2 signed URL, or media upload is created by apply/reset itself. Scoring that produces `quickEditSuggestions` is covered by the clip and Stitch score limits. |
| Manual source cuts | Clip details cut controls and saved normal Stitch source settings | Source clip cut saves use `videoClips.updateCuts` and consume `convexMetadataUpdate` before writing `quickEdit.removeRanges`. Saved Stitch source cuts regenerate a replacement poster through the existing R2 upload signed URL and byte limits, then use `stitches.updateSourceCuts` and consume `convexMetadataUpdate` before replacing `ugcQuickEdit.removeRanges` or `demoQuickEdit.removeRanges`; stale saved render/poster cleanup uses the R2 delete limit. No provider call, AI call, or music generation is created by manual cuts. |
| R2 batch image download signed URLs | `POST /api/r2/download-urls` | Uses the R2 download signed URL limit once per authenticated batch after validating every key belongs to the user and is a cacheable `poster.*` or `thumbnail.*` image. Requests are capped at 48 keys. |
| R2 deletes | `POST /api/r2/delete-objects` | 2,000 objects/hour/user, burst 500 |
| Swipr photo R2 upload signed URL | `POST /api/swipr/backgrounds/upload-url` | Uses the R2 upload signed URL and byte limits before creating an owner-owned Swipr photo PUT URL |
| Swipr photo R2 download signed URL | `POST /api/swipr/backgrounds/download-url` | Uses the R2 download signed URL limit after validating the private owner-owned Swipr photo or global Pexels pack photo exists. The browser caches the signed URL per background id until shortly before expiry. |
| Shared music R2 download signed URL | `POST /api/music/download-url` | Uses the R2 download signed URL limit after validating the shared music track exists. The browser caches the signed URL per track id until shortly before expiry. |
| Upload image metadata analysis | `POST /api/uploads/analyze` for avatar/photo images and video fallback posters | 300/hour/user, burst 100; 10,000/30 days/user; global 6,000/hour |
| Swipr background metadata analysis | `POST /api/swipr/backgrounds/analyze` | Uses the upload image metadata analysis limits before calling the configured upload image analysis model through Replicate |
| Upload video action analysis | `POST /api/uploads/analyze` for browser-normalized video uploads, `POST /api/uploads/jobs` for upload worker fallback, and `POST /api/video-clips/score` for saved UGC/demo clip scoring | 60/hour/user, burst 20; 1,500/30 days/user; global 1,000/hour. The browser-first path consumes this when the normalized video is sent for immediate analysis. The fallback worker path consumes this before creating the durable upload media job; after normalization, the media worker creates an `upload-video-analysis` provider job. Manual clip scoring consumes this before signing saved R2 media or calling the provider. Gemini full-video analysis runs first for videos up to 100 MB; OpenAI poster analysis is the fallback when Gemini fails or the video exceeds the analysis size cap. |
| Stitch score analysis | `POST /api/stitches/score` from saved stitch cards | 60/hour/user, burst 20; 1,500/30 days/user; global 1,000/hour, burst 200. The route consumes this before provider work. The client makes sure a saved render exists when possible, and the route scores that rendered stitch MP4. If no rendered video is available, or if Gemini full-video analysis fails, it falls back to the OpenAI poster/image analysis path using the saved stitch poster when available plus saved stitch settings and source metadata. Raw source videos are not sent as the Stitch Score fallback. |
| Swapr photo expansion | `POST /api/swapr/photos/expand` | 10/hour/user, burst 5; 20/day/user; 375/30 days/user; global 300/hour |
| Swapr video job create | `POST /api/swapr/generations` for the close-safe worker path; legacy `POST /api/swapr/jobs` for direct prediction creation | 2 Swapr batches/hour/user, burst 2; 5 Swapr batches/day/user; 500 estimated output seconds/30 days/user; technical provider segment guard 60 segments/hour/user and 180 segments/day/user; global 300 provider segments/hour. The worker route accepts saved R2 media references only, validates every segment before queuing, consumes the job/seconds/segment limits and R2 download limit before creating one durable `manual-swapr` provider job. The provider worker starts and polls segment predictions, and the media worker normalizes/stitches the final saved Swapr clip. |
| Swapr job polling | `GET /api/swapr/jobs/{id}` | 600/minute/user, burst 150 |
| Swapr job cancellation | `POST /api/swapr/jobs/{id}/cancel` | 100/hour/user, burst 20 |
| Swapr output proxy | `GET /api/swapr/output` | 1,000/hour/user, burst 200 |
| Avatar photo generation | `POST /api/avatars/photos/generate` from the Avatars page or UGC clip avatar action | 15 generated images/hour/user, burst 10; 25 generated images/day/user; 500 generated images/30 days/user; global 1,000 generated images/hour. The route stores the source image in R2, creates an `avatar-photo-generation` provider job, and returns after durable queuing; the provider worker calls Replicate and saves `photoAssets`. |
| Swipr AI background generation | `POST /api/swipr/backgrounds/generate` | 20 images/hour/user, burst 8; 50 images/day/user; 500 images/30 days/user; global 1,000 images/hour |
| Swipr Pexels search | `POST /api/swipr/pexels/search` | 120 searches/hour/user, burst 30; global 800 searches/hour, burst 200 across 4 shards. The route consumes this before calling Pexels with `PEXELS_API_KEY`; selected manual photo saves then use existing Swipr background analysis, private R2 upload, and Convex record-save limits. Loading more results for the same query passes a later Pexels `page` value and consumes the same search limits. |
| Swipr Pexels query import | `POST /api/swipr/pexels/import` | Loaded-photo imports use the already-loaded dashboard results and do not call Pexels search again. The legacy page/count path still consumes the Swipr Pexels search limits before calling Pexels. Both paths consume 120 imported images/hour/user with burst 120 and global 3,000 imported images/hour with burst 500 across 5 shards before downloading new images or writing to R2. Each newly imported image also uses `swiprBackgrounds.save`, which consumes the shared Convex record-save limit. Already-imported global Pexels photo IDs are skipped before import quota is consumed. The route adds the pack to the user's account through `swiprBackgrounds.addLibraryPackToAccount`, which consumes `convexMetadataUpdate`. |
| Swipr Pexels pack edits | `swiprBackgrounds.addLibraryPackToAccount`, `swiprBackgrounds.removeLibraryPackFromAccount`, `swiprBackgrounds.removeFromLibraryPack`, `swiprBackgrounds.removeLibraryPack` | Pack add/remove account actions consume `convexMetadataUpdate` after validating the global pack or account row. Photo removal consumes `convexMetadataUpdate` after validating that the shared pack is in the user's account, then writes a user-specific exclusion row. `removeLibraryPack` remains as a compatibility mutation, but it now removes only the account-pack row and per-photo exclusions. Shared Pexels pack records and R2 objects are not user-deletable. `swiprBackgrounds.renameLibraryPack` remains available only to throw because shared packs cannot be renamed by one user. |
| Public waitlist submission | `waitlist.submit` from `/sign-up` | 3/hour/normalized email, burst 3; shared global bucket 500/hour, burst 100 |
| TikTok Events API forwarding | `POST /api/analytics/tiktok/events` after marketing-cookie consent | 120/hour/client fingerprint, burst 30; shared global bucket 5,000/hour, burst 1,000 |
| IndexNow sitemap submission | `POST /api/indexnow` with `INDEXNOW_SUBMIT_SECRET` | Submits all public sitemap URLs only, excludes authenticated dashboard/API routes, requires a public `NEXT_PUBLIC_SITE_URL`, consumes 500 submitted URLs/hour/client fingerprint, burst 100; shared global bucket 5,000 submitted URLs/hour, burst 500 |
| Product enrichment, Hook Lab setup, and website import | `POST /api/settings/products`, `PATCH /api/settings/products/{id}` | 100/hour/user, burst 20; 2,000/30 days/user; global 5,000/hour. The route consumes this limit before Firecrawl website crawling and before the Replicate product enrichment call. Website import is capped at 15 Firecrawl pages per create/update. Product edits only re-crawl Firecrawl when the saved website URL changes. Hook Lab examples, goal, and tone are saved on the same product create/update path and do not add a separate provider call. |
| Clipr job create | `POST /api/clipr/jobs` | 3/hour/user, burst 2; 8/day/user; 900 generated seconds/30 days/user; shared global provider bucket 10,000 units/hour, burst 2,000. The route resolves the requested mode, creates a queued `cliprJobs` record and a durable `manual-clipr` provider job, then returns immediately. Current visible Reaction and B-roll jobs consume the 4-10 second visual estimate. Script jobs consume the 60 second estimate only when `isCliprScriptModeEnabled` is `true`; hidden Script requests resolve to a visual mode before quota/provider work. |
| Clipr hook/script generation | `POST /api/clipr/jobs` worker path, `POST /api/clipr/text` immediate suggestion path, and `POST /api/swipr/drafts/generate` batch draft path | 30/hour/user, burst 10; shared global provider bucket 10,000 units/hour, burst 2,000. Manual Clipr job creation consumes this only for Script mode. Reaction, B-roll, and Demo use a local visual plan and do not consume hook/script quota. Stitchr requests can include selected UGC/demo context and return overlay text plus caption/hashtag copy under this same limit. Swipr text generation returns carousel text plus one combined caption, 1000-4000 character description, and hashtag field under this same limit. Swipr batch draft generation consumes this with `count` fixed to 10 editable draft Swipes before calling the writing provider. The default writing provider is `anthropic/claude-sonnet-4.6`; `anthropic/claude-opus-4.6` can be enabled through `TEXT_WRITING_MODEL_ID` for higher-cost tests. |
| Clipr avatar still generation | `POST /api/clipr/jobs` before queued worker generation | 20 images/hour/user, burst 6; global provider bucket counted once per still. The provider worker creates the avatar still for Script, Reaction, and B-roll modes, then R2 upload byte limits are consumed before personal avatar-photo and thumbnail copies are saved. Demo mode skips avatar-still generation. |
| Clipr voice and Script-mode lip-sync generation | `POST /api/clipr/jobs` before queued worker generation | 600 estimated voice seconds/hour/user, burst 180; global provider bucket counted by estimated seconds. Manual Clipr job creation consumes this only for Script mode. It protects ElevenLabs v3 speech generation and optional second-pass lip-sync models before the provider job is queued. PixVerse lip-sync jobs create temporary provider-worker ffmpeg video/audio segments in R2 before stitching the lip-synced segment outputs. |
| Clipr video generation | `POST /api/clipr/jobs` before queued worker generation | 600 estimated video seconds/hour/user, burst 180; global provider bucket counted by estimated seconds. Script mode uses `prunaai/p-video-avatar`; Reaction and B-roll use the selected visual model; Demo mode uses Seedance with the selected Demo clip as a reference video. Reaction, B-roll, and Demo skip voice, music, and PixVerse. |
| Shared music upload | `POST /api/music/upload` from the music picker | Uses the R2 upload byte limits before storing the shared music object, then `sharedMusicTracks.save` consumes the shared Convex record-save limit. Uploads are capped at 30 MB and accepted audio MIME types only. |
| Removed music generation routes | `POST /api/music/generate`, `POST /api/clipr/music`, `POST /api/stitches/music` | These routes return `410 Gone` and do not consume provider, R2, or Convex write limits because music generation has been removed. |
| Clipr job polling | Reserved Clipr polling route and Convex job refreshes | 600/minute/user, burst 150 |
| Clipr job cancellation | `cliprJobs.cancel` | 100/hour/user, burst 20 |
| Automation planner dispatch | `POST /api/automation/plan` and Convex Cron `automationScheduler.planCoreDaily` | Worker-secret authorized only; planners create durable automation runs/tasks and consume automation-specific tool budgets before provider or media work. Enabled product preferences are planned separately, so each product can run its own selected daily tools. |
| Provider worker jobs | `npm run provider-worker` with `PROVIDER_WORKER_SECRET`; provider-only mutations such as `providerJobs.claimNextForProvider`, `automationTasks.claimNextForProvider`, `automationTasks.markProviderStatus`, `mediaJobs.create*FromProvider`, `providerWorkerLaunch.requestContinuation`, and provider `replicateJobs` writes | Provider work is claimed from Convex and no longer dispatched through protected Next.js Preview routes. Creating a manual `providerJobs` record or automation task schedules a coalesced Convex dispatch action that runs the Cloud Run provider job immediately, schedules a short 3-second follow-up when an immediate launch is coalesced, and schedules a coalesced delayed recovery dispatch 10 minutes after the launch target. Trusted API routes may call `workerDispatch.runWorkerFromApi` with `AUTOMATION_WORKER_SECRET` only after their own user-facing limits have been consumed; Stitchr Batch uses this to start the provider job after foreground hook planning while retaining a delayed fallback launch. Bounded provider worker runs request a worker-secret continuation launch when they process a full `maxJobs` batch. The worker handles manual Swapr, manual Clipr, manual avatar-photo generation, upload video analysis, automated Stitch score analysis, automatic Stitchr overlay/caption/hashtag text, automatic Swapr create/finalize, automatic Clipr text/still/video, automatic avatar-photo generation, and automatic Swipr Pexels-photo/text draft generation. Manual routes consume their user limits before creating jobs; automation planners consume tool budgets before worker execution. |
| Media worker jobs | `mediaJobs.createUploadNormalization`, `mediaJobs.createCliprFinalizationFromProvider`, `mediaJobs.createSwaprFinalizationFromProvider`, `mediaJobs.createStitchrDraftFinalizationFromProvider`, existing automation media creators, `mediaWorkerLaunch.requestContinuation`, and `npm run media-worker` | Media jobs are worker-secret controlled. Creating a media job schedules a coalesced Convex dispatch action that runs the Cloud Run media job immediately, schedules a short 3-second follow-up when an immediate launch is coalesced, and schedules a coalesced delayed recovery dispatch 10 minutes after the launch target. Bounded media worker runs request a worker-secret continuation launch when they process a full `maxJobs` batch. The worker normalizes fallback video uploads when browser Media Bunny processing is unavailable, creates upload posters, saves uploaded clips, creates upload-analysis provider jobs, saves editable Stitchr drafts with generated captions, creates Stitch score provider jobs for automated Stitchr and user-triggered Stitchr Batch outputs, finalizes Swapr provider outputs, and finalizes Clipr outputs. Manual asset saves consume normal user-facing limits before job creation; automatic final asset saves consume automatic asset save buckets: 20 saved assets/day/user; global 2,000/day. Stitchr Batch final asset saves consume separate Batch asset-save buckets. |
| Stitchr Batch generation | Signed-in `POST /api/stitchr/batch/generate` before provider work; can run at any time and uses `stitchrBatchPairHistory`, not automation pair history. The browser sends its IANA time zone, and the API computes the Batch date in that time zone with UTC fallback for missing or invalid values. Optional template selection only reuses owned saved template text/caption data and does not bypass Batch limits. Convex creates or repairs active tasks, schedules a delayed provider-worker fallback, and the API route directly dispatches the provider worker through Convex after foreground hook planning. No direct dispatch is attempted when Convex returns no active task IDs, such as an already completed daily batch. | 10 Stitchr Batch outputs/user/browser-local batch date; global 1,000/day; final Batch asset saves use the same owner-and-batch-date key plus the 1,000/day global asset-save bucket |
| Stitchr Batch hook planning | Signed-in `POST /api/stitchr/batch/generate` after durable batch task creation and before the foreground writing provider call | 20 hook-planning calls/day/user, burst 10; global 2,000/day, burst 500; shared provider bucket 10,000 units/hour, burst 2,000. Template-covered batches skip this limit because no writing provider call is made. Planner failures do not delete the already-created batch tasks; provider workers fall back to per-stitch writing for missing or failed plans. |
| Automatic Stitchr generation | Worker-only automation planner before provider work; scheduled planning respects the daily generation window and uses automation pair history. Optional template allocations reuse owned saved template text/caption data and do not bypass automation budgets. | User can choose 3, 5, or 10 Stitchr outputs/day/product; global 1,000/day. The per-tool bucket is keyed by owner and product. |
| Automatic Swapr generation | Worker-only automation planner before provider work; provider worker claims one queued Swapr task for the product's default avatar before creating a Replicate prediction and later claims provider-created Swapr tasks before creating a media finalization job | 1 Swapr output/day/product; global 100/day. The per-tool bucket is keyed by owner and product. |
| Automatic Clipr generation | Worker-only automation planner before provider work; provider worker runs the selected Clipr mode, avatar-image, and avatar-video generation for the product's default avatar without consuming manual Clipr buckets | 1 Clipr output/day/product; global 100/day. The per-tool bucket is keyed by owner and product. Any is the default automation mode and resolves to an enabled visual mode while Script is hidden. Reaction and B-roll reserve the 8 second visual estimate and skip voice, music, and PixVerse. Script mode reserves 60 automation provider cost units only when `isCliprScriptModeEnabled` is `true`; saved hidden Script preferences are normalized to Any before resolving. |
| Automatic avatar photo generation | Worker-only automation planner before provider work; provider worker creates one generated avatar photo from the product default avatar's latest source photo | Planner queues only the product default avatar; rate bucket is 1 generated photo/day/product/avatar; global 500/day. The per-tool bucket is keyed by owner, product, and avatar. |
| Automatic Swipr generation | Worker-only automation planner before provider work; provider worker can reuse selected account-added Pexels packs, otherwise searches Pexels, saves private Pexels photo records, creates generated slide text plus caption, long description, hashtags, and saves editable 8-slide Swipe drafts | User can choose 3, 5, or 10 Swipes/day/product; global 100/day. The per-tool bucket is keyed by owner and product. Saved Pexels pack reuse avoids new Pexels background downloads when selected pack images are available. |
| Automatic provider cost guard | Worker-only automation planner before provider work | 10,000 provider cost units/day global |
| Automatic asset final saves | Worker-only finalizers for automated Stitches, video clips, avatar photos, and Swipes | 20 saved assets/day/user; global 2,000/day |
| Notification inbox actions | `notifications.unreadCount`, `notifications.listRecent`, `notifications.markRead`, `notifications.markAllRead`, `notifications.remove`, and `notifications.clearAll` | `unreadCount` reads one summary row for the always-visible bell badge. `listRecent` is an indexed, capped read of at most 80 records and is loaded only while the popover is open. Neither read is separately rate-limited because they do not mutate data, create storage, or call paid providers. Read-state changes consume `convexMetadataUpdate`; deletes consume `convexRecordDelete`. Notification creation happens after already-limited content saves or worker-only automation completion paths and does not call paid providers or create media storage. |
| Avatar cascade delete | `DELETE /api/avatars/{id}` | 100/hour/user, burst 20 |
| Convex record saves | `avatars.save`, `videoClips.save`, `photoAssets.save`, `products.create`, `stitches.save`, `stitchTemplates.createFromStitch`, `stitchrHookPlans.saveBatchPlannerResults`, `swiprBackgrounds.save`, `sharedMusicTracks.save`, new `swipes.save` records | 3,000/hour/user, burst 500 |
| Convex metadata updates | `avatars.update`, `avatarPreferences.setDefaultAvatar`, `productPreferences.setDefaultProduct`, `productPreferences.completeOnboarding`, `automationPreferences.save`, `updateMetadata` mutations, `videoClips.updateCliprMusic`, `videoClips.updateCrop`, `stitches.updateMusic`, `stitches.updatePostedStatus`, `stitches.updateSourceSettings`, `stitches.updateSourceCrop`, `stitches.updateTextOverlay`, `stitches.updateSocialCaption`, `stitches.updateRenderedVideo`, `stitchTemplates.updateName`, `products.update`, `stitchrHookPlans.accept`, `stitchrHookPlans.reject`, `cliprPreferences.setDefaultVoice`, existing `swipes.save` records | 5,000/hour/user, burst 1,000 |

Changing an avatar's linked product uses `avatars.update` and patches the
avatar's photo records to the same product under the shared Convex metadata
update limit.
| Convex poster updates | `updatePoster` mutations | 1,000/hour/user, burst 300 |
| Convex record deletes | `remove` mutations, including `stitchTemplates.remove` | 2,000/hour/user, burst 500 |
| Convex Clipr job writes | `cliprJobs.createQueued`, `cliprJobs.applyScriptPlan`, `cliprJobs.recordAvatarImageOutput`, `cliprJobs.recordAvatarVideoOutput`, `cliprJobs.markBrowserSaving`, `cliprJobs.finalizeWithClip` | 3,000/hour/user, burst 500 |

## Intentionally Not Rate-Limited

Aggregate library count reads through `libraryCounts.get` are authenticated,
read-only Convex queries backed by the Aggregate component. They do not create
storage, bandwidth, provider, or external API cost, so they are not
rate-limited.

Operator-only maintenance backfills such as
`aggregateBackfills.backfillVideoClipLibraryKinds` are guarded by
`RATE_LIMIT_API_SECRET` and are not exposed through a user-triggered route. They
are intentionally not rate-limited; run them in small paginated batches with the
documented cursor workflow.

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

Stitchr Longr-mode rendering is browser-local and has no provider cost. If the
user opens the shared music picker and uploads a new track, `POST /api/music/upload`
consumes the normal R2 upload limits and `sharedMusicTracks.save` consumes the
shared Convex record-save limit. Saving the finished output stores a normal
Stitch, so it consumes the shared R2 upload limits and the shared Convex
record-save limit for `stitches.save`.

Swipr AI background generation is separate from export: it calls the selected
Replicate image model through `POST /api/swipr/backgrounds/generate`, consumes
the dedicated Swipr AI background limits before creating the prediction, and
streams the generated image back to the browser. `openai/gpt-image-2` requests
low-quality 2:3 generation by default for speed; the Pruna background models
request direct 9:16 output. The client then analyzes the generated image through
`POST /api/swipr/backgrounds/analyze`, uploads it through
`POST /api/swipr/backgrounds/upload-url`, and saves the owner-owned Swipr photo
metadata through `swiprBackgrounds.save`.

Uploaded Swipr photos and selected manual Pexels photos use the same analysis,
private R2 upload, and `swiprBackgrounds.save` path. Imported Pexels query
packs use `POST /api/swipr/pexels/import`, consume Pexels search and
import-image limits before downloading images, write imported R2 objects, and
save each photo with `libraryQuery` so the pack can appear in the global Pexels
library. Private Swipr photos are only listed and loaded for their owner and
are used to reopen, edit, preview, batch draft, and download saved Swipes.

The Swipr creation page can upload multiple photos in one browser selection and
generate one AI photo per current carousel image. AI generation has no separate
batch endpoint: each generated photo calls `POST /api/swipr/backgrounds/generate`
and consumes the existing per-image Swipr AI background limits before provider
work; each uploaded or generated photo then consumes the existing image-analysis,
R2 upload, and Convex record-save protections before persistence. Swipr text
batch drafts are separate from photo generation: `POST /api/swipr/drafts/generate`
uses already-saved Pexels pack backgrounds and consumes counted writing quota
before saving editable Swipe records.


Product creates and edits call Replicate GPT-4.1 through
`POST /api/settings/products` and `PATCH /api/settings/products/{id}` to infer
hidden product strategy metadata before saving the product to Convex. The route
consumes the product enrichment limit before creating the prediction, then
`products.create` consumes the shared Convex record-save limit or
`products.update` consumes the shared Convex metadata-update limit before the
database write. `products.remove` consumes the shared Convex record-delete limit.
When the dashboard automatically assigns old unscoped content to a user's first
product, `products.assignLegacyContentToPrimary` consumes the shared Convex
metadata-update limit before patching records.

The shared music picker searches `sharedMusicTracks`. Selecting an existing
track only creates an R2 download signed URL after Convex validation and uses
the normal R2 download limit. Uploading a new track goes through
`POST /api/music/upload`, consumes R2 upload bytes before storage, saves one
shared object under `shared/music/...`, and writes a `sharedMusicTracks` record.
Shared music objects are not user-deletable through the personal R2 delete
route because uploaded music is intentionally shared.

Clipr final preparation is now worker-owned. `POST /api/clipr/jobs` consumes the
job, mode-specific script/avatar-still/video/speech/lip-sync, and
generated-seconds limits before creating the `manual-clipr` provider job. The
provider worker creates generated speech when enabled, passes it into
`prunaai/p-video-avatar`, optionally runs a second lip-sync pass, copies
generated still/video/speech outputs into R2, and creates the media job. Selected
shared music remains separate metadata. Music is mixed into a fresh downloadable
file only when the user exports/downloads. That export-time Media Bunny render
is browser-local and is not separately rate-limited.

Saved Stitchr outputs use the existing export-time model: saving a stitch stores
source clip references, trim ranges, text, source audio flags, and music
metadata in Convex without uploading a rendered stitch video to R2. When a
stitch has text, the browser renders and uploads one text-aware stitch poster
through the normal R2 upload limits and records it with `stitches.save` or
`stitches.updatePoster`; export-time stitching and music mixing are
browser-local and are not separately rate-limited. Saved stitches can attach a
selected shared music track, including tracks uploaded through the shared music
picker.

Marking a saved stitch, script Clipr clip, or Swipe as posted or active is
metadata-only. The matching posted-status mutation authenticates the owner,
consumes the shared Convex metadata-update limit before patching the record, and
does not touch R2 objects, source clips, posters, music assets, or provider
APIs. UGC clips, Demo clips, Swapr outputs, and non-script Clipr visual clips do
not expose posted actions. Reusing a saved stitch as a Stitchr template is
client-side state hydration from the owner-scoped stitch and source clip
metadata; it creates no backend cost until the user saves or exports a new
stitch.

The expanded hook libraries and Hook Lab product examples are prompt resources,
not new backend operations. Swipr and Stitchr auto-text continue to use
`POST /api/clipr/text` and the existing Clipr hook/script generation rate limit
before the provider call. Stitchr Hook Lab variants return in the same response;
clicking an alternate hook in the dashboard only edits client state.

## Client Batch Caps

Client upload controls enforce batch sizes before any processing, signed URL
request, R2 upload, or Convex save starts:

| Surface | Client Cap | Reason |
| --- | --- | --- |
| Photo upload without AI expansion | 100 files at once | Each photo creates 3 R2 objects and 1 metadata analysis request, fitting under the R2 upload, analysis, and Convex-save burst limits. |
| Photo upload with AI expansion | 1 file at once | Each source image may trigger paid outpainting before it is saved, so the UI keeps this workflow explicitly one-at-a-time. |
| Video upload | 20 files at once | Each browser-first video creates 1 normalized video object, 1 poster object, 1 signed video download URL, 1 immediate upload-analysis request, and 1 library clip. If browser normalization fails, the fallback path uploads one raw source object and creates an `upload-normalization` media job, fitting under the R2 upload, download URL, video-analysis, media-job, and Convex-save burst limits. |
| Stitchr UGC batch | 20 selected UGC videos at once | Each selected UGC creates one editable stitch with the selected demo, copied trims, text, and audio settings. Creating the batch consumes Convex stitch saves and, when text is present, one stitch-poster R2 upload per output; export-time browser encoding runs only when the user downloads/exports. |
| Stitchr Longr-mode output | 1 finished Stitch at a time | Longr mode creates one browser-rendered 9:16 Stitch from the ordered sequence. The one-at-a-time cap limits browser encode work, output size, R2 upload bytes, and preview complexity. |
| Swipr Pexels query import | 120 loaded photos per request | Each newly imported photo downloads from Pexels, uploads one R2 object, and saves one global Pexels Swipr background record. The dashboard caps loaded visible results to the same value. |
| Swipr batch draft generation | 10 editable Swipe drafts per request | Each draft consumes counted writing quota and saves one editable Swipe. Each draft can use up to the max 8 Swipr slides. |

These caps reduce partial batches and orphaned R2 objects. They do not replace
server-side rate limits: prior usage in the same window can still cause a `429`
before expensive work is started.

## Replicate Ownership

Swapr video predictions are recorded in Convex after creation. Poll, cancel, and
output proxy routes must prove the prediction belongs to the authenticated user
before calling Replicate or fetching an output URL.

Avatar photo generation is rate-limited by requested output image count before
creating the durable provider job, including generation started from a UGC clip
poster in the Library. The source image is copied to R2 before the route
returns. The provider worker runs one prediction per generated avatar photo so
each output can receive a unique prompt variant and avoid grid/contact-sheet
results. The MiniMax Image-01 workflow is also one prediction per generated
image because ClipStitchr gives each output a unique prompt variant and one
source `subject_reference` image. Each prediction is recorded as an
`avatar-photo` Replicate job.
Generation speed profiles may run those one-image predictions concurrently:
Creator runs 1 at a time, Pro runs up to 2, and Studio runs up to 4. This
concurrency does not loosen the image-count rate limit; the full requested count
is consumed before any Replicate prediction is created.

Upload video analysis is rate-limited separately from avatar/photo image
analysis because it can send the normalized video to Gemini for a chronological
action breakdown. The browser-first path normalizes with Media Bunny, uploads
the normalized video/poster, signs a short-lived R2 read URL for the normalized
video, and calls `POST /api/uploads/analyze` before saving the clip. The
close-safe fallback path uploads the raw source video to R2, queues
`upload-normalization`, and lets the media worker create the final video/poster
objects before it creates an `upload-video-analysis` provider job. The provider
worker signs short-lived R2 read URLs for the stored video/poster and consumes
the already-authorized analysis work without requiring the browser to stay open.
If Gemini fails, or if the normalized video is larger than 100 MB, the provider
worker falls back to the OpenAI image-analysis path using the generated poster
image when one is available. The default poster-analysis model is
`openai/gpt-5-mini`; full-video scoring stays on Gemini because OpenAI's GPT-5
mini model lists video input as unsupported. `POST /api/video-clips/score`
uses this same quota for saved UGC/demo clips and rejects Swaps before quota or
provider work. Generated Clipr reaction and b-roll videos are treated as UGC for
scoring. `POST /api/uploads/analyze` also remains for image analysis.

Swapr video generation is rate-limited both by job count and by estimated output
seconds before the worker job is created. `POST /api/swapr/generations` uses
the final source duration and selected speed tier to consume the batch,
generated-seconds, provider-segment, and R2 read limits, then snapshots all
segment R2 keys into one `manual-swapr` provider job. The provider worker owns
Replicate creation/polling and the media worker owns final normalization and
library save.

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
