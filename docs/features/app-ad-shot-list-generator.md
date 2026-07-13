# App Ad Shot List Generator

## Overview

The public tool at `/tools/app-ad-shot-list-generator` turns one app-ad idea
into a copyable shoot-day plan. It gives every requested source file its own
capture ID, framing, action, audio, timing, purpose, and clean-handoff
direction.

This differs from the UGC Ad Brief Builder. The brief explains the overall
creator assignment and aggregate deliverables. The shot-list generator is the
on-set checklist for one concept, with one card per file.

## Inputs and Output

The browser accepts bounded text for the app, audience, frustrating moment,
product-demo moment, desired outcome, call to action, and optional approved
proof. The visitor also chooses an existing creator style, an opening angle,
and one, three, or five opening captures.

Blank required values produce an incomplete state instead of malformed live
copy. Valid input creates:

- The requested number of distinct opening files.
- One context file, one clean product demo, one outcome file, and one CTA.
- One proof file only when approved proof was supplied.
- A total planned-file count and a separate two-takes-per-file recommendation.
- A copyable on-set checklist.

Each shot remains one reusable beat. UGC and product-demo footage stay in
separate files, and every handoff asks for clean handles with no permanent
music, captions, watermark, transition, or app interface inside the UGC clip.
The demo starts from a clean before-state, shows one complete action, and holds
the visible result.

## Deterministic Engine

`createAppAdShotList` composes focused shot helpers. The opening angle changes
what the first capture leads with, while the creator style changes the source,
framing, and spoken-versus-silent direction. The engine does not call AI, a
provider, or the Hook library. It preserves supplied proof and explicitly
forbids stronger claims.

`formatAppAdShotListText` owns the copyable handoff. Inputs and results remain
in React state and are not persisted, placed in URLs, sent to analytics, or
posted to a backend.

## User Flow and Conversion

The page follows the shared public-tool sequence: structured data, hero,
immediate generator, the fixed-source mailing-list form, guide, matching FAQ,
and related tools. The lead source is `app-ad-shot-list-generator`. The paid
CTA links to `/pricing` and explains that ClipStitchr continues with organized
source footage and reusable production.

## Free-versus-Paid Boundary

The free tool plans what to record. It does not record, upload, normalize,
store, organize, assemble, stitch, save, or export media. Paid ClipStitchr
continues to own the reusable asset library, UGC-to-demo sequencing, batch
production, saved projects, and finished exports.

The candid functional, standalone-value, runtime, limitation, and next-step
rating is maintained in
`docs/features/public-tool-quality-register.md`. Adding AI or Hook Library
material later requires a fresh privacy, abuse-cost, value, and boundary
review.

## File Tree

```text
web/app/(content)/tools/app-ad-shot-list-generator/page.tsx
web/app/_components/tools/app-ad-shot-list-generator/
  AppAdShotCard.tsx
  AppAdShotListEmptyState.tsx
  AppAdShotListFaq.tsx
  AppAdShotListForm.tsx
  AppAdShotListGenerator.tsx
  AppAdShotListGuide.tsx
  AppAdShotListHero.tsx
  AppAdShotListPage.tsx
  AppAdShotListPage.test.tsx
  AppAdShotListPricingCta.tsx
  AppAdShotListResults.tsx
  AppAdShotListSelectField.tsx
web/lib/clipstitchr/tools/appAdShotList/
  AppAdShot*.ts
  appAdShotList*.ts
  createAppAd*.ts
  defaultAppAdShotListInput.ts
  formatAppAdShotListText.ts
  getAppAd*.ts
```

## Verification

Focused tests cover every opening count, unique IDs, creator-style changes,
proof safety, copy formatting, missing required inputs, metadata, structured
data, exact lead source, paid CTA, and the absence of a free-tier promise.

## Source References

- `docs/features/public-tool-batch-11-15-design.md`
- `docs/features/app-ugc-brief-builder.md`
- `docs/features/public-app-marketing-tools.md`
- `docs/features/public-tool-quality-register.md`
- `project-scope.md`, sections 1, 4.1, and 4.2
