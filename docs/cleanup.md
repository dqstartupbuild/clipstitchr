# Codebase Cleanup & Tech Debt Analysis

Used `codebase-cleanup-tech-debt` for the initial inventory, follow-up cleanup pass, and next-sprint test pass.

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
- Added focused hook coverage for clip/photo/Swipr libraries, Upload Processor, Stitchr, Longr, Swapr generation, Clipr generation, product state, avatar photo generation, avatar-from-UGC creation, video music details, and sequence players.
- Added SSR render coverage for dashboard page clients and media preview components, including `VideoPreview`, `VideoClipMusicPreview`, and `LongVideoPreview`.
- Added focused Media/UI utility coverage for text overlay drawing, avatar-generation constants, and Clipr raw hook template resources.
- Reused the shared overlay style helper from:
  - `web/app/_components/stitchr/TextOverlayBox.tsx`
  - `web/app/_components/stitchr/TextOverlayPreviewBox.tsx`
  - `web/app/_components/swipr/SwiprStaticTextOverlayBox.tsx`

## Verification After Cleanup

- `npm run lint`: pass, 0 warnings.
- `npm run typecheck`: pass.
- `npm test`: pass, 137 test files / 458 tests.
- Full all-file coverage: 50.26% statements, 40.40% branches, 41.80% functions, 50.33% lines.
- `npm run build` with placeholder production environment: pass on Next.js `16.2.6`.
- `npm audit --omit=dev --json`: 0 critical, 0 high, 4 moderate vulnerabilities remain.

## Current Residual Audit Findings

- `next` still reports a moderate advisory through its bundled `postcss`; npm only offers an invalid major downgrade (`next@9.3.3`) as the automated fix.
- `convex` still reports a moderate advisory through transitive `ws`; npm only offers a major downgrade (`convex@1.31.7`) as the automated fix.
- Treat these as monitored dependency debt until upstream packages ship compatible patched dependency trees.

## Current State

- **Quality gates:** `npm test`, `npm run typecheck`, and `npm run lint` pass; `placeholder-env npm run build` passed in the dependency cleanup pass.
- **Lint:** Has 0 errors and 0 warnings after excluding `web/convex/_generated/*`.
- **Scale:** 1,042 TS/JS source/test files, 64,175 lines, 54 files over 250 lines, 12 over 500 lines.
- **Tests:** 137 test files / 458 tests. Coverage includes unloaded source and now reports 50.26% statements, 40.40% branches, 41.80% functions, and 50.33% lines.
- **Security:** `npm audit --omit=dev` reports 4 prod vulnerabilities: 0 high, 4 moderate via `next/postcss` and `convex/ws`.

## Highest-ROI Debt

1. **Done: Vulnerable Next.js dependency**
   - **File:** `web/package.json:27` now pins `next@16.2.6`; the high-severity advisories are cleared.
   - **Residual:** npm still reports a moderate `postcss` advisory through `next`.
2. **High: Misleading coverage and missing workflow tests**
   - `coverage.include/all` is now enabled and the first next-sprint target is complete: all-file statement coverage is above 50%.
   - Covered slices now include expensive API routes, Convex mutations/queries, core hooks, dashboard page clients, preview components, and text overlay utilities.
   - Remaining gap: `clipr/jobs`, media export pipelines, large dashboard components, and content/analytics routes still need deeper tests.
   - **Action:** Continue toward 60% with `clipr/jobs`, Media Bunny export helpers, and the largest dashboard components.
3. **High: Oversized orchestration route**
   - **File:** `web/app/api/clipr/jobs/route.ts:43` is 404 lines and owns auth, rate limits, Convex writes, Replicate text/image/video/music calls, R2 saves, shared music saves, analytics, and failure handling.
   - **Action:** Split into request parsing, quota consumption, generation steps, persistence, and cleanup.
   - **Effort:** 16-24h.
4. **High: Eager library hydration can become expensive**
   - **File:** `web/lib/clipstitchr/hooks/useClipLibraryState.ts:392` downloads poster blobs for all clips/stitches and full Longr blobs during hydration. That turns dashboard/library load into O(saved media bytes).
   - **Action:** Lazy-load video blobs and paginate metadata.
   - **Effort:** 8-16h.
5. **Medium: Duplicated Media Bunny export pipeline**
   - **Files:**
     - `web/lib/clipstitchr/media/stitchNormalizedVideos.ts:52`
     - `web/lib/clipstitchr/media/stitchNormalizedVideosWithTextOverlay.ts:56`
     - `createVideoSegmentBlob.ts` (repeat codec selection, audio validation, output setup, finalization, and progress math).
   - **Action:** Extract shared output/session helpers without using Conversion for stitching.
   - **Effort:** 8-12h.
6. **Done: Text overlay style drift risk**
   - **Action:** Extracted `getTextOverlayCssProperties` and removed the duplicated style calculation from Stitchr and Swipr overlay boxes.
7. **Done: Lint scans generated Convex files**
   - **Action:** `web/eslint.config.mjs` now ignores `convex/_generated/**`.

## Roadmap

- **This sprint:** Complete. Coverage was expanded from the all-file baseline to 50.26% statements across API routes, Convex modules, hooks, dashboard SSR renders, and media utilities.
- **Month 1:** Split `clipr/jobs` route; add route tests for auth, 429, validation, provider failure; lazy-load Longr/video blobs; extract Media Bunny export helpers; continue coverage toward 60%.
- **Quarter:** Add integration/E2E coverage for upload normalization, Stitchr UGC-then-Demo export, dashboard library flows, and paid provider routes; add dependency/audit checks to CI.

## Prevention

Add CI gates for build, typecheck, lint, test, `npm audit --omit=dev --audit-level=high`, and a duplication/max-lines check. Track real coverage after enabling all-file coverage, with separate targets for API routes, hooks, media, and UI workflows.
