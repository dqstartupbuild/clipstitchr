# App-Ad Dead-Space Finder

## What It Does

`/tools/app-ad-dead-space-finder` reviews one local short-form video and lists
timestamped spans where decoded audio and sampled visual change both stay below
visitor-adjustable thresholds. The output says “review,” never “delete.”

## Media Bunny Implementation

The reader creates one `Input` with the existing `createMediaInput` helper. A
`CanvasSink` renders 64-pixel-wide frames at bounded half-second timestamps with
a canvas pool of one. Luminance difference is calculated from copied pixel
arrays because the pooled canvas is reused. When a primary audio track is
decodable, `AudioSampleSink.samplesAtTimestamps` supplies matching samples for
root-mean-square amplitude. Every `AudioSample` is closed in `finally`.

The input is disposed after success, failure, replacement, abort, or unmount.
Analysis is capped at 180 seconds, 200 MB, and 360 sample points. Replacing a
file aborts stale work.

## Result Rules

Consecutive samples become a review span only when visual change and decoded
audio remain under the selected thresholds for the minimum span duration. A
silent file uses visual change alone. The first visual sample is never treated
as still because it has no previous frame.

## Privacy and Paid Boundary

The file, pixels, audio samples, and timestamps stay in the browser and are not
included in analytics or lead capture. The tool does not understand speech or
story, trim video, create a timeline, modify a file, or export media. Those
production actions remain outside the free resource.

## Source References

- `project-scope.md`, Video Processing Engine and Media Bunny API Map.
- `docs/media-bunny/media-bunny-llms.md`, CanvasSink sparse sampling and
  AudioSampleSink RMS example.
- `docs/media-bunny/media-bunny-api.md`, exact sink and sample signatures.

## File Tree

```text
web/app/(content)/tools/app-ad-dead-space-finder/page.tsx
web/app/_components/tools/dead-space-finder/
web/lib/clipstitchr/tools/deadSpaceFinder/
```

The quality register remains Yellow until representative MP4, MOV, and WebM
browser fixtures are recorded.

The full candid record remains in
`docs/features/public-tool-quality-register.md`.
