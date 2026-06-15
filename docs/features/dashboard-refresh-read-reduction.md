# Dashboard Refresh Read Reduction

## What Changed

Dashboard pages now load less data on hard refresh. The dashboard home uses a
single summary query for counts and recent cards, pages that only save Stitchr
templates no longer load the full template list, and shared media libraries skip
queries that are unrelated to the active route or upload tab.

## How It Works

`web/convex/dashboardSummary.ts` returns the dashboard home data in one request:
clip counts, recent uploads, recent active stitches, recent active Swipes,
backgrounds needed by those Swipes, and source clips needed by recent Stitch
cards.

`web/lib/clipstitchr/hooks/useDashboardSummary.ts` maps that Convex response
into app types for `web/app/dashboard/DashboardPageClient.tsx`.

`web/lib/clipstitchr/hooks/useStitchTemplateActions.ts` owns create, rename,
and delete template actions without loading templates. The dashboard home and
uploads page use this action hook. `useStitchTemplates` still loads the template
list for the Templates and Stitchr pages.

The shared library hooks now use route and search-param gates:

- `useClipLibraryState` skips dashboard-home list hydration, loads UGC sources
  for Swapr instead of all clips, and narrows `/dashboard/uploads` reads by tab.
- `usePhotoLibraryState` no longer loads photo and avatar libraries on the
  dashboard home.
- `useSwiprLibraryState` skips dashboard-home background and swipe hydration,
  loads upload Swipes only for the All or Swipes tab, and loads Swipr-page
  saved Swipes only when a `swipe` URL param is present.

Because those gates read dashboard URL search params from shared dashboard
state, `web/app/dashboard/layout.tsx` wraps `DashboardLibraryProvider` in a
Suspense boundary. That lets Next prerender dashboard routes like
`/dashboard/avatars` without failing when the shared provider reads query
params during client hydration.

## Use Cases

- Refreshing `/dashboard` should show the same overview without hydrating every
  media library.
- Refreshing `/dashboard/uploads?tab=demo` should avoid unrelated UGC, Swapr,
  Stitch, and Swipe reads.
- Refreshing `/dashboard/swapr` should load only valid UGC source clips and
  stitches instead of all video clips.
- Saving a Stitchr template from dashboard cards should not require loading the
  template library first.

## File Tree

```text
web/convex/dashboardSummary.ts
web/lib/clipstitchr/constants/emptyClipLibraryCounts.ts
web/lib/clipstitchr/hooks/useDashboardSummary.ts
web/lib/clipstitchr/hooks/useDashboardSummary.test.ts
web/lib/clipstitchr/hooks/useStitchTemplateActions.ts
web/lib/clipstitchr/hooks/useStitchTemplates.ts
web/lib/clipstitchr/types/DashboardSummary.ts
web/app/_components/dashboard/DashboardLayoutFallback.tsx
web/app/dashboard/layout.tsx
web/app/dashboard/DashboardPageClient.tsx
web/app/dashboard/uploads/UploadsPageClient.tsx
web/app/dashboard/swapr/SwaprPageClient.tsx
```

## Verification

Focused tests cover the dashboard summary mapper, route-aware library skipping,
template auth gating, dashboard rendering, uploads rendering, and Swapr source
selection.
