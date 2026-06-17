# Swipr Pexels Pack Library

Swipr Pexels packs let a user import a group of Pexels photos from one search
query, save those photos into their own R2-backed library, and use those saved
packs later for editable Swipe drafts.

This mirrors the useful part of SlideSmith's image-pack workflow: a search
query becomes a reusable pack of images. ClipStitchr keeps the provider
different by using Pexels instead of Pinterest and stores the images as
owner-owned Swipr background records in Convex plus Cloudflare R2.

## User Workflow

1. The user opens `/dashboard/swipr`.
2. Swipr opens in Batch mode by default.
3. The user searches Pexels from the Pexels panel.
4. The user can load more Pexels results for the same query when the current
   page returns a full result set.
5. The user can import the loaded new results as a saved pack. Already-saved
   Pexels photos are hidden from the visible result list, so repeat searches
   make it easier to find fresh photos.
6. In Manual mode, the user can add one visible result directly to the selected
   slide.
7. Imported photos are saved with `source: "pexels"` and `libraryQuery` set to
   the normalized search query. If a matching pack already exists, the import
   reuses that pack name instead of creating a duplicate casing/spacing variant.
8. The Pexels panel shows saved query packs with cover images and lets the user
   choose all packs or selected packs.
9. Saved pack photos can be added to the selected slide in Manual mode.
10. The user can edit a saved pack by renaming it, removing a photo from that
   pack, or deleting the pack and its saved photos.
11. The user can generate multiple editable draft Swipes at once from Batch
   mode. Draft generation uses the selected query packs, creates text for each
   slideshow, assigns saved Pexels backgrounds to the slides, and saves each
   result as a normal editable 8-slide Swipe.

## Data Model

`swiprBackgrounds` now stores an optional `libraryQuery` string. This field is
only used for owner-owned Pexels pack images.

The saved background record includes:

- Owner ID from Convex auth.
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
- Reuses an existing pack name when the normalized search query already exists.
- Skips photos already imported by the owner.
- Downloads each new photo server-side.
- Uploads each photo to owner-scoped R2 storage.
- Saves each photo through `swiprBackgrounds.save` with `libraryQuery`.
- Returns the imported background IDs, query, imported count, and searched
  count.

`swiprBackgrounds.renameLibraryPack`

- Requires an authenticated user.
- Finds owner-owned Pexels backgrounds whose normalized `libraryQuery` matches
  the source pack name.
- Consumes `convexMetadataUpdate` for the matching record count.
- Patches each matching record to the new normalized pack name.

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

`POST /api/swipr/drafts/generate`

- Requires an authenticated user.
- Reads a product ID, draft count, and optional selected library queries.
- Always creates 8-slide drafts on the server. The route ignores client slide
  counts so old clients cannot create shorter batch Swipes.
- Consumes the counted Clipr hook/script writing limit before provider work.
- Loads the selected product and owner-owned Swipr backgrounds.
- Uses Pexels backgrounds with `libraryQuery`; an empty selected-query list
  means all saved Pexels packs.
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
- `web/app/_components/swipr/SwiprPexelsPanel.tsx`
- `web/app/_components/swipr/SwiprModeToggle.tsx`
- `web/app/_components/swipr/SwiprBatchControls.tsx`
- `web/app/_components/swipr/SwiprManualControls.tsx`
- `web/app/_components/swipr/SwiprLibraryPackPicker.tsx`
- `web/app/_components/swipr/SwiprLibraryPackButton.tsx`
- `web/app/_components/swipr/SwiprLibraryPackEditor.tsx`
- `web/app/_components/swipr/SwiprLibraryPackRenameForm.tsx`
- `web/app/_components/swipr/SwiprLibraryPackPhotoList.tsx`
- `web/app/_components/swipr/SwiprLibraryPackEditorPhoto.tsx`
- `web/app/_components/swipr/SwiprLibraryPackDeleteAction.tsx`
- `web/app/_components/swipr/SwiprLibraryPhotoCard.tsx`
- `web/app/_components/swipr/SwiprDraftGenerationCountControl.tsx`
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
equal to the requested draft count before calling the writing provider. Each
saved draft then uses the existing `swipes.save` write limits.

## Maintenance Notes

Imported packs are owner-owned. There is no shared Swipr image library and no
cross-user browsing of imported photos.

Pack deletion deletes owner-owned R2 images through the rate-limited R2 delete
route, then deletes the matching owner-owned Convex records. Removing one photo
from a pack clears `libraryQuery`; it does not delete the photo record, so any
saved Swipe that already references that photo can still reopen.
