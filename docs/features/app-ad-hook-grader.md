# App Ad Hook Grader

## Overview

The public Hook Strength Grader at `/tools/app-ad-hook-grader` helps app
founders review one short-form opening before filming. It checks writing craft
with transparent rules and does not predict views, clicks, installs, or sales.

All submitted text stays in the browser. Grading does not call a provider,
Next.js API route, Convex, or browser storage.

## How It Works

The visitor enters a hook, app name or category, audience, desired outcome, and
an optional first visual. The local grader scores six dimensions from 0–100:

- Clarity checks length, unresolved placeholders, contextless wording, all
  caps, and repeated punctuation.
- Specificity checks whether the hook connects to the supplied app, audience,
  or outcome instead of relying on vague hype.
- Audience fit checks direct viewer language and audience-word overlap.
- Curiosity checks useful questions, tension, and open loops without rewarding
  a vague `this` when no visual is planned.
- Visual bridge checks whether the hook, outcome, and first visual can lead into
  one another.
- Claim safety flags numbers, absolutes, borrowed authority, and sensitive
  outcomes that deserve support and human review.

The overall score is the rounded average. Scores from 80–100 are **Strong
start**, 60–79 are **Worth testing**, and lower scores are **Needs a sharper
angle**. The three lowest dimensions produce the prioritized fixes.

## User Experience and Conversion

The result is useful before the mailing-list form appears. It includes a concise
screen-reader announcement, six labeled score cards, proof reminders, a link to
the App Ad Hook Rewrite Tool, and a paid-plan call to action. The page also
publishes visible FAQ content and matching `WebApplication` and `FAQPage`
structured data.

## Relevant Files

```text
web/app/(content)/tools/app-ad-hook-grader/page.tsx
web/app/_components/tools/app-ad-hook-grader/
web/lib/clipstitchr/tools/appAdHookGrader/
web/lib/clipstitchr/tools/publicHooks/
```

Each component, type, scoring function, constant, and test remains in its own
focused file. Shared public-hook token, intent, similarity, and claim helpers
are browser-safe and contain no provider or server dependency.

## Source References

- `web/lib/clipstitchr/resources/clipr/cliprHookStyles.ts` documents the
  product's durable hook-intent vocabulary.
- `web/lib/clipstitchr/server/hookLab/getHookLabTextSimilarity.ts` supplied the
  precedent for transparent token similarity.
- `docs/features/public-tool-batch-3-10-design.md` defines the approved public
  tool contract.

## Verification

```bash
npx vitest run \
  lib/clipstitchr/tools/appAdHookGrader/gradeAppAdHook.test.ts \
  app/_components/tools/app-ad-hook-grader/AppAdHookGraderPage.test.tsx
```

The candid release status and next refinement are recorded in
`docs/features/public-tool-quality-register.md`.
