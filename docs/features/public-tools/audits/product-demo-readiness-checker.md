# Product Demo Readiness Checker

## What It Does

The Product Demo Readiness Checker helps app founders and marketers decide
whether one product demo is ready for an initial creative test. It is available
at `/tools/product-demo-readiness-checker`.

The tool combines browser-read technical facts with an eight-question human
review. It does not use AI to inspect the content, upload the video, export a
report, or create a finished ad.

## Inputs

The visitor chooses one intended use:

- Short-form ad
- Organic post
- Landing page

This selection changes only a clearly labeled planning-length guideline. It is
not presented as an ad-network rule.

The visitor then answers Yes, Not sure, or No for eight statements:

1. A useful product moment appears in the first two seconds.
2. The demo focuses on one outcome.
3. The action and result are both visible.
4. The important interface is readable at phone size.
5. Personal, secret, and customer data is hidden.
6. Spoken words have captions.
7. The viewer gets a clear next step.
8. Dead time has been removed.

Captions may be marked Not applicable and are then removed from the score's
denominator.

## Automatic Checks and Scoring

The local inspector adds browser video playback, source resolution, audio
playback, and planning-length checks. Each applicable pass or Yes earns full
weight, a warning or Not sure earns half, and a failure or No earns none.

An undecodable primary video, unreadable phone-size interface, or exposed
private data is a blocker regardless of the percentage. A score of 80 or more
with no blocker is **Ready to test**. A score from 60 to 79 with no blocker is
**Nearly ready**. Every other result is **Needs another pass**.

The report shows:

- The weighted status and percentage.
- A local video preview and technical file facts.
- The three highest-priority fixes, with blockers first.
- The items that already pass.
- The full technical and human checklist.

Wide desktop demos do not automatically fail. The result reuses ClipStitchr's
existing wide-demo policy to explain its fit-with-background production path.

## Page Flow and Conversion

The useful result appears before any email request. The paid-plan call to
action explains how ClipStitchr can pair the reviewed demo with UGC, hooks, and
text in a finished batch. The existing mailing-list form uses the fixed source
`product-demo-readiness-checker`; submitting it does not create an account.

Visible FAQ answers match the page's `FAQPage` structured data.

## Privacy and Abuse Surface

Video bytes, filenames, technical facts, and checklist answers stay in the
browser and are not included in analytics. The check creates no backend work,
provider cost, or storage. Replacing the file cancels stale work and revokes
the old preview URL. The separate mailing-list form retains its existing
per-client, per-email, and global limits.

## File Tree

```text
web/app/(content)/tools/product-demo-readiness-checker/page.tsx
web/app/_components/tools/product-demo-readiness-checker/
  ProductDemoChecklist.tsx
  ProductDemoChecklistQuestion.tsx
  ProductDemoReadinessChecker.tsx
  ProductDemoReadinessFaq.tsx
  ProductDemoReadinessGuide.tsx
  ProductDemoReadinessHero.tsx
  ProductDemoReadinessPage.tsx
  ProductDemoReadinessPricingCta.tsx
  ProductDemoReadinessResults.tsx
  ProductDemoUseField.tsx

web/lib/clipstitchr/tools/productDemoReadiness/
  ProductDemoAnswer.ts
  ProductDemoAnswers.ts
  ProductDemoQuestion.ts
  ProductDemoQuestionId.ts
  ProductDemoReadinessStatus.ts
  ProductDemoUse.ts
  ProductDemoUseOption.ts
  createProductDemoReadinessChecks.ts
  defaultProductDemoAnswers.ts
  getProductDemoOrientationAdvice.ts
  getProductDemoReadinessFixes.ts
  getProductDemoReadinessStatus.ts
  productDemoAnswerOptions.ts
  productDemoQuestions.ts
  productDemoReadinessDescription.ts
  productDemoReadinessFaqs.ts
  productDemoUseOptions.ts
```

Shared inspection files are documented in
`docs/features/editor/browser-local-video-inspection.md`.

## Verification

Focused tests cover all-pass scoring, Not applicable caption handling,
Not-sure warnings, duration planning guidance, private-data blockers,
undecodable video, wide-demo advice, metadata, structured data, lead source,
discovery links, prioritized fixes, and paid-only copy.

## Source References

- `docs/features/public-tools/portfolio/public-tool-batch-3-10-design.md`
- `docs/features/editor/browser-local-video-inspection.md`
- `project-scope.md`, section 7
- `web/lib/clipstitchr/utils/getClipShouldUseUploadBackgroundLayout.ts`
- `web/services/media-worker/selectUploadNormalizationLayout.mjs`

The candid release status and next refinement are recorded in
`docs/features/public-tools/portfolio/public-tool-quality-register.md`.
