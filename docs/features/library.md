# Library

## What It Does

The authenticated Library lives at `/dashboard/library`. It is the single place
for saved source clips, generated outputs, finished work, avatar photos, and
Stitchr templates.

Library tabs:

- UGC
- Demo
- Swaps
- Swipes
- Pexels
- Stitches
- Avatars
- Templates

UGC is the default tab when no `tab` query is present. The old All tab is no
longer shown. Old dashboard URLs stay as compatibility redirects:

- `/dashboard/uploads` -> `/dashboard/library`
- `/dashboard/avatars` -> `/dashboard/library?tab=avatars`
- `/dashboard/templates` -> `/dashboard/library?tab=templates`
- `/dashboard/stitches` -> `/dashboard/library?tab=stitches`

## Implementation

The Library page is implemented by
`web/app/dashboard/library/LibraryPageClient.tsx` and rendered from
`web/app/dashboard/library/page.tsx`.

The tab bar is `web/app/_components/library/LibraryTabs.tsx`. The selected tab
is read from the `tab` search param through:

- `web/lib/clipstitchr/types/LibraryTab.ts`
- `web/lib/clipstitchr/utils/getInitialLibraryTab.ts`
- `web/lib/clipstitchr/utils/getLibraryTabFromSearchParams.ts`
- `web/lib/clipstitchr/utils/getLibraryTabFromAssetType.ts`

Avatar functionality moved into
`web/app/_components/library/AvatarLibraryTabSection.tsx`. It preserves avatar
photo upload, avatar assignment, default avatar actions, product assignment,
voice and wardrobe controls, AI photo generation, metadata editing, deletion,
and photo browsing.

Template management moved into
`web/app/_components/library/TemplateLibraryTabSection.tsx`. It preserves saved
template browsing, rename, delete, and "Use in Stitchr" actions.

Pexels pack management lives in
`web/app/_components/library/PexelsLibraryTabSection.tsx`. It preserves Pexels
search/import, imported pack browsing, pack editing, and account pack selection.
The Pexels tab has All/Mine filters: All shows global imported packs, and Mine
shows packs the current user imported or added for Swipr.

## Data Loading

The dashboard providers still share one library context. The route-aware hooks
load the data needed by `/dashboard/library`:

- `useClipLibraryState` loads UGC, Demo, Swaps, Stitches, posted Stitches, and
  library counts.
- `useSwiprLibraryState` loads account Swipr backgrounds, global Pexels packs,
  active Swipes, and posted Swipes.
- `usePhotoLibraryState` loads avatar documents, photo documents, and avatar
  preferences.

## Upload Behavior

The dashboard upload selector routes users to the matching Library tab with
upload controls open:

- UGC -> `/dashboard/library?tab=ugc&upload=open#upload-panel`
- Demo -> `/dashboard/library?tab=demo&upload=open#upload-panel`
- Avatar photo -> `/dashboard/library?tab=avatars&upload=open#upload-panel`

UGC and Demo uploads render in the main Library page. Avatar uploads render
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
  TemplateLibraryTabSection.tsx

web/app/dashboard/uploads/page.tsx
web/app/dashboard/avatars/page.tsx
web/app/dashboard/templates/page.tsx
web/app/dashboard/stitches/page.tsx
```

## Maintenance Notes

Add new Library tabs to `LibraryTab`, `LibraryTabs`, and
`getLibraryTabFromSearchParams` together. If a tab needs upload controls, update
`getLibraryTabFromAssetType` and `UploadDestinationMenuButton` in the same
change.

Do not add new standalone dashboard pages for Library-owned asset management.
Add the UI as an atomic tab section under `web/app/_components/library/` and
wire it into `LibraryPageClient`.
