# Private Sound Assist

## Summary

Private Sound Assist lets users add a relevant sound to Clipr, Stitchr, saved
Stitches, and Stitchr Batch without keeping a shared music library. Users can
upload an audio file, search TikTok-style sounds by keyword, or paste a TikTok
link. Imported and uploaded sounds are saved as owner-scoped tracks and are not
listed for other users.

The UI keeps the flow small: open the sound picker, search or paste, save a
sound, and select it. The one-time rights confirmation is stored in Convex and
is only shown before a user first uploads or imports a sound.

## User Flow

1. The user opens the sound picker from Clipr, Stitchr, a saved Stitch, or Batch.
2. If needed, they accept the one-time sound-use confirmation.
3. They search saved sounds, find a TikTok sound by keyword, paste a TikTok
   link, or upload an audio file.
4. TikTok lookup calls Apify's `clockworks/tiktok-scraper`, extracts sound
   metadata from matching videos, and returns short candidate rows.
5. Saving a TikTok sound downloads the audio or video URL returned by the
   scraper, stores the file in the user's R2 area, and writes an owner-scoped
   `sharedMusicTracks` record with `source: "tiktok"`.
6. The selected sound is stored as editable music metadata on the Clip or Stitch
   and mixed during browser export or worker finalization.

## Implementation

- `web/app/_components/music/MusicSelectorButton.tsx` coordinates saved sound
  search, upload, TikTok lookup, TikTok import, and one-time confirmation.
- `web/app/_components/music/MusicSelectorDialog.tsx` renders the sound picker.
- `web/app/_components/music/TikTokSoundCandidateListItem.tsx` renders a TikTok
  candidate.
- `web/app/api/music/upload/route.ts` saves owner-scoped uploaded sounds.
- `web/app/api/music/tiktok/search/route.ts` searches TikTok sound candidates.
- `web/app/api/music/tiktok/import/route.ts` imports one selected TikTok sound.
- `web/convex/soundPreferences.ts` stores the one-time confirmation.
- `web/convex/sharedMusicTracks.ts` stores owner-scoped sound records.
- `web/convex/stitchrBatch.ts` snapshots a selected sound into Batch tasks.
- `web/services/provider-worker/runProviderWorker.ts` forwards Batch sound
  metadata into media finalization.
- `web/services/media-worker/runMediaWorker.mjs` saves Batch drafts with the
  selected sound metadata.

## Rate Limits And Cost

TikTok search and import are protected before Apify calls run. Imports also
consume the normal R2 upload byte limit before writing audio to storage.
Uploaded audio uses the same R2 upload protection. Convex sound records use the
shared Convex record-save bucket.

`APIFY_TOKEN` is required in the Next.js runtime environment for TikTok sound
search and import. It must stay server-side.

## File Tree

```text
web/app/_components/music/
  MusicSelectorButton.tsx
  MusicSelectorDialog.tsx
  TikTokSoundCandidateListItem.tsx
web/app/api/music/
  upload/route.ts
  tiktok/search/route.ts
  tiktok/import/route.ts
web/convex/
  soundPreferences.ts
  sharedMusicTracks.ts
  createSoundTrackSnapshot.ts
web/lib/clipstitchr/server/apify/
web/lib/clipstitchr/server/tiktok/
```
