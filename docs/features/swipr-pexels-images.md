# Swipr Pexels Images

Swipr Pexels images let users search Pexels from the carousel editor and add a
photo to the selected slide. This gives Swipr another image path beyond AI
generation, uploads, saved backgrounds, and avatar photos.

## How It Works

1. The user types a photo search in the Pexels panel on `/dashboard/swipr`.
2. The client calls `POST /api/swipr/pexels/search`.
3. The route authenticates the user, consumes Pexels rate limits, reads
   `PEXELS_API_KEY`, and calls Pexels with `orientation=portrait`.
4. The client shows returned photos with Pexels attribution and photographer
   credit.
5. When the user taps Add, the client downloads the selected image, saves it
   through the Swipr background save flow, and assigns it to the selected slide.

Pexels imports use the normal Swipr background analysis, R2 upload, and
`swiprBackgrounds.save` path. Imported Pexels photos are shared Swipr
backgrounds, so other users can reuse them from the background library.

## Relevant Code

- `web/app/api/swipr/pexels/search/route.ts` searches Pexels server-side.
- `web/lib/clipstitchr/client/searchPexelsPhotos.ts` calls the search route.
- `web/lib/clipstitchr/client/loadPexelsPhotoBlob.ts` downloads the selected
  image for saving.
- `web/app/_components/swipr/SwiprPexelsPanel.tsx` renders the search controls.
- `web/app/_components/swipr/PexelsPhotoCard.tsx` renders each result and
  photographer credit.
- `web/app/dashboard/swipr/SwiprPageClient.tsx` saves the selected photo as a
  Swipr background and assigns it to the active slide.

## Configuration

`PEXELS_API_KEY` must be set in the Next.js runtime environment. Keep it
server-side only. Do not expose it with a `NEXT_PUBLIC_` prefix.

## Abuse Protection

`consumePexelsSearch` enforces:

- 120 searches/hour/user with burst 30.
- 800 searches/hour globally with burst 200 across 4 shards.

The route consumes those limits before calling Pexels. Pexels photo saving then
uses the existing Swipr background analysis, R2 upload, and Convex record-save
limits.

## Attribution

The UI shows “Photos provided by Pexels” and shows the photographer name on
each result. Photographer names link to the photographer URL when Pexels
returns one. Hidden background details keep the Pexels photo URL and
photographer for future maintenance.
