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
8. Users can edit packs they imported by renaming them, removing a photo from a
   pack, or deleting the pack and its saved photos.
9. Swipr Batch mode shows the user's Mine packs as small selectable buttons.
   The user must choose at least one pack.
10. Swipr Batch mode generates 10 editable draft Swipes at once. Draft
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

- Requires an authenticated user.
- Finds owner-owned Pexels backgrounds whose normalized `libraryQuery` matches
  the source pack name.
- Consumes `convexMetadataUpdate` for the matching record count.
- Patches each matching record to the new normalized pack name.
- Patches matching account-pack rows to the new normalized pack name.

`swiprBackgrounds.removeFromLibraryPack`

- Requires an authenticated user.
- Verifies the requested background belongs to the user.
- Consumes `convexMetadataUpdate`.
- Clears `libraryQuery` so the photo no longer appears inside that pack.

`swiprBackgrounds.removeLibraryPack`

- Requires an authenticated user.
- Finds owner-owned Pexels backgrounds whose normalized `libraryQuery` matches
  the pack name.
- Consumes `convexRecordDelete` for the matching record count.
- Deletes the matching Convex records. The client deletes the matching R2 image
  objects through the existing rate-limited R2 delete route before calling this
  mutation.
- Deletes matching account-pack rows because the global pack no longer exists.

`swiprBackgrounds.addLibraryPackToAccount`

- Requires an authenticated user.
- Verifies the global Pexels pack exists.
- Consumes `convexMetadataUpdate`.
- Inserts the account-pack row when it does not already exist.

`swiprBackgrounds.removeLibraryPackFromAccount`

- Requires an authenticated user.
- Consumes `convexMetadataUpdate`.
- Deletes the account-pack row. It does not delete global Pexels photos.

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
- Generates multiple slideshow text drafts through the existing text-writing
  provider.
- Saves each draft through `swipes.save`, including the generated caption,
  1000-4000 character description, hashtags, combined social copy, and
  performance note.

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
- `web/app/_components/swipr/SwiprLibraryPackEditor.tsx`
- `web/app/_components/swipr/SwiprLibraryPackRenameForm.tsx`
- `web/app/_components/swipr/SwiprLibraryPackPhotoList.tsx`
- `web/app/_components/swipr/SwiprLibraryPackEditorPhoto.tsx`
- `web/app/_components/swipr/SwiprLibraryPackDeleteAction.tsx`
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
  count before downloading or saving images.
- `convexRecordSave` inside `swiprBackgrounds.save` for each imported photo.
- The existing R2 delete route and `convexRecordDelete` when a pack is deleted.
- `convexMetadataUpdate` when a pack is renamed or a photo is removed from a
  pack.

Draft generation creates provider-writing and Convex write cost. The draft
route consumes `cliprHookScript` and `cliprProviderSpendGlobal` with `count`
equal to the fixed Swipr batch count of 10 before calling the writing provider.
Each saved draft then uses the existing `swipes.save` write limits.

## Maintenance Notes

Imported Pexels packs are global for authenticated users. Only Pexels records
with a `libraryQuery` are globally readable. Uploaded, avatar-photo, AI, and
provider-generated one-off Swipr backgrounds remain private.

Pack deletion deletes owner-owned R2 images through the rate-limited R2 delete
route, then deletes the matching owner-owned Convex records. Removing one photo
from a pack clears `libraryQuery`; it does not delete the photo record, so any
saved Swipe that already references that photo can still reopen.
