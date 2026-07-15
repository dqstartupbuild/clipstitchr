# App UGC Clip Readiness Checker

## Overview

The public tool at `/tools/app-ugc-clip-readiness-checker` helps an app founder
or marketer decide whether one raw creator clip is clean enough to hand off and
flexible enough to reuse. It combines browser-read technical facts with seven
honest questions that require a person to watch the footage.

The tool is not another Product Demo Readiness Checker or 9:16 finished-video
checker. It focuses on raw UGC: performance opening, crop-safe framing,
intelligibility, clean handles, modularity, baked-in treatment, and documented
usage approval.

## Inputs

The visitor chooses one local video and its intended role:

- Spoken hook
- Silent reaction
- Lifestyle b-roll
- Spoken call to action

The role changes the audio and duration checks. The visitor then answers Yes,
Not sure, or No for center-safe framing, first-second motion, spoken clarity,
clean handles, one reusable beat, a clean unedited source, and documented usage
approval. Spoken clarity is removed from the score for silent roles.

## Automatic Facts and Self-Review

The local Media Bunny layer automatically checks browser playback, role-aware
audio-track presence and support, source resolution, 9:16 display shape, and a
role-aware reusable-clip duration guideline. Non-9:16 footage warns but does
not automatically block because ClipStitchr can normalize it and a human must
still judge the crop.

The tool does not claim computer vision, motion detection, transcription,
voice-quality analysis, edit-treatment detection, or legal-rights
verification. The page, result, and copied report label the seven content
observations as self-review.

Passes earn full weight, warnings earn half, and failures earn none. Playback,
missing or undecodable audio for spoken roles, unsafe framing, and missing
usage approval are blockers. Less than 60 or a blocker is **Not ready to hand
off**; 60–79 without a blocker is **Needs a quick fix**; 80 or more without a
blocker is **Ready to reuse**.

The result shows a local preview, technical facts, three prioritized fixes,
passes, separate automatic and self-review sections, and a copyable report.

## Privacy and Abuse Surface

The file is read and disposed on the visitor's device through the existing
local inspector. Replacing the file cancels stale work, revokes the previous
preview URL, and resets the answers. Video bytes, filenames, metadata,
answers, and report text never reach an API, Convex, R2, a provider, or
analytics.

The checker creates no new backend operation or provider cost. Its only write
is the separate shared lead form with fixed source
`app-ugc-clip-readiness-checker` and the existing same-origin, size,
validation, per-client, per-email, and global protections.

## Free-versus-Paid Boundary

The free tool diagnoses one local raw clip. It does not repair, trim,
normalize, upload, store, organize, stitch, save, or export it. Paid
ClipStitchr owns those reusable production and finished-output jobs.

The quality rating remains Yellow/Automated until representative raw UGC MP4,
MOV, and WebM files are exercised in a real browser. The durable limitation
and next refinement live in
`docs/features/public-tools/portfolio/public-tool-quality-register.md`. Future AI, speech, motion, or
deeper media analysis requires a fresh privacy, abuse-cost, value, and paid
boundary review.

## File Tree

```text
web/app/(content)/tools/app-ugc-clip-readiness-checker/page.tsx
web/app/_components/tools/app-ugc-clip-readiness-checker/
  AppUgcClipChecklist.tsx
  AppUgcClipChecklistQuestion.tsx
  AppUgcClipPricingCta.tsx
  AppUgcClipReadinessChecker.tsx
  AppUgcClipReadinessFaq.tsx
  AppUgcClipReadinessGuide.tsx
  AppUgcClipReadinessHero.tsx
  AppUgcClipReadinessPage.tsx
  AppUgcClipReadinessPage.test.tsx
  AppUgcClipReadinessResults.tsx
  AppUgcClipRoleField.tsx
web/lib/clipstitchr/tools/appUgcClipReadiness/
  AppUgcClip*.ts
  appUgcClip*.ts
  createAppUgcClip*.ts
  defaultAppUgcClipAnswers.ts
  formatAppUgcClipReadinessReport.ts
  getAppUgcClip*.ts
```

The checker reuses the shared files documented in
`docs/features/editor/browser-local-video-inspection.md`.

## Verification

Focused tests cover spoken and silent audio behavior, silent-role denominator
handling, resolution, non-vertical warning, critical self-review failures,
ready status, metadata, structured data, exact lead source, local-only copy,
separate automatic/self-review sections, copied report, and paid CTA.

## Source References

- `docs/features/public-tools/portfolio/public-tool-batch-11-15-design.md`
- `docs/features/editor/browser-local-video-inspection.md`
- `docs/features/public-tools/audits/product-demo-readiness-checker.md`
- `docs/features/public-tools/audits/9-16-app-demo-video-checker.md`
- `docs/features/public-tools/portfolio/public-tool-quality-register.md`
- `project-scope.md`, section 7
- `docs/references/media-bunny/guides.md`
- `docs/references/media-bunny/api.md`
