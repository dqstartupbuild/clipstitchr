# Codebase Cleanup & Tech Debt Analysis

Used `codebase-cleanup-tech-debt` for the initial inventory, follow-up cleanup pass, next-sprint test pass, 80% coverage completion pass, and 93% coverage continuation pass.

## Cleanup Changes Applied

- Upgraded `next` and `eslint-config-next` from `16.2.4` to `16.2.6` in `web/package.json` and `web/package-lock.json`.
- Added `convex/_generated/**` to ESLint ignores so generated Convex files no longer produce lint warnings.
- Updated Vitest coverage collection to include unloaded `app`, `convex`, and `lib` source files while excluding tests, generated Convex files, build output, and generated content.
- Extracted duplicate text overlay CSS generation into `web/lib/clipstitchr/utils/getTextOverlayCssProperties.ts`.
- Added focused unit coverage for the shared text overlay CSS helper.
- Added focused route coverage for `POST /api/r2/upload-url` auth, request validation, quota consumption, signed URL creation, and 429 retry timing.
- Added focused route coverage for `POST /api/r2/download-url` auth, request validation, owner-scope enforcement, quota consumption, signed URL creation, and 429 retry timing.
- Added next-sprint coverage for high-cost API routes:
  - `POST /api/swapr/jobs`
  - `POST /api/swapr/photos/expand`
  - `GET /api/swapr/output`
  - `POST /api/avatars/photos/generate`
  - `POST /api/dev/swipr/backgrounds/seed`
  - `POST /api/uploads/analyze`
  - `POST /api/music/generate`
  - `POST /api/music/download-url`
  - `POST /api/stitches/music`
  - `POST /api/clipr/music`
  - `POST /api/clipr/text`
  - `POST /api/settings/products`
  - `PATCH /api/settings/products/[id]`
  - `POST /api/r2/delete-objects`
- Added focused Convex coverage for Clipr jobs, media collections, products, rate limits, shared music tracks, Swipr backgrounds, and waitlist submission behavior.
- Added focused hook coverage for clip/photo/Swipr libraries, Upload Processor, Stitchr, Swapr generation, Clipr generation, product state, avatar photo generation, avatar-from-UGC creation, video music details, and sequence players.
- Added SSR render coverage for dashboard page clients and media preview components, including `VideoPreview` and `VideoClipMusicPreview`.
- Added focused Media/UI utility coverage for text overlay drawing, avatar-generation constants, and Clipr raw hook template resources.
- Added follow-up next-sprint coverage for:
  - `POST /api/clipr/jobs`
  - `DELETE /api/avatars/[id]`
  - `GET /api/swapr/jobs/[id]`
  - `POST /api/swapr/jobs/[id]/cancel`
  - `POST /api/swipr/backgrounds/upload-url`
  - `POST /api/swipr/backgrounds/analyze`
  - `POST /api/swipr/backgrounds/download-url`
  - `POST /api/indexnow`
  - `generateAvatarPhotos`
  - `createSwaprOutpaintInputs`
  - `createSwaprPortraitPhotoBlob`
  - `getClipMetadata`
  - `useShowUploadControls`
  - `useLoadedVideoClip`
- Added an additional continuation batch for:
  - `POST /api/analytics/tiktok/events`
  - `createVideoPosterCandidateTimes`
  - `encodeCanvasAsPosterBlob`
  - `getCanvasVisiblePixelRatio`
  - `getSupportedOutputCodecs`
  - `getVideoMimeType`
  - `createRetimedAudioSample`
  - `createRetimedVideoSample`
  - `registerAacEncoderIfNeeded`
- Added the 75% coverage continuation batch for:
  - `VideoPreview`
  - `LoadedStitchSequencePreview`
  - `CreateAvatarFromClipDialog`
  - `SwiprSwipeCard`
  - `VideoClipDetailsDialog`
  - typed fixture updates for current `TextOverlay`, music metadata, shared track, and Swipr slide shapes.
- Reused the shared overlay style helper from:
  - `web/app/_components/stitchr/TextOverlayBox.tsx`
  - `web/app/_components/stitchr/TextOverlayPreviewBox.tsx`
  - `web/app/_components/swipr/SwiprStaticTextOverlayBox.tsx`
- Replaced eager library hydration with paginated Convex metadata queries and lazy blob loaders:
  - `videoClips.list` and `stitches.list` now paginate metadata instead of collecting every document.
  - `useClipLibraryState` no longer downloads poster blobs during dashboard/library load.
  - Clip and stitch poster blobs load on card demand.
  - Dashboard, Uploads, and Stitchr library views now expose "load more" controls for paginated metadata.
- Added focused coverage for paginated library queries, lazy library blob loading, and lazy object URL cleanup.
- Added batched, cacheable image downloads for visible poster/thumbnail media:
  - `POST /api/r2/download-urls` signs up to 48 user-owned poster/thumbnail keys after one auth and R2-download rate-limit check.
  - Client poster and thumbnail loading now checks persistent browser Cache Storage first, batch-signs cache misses, and fetches image blobs with limited parallelism.
  - Full video/audio/blob downloads still use the single-object path and are not persisted in browser cache.
- Split the oversized Clipr job orchestration route:
  - `web/app/api/clipr/jobs/route.ts` now owns auth, request-scoped setup, response formatting, and error mapping.
  - Request parsing, start quotas, Convex input loading, queued job persistence, script planning, avatar image generation, avatar video generation, shared music metadata handling, analytics, and failure cleanup now live in focused `web/lib/clipstitchr/server/clipr/*` modules.
  - Existing Clipr route coverage continues to cover auth, validation, rate-limit, selected music, provider, R2, Convex persistence, analytics, and failure behavior.
- Added the 80% coverage completion batch for:
  - static RSS and `llms.txt` route responses.
  - content/blog/docs route rendering, MDX component mapping, and landing/app route wrapper coverage.
  - analytics preference UI/reporters and waitlist submit success/error flows.
  - music selector, upload/tag/product demo controls, Settings client wiring, and Product Settings UI.
  - Clipr controls/result/progress components and Longr timeline/music/sequence player branches.
  - dashboard shell/sidebar/stats/recent sections and focused misc Stitchr/Swapr/Swipr empty/dialog/pagination states.
- Added the 93% coverage continuation batch for:
  - cookie consent hydration/cleanup, media action menu event cleanup, and object URL lifecycle coverage.
  - Clipr avatar image creation, Clipr text parsing fallbacks, PostHog server capture, and additional R2/client utility wrappers.
  - paginated and lazy library state edge cases across clips, photos, Swipr backgrounds, and Longr media records.
  - Video clip cards/previews/music previews, Stitch download/export cards, Swipr background/details dialogs, Stitch text settings, sequence preview, trim editor/slider, and product edit dialog interactions.
  - Waitlist validation branches, Convex Longr list/get/save/remove paths, and additional dashboard/page-client workflow branches.

## Verification After Cleanup

- `npm run lint`: pass, 0 warnings.
- `npm run typecheck`: pass.
- `npm test`: pass, 286 test files / 982 tests.
- Full all-file coverage: 93.51% statements, 81.05% branches, 88.39% functions, 93.65% lines.
- `npm run build` with placeholder production environment: pass on Next.js `16.2.6`.
- `npm audit`: reports 4 moderate vulnerabilities and no high or critical vulnerabilities; npm's automated fixes still require `--force` and incompatible downgrade paths.

## Current Residual Audit Findings

- `next` still reports a moderate advisory through its bundled `postcss`; npm only offers an invalid major downgrade (`next@9.3.3`) as the automated fix.
- `convex` still reports a moderate advisory through transitive `ws`; npm only offers a major downgrade (`convex@1.31.7`) as the automated fix.
- Treat these as monitored dependency debt until upstream packages ship compatible patched dependency trees.

## Current State

- **Quality gates:** `npm test`, `npm run typecheck`, and `npm run lint` pass; `placeholder-env npm run build` passed in the dependency cleanup pass.
- **Lint:** Has 0 errors and 0 warnings after excluding `web/convex/_generated/*`.
- **Scale:** 1,204 TS/JS source/test files, 83,680 lines, 66 files over 250 lines, 14 over 500 lines.
- **Tests:** 286 test files / 982 tests. Coverage includes unloaded source and now reports 93.51% statements, 81.05% branches, 88.39% functions, and 93.65% lines.
- **Security:** `npm audit` reports 4 vulnerabilities: 0 high, 4 moderate via `next/postcss` and `convex/ws`.

## Highest-ROI Debt

1. **Done: Vulnerable Next.js dependency**
   - **File:** `web/package.json:27` now pins `next@16.2.6`; the high-severity advisories are cleared.
   - **Residual:** npm still reports a moderate `postcss` advisory through `next`.
2. **Done: Misleading coverage and missing workflow tests**
   - `coverage.include/all` is now enabled, the 80% statement coverage target is complete, and the follow-up pass pushed all-file statement/line coverage above 93%.
   - Covered slices now include expensive API routes, analytics routes, Convex mutations/queries, core hooks, dashboard page clients, preview components, client helpers, Media Bunny helpers, media canvas helpers, dialog/card workflows, content pages, analytics UI, music/upload controls, Settings/Product UI, Longr timeline branches, text overlay utilities, lazy object URLs, Clipr parser/provider helpers, and additional Swipr/Stitchr/Waitlist/Product workflows.
   - Remaining gap: literal 100% still requires broad branch-heavy coverage across Swipr/Clipr page clients, avatar generation/actions, Stitchr sequence/editor controls, Swapr controls, provider/R2 edge helpers, and low-level media export branches.
   - **Action:** Continue with branch/deeper workflow coverage; prioritize high-risk workflows over chasing low-value generated/config wrappers.
3. **Done: Oversized orchestration route**
   - **Action:** Split `POST /api/clipr/jobs` into request parsing, quota consumption, input loading, generation steps, persistence, analytics, and failure cleanup helpers.
   - **Files:** `web/app/api/clipr/jobs/route.ts` and `web/lib/clipstitchr/server/clipr/*`.
   - **Result:** The route is now 82 lines and delegates the multi-step Clipr workflow to focused server modules while preserving existing route behavior.
4. **Done: Eager library hydration can become expensive**
   - **Action:** `useClipLibraryState` now subscribes to paginated metadata and keeps saved media bytes out of initial dashboard/library hydration.
   - **Files:** `web/lib/clipstitchr/hooks/useClipLibraryState.ts`, Convex clip/stitch/Longr list queries, and dashboard library consumers.
   - **Result:** Poster blobs load when cards need them but now coalesce same-page cache misses through `POST /api/r2/download-urls`, persistent browser Cache Storage avoids refetching posters/thumbnails across refreshes, full Longr video blobs load only for preview/download, and library views can request additional metadata pages.
5. **Done: Duplicated Media Bunny export pipeline**
   - **Files:**
     - `web/lib/clipstitchr/media/stitchNormalizedVideos.ts`
     - `web/lib/clipstitchr/media/stitchNormalizedVideosWithTextOverlay.ts`
     - `web/lib/clipstitchr/media/createVideoSegmentBlob.ts`
     - `web/lib/clipstitchr/media/*MediaBunny*`, `createTikTok*`, `createOutputAudioSampleSource.ts`, and `assertNormalizedAudioParameters.ts`
   - **Action:** Extract shared output/session helpers without using Conversion for stitching.
   - **Result:** Shared Media Bunny helpers now own normalized-audio validation, output codec resolution, TikTok video/canvas/audio source creation, output session setup, progress mapping, and finalization while Stitchr still manually writes UGC-then-Demo samples.
6. **Done: Text overlay style drift risk**
   - **Action:** Extracted `getTextOverlayCssProperties` and removed the duplicated style calculation from Stitchr and Swipr overlay boxes.
7. **Done: Lint scans generated Convex files**
   - **Action:** `web/eslint.config.mjs` now ignores `convex/_generated/**`.

## Roadmap

- **This sprint:** Coverage was expanded from the all-file baseline to 93.51% statements and 93.65% lines across API routes, analytics routing, Convex modules, hooks, dashboard SSR renders, content routes, client helpers, media utilities, preview components, and dialog/card workflows.
- **Month 1:** Continue toward literal 100% by targeting branch-heavy workflows: Swipr/Clipr page branches, avatar generation/actions, Swapr controls, Stitchr sequence/editor controls, provider/R2 edge helpers, and media export failure paths.
- **Quarter:** Add integration/E2E coverage for upload normalization, Stitchr UGC-then-Demo export, dashboard library flows, and paid provider routes; add dependency/audit checks to CI.

## Prevention

Add CI gates for build, typecheck, lint, test, `npm audit --omit=dev --audit-level=high`, and a duplication/max-lines check. Track real coverage after enabling all-file coverage, with separate targets for API routes, hooks, media, and UI workflows.
