# Stitchr Feature Guide

Stitchr is the primary ClipStitchr workflow.

Its job is to turn Hook/UGC clips and product demo videos into finished short-form
ads without making the user become a content person for the day.

## Problem

Users often have enough raw material to make ads, but not enough energy or time
to assemble it again:

- Hook/UGC clips are scattered across downloads, drives, and project folders.
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
mode still lets the user select up to 20 Hook/UGC clips and one product demo when
they want hands-on control.

## Intended Sequence

Every Stitchr output follows the same basic ad structure:

1. Hook/UGC clip first.
2. Product demo second.
3. Single normalized 9:16 output saved as the finished Stitch video.

When multiple Hook/UGC clips are selected, Stitchr creates one output per
selected Hook/UGC clip while reusing the same selected product demo. Each output
can keep its own overlay settings, and the active overlay can be copied to every
selected output.

This sequence supports the practical pattern ClipStitchr is built around: earn
attention first, show the product immediately after.

## Workflow

1. Upload Hook/UGC and demo videos. Both clip types must be linked to the active
   product before they enter the library.
2. Normalize every video to 9:16 before it enters the library.
3. Save generated posters so clips are recognizable at a glance.
4. Store non-destructive default trims on each clip.
5. Stitchr opens on the Batch tab by default. Batch mode queues a new run from
   the Stitchr page at any time, creating 10 editable Stitch drafts through the
   provider and media workers. A user can run it repeatedly on the same day.
6. Batch mode uses its own Stitchr Batch pair history when choosing Hook/UGC and Demo
   pairs. It prefers unused or older pairs, tracks when each pair was last used,
   and spreads a batch across different Hook/UGC and Demo clips before reusing
   pieces. When unique pairs run out, it repeats ranked pairs until the batch
   is full.
7. Switch to Normal mode to select up to 20 Hook/UGC clips and one demo clip inside
   Stitchr. Hook/UGC and demo selection both use the active product, so clips
   from another product stay out of the picker. When upload analysis has scored
   a clip, show that score in the picker so the user can spot clips worth using
   before building the batch. The picker header, filters, and create action
   stack within their own panel width, so a wide viewport with a narrow nested
   panel cannot place a filter over the create button.
8. Copy clip default trims and active source Quick Edit metadata into the
   Stitchr session.
9. Tap or swipe through each exact Hook/UGC-then-demo preview.
10. Optionally configure one text overlay and one caption/hashtag field per
    output or copy one overlay across the batch.
11. Optionally generate one overlay, a caption hook, and 3-5 hashtags from saved
    product context and the selected Hook/UGC/demo clip descriptions. If
    selected clips have already-applied Quick Edit overlay metadata, auto-text
    can treat that metadata as soft direction. The generated overlay and caption
    stay editable. The backend
    writing call uses `TEXT_WRITING_MODEL_ID`, which defaults to
    `anthropic/claude-sonnet-4.6`; `anthropic/claude-opus-4.6` is supported for
    higher-cost writing tests.
12. Optionally attach a selected, uploaded, or TikTok-imported sound to each stitch.
13. Create one stitched output per selected Hook/UGC clip.
14. Render and save each finished Stitch video.
15. Download the finished ads whenever needed.
16. Mark saved stitches as posted after they go live so the Stitches library can
    separate reusable drafts from already-published assets.
17. Score a saved stitch when the user wants a quick retention estimate,
    hook-to-demo flow read, drop-off risks, trim/cut ideas, and a posting
    readiness recheck before posting.

The hands-on Stitchr view shows a four-step workflow strip: Pick clips, Add
text, Preview, and Create. The strip is guidance, not a hard wizard, so users
can still adjust clips, text, captions, music, and preview state in the order
that fits the job.

Saved Stitch cards expose Download as the visible primary action while keeping
reuse, edit, scheduling, scoring, posted-state, template, and delete actions in
the action menu.

Saved stitch music is stored separately from the stitch so it can still be
edited later. The saved finished video includes the current music choice when
music is enabled. If the user changes text, music, source clips, trims, playback
speed, or applies/resets Quick Edit, ClipStitchr clears the old render and saves
a fresh one the next time the user previews, downloads, or scores the Stitch.

Saved Stitch renders are documented separately in
`docs/features/stitchr/saved-stitch-renders.md`.

Stitchr Batch is documented separately in
`docs/features/stitchr/stitchr-batch.md`.

Saved stitches are reusable. The saved stitch card can launch Stitchr
with the original source clips, trims, source-audio flags, playback rates, and
text overlays and caption field already selected, letting users create a new
stitch by changing only the parts that should differ. In normal Stitchr mode,
reused text and reused caption copy become session defaults for selected
Hook/UGC clips that do not have their own edits yet. The user can deselect the
original Hook/UGC clip, move through picker pages, select different Hook/UGC
clips, and keep the same reused text and caption on the new outputs. If a
specific Hook/UGC clip gets its own text edit, caption edit, empty text list, or
empty caption field, that clip-specific choice wins over the reused
content. Reuse does not overwrite the existing stitch. Posted status is also
non-destructive metadata: marking or
unmarking a stitch as posted only changes library organization and does not
change source clips, stored stitch settings, music, posters, captions, or
downloadable output.

Stitchr social captions are documented separately in
`docs/features/stitchr/stitchr-social-captions.md`.

Saved Stitch scoring is documented separately in `docs/features/editor/stitch-score.md`.
Quick Edit is documented separately in `docs/features/editor/quick-edit.md`. Applying
Quick Edit to a source Hook/UGC or Demo clip affects future Stitchr selections only.
Existing saved Stitches keep their own copied trim and Quick Edit metadata so
the user can control each Stitch individually. Automated Stitchr drafts follow
the same rule: they ignore raw score overlay suggestions, let Hook Lab handle
generated text, and copy active source Quick Edit metadata into the saved
automated Stitch.

## Product Principles

- Prioritize speed over full editor flexibility.
- Use clear clip categories: Hook/UGC, Demo, Swaps, and Stitches.
- Keep product demos linked to saved products so demo selection stays focused
  as the library grows.
- Preserve source clips; trims are editable metadata.
- Preserve saved Stitch control; later source clip defaults must not rewrite
  existing Stitches.
- Make outputs easy to recognize later with names, posters, and metadata.
- Keep Normal mode creation predictable: one selected demo, up to 20 selected
  Hook/UGC clips, and one editable overlay per output.
- Keep AI-generated Clipr Hook/UGC and Swaps as UGC-compatible clips that can flow
  into Stitchr.
- Keep generated overlay text and caption copy editable while hiding hook
  style/template mechanics.
- Keep Stitchr hook and caption generation simple and viewer-first, matching
  the Swipr prompt style while still using selected source context when it is
  helpful.
- Keep selected, uploaded, or imported sounds editable and separate from the saved stitch.
- Keep saved stitches reusable even after they are marked posted.
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
