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

Select up to 20 UGC clips and one product demo. Preview each pairing, apply one
shared text overlay when needed, and create finished vertical ad variants.

## Intended Sequence

Every Stitchr output follows the same basic ad structure:

1. UGC clip first.
2. Product demo second.
3. Single normalized 9:16 output.

When multiple UGC clips are selected, Stitchr creates one output per selected
UGC clip while reusing the same selected product demo and overlay settings.

This sequence supports a common direct-response creative pattern: attention or
social proof first, product proof immediately after.

## Workflow

1. Upload UGC and demo videos.
2. Normalize every video to 9:16 before it enters the library.
3. Save generated posters so clips are recognizable at a glance.
4. Store non-destructive default trims on each clip.
5. Select up to 20 UGC clips and one demo clip inside Stitchr.
6. Copy clip default trims into the Stitchr session.
7. Tap or swipe through each exact UGC-then-demo preview.
8. Optionally configure one shared text overlay for every output.
9. Optionally generate the shared overlay from the hidden Clipr hook-template
   engine using saved product context. The generated overlay stays editable.
10. Create one stitched output per selected UGC clip.
11. Save and download the finished ad variants.

## Product Principles

- Prioritize speed over full editor flexibility.
- Use clear clip categories: UGC, Demo, Swaps, and Stitches.
- Preserve source clips; trims are editable metadata.
- Make outputs easy to recognize later with names, posters, and metadata.
- Keep batch creation predictable: one selected demo, up to 20 selected UGC
  clips, and one shared overlay for the batch.
- Keep AI-generated Clips and Swaps as UGC-compatible clips that can flow into
  Stitchr.
- Keep generated overlay text editable and hide hook style/template mechanics.

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
