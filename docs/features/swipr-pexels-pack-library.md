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
5. The user can import the currently viewed query page as a saved pack. The
   import count defaults to 24 and is clamped by the backend to 40 images.
6. In Manual mode, the user can add one visible result directly to the selected
   slide.
7. Imported photos are saved with `source: "pexels"` and `libraryQuery` set to
   the search query.
8. The Pexels panel shows saved query packs with cover images and lets the user
   choose all packs or selected packs.
9. Saved pack photos can be added to the selected slide in Manual mode.
10. The user can generate multiple editable draft Swipes at once from Batch
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
- Pexels URL, photographer credit, and optional alt text in hidden details.
- Dimensions, MIME type, size, tags, and created timestamp.

Saved Swipes remain fully editable. Draft generation stores the same slide
records as manual Swipr saves, so users can reopen a generated draft and change
each slide's photo and text.

## Backend Routes

`POST /api/swipr/pexels/import`

- Requires an authenticated user.
- Reads a query, result page, and import count.
- Consumes Pexels search limits and Pexels import-image limits before calling
  Pexels.
- Searches Pexels with portrait orientation.
- Downloads each returned photo server-side.
- Uploads each photo to owner-scoped R2 storage.
- Saves each photo through `swiprBackgrounds.save` with `libraryQuery`.
- Returns the imported background IDs, query, imported count, and searched
  count.

`POST /api/swipr/drafts/generate`

- Requires an authenticated user.
- Reads a product ID, draft count, slide count, and optional selected library
  queries.
- Consumes the counted Clipr hook/script writing limit before provider work.
- Loads the selected product and owner-owned Swipr backgrounds.
- Uses Pexels backgrounds with `libraryQuery`; an empty selected-query list
  means all saved Pexels packs.
- Generates multiple slideshow text drafts through the existing text-writing
  provider.
- Saves each draft through `swipes.save`.

The Swipr Batch tab sends a slide count of 8, so user-triggered batch drafts
match the automatic Swipr draft shape.

## Relevant Code

- `web/app/api/swipr/pexels/import/route.ts`
- `web/app/api/swipr/drafts/generate/route.ts`
- `web/app/_components/swipr/SwiprPexelsPanel.tsx`
- `web/app/_components/swipr/SwiprModeToggle.tsx`
- `web/app/_components/swipr/SwiprBatchControls.tsx`
- `web/app/_components/swipr/SwiprManualControls.tsx`
- `web/app/_components/swipr/SwiprLibraryPackPicker.tsx`
- `web/app/_components/swipr/SwiprLibraryPackButton.tsx`
- `web/app/_components/swipr/SwiprLibraryPhotoCard.tsx`
- `web/app/_components/swipr/SwiprDraftGenerationCountControl.tsx`
- `web/app/dashboard/swipr/SwiprPageClient.tsx`
- `web/lib/clipstitchr/utils/getSwiprLibraryPacks.ts`
- `web/lib/clipstitchr/server/createSwiprBatchTextGeneration.ts`
- `web/lib/clipstitchr/server/createSwiprBatchTextGenerationPrompt.ts`

## Abuse Protection

Pexels pack import creates external API, bandwidth, R2, and Convex write cost.
The import route consumes:

- `pexelsSearch` and `pexelsSearchGlobal` before calling Pexels.
- `pexelsImportImages` and `pexelsImportImagesGlobal` by requested import
  count before downloading or saving images.
- `convexRecordSave` inside `swiprBackgrounds.save` for each imported photo.

Draft generation creates provider-writing and Convex write cost. The draft
route consumes `cliprHookScript` and `cliprProviderSpendGlobal` with `count`
equal to the requested draft count before calling the writing provider. Each
saved draft then uses the existing `swipes.save` write limits.

## Maintenance Notes

Imported packs are owner-owned. There is no shared Swipr image library and no
cross-user browsing of imported photos.

Deleting old R2 images remains an operator/manual cleanup task unless a future
user-facing pack delete action is added. If pack deletion is added, it must
delete owner-owned Convex records and R2 objects behind rate-limited, authorized
server operations.
