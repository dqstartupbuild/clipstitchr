# Stitchr Feature Guide

Stitchr is the primary ClipStitchr workflow.

Its job is to turn UGC clips and product demo videos into finished
short-form ad variants with as little editing friction as possible.

## Problem

Users often have enough raw material to make ads, but not enough energy or time
to assemble it:

- UGC clips are scattered across downloads, drives, and project folders.
- Product demos exist, but are not paired with hooks or reactions.
- Raw clips need trimming before they are usable.
- Traditional editors require importing, sequencing, exporting, naming, and
  tracking files.
- The user may collect more footage instead of publishing what they already
  have.

Stitchr should make that workflow feel like selecting ingredients from a
library, not editing from scratch.

## Core Promise

Select up to 20 UGC clips and one product demo. Preview each pairing, customize
one text overlay per output when needed, and create finished vertical ad
variants.

## Intended Sequence

Every Stitchr output follows the same basic ad structure:

1. UGC clip first.
2. Product demo second.
3. Single normalized 9:16 output at export time.

When multiple UGC clips are selected, Stitchr creates one output per selected
UGC clip while reusing the same selected product demo. Each output can keep its
own overlay settings, and the active overlay can be copied to every selected
output.

This sequence supports a common direct-response creative pattern: attention or
social proof first, product proof immediately after.

## Workflow

1. Upload UGC and demo videos. Product demos must be linked to a saved product.
2. Normalize every video to 9:16 before it enters the library.
3. Save generated posters so clips are recognizable at a glance.
4. Store non-destructive default trims on each clip.
5. Select up to 20 UGC clips and one demo clip inside Stitchr, using the
   product filter when the library contains demos for multiple products.
6. Copy clip default trims into the Stitchr session.
7. Tap or swipe through each exact UGC-then-demo preview.
8. Optionally configure one text overlay per output or copy one overlay across
   the batch.
9. Optionally generate an overlay from the hidden Clipr hook-template
   engine using saved product context. Stitchr auto-text can draw from
   product/ad hook-library templates, but source names and template IDs stay
   hidden. The generated overlay stays editable. The backend writing call uses
   `TEXT_WRITING_MODEL_ID`, which defaults to
   `anthropic/claude-sonnet-4.6`; `anthropic/claude-opus-4.6` is supported for
   higher-cost writing tests.
10. Optionally generate separate 60 second music for each stitch.
11. Create one stitched output per selected UGC clip.
12. Save and download the finished ad variants.
13. Mark saved stitches as posted after they go live so the Stitches library can
    separate reusable drafts from already-published assets.

Saved stitch music is stored separately from the stitch. Users can edit text,
remove music, regenerate it, enable or disable it, or change volume later from
the saved stitch card. Media Bunny renders the UGC-then-demo video and mixes the
selected music only when the user downloads the stitch.

Saved stitches are reusable templates. The saved stitch card can launch Stitchr
with the original source clips, trims, source-audio flags, playback rates, and
text overlays already selected, letting users create a new stitch by changing
only the parts that should differ. Reuse does not overwrite the existing stitch.
Posted status is also non-destructive metadata: marking or unmarking a stitch as
posted only changes library organization and does not change source clips,
stored stitch settings, music, posters, or downloadable output.

## Product Principles

- Prioritize speed over full editor flexibility.
- Use clear clip categories: UGC, Demo, Swaps, and Stitches.
- Keep product demos linked to saved products so demo selection stays focused
  as the library grows.
- Preserve source clips; trims are editable metadata.
- Make outputs easy to recognize later with names, posters, and metadata.
- Keep batch creation predictable: one selected demo, up to 20 selected UGC
  clips, and one editable overlay per output.
- Keep AI-generated Clips and Swaps as UGC-compatible clips that can flow into
  Stitchr.
- Keep generated overlay text editable and hide hook style/template mechanics.
- Keep generated music editable and separate from the saved stitch.
- Keep saved stitches usable as templates even after they are marked posted.

## Non-Goals

Stitchr is not meant to be:

- a full timeline editor
- a complex motion graphics tool
- a social scheduler
- an AI-first generator
- a replacement for marketing strategy or creative testing judgment

## Success Criteria

Stitchr is working when a user with a pile of clips can create multiple finished
ad variants without opening a traditional editor or hunting through local file
folders.
