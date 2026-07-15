# Swipr Pexels Pack Library

Swipr Pexels packs let a user import a group of Pexels photos from one search
query, save those photos as a global R2-backed pack, and add packs to their own
account for editable Swipe drafts.

This mirrors the useful part of SlideSmith's image-pack workflow: a search
query becomes a reusable pack of images. ClipStitchr keeps the provider
different by using Pexels instead of Pinterest and stores the images as global
Pexels Swipr background records in Convex plus Cloudflare R2. A separate
account-pack table controls which global packs appear in a user's Swipr and
automation settings.

## User Workflow

1. The user opens `/dashboard/library?tab=pexels`.
2. The user searches Pexels from the Pexels tab.
3. The user can load more Pexels results for the same query when the current
   page returns a full result set.
4. The user can import the loaded new results as a global saved pack. Already-saved
   Pexels photos are hidden from the visible result list, so repeat searches
   make it easier to find fresh photos.
5. Imported photos are saved with `source: "pexels"` and `libraryQuery` set to
   the normalized search query. If a matching pack already exists, the import
   reuses that pack name instead of creating a duplicate casing/spacing variant.
6. The Library Pexels tab shows All and Mine filters. All includes every global
   imported pack. Mine includes packs the user imported and global packs they
   added to their account.
7. Users can add a global pack to Mine for Swipr batch generation and
   automation.
8. Users can click any pack card to view its photos in a dialog. The dialog
   shows 12 photos per page, supports previous and next page controls, and
   closes when the user taps outside it or uses the close button.
9. Users can remove a pack from Mine. This only removes the pack from that
   user's account and never deletes the shared global pack.
10. Users can remove individual photos from their own account copy of a pack.
    The photo remains in the global pack for everyone else.
11. Swipr Batch mode shows the user's Mine packs as small selectable buttons.
    The user must choose at least one pack.
12. Swipr Batch mode generates 10 editable draft Swipes at once. Draft
    generation uses the selected packs, creates text for each slideshow,
    assigns saved Pexels backgrounds to the slides, and saves each result as a
    normal editable 8-slide Swipe.

## Data Model

`swiprBackgrounds` stores an optional `libraryQuery` string. This field is only
used for global Pexels pack images.

`swiprLibraryPackAccounts` stores one row per account-added pack:

- Owner ID from Convex auth.
- Normalized pack display name.
- Normalized pack key.
- Created timestamp.

`swiprLibraryPackPhotoExclusions` stores one row per account-hidden photo:

- Owner ID from Convex auth.
- Stable Swipr background ID.
- Normalized pack display name.
- Normalized pack key.
- Created timestamp.

The saved background record includes:

- Importing owner ID from Convex auth.
- Stable background ID.
- R2 image object.
- `source: "pexels"`.
- `libraryQuery`, normalized to the trimmed query.
- Optional `pexelsPhotoId`, used to hide or skip photos that were already
  imported. Older records are still deduped by parsing the stored Pexels URL in
  hidden details.
- Pexels URL, photographer credit, and optional alt text in hidden details.
- Dimensions, MIME type, size, tags, and created timestamp.

Saved Swipes remain fully editable. Draft generation stores the same slide
records as manual Swipr saves, so users can reopen a generated draft and change
each slide's photo and text.

Product automation settings can also reuse Mine packs. In Settings, the user
can pick which account-added Pexels packs Swipr automation should use for the
active product. If the selected packs have images, the provider worker uses
those saved background IDs instead of downloading new Pexels photos for that
automatic Swipe.

## Backend Routes

`POST /api/swipr/pexels/import`

- Requires an authenticated user.
- Reads a query plus either loaded Pexels photo results from the dashboard or a
  legacy result page/import count.
- For loaded-photo imports, skips the Pexels search call because the user
  already searched those pages.
- For legacy page/count imports, consumes Pexels search limits before calling
  Pexels.
- Consumes Pexels import-image limits for the new photos before downloading or
  saving images.
- Reuses an existing global pack name when the normalized search query already
  exists.
- Skips photos already imported globally.
- Downloads each new photo server-side.
- Uploads each photo to owner-scoped R2 storage.
- Saves each photo through `swiprBackgrounds.save` with `libraryQuery`.
- Adds the pack to the current user's account, even when the pack already
  existed globally and no new photos were imported.
- Returns the imported background IDs, query, imported count, and searched
  count.

`swiprBackgrounds.renameLibraryPack`

- Remains as a compatibility mutation for older clients.
- Requires an authenticated user.
- Always throws because Pexels packs are shared and cannot be renamed by one
  user.

`swiprBackgrounds.removeFromLibraryPack`

- Requires an authenticated user.
- Verifies the requested background is a global Pexels pack photo and that the
  pack is in the user's account.
- Consumes `convexMetadataUpdate`.
- Inserts a `swiprLibraryPackPhotoExclusions` row so the photo no longer appears
  in that user's Mine pack or Swipr pack picker.
- Does not delete or patch the global photo record.

`swiprBackgrounds.removeLibraryPack`

- Remains as a compatibility mutation for older clients.
- Requires an authenticated user.
- Consumes `convexMetadataUpdate` when the pack is in the user's account.
- Removes the account-pack row and matching per-photo exclusions.
- Does not delete shared Convex records or R2 image objects.

`swiprBackgrounds.addLibraryPackToAccount`

- Requires an authenticated user.
- Verifies the global Pexels pack exists.
- Consumes `convexMetadataUpdate`.
- Inserts the account-pack row when it does not already exist.

`swiprBackgrounds.removeLibraryPackFromAccount`

- Requires an authenticated user.
- Consumes `convexMetadataUpdate`.
- Deletes the account-pack row and any per-photo exclusions for that user and
  pack. It does not delete global Pexels photos.

`POST /api/swipr/drafts/generate`

- Requires an authenticated user.
- Reads a product ID and selected library queries.
- Requires at least one selected Pexels pack.
- Always creates 10 draft Swipes on the server.
- Always creates 8-slide drafts on the server. The route ignores client slide
  counts so old clients cannot create shorter batch Swipes.
- Consumes the counted Clipr hook/script writing limit before provider work.
- Loads the selected product and the user's account-added Swipr backgrounds.
- Uses Pexels backgrounds from the selected account-added pack names.
- Randomizes Pexels background assignment instead of walking pack photos in
  saved order. Batch generation picks a random first-slide/preview-photo order
  across drafts, and each draft uses a shuffled non-repeating cycle before any
  selected photo repeats.
- Generates multiple slideshow text drafts through the existing text-writing
  provider.
- Saves each draft through `swipes.save`, including the generated caption, a
  useful 1000-2000 character description, optional hashtags, combined social
  copy, and performance note. The description may be shorter when the supplied
  context cannot support the target length without repetition or invention.

The Swipr Batch tab also sends a slide count of 8 for clarity, but the backend
is the source of truth.

## Relevant Code

- `web/app/api/swipr/pexels/import/route.ts`
- `web/app/api/swipr/drafts/generate/route.ts`
- `web/app/_components/library/PexelsLibraryTabSection.tsx`
- `web/app/_components/library/PexelsLibraryFilterTabs.tsx`
- `web/app/_components/library/PexelsLibraryPackCard.tsx`
- `web/app/_components/swipr/SwiprPexelsPanel.tsx`
- `web/app/_components/swipr/SwiprModeToggle.tsx`
- `web/app/_components/swipr/SwiprBatchControls.tsx`
- `web/app/_components/swipr/SwiprManualControls.tsx`
- `web/app/_components/swipr/SwiprLibraryPackPicker.tsx`
- `web/app/_components/swipr/SwiprLibraryPackDialog.tsx`
- `web/app/_components/swipr/SwiprLibraryPackPhotoList.tsx`
- `web/app/_components/swipr/SwiprLibraryPackEditorPhoto.tsx`
- `web/lib/clipstitchr/constants/swiprLibraryPackPageSize.ts`
- `web/app/_components/swipr/SwiprLibraryPhotoCard.tsx`
- `web/app/_components/settings/AutomationSwiprPackPicker.tsx`
- `web/app/dashboard/library/LibraryPageClient.tsx`
- `web/app/dashboard/swipr/SwiprPageClient.tsx`
- `web/lib/clipstitchr/utils/getSwiprLibraryPacks.ts`
- `web/lib/clipstitchr/utils/getImportedPexelsPhotoIds.ts`
- `web/lib/clipstitchr/utils/getSwiprLibraryQueryForImport.ts`
- `web/lib/clipstitchr/server/createSwiprBatchTextGeneration.ts`
- `web/lib/clipstitchr/server/createSwiprBatchTextGenerationPrompt.ts`

## Abuse Protection

Pexels pack import creates external API, bandwidth, R2, and Convex write cost.
The import route consumes:

- `pexelsSearch` and `pexelsSearchGlobal` before calling Pexels only for the
  legacy page/count path. Loaded-photo imports use the already-loaded results
  and do not call Pexels search again.
- `pexelsImportImages` and `pexelsImportImagesGlobal` by requested import
  count before downloading or saving images. The global 500-image burst uses
  four shards so each empty shard can accept the supported 120-image import.
- `convexRecordSave` inside `swiprBackgrounds.save` for each imported photo.
- `convexMetadataUpdate` when a pack is added to or removed from an account,
  and when a photo is removed from an account copy of a pack.

Draft generation creates provider-writing and Convex write cost. The draft
route consumes `cliprHookScript` and `cliprProviderSpendGlobal` with `count`
equal to the fixed Swipr batch count of 10 before calling the writing provider.
Each saved draft then uses the existing `swipes.save` write limits.

## Maintenance Notes

Imported Pexels packs are global for authenticated users. Only Pexels records
with a `libraryQuery` are globally readable. Uploaded, avatar-photo, AI, and
provider-generated one-off Swipr backgrounds remain private.

Pexels packs are shared and immutable from the user UI. Removing a pack deletes
only that user's account-pack row. Removing one photo inserts a user-specific
exclusion row. Neither action deletes global Convex records or R2 images, so
the All list can keep helping other users start faster and saved Swipes that
already reference a photo can still reopen.
