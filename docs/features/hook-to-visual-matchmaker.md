# Hook-to-Visual Matchmaker

## Overview

The public Hook-to-Visual Matchmaker at
`/tools/hook-to-visual-matchmaker` turns an app-ad hook and descriptions of
available footage into a practical 0–5 second storyboard.

The visitor describes footage instead of uploading it. All input and matching
stay in the browser, and the tool does not inspect media, call a provider, or
claim that one pairing will outperform another.

## How It Works

Inputs cover the hook, app or category, audience, desired viewer action,
available UGC, available demo moment, and preferred opening source. The matcher
detects one transparent intent:

- Audience callout
- Comparison
- Curiosity gap
- Demonstration
- Product discovery
- Objection answer
- Desired outcome
- Problem recognition

That intent selects a curated opening and product-handoff treatment. The source
selector honors a requested UGC or demo opening when it exists. If it is
missing, the tool uses the other available source. When neither source exists,
the result starts with a plain text card and explicitly names the missing demo
shot instead of pretending footage exists.

The primary output contains an opening shot, exact on-screen hook, three timed
beats, demo handoff, and call-to-action bridge. An alternate plan uses the
other available source when possible. Both plans are copyable. Claim signals
produce a reminder that factual wording needs visible support.

## User Experience and Conversion

The result includes a concise live-region announcement, an explicit
performance disclaimer, copy controls, a paid-plan call to action, an optional
mailing-list form, visible FAQ content, and matching structured data.

## Relevant Files

```text
web/app/(content)/tools/hook-to-visual-matchmaker/page.tsx
web/app/_components/tools/hook-to-visual-matchmaker/
web/lib/clipstitchr/tools/hookVisualMatchmaker/
web/lib/clipstitchr/tools/publicHooks/
```

Each storyboard type, source-selection function, formatter, intent pattern,
component, and test lives in its own focused file.

## Source References

- `web/lib/clipstitchr/utils/getHookLabVariationDirection.ts` supplies the
  product's durable recognition, reframe, realization, curiosity, and
  transformation visual treatments.
- `web/lib/clipstitchr/resources/clipr/cliprHookStyles.ts` supplies the hook
  intent vocabulary.
- `docs/features/public-tool-batch-3-10-design.md` defines the approved
  footage-aware behavior.

## Verification

```bash
npx vitest run \
  lib/clipstitchr/tools/hookVisualMatchmaker/matchHookToVisual.test.ts \
  app/_components/tools/hook-to-visual-matchmaker/HookVisualMatchmakerPage.test.tsx
```

The candid release status and next refinement are recorded in
`docs/features/public-tool-quality-register.md`.
