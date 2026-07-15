# Browser-Local Video Inspection

## What It Does

The browser-local video inspector reads technical facts from a visitor's video
without uploading the file. It supports public diagnostic tools that need more
detail than the normal ClipStitchr upload path while keeping paid upload and
normalization performance unchanged.

The inspector reports:

- Display dimensions, aspect ratio, duration, rotation, and MIME type.
- Current-browser video and audio decode support.
- Primary video and audio codecs and codec parameter strings.
- An estimated frame rate and video/audio bitrate from the first 120 packets.
- HDR and pixel-aspect-ratio metadata when available.
- Audio channels and sample rate when audio exists.
- Video and audio track counts, filename, and file size.

Optional metadata failures return `null` for that fact. They do not discard a
valid base report.

## How It Works

`readLocalVideoInspection` creates a Media Bunny `Input` through the existing
`createMediaInput` helper. `getLocalVideoInspection` reuses `getClipMetadata`
for the normal readable-video checks, then asks the primary tracks for the
additional facts needed by public checkers.

The detailed work is deliberately opt-in. `getClipMetadata` is not expanded,
because ClipStitchr's paid normalization flow calls it more than once and does
not need packet-stat estimates.

An `AbortSignal` lets the owner dispose in-flight Media Bunny work when a file
is replaced. The input is also disposed after success and failure. Local
previews use the existing `useObjectUrl` hook, which revokes the temporary URL
when the file changes or the component unmounts.

## Privacy and Backend Surface

- Video bytes never go to an API, Convex, R2, analytics, or an external
  provider.
- The inspector does not persist files or metadata.
- Analytics for the public tools must never include filenames or inspected
  media facts.
- The inspector creates no backend operation and therefore no new rate-limit
  surface.
- Mailing-list submission is a separate, explicit action protected by the
  existing public-tool lead limits.

## Shared Files

```text
web/lib/clipstitchr/tools/localVideoInspection/
  LocalVideoInspection.ts
  VideoCheck.ts
  VideoCheckScore.ts
  VideoCheckStatus.ts
  createLocalVideoInputDisposer.ts
  formatBitrate.ts
  getLocalVideoInspection.ts
  readLocalVideoInspection.ts
  scoreVideoChecks.ts
  useLocalVideoInspection.ts

web/app/_components/tools/video/
  LocalVideoDropzone.tsx
  LocalVideoPreview.tsx
  VideoCheckRow.tsx
  VideoInspectionFacts.tsx
  VideoReadinessScoreCard.tsx
```

## Verification

Focused tests cover readable video, silent video, optional metadata failure,
missing video tracks, disposal after success and failure, abort disposal,
stale-selection protection, and weighted check scoring.

## Source References

- `project-scope.md`, section 7, defines ClipStitchr's Media Bunny policy and
  1080x1920 production target.
- `docs/references/media-bunny/guides.md`, "Reading media files," documents
  `BlobSource`, lazy local reads, track metadata, and bounded packet-stat
  estimates.
- `docs/references/media-bunny/api.md` is the local source of truth for
  `Input`, `InputVideoTrack`, `InputAudioTrack`, `PacketStats`, and `Rational`.
- `web/lib/clipstitchr/media/createMediaInput.ts` and
  `web/lib/clipstitchr/media/getClipMetadata.ts` provide the reused base path.
