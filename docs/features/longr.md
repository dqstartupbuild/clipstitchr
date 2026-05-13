# Longr Feature Guide

Longr is a standalone long-form builder for ClipStitchr.

It is intentionally separate from Stitchr: Stitchr makes many short-form ads
from many UGC clips and one demo, while Longr makes one curated long-form video
from multiple saved clips.

## Product Goal

Longr helps users turn saved UGC and demo videos into one continuous vertical
video without opening a full timeline editor.

The tool is for lightweight sequencing, not frame-level editing. Users choose
clips, arrange the order, build once, and save one output.

## Workflow

1. Open `/dashboard/longr`.
2. Select UGC clips and/or Demo videos from the saved Content Library.
3. Selection order becomes the initial play order.
4. Review the ordered sequence in the preview and compact horizontal timeline
   strip.
5. Add reusable music from the shared music library when needed.
6. Duplicate, trim, move, extend, remove, and adjust music clips on the audio
   timeline.
7. Drag cards in the timeline strip to reorder the video sequence.
8. Watch the running duration meter.
9. Build one combined 9:16 MP4.
10. Save the output to R2 and Convex.
11. Reuse or download the saved output from the Content Library Longs tab.

## Behavior

- Longr accepts saved UGC-compatible clips and saved Demo videos.
- Each source clip uses its current non-destructive default trim range.
- The app prevents builds above 5 minutes total duration.
- The timeline strip is a compact ordering control, not a full video-editor
  timeline.
- Music behaves as editable audio media on Longr's timeline. The same shared
  track can be added multiple times, trimmed to different ranges, repositioned,
  duplicated, or mixed at different volumes.
- Build output is one continuous 9:16 MP4 in timeline order.
- Source clips are unchanged.

## Storage

Each Longr output stores:

- one R2 video object under the `longr-video` object kind
- an optional poster image under the `longr-poster` object kind
- Convex metadata in `longrVideos`
- ordered clip segment metadata with source clip IDs, names, clip types, trim
  ranges, segment durations, and order
- optional music clip metadata with shared track IDs, track titles, trim ranges,
  timeline start times, and volume

Saved Longr outputs are called Longs in the Content Library. They appear under
the Longs tab and in the All tab.

## Media Bunny Implementation

Longr uses a fresh Media Bunny `Output` with a `VideoSampleSource` and optional
`AudioBufferSource`.

For each selected source clip:

1. Open the normalized source blob as a Media Bunny input.
2. Clamp the default trim range against source duration.
3. Copy video samples into the output at the current timeline offset.
4. Advance the timeline offset by the clamped segment duration.
5. Mix source audio and selected shared music clips into one Web Audio
   `AudioBuffer`.
6. Add the mixed buffer to the output audio source.

Longr does not use Media Bunny `Conversion`, because this is a multi-input
sequencing workflow rather than one input transformed into one output.

## Limits

- Client cap: 5 minutes combined selected duration.
- Source selection has no fixed UGC-to-Demo pairing.
- R2 uploads are gated by the shared signed-upload and byte limits.
- Convex saves are gated by the shared record-save limit.
- Longr export rendering is browser-local and has no provider cost.
- Generating a new music track from the picker is provider work and uses the
  shared music generation limits before the Replicate call.

## Non-Goals

Longr is not:

- Stitchr mode toggle
- a batch short-form ad generator
- a multi-track editor
- a general-purpose audio workstation
- a text overlay editor
- an AI generation workflow
- a social scheduler
