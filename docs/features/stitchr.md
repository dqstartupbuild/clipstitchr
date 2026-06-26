# Stitchr Feature Guide

Stitchr is the primary ClipStitchr workflow.

Its job is to turn UGC clips and product demo videos into finished short-form
ads without making the user become a content person for the day.

## Problem

Users often have enough raw material to make ads, but not enough energy or time
to assemble it again:

- UGC clips are scattered across downloads, drives, and project folders.
- Product demos exist, but are not paired with hooks or reactions.
- Raw clips need trimming before they are usable.
- Traditional editors require importing, sequencing, exporting, naming, and
  tracking files.
- Writing overlay text that does not sound fake becomes its own blocker.
- The user may collect more footage instead of using what they already have.

Stitchr should make the work feel like choosing what to review, not editing
from scratch.

## Core Promise

Upload clips once, pick the product demo, and create finished vertical ads from
saved footage. Batch mode remains the in-app label for queued drafts. Normal
mode still lets the user select up to 20 UGC clips and one product demo when
they want hands-on control.

## Intended Sequence

Every Stitchr output follows the same basic ad structure:

1. UGC clip first.
2. Product demo second.
3. Single normalized 9:16 output saved as the finished Stitch video.

When multiple UGC clips are selected, Stitchr creates one output per selected
UGC clip while reusing the same selected product demo. Each output can keep its
own overlay settings, and the active overlay can be copied to every selected
output.

This sequence supports the practical pattern ClipStitchr is built around: earn
attention first, show the product immediately after.

## Workflow

1. Upload UGC and demo videos. Uploaded UGC is account-wide, and product demos
   must be linked to a saved product.
2. Normalize every video to 9:16 before it enters the library.
3. Save generated posters so clips are recognizable at a glance.
4. Store non-destructive default trims on each clip.
5. Stitchr opens on the Batch tab by default. Batch mode queues the signed-in
   user's daily Stitchr batch from the Stitchr page at any time, creating up to
   10 editable Stitch drafts through the provider and media workers.
6. Batch mode uses its own Stitchr Batch pair history when choosing UGC/Demo
   pairs. It prefers unused or older pairs, tracks when each pair was last used,
   and spreads a batch across different UGC and Demo clips before reusing
   pieces.
7. Switch to Normal mode to select up to 20 UGC clips and one demo clip inside
   Stitchr. UGC stays account-wide, while demo selection uses the product
   filter when the library contains demos for multiple products. When
   upload analysis has scored a clip, show that score in the picker so the user
   can spot clips worth using before building the batch.
8. Copy clip default trims and active source Quick Edit metadata into the
   Stitchr session.
9. Tap or swipe through each exact UGC-then-demo preview.
10. Optionally configure one text overlay and one caption/hashtag field per
   output or copy one overlay across the batch.
11. Optionally generate ranked overlay hook options, a caption hook, and 3-5
   hashtags from saved product context, Hook Lab examples, and the selected
   UGC/demo clip descriptions. Stitchr auto-text can draw from product/ad
   hook-library templates, but source names and template IDs stay hidden. Hook
   Lab handles generated text; if selected clips have already-applied Quick
   Edit overlay metadata from older records, auto-text can treat that metadata
   as soft direction. The top hook is applied automatically, alternate hooks
   stay selectable, and the generated overlay and caption field stay editable. The backend
   writing call uses `TEXT_WRITING_MODEL_ID`, which defaults to
   `anthropic/claude-sonnet-4.6`; `anthropic/claude-opus-4.6` is supported for
   higher-cost writing tests.
12. Optionally attach a selected, uploaded, or TikTok-imported sound to each stitch.
13. Create one stitched output per selected UGC clip.
14. Render and save each finished Stitch video.
15. Download the finished ads whenever needed.
16. Mark saved stitches as posted after they go live so the Stitches library can
    separate reusable drafts from already-published assets.
17. Score a saved stitch when the user wants a quick retention estimate,
    hook-to-demo flow read, drop-off risks, trim/cut ideas, and a posting
    readiness recheck before posting.

Saved stitch music is stored separately from the stitch so it can still be
edited later. The saved finished video includes the current music choice when
music is enabled. If the user changes text, music, source clips, trims, playback
speed, or applies/resets Quick Edit, ClipStitchr clears the old render and saves
a fresh one the next time the user previews, downloads, or scores the Stitch.

Saved Stitch renders are documented separately in
`docs/features/saved-stitch-renders.md`.

Stitchr Batch is documented separately in
`docs/features/stitchr-batch.md`.

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
sidebar page. In Batch mode, a selected template supplies the text overlay style
and caption copy for every queued draft while Batch still picks fresh UGC/Demo
pairs. See `docs/features/stitchr-templates.md` for the data model, routes,
CRUD behavior, rate limits, and maintenance notes.

Stitchr social captions are documented separately in
`docs/features/stitchr-social-captions.md`.

Stitchr Hook Lab is documented separately in
`docs/features/stitchr-hook-lab.md`.

Saved Stitch scoring is documented separately in `docs/features/stitch-score.md`.
Quick Edit is documented separately in `docs/features/quick-edit.md`. Applying
Quick Edit to a source UGC or Demo clip affects future Stitchr selections only.
Existing saved Stitches keep their own copied trim and Quick Edit metadata so
the user can control each Stitch individually. Automated Stitchr drafts follow
the same rule: they ignore raw score overlay suggestions, let Hook Lab handle
generated text, and copy active source Quick Edit metadata into the saved
automated Stitch.

## Product Principles

- Prioritize speed over full editor flexibility.
- Use clear clip categories: UGC, Demo, Swaps, and Stitches.
- Keep product demos linked to saved products so demo selection stays focused
  as the library grows.
- Preserve source clips; trims are editable metadata.
- Preserve saved Stitch control; later source clip defaults must not rewrite
  existing Stitches.
- Make outputs easy to recognize later with names, posters, and metadata.
- Keep Normal mode creation predictable: one selected demo, up to 20 selected
  UGC clips, and one editable overlay per output.
- Keep AI-generated Clipr UGC and Swaps as UGC-compatible clips that can flow
  into Stitchr.
- Keep generated overlay text and caption copy editable while hiding hook
  style/template mechanics.
- Keep Hook Lab examples as user-owned taste memory, not copied output.
- Keep Stitchr hook and caption generation simple and viewer-first, matching
  the Swipr prompt style while still using selected source context when it is
  helpful.
- Keep selected, uploaded, or imported sounds editable and separate from the saved stitch.
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

Stitchr is working when a user with a pile of clips can make finished ads
without opening a traditional editor, hunting through local file folders, or
losing another work session to content.
