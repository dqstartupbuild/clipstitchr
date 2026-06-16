# Shared Music Upload

## Summary

Shared music upload replaces AI music generation. Users can still add music to
Clipr clips and Stitchr outputs, but the only ways to do that are selecting an
existing shared track or uploading an audio file through the music picker.

Uploaded tracks are saved to the shared music pool. Other users can search for
and use those tracks, so the product copy, Privacy Policy, and Terms of Use all
state that users must only upload music they have the rights to share and use.

## User Flow

1. The user opens a music picker from Clipr, Stitchr, or a saved media editor.
2. They search existing shared tracks or choose an audio file.
3. The browser reads the audio duration for better metadata.
4. `POST /api/music/upload` validates the file, consumes R2 upload limits, saves
   the object under `shared/music/...`, and writes a `sharedMusicTracks` record.
5. The picker selects the uploaded track and attaches normal editable music
   metadata to the Clip or Stitch.

## Implementation

- `web/app/_components/music/MusicSelectorDialog.tsx` owns the search and upload
  controls.
- `web/app/_components/music/MusicSelectorButton.tsx` loads shared tracks,
  measures the selected audio file, uploads it, and returns the selected track.
- `web/app/api/music/upload/route.ts` authenticates the user, validates the
  audio file, consumes upload protection, saves the shared R2 object, and records
  the shared track.
- `web/lib/clipstitchr/server/music/*` contains the focused request validators.
- Removed generation routes return `410 Gone`: `/api/music/generate`,
  `/api/clipr/music`, and `/api/stitches/music`.

## Supported Files

Music uploads accept AAC, FLAC, M4A, MP4 audio, MP3, OGG, WAV, and WebM audio up
to 30 MB.

## Privacy And Rights

Uploaded music is shared across the app. Users must not upload private,
unlicensed, copyrighted, or otherwise restricted music unless they have the
rights and permissions needed to share it and use it in finished videos.
