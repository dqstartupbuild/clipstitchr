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
3. Single normalized 9:16 output saved as the finished Stitch video.

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
   product filter when the library contains demos for multiple products. When
   upload analysis has scored a clip, show that score in the picker so the user
   can spot clips worth using before building the batch.
6. Copy clip default trims and active source Quick Edit metadata into the
   Stitchr session.
7. Tap or swipe through each exact UGC-then-demo preview.
8. Optionally configure one text overlay and one caption/hashtag field per
   output or copy one overlay across the batch.
9. Optionally generate an overlay hook, a caption hook, and 3-5 hashtags from
   the hidden Clipr hook-template engine using saved product context and the
   selected UGC/demo clip descriptions. Stitchr auto-text can draw from
   product/ad hook-library templates, but source names and template IDs stay
   hidden. When selected clips have Quick Edit overlay text suggestions from
   score analysis, auto-text treats those suggestions as soft hook direction,
   not required copy. The generated overlay and caption field stay editable. The
   backend writing call uses `TEXT_WRITING_MODEL_ID`, which defaults to
   `anthropic/claude-sonnet-4.6`; `anthropic/claude-opus-4.6` is supported for
   higher-cost writing tests.
10. Optionally attach selected shared music to each stitch.
11. Create one stitched output per selected UGC clip.
12. Render and save each finished Stitch video.
13. Download the finished ad variants whenever needed.
14. Mark saved stitches as posted after they go live so the Stitches library can
    separate reusable drafts from already-published assets.
15. Score a saved stitch when the user wants a quick retention estimate,
    hook-to-demo flow read, drop-off risks, trim ideas, overlay ideas, and a
    stronger opening line before posting.

Saved stitch music is stored separately from the stitch so it can still be
edited later. The saved finished video includes the current music choice when
music is enabled. If the user changes text, music, source clips, trims, playback
speed, or applies/resets Quick Edit, ClipStitchr clears the old render and saves
a fresh one the next time the user previews, downloads, or scores the Stitch.

Saved Stitch renders are documented separately in
`docs/features/saved-stitch-renders.md`.

Saved stitches are reusable templates. The saved stitch card can launch Stitchr
with the original source clips, trims, source-audio flags, playback rates, and
text overlays and caption field already selected, letting users create a new
stitch by changing only the parts that should differ. In normal Stitchr mode,
reused text and reused caption copy become session templates for selected UGC
clips that do not have their own edits yet. The user can deselect the original
UGC, move through picker pages, select different UGC clips, and keep the same
reused text and caption on the new outputs. If a specific UGC gets its own text
edit, caption edit, empty text list, or empty caption field, that UGC-specific
choice wins over the reused template content. Reuse does not overwrite the
existing stitch. Posted status is also non-destructive metadata: marking or
unmarking a stitch as posted only changes library organization and does not
change source clips, stored stitch settings, music, posters, captions, or
downloadable output.

Dedicated Stitchr templates are saved setup records created from finished stitch
cards with **Save as Template**. They can be selected from the Template picker on
the Stitchr page, where **None** is the default, or managed from the Templates
sidebar page. See `docs/features/stitchr-templates.md` for the data model,
routes, CRUD behavior, rate limits, and maintenance notes.

Stitchr social captions are documented separately in
`docs/features/stitchr-social-captions.md`.

Saved Stitch scoring is documented separately in `docs/features/stitch-score.md`.
Quick Edit is documented separately in `docs/features/quick-edit.md`. Applying
Quick Edit to a source UGC or Demo clip affects future Stitchr selections only.
Existing saved Stitches keep their own copied trim and Quick Edit metadata so
the user can control each Stitch individually. Automated Stitchr drafts follow
the same rule: they treat score overlay suggestions as soft text-generation
hints and copy active source Quick Edit metadata into the saved automated
Stitch.

## Product Principles

- Prioritize speed over full editor flexibility.
- Use clear clip categories: UGC, Demo, Swaps, and Stitches.
- Keep product demos linked to saved products so demo selection stays focused
  as the library grows.
- Preserve source clips; trims are editable metadata.
- Preserve saved Stitch control; later source clip defaults must not rewrite
  existing Stitches.
- Make outputs easy to recognize later with names, posters, and metadata.
- Keep batch creation predictable: one selected demo, up to 20 selected UGC
  clips, and one editable overlay per output.
- Keep AI-generated Clipr UGC and Swaps as UGC-compatible clips that can flow
  into Stitchr.
- Keep generated overlay text and caption copy editable while hiding hook
  style/template mechanics.
- Keep selected or uploaded shared music editable and separate from the saved stitch.
- Keep saved stitches usable as templates even after they are marked posted.
- Use clip scores as guidance for selection, not as a hard gate that blocks the
  user's creative judgment.
- Use Stitch scores as quick editing guidance for finished stitches, not as a
  promise of real post performance.

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
