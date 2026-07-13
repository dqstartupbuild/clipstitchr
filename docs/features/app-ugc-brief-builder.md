# UGC Ad Brief Builder for Apps

## Overview

The public tool at `/tools/app-ugc-brief-builder` turns app-marketing context
into a creator-ready UGC production brief. It is designed for app founders and
marketers who need modular source footage that can later be organized, reused,
and paired with product demos in ClipStitchr.

The complete brief is visible and copyable without an email gate. The page
offers the shared mailing-list form and a paid-plan call to action after it has
already delivered value. It does not promise a free ClipStitchr account or
trial.

## Inputs

The browser accepts bounded plain-text fields for:

- App name
- Audience
- Audience problem
- Desired outcome
- One key product feature or moment
- Optional approved proof
- Call to action

The visitor also selects a creator style, tone, and deliverable size. The three
deliverable sizes produce 8, 12, or 20 separate source clips. The 20-clip option
matches Stitchr's maximum Hook/UGC batch size without exporting a finished ad.

## Deterministic Brief Rules

`createAppUgcBrief` composes a stable result from the submitted words and
curated directions. It does not call an AI model or provider. The result
contains:

- One focused creative objective
- Audience and creator direction
- Audience-callout, problem-moment, and outcome-led hook directions
- Separate hook, reaction, everyday b-roll, and call-to-action deliverables
- A clean handoff into a separate product demo
- An explicit proof boundary
- A vertical-video filming checklist

An empty proof field produces a direct instruction not to invent numbers,
guarantees, testimonials, rankings, savings, speed, endorsements, or personal
experience. Supplied proof is repeated as approved context and may not be
strengthened. The output is a creative brief, not a creator contract or legal
usage-rights advice.

`formatAppUgcBriefText` owns the plain-text handoff used by the shared
`CopyTextButton`. Nothing is uploaded or persisted.

## User Experience and Conversion

The page follows the shared public-tool composition:

1. Canonical page metadata and matching `WebApplication` and `FAQPage` data
2. Plain-language hero
3. Browser-local form and immediate brief
4. Full-brief copy control
5. Mailing-list capture attributed to `app-ugc-brief-builder`
6. Production guidance and FAQ
7. Related tools and the `/tools` hub

The result CTA sends visitors to `/pricing` to turn delivered source footage
into a paid ClipStitchr workflow. Fixed CTA metadata is tracked, but visitor
inputs and copied brief text are not analytics properties.

## Privacy, Cost, and Abuse Surface

All brief assembly happens during React rendering in the browser. The tool has
no provider, storage, media, or API cost and adds no new rate-limited operation.
Only the existing shared mailing-list route reaches the backend, where the
catalog source allowlist, same-origin checks, body limit, opaque duplicate
handling, and shared lead limits apply.

## File Tree

```text
web/app/(content)/tools/app-ugc-brief-builder/page.tsx
web/app/_components/tools/app-ugc-brief-builder/
  AppUgcBriefBuilder.tsx
  AppUgcBriefBuilderFaq.tsx
  AppUgcBriefBuilderForm.tsx
  AppUgcBriefBuilderGuide.tsx
  AppUgcBriefBuilderHero.tsx
  AppUgcBriefBuilderPage.tsx
  AppUgcBriefBuilderPage.test.tsx
  AppUgcBriefBuilderResults.tsx
  AppUgcBriefPricingCta.tsx
  AppUgcBriefSelectField.tsx
  AppUgcBriefShotCard.tsx
  AppUgcBriefTextField.tsx
web/lib/clipstitchr/tools/appUgcBriefBuilder/
  AppUgcBriefCreatorStyle.ts
  AppUgcBriefDeliverableSize.ts
  AppUgcBriefDeliverables.ts
  AppUgcBriefInput.ts
  AppUgcBriefResult.ts
  AppUgcBriefShot.ts
  AppUgcBriefTone.ts
  appUgcBriefCreatorStyleOptions.ts
  appUgcBriefDeliverableSizeOptions.ts
  appUgcBriefDescription.ts
  appUgcBriefFaqs.ts
  appUgcBriefFieldLimits.ts
  appUgcBriefFilmingChecklist.ts
  appUgcBriefToneOptions.ts
  createAppUgcBrief.ts
  createAppUgcBrief.test.ts
  createAppUgcBriefHookDirections.ts
  createAppUgcBriefShotList.ts
  defaultAppUgcBriefInput.ts
  formatAppUgcBriefText.ts
  getAppUgcBriefCreatorDirection.ts
  getAppUgcBriefDeliverables.ts
  getAppUgcBriefProofBoundary.ts
```

## Source References

- `project-scope.md` defines ClipStitchr's Hook/UGC-then-demo production model.
- `web/lib/clipstitchr/server/createCliprReactionVisualPrompt.ts` establishes
  the existing silent reaction guidance.
- `web/lib/clipstitchr/server/createCliprBrollVisualPrompt.ts` establishes the
  existing one-action, vertical b-roll guidance.
- `docs/features/public-tool-batch-3-10-design.md` defines the approved public
  batch contract and proof-safety boundary.

## Verification

Focused tests cover each deliverable total, shot-count sums, supplied and empty
proof, copy formatting, visible sections, canonical metadata, structured data,
lead attribution, related links, paid pricing CTA, and the absence of free-plan
or trial promises.

The candid release status and next refinement are recorded in
`docs/features/public-tool-quality-register.md`.
