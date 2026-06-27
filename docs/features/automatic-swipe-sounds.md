# Automatic Swipe Sounds

Saved Swipes default to automatic sound when they are scheduled through Post
Bridge. The user can still choose a specific saved sound or select no sound.

## Behavior

1. The schedule dialog builds a short search phrase from the Swipe title,
   product context, and caption.
2. It checks the user's saved sounds first and picks the best matching track,
   with TikTok-sourced sounds preferred when scores are close.
3. If no saved sound is available and the one-time sound confirmation is
   accepted, scheduling searches TikTok and imports the best usable candidate.
4. The selected or imported sound is downloaded in the browser and mixed into
   the 9:16 Swipe MP4 before `POST /api/post-bridge/schedule` uploads it.
5. If automatic sound cannot run yet, the dialog asks the user to continue once
   for sound use. They can switch to `No sound` at any time.

## Source Files

- `web/app/_components/postBridge/PostBridgeScheduleDialog.tsx`
- `web/app/_components/postBridge/PostBridgeAutomaticSoundStatus.tsx`
- `web/app/_components/postBridge/PostBridgeSoundModePicker.tsx`
- `web/lib/clipstitchr/hooks/useAutomaticPostBridgeSound.ts`
- `web/lib/clipstitchr/utils/createAutomaticSoundSearchQuery.ts`
- `web/lib/clipstitchr/utils/selectAutomaticSharedMusicTrack.ts`
- `web/lib/clipstitchr/utils/selectAutomaticTikTokSoundCandidate.ts`
- `web/lib/clipstitchr/media/renderSwiprSwipeVideoBlob.ts`

## Rate Limits

Automatic TikTok search/import uses the existing authenticated sound endpoints:

- `POST /api/music/tiktok/search`
- `POST /api/music/tiktok/import`

Those routes consume TikTok sound lookup/import limits before Apify calls and R2
storage writes happen. Post Bridge scheduling still consumes its own scheduling
and media upload-byte limits after the browser-rendered MP4 is ready.
