# Codebase Cleanup & Tech Debt Analysis

Used `codebase-cleanup-tech-debt` and scanned the repo without changing files.

## Current State

- **Quality gates:** `npm test`, `npm run typecheck`, and `placeholder-env npm run build` pass.
- **Lint:** Has 0 errors, 4 warnings from `web/convex/_generated/*`.
- **Scale:** 990 TS/JS source/test files, 54,300 lines, 36 files over 250 lines, 8 over 500 lines.
- **Tests:** 86 test files / 211 tests. Coverage reports 90%, but only for loaded files; `web/vitest.config.ts:16` does not enable all-file coverage, so this is misleading.
- **Security:** `npm audit --omit=dev` reports 4 prod vulnerabilities: 1 high in `next`, 3 moderate via `next/postcss` and `convex/ws`. `next` should move from `16.2.4` to `16.2.6`.

## Highest-ROI Debt

1. **High: Vulnerable Next.js dependency**
   - **File:** `web/package.json:27` pins `next@16.2.4`; current audit says `16.2.6` fixes high-severity advisories.
   - **Effort:** 2-4h. Do this first.
2. **High: Misleading coverage and missing workflow tests**
   - `app/api` has 26 source files and 0 tests; `app/_components` has 165 source files and 0 tests; hooks have 27 source files and 0 tests; media has 39 source files and 1 test.
   - **Action:** Add `coverage.include/all` first, then cover expensive API routes and browser media flows.
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
6. **Medium: Text overlay style drift risk**
   - **Files:**
     - `web/app/_components/stitchr/TextOverlayBox.tsx:45`
     - `web/app/_components/stitchr/TextOverlayPreviewBox.tsx:17`
     - `web/app/_components/swipr/SwiprStaticTextOverlayBox.tsx:17` (duplicate style computation).
   - **Action:** Extract `getTextOverlayCssProperties`.
   - **Effort:** 2-4h.
7. **Low: Lint scans generated Convex files**
   - **File:** `web/eslint.config.mjs:9` should ignore `convex/_generated/**`.
   - **Effort:** 15m.

## Roadmap

- **This sprint:** Upgrade `next`/`eslint-config-next`, re-run audit; ignore Convex generated files in lint; fix coverage config; extract text overlay style helper.
- **Month 1:** Split `clipr/jobs` route; add route tests for auth, 429, validation, provider failure; lazy-load Longr/video blobs; extract Media Bunny export helpers.
- **Quarter:** Add integration/E2E coverage for upload normalization, Stitchr UGC-then-Demo export, dashboard library flows, and paid provider routes; add dependency/audit checks to CI.

## Prevention

Add CI gates for build, typecheck, lint, test, `npm audit --omit=dev --audit-level=high`, and a duplication/max-lines check. Track real coverage after enabling all-file coverage, with separate targets for API routes, hooks, media, and UI workflows.
