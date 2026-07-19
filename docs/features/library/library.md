# Library

The server passes the requested `tab` query value into the first Library render. This keeps the server and browser on the same selected tab during hydration, including direct links such as `/dashboard/library?tab=demo`, while the existing client-side URL synchronization continues to handle later tab changes and browser navigation.

## What It Does

The authenticated Library lives at `/dashboard/library`. It is the single place
for saved Hook/UGC clips, product demos, generated outputs, finished work, and
avatar photos. Reusable Stitchr setups now live as Ideas in Hook Lab.

Library tabs are grouped by the way users think about the work:

- Videos: Hook/UGC, Product demos, Swaps
- Finished: Stitches, Carousels
- Assets: Avatars, Pexels

The Hook/UGC tab is backed by the `ugc` tab value because those clips remain the
UGC-compatible source clips in the data model. Hook/UGC is the visible label so
the product UI keeps the hook role and the UGC asset type together. The old All
tab is no longer shown. Old dashboard URLs stay as
compatibility redirects:

- `/dashboard/uploads` -> `/dashboard/library`
- `/dashboard/avatars` -> `/dashboard/library?tab=avatars`
- `/dashboard/templates` -> `/dashboard/hooks?view=ideas`
- `/dashboard/stitches` -> `/dashboard/library?tab=stitches`

The legacy `/dashboard/library?tab=templates` URL also redirects to
`/dashboard/hooks?view=ideas`. `templates` remains an accepted internal tab
value only for rollback compatibility; it is not rendered in `LibraryTabs`.

## Implementation

The Library page is implemented by
`web/app/dashboard/library/LibraryPageClient.tsx` and rendered from
`web/app/dashboard/library/page.tsx`.

The grouped tab bar is `web/app/_components/library/LibraryTabs.tsx`. It uses
`web/app/_components/ui/SegmentedControl.tsx` so Library tabs, status filters,
and mode toggles share the same behavior. The selected tab is read from the
`tab` search param through:

- `web/lib/clipstitchr/types/LibraryTab.ts`
- `web/lib/clipstitchr/utils/getInitialLibraryTab.ts`
- `web/lib/clipstitchr/utils/getLibraryTabFromSearchParams.ts`
- `web/lib/clipstitchr/utils/getLibraryTabFromAssetType.ts`

Avatar functionality moved into
`web/app/_components/library/AvatarLibraryTabSection.tsx`. It preserves avatar
photo upload, avatar assignment, default avatar actions, product assignment,
voice and wardrobe controls, AI photo generation, metadata editing, deletion,
and photo browsing.

The old `TemplateLibraryTabSection.tsx` remains in source during the Hook Lab
rollback window, but current navigation never renders it. Recipe Ideas are
managed at `/dashboard/hooks?view=ideas`.

Pexels pack management lives in
`web/app/_components/library/PexelsLibraryTabSection.tsx`. It preserves Pexels
search/import, imported pack browsing, pack editing, and account pack selection.
The Pexels tab has All/Mine filters: All shows global imported packs, and Mine
shows packs the current user imported or added for Swipr.

The Pexels tab reads one compact summary per pack. It does not load every
Pexels background or the account Swipr background list on entry. A selected
pack's bounded compact backgrounds load only while its dialog is open, and
cover images load only as their cards approach the viewport.

## Data Loading

The dashboard providers still share one library context. The route-aware hooks
load the data needed by `/dashboard/library`:

- `useClipLibraryState` loads UGC, Demo, Swaps, Stitches, posted Stitches, and
  library counts.
- `useSwiprLibraryState` loads only global Pexels pack summaries on the Pexels
  tab. Account Swipr backgrounds, active Swipes, and posted Swipes remain
  route- and tab-scoped to their actual consumers.
- `usePhotoLibraryState` loads avatar documents, photo documents, and avatar
  preferences.

## Upload Behavior

The dashboard upload selector routes users to the matching Library tab with
upload controls open:

- Hook/UGC clip -> `/dashboard/library?tab=ugc&upload=open#upload-panel`
- Demo -> `/dashboard/library?tab=demo&upload=open#upload-panel`
- Avatar photo -> `/dashboard/library?tab=avatars&upload=open#upload-panel`

Hook/UGC and Demo uploads render in the main Library page. Avatar uploads render
inside the Avatars tab so the assignment controls remain next to avatar
management.

## File Tree

```text
web/app/dashboard/library/
  LibraryPageClient.tsx
  LibraryPageClient.test.tsx
  page.tsx

web/app/_components/library/
  AvatarLibraryTabSection.tsx
  AvatarLibraryTabSection.test.tsx
  LibraryTabs.tsx
  PexelsLibraryFilterTabs.tsx
  PexelsLibraryPackCard.tsx
  PexelsLibraryTabSection.tsx
  TemplateLibraryTabSection.tsx  # legacy rollback compatibility

web/app/dashboard/uploads/page.tsx
web/app/dashboard/avatars/page.tsx
web/app/dashboard/templates/page.tsx
web/app/dashboard/stitches/page.tsx
```

## Maintenance Notes

Add new visible Library tabs to `LibraryTab`, `LibraryTabs`, and
`getLibraryTabFromSearchParams` together. If a tab needs upload controls, update
`getLibraryTabFromAssetType` and `UploadDestinationMenuButton` in the same
change.

Keep the `templates` compatibility value and server redirect until the Hook Lab
Template migration has completed its rollback window. Do not re-add Templates
to the visible Assets group.

Place new tabs in the clearest Library group: Videos, Finished, or Assets. If a
new group is needed, keep the label plain and user-facing.

Do not add new standalone dashboard pages for Library-owned asset management.
Add the UI as an atomic tab section under `web/app/_components/library/` and
wire it into `LibraryPageClient`.
