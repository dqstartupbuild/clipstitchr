# First Batch Onboarding

## What It Does

The first batch onboarding flow gives new users one direct path into ClipStitchr:

1. Add a product name and website.
2. Review and edit the generated product profile.
3. Choose Hook Lab writing goal/tone and any phrases to avoid.
4. Upload Hook/UGC clips and review their scores.
5. Upload a product demo and review its score.
6. Choose Stitchr batch text style and colors.
7. Queue the first batch and land on the Library Stitches tab.

The flow intentionally skips a dashboard tour. It assumes the user already has
Hook/UGC clips and a product demo, which is the only supported onboarding
segment for now.

## Route

- `/dashboard/onboarding`

The route renders inside the normal dashboard shell. Users who have not completed onboarding are redirected here from other dashboard routes.

## Implementation

- `web/app/dashboard/onboarding/page.tsx` defines the route metadata and renders the client.
- `web/app/dashboard/onboarding/OnboardingPageClient.tsx` owns the step state, product creation/update calls, upload review state, and final batch redirect.
- `web/app/_components/onboarding/` contains the focused onboarding UI pieces.
- `web/app/_components/dashboard/UploadPanel.tsx` is reused for Hook/UGC and demo uploads.
- `web/app/_components/stitchr/StitchrBatchPanel.tsx` is reused for the batch style and color controls.
- `web/lib/clipstitchr/hooks/useClipLibraryState.ts` loads Hook/UGC and demo metadata on the onboarding route so review cards update as background jobs finish.
- `web/app/dashboard/DashboardProductProvider.tsx` redirects incomplete users to `/dashboard/onboarding`, blocks normal dashboard pages while the gate is loading or redirecting, and suppresses the old required product dialog while onboarding is required.
- `web/app/_components/dashboard/DashboardGateState.tsx` shows the brief waiting message while the dashboard gate is checking or redirecting.
- `web/app/_components/dashboard/DashboardSidebar.tsx` hides the normal dashboard navigation while onboarding is required.
- `web/convex/productPreferences.ts` stores `onboardingCompletedAt` after the first batch queues successfully.

## Product Review

The first screen asks only for product name and website. The create endpoint enriches the product profile from the website when possible.

The review screen lets the user edit:

- Product name
- Website
- Preferred hook style
- Hook Lab goal, tone, and phrases to avoid
- Product details
- Audience details
- Audience problem
- Pain points
- Emotional narrative

`ProductProfileCreateInput` now supports `inferredProblem` and `inferredPainPoints` so the review screen can save the generated fields it shows.

The review screen no longer asks new users for raw winning-hook examples. Saved
Ideas are the positive learning source, while onboarding owns only goal, tone,
and avoid phrases. Existing `winningHookExamples` values pass through unchanged
for rollback and are converted to product-scoped Ideas by the rollout
migration.

## Upload Review

Hook/UGC and demo uploads use the existing upload job pipeline:

- Source file uploads to R2.
- Media worker normalizes the video.
- Provider worker analyzes the clip and saves the score.

The onboarding review cards show saved normalized clips immediately. If the provider score is not ready yet, the card shows `Scoring`.

## Batch Creation

The final step calls `generateStitchrBatch` with the chosen text style and colors. On a successful queue, the user is redirected to:

`/dashboard/library?tab=stitches`

If no drafts are queued, the API message is shown in place.

## Completion Gate

Onboarding is considered complete when `productPreferences.onboardingCompletedAt` is set. The onboarding page sets this after `POST /api/stitchr/batch/generate` queues at least one Stitch draft.

Users without that flag are redirected back to `/dashboard/onboarding` from other dashboard routes. Existing accounts with saved Stitches are treated as already complete so the gate does not interrupt users who were using Stitchr before this onboarding flow existed.
