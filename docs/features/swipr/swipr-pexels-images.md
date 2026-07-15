# Swipr Pexels Images

Swipr Pexels images let users search Pexels from the carousel editor, add a
photo to the selected slide, and import a search query as a saved owner-owned
photo pack. This gives Swipr another image path beyond AI generation, uploads,
and avatar photos.

## How It Works

1. The user types a photo search in the Pexels panel on `/dashboard/swipr`.
2. The client calls `POST /api/swipr/pexels/search`.
3. The route authenticates the user, consumes Pexels rate limits, reads
   `PEXELS_API_KEY`, and calls Pexels with `orientation=portrait`, the
   requested `page`, and the requested page size.
4. The client shows returned photos with Pexels attribution and photographer
   credit.
5. If the page returns a full result set, the user can load more results. The
   client requests the next Pexels page for the same query and appends new
   photo IDs.
6. In Manual mode, when the user taps Add, the client downloads the selected
   image, saves it through the Swipr photo save flow, and assigns it to the
   selected slide only.
7. In Batch mode, when the user taps Import loaded, the client calls
   `POST /api/swipr/pexels/import` with the visible loaded photos for the
   current query.
8. The import route skips photos the user already imported, downloads the new
   Pexels photos server-side, writes them to owner-scoped R2 storage, and saves
   `swiprBackgrounds` records with `libraryQuery` set to that query.
9. The Pexels panel groups imported photos into query packs. Users can choose
   all packs or selected packs for batch draft generation, and can use any
   saved pack photo on the selected slide.

Single selected Pexels images use the normal Swipr background analysis, R2
upload, and `swiprBackgrounds.save` path. Query-pack imports save the Pexels
image bytes directly from the server into R2, create the same owner-owned
background records, and store Pexels credit details for maintenance. Imported
Pexels photos are owner-owned Swipr photo records used by saved Swipes and
batch drafts; they are not exposed as a shared Swipr gallery.

## Relevant Code

- `web/app/api/swipr/pexels/search/route.ts` searches Pexels server-side.
- `web/app/api/swipr/pexels/import/route.ts` imports a query into R2 and
  Convex.
- `web/app/api/swipr/drafts/generate/route.ts` creates editable draft Swipes
  from saved Pexels packs.
- `web/lib/clipstitchr/server/pexels/getPexelsSearchPage.ts` clamps requested
  Pexels result pages.
- `web/lib/clipstitchr/server/readSwiprPexelsImportPhotos.ts` validates
  dashboard-loaded Pexels results before server-side import.
- `web/lib/clipstitchr/client/searchPexelsPhotos.ts` calls the search route.
- `web/lib/clipstitchr/client/importPexelsPhotosToSwiprLibrary.ts` calls the
  import route.
- `web/lib/clipstitchr/client/generateSwiprDrafts.ts` calls the batch draft
  route.
- `web/lib/clipstitchr/client/loadPexelsPhotoBlob.ts` downloads the selected
  image for saving.
- `web/app/_components/swipr/SwiprPexelsPanel.tsx` renders the search controls.
- `web/app/_components/swipr/SwiprLibraryPackPicker.tsx` renders imported
  query pack selection.
- `web/app/_components/swipr/SwiprLibraryPhotoCard.tsx` renders saved pack
  photos.
- `web/app/_components/swipr/PexelsPhotoCard.tsx` renders each result and
  photographer credit.
- `web/app/dashboard/swipr/SwiprPageClient.tsx` saves the selected photo as a
  Swipr background and assigns it to the active slide.
- `web/services/provider-worker/runProviderWorker.ts` searches Pexels for
  automated Swipr drafts and saves owner-owned Pexels photo records before
  saving the editable Swipe.

## Configuration

`PEXELS_API_KEY` must be set in the Next.js runtime environment and provider
worker environment. Keep it server-side only. Do not expose it with a
`NEXT_PUBLIC_` prefix.

Production Cloud Run provider deployments should reference the
`clipstitchr-pexels-api-key` Secret Manager secret. The secret must exist and
grant accessor permission to the provider worker service account before the
Pexels-enabled job shape can deploy.

## Abuse Protection

`consumePexelsSearch` enforces:

- 120 searches/hour/user with burst 30.
- 800 searches/hour globally with burst 200 across 4 shards.

The route consumes those limits before calling Pexels. Pexels photo saving then
uses the existing Swipr background analysis, R2 upload, and Convex record-save
limits.

Pexels pagination uses the same `consumePexelsSearch` buckets. Loading another
page is another Pexels search request, not a separate rate-limit surface.

`consumePexelsImport` enforces:

- 120 imported images/hour/user with burst 120.
- 3,000 imported images/hour globally with burst 500 across 4 shards.

The import route consumes import-image limits before downloading Pexels images
or writing to R2. Loaded-photo imports do not consume Pexels search limits
because the dashboard already consumed those limits while loading the result
pages. Legacy page/count imports still consume search limits before calling
Pexels. Each saved background also consumes the normal Convex record-save limit
inside `swiprBackgrounds.save`.

The four global shards each start with 125 burst tokens. This keeps the global
limit sharded while allowing the dashboard's largest supported 120-image
import to pass when the limiter has no existing shard state.

The dashboard hides already-imported Pexels photos by checking `pexelsPhotoId`
and, for older records, parsing the saved Pexels URL from hidden details. The
import route repeats the same dedupe server-side before it consumes import
quota or downloads images.

Batch draft generation uses the existing Clipr hook/script generation bucket
with `count` equal to the requested draft count before calling the text-writing
provider. Each generated draft is saved through `swipes.save`.

Automatic Swipr generation is worker-only and is protected by the Swipr
automation daily/global limits before the provider worker searches Pexels or
saves the draft assets.

## Attribution

The UI shows “Photos provided by Pexels” and shows the photographer name on
each result. Photographer names link to the photographer URL when Pexels
returns one. Hidden background details keep the Pexels photo URL and
photographer for future maintenance.
