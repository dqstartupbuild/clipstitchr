# App Ad Hook Rewriter

## Overview

The public App Ad Hook Rewrite Tool at `/tools/app-ad-hook-rewriter` turns one
app-ad opening into six purposefully different directions: clearer, shorter,
audience-first, problem-first, outcome-led, and pattern break.

Rewriting is deterministic and browser-local. The tool does not send submitted
copy to an API, load the full 820-entry server hook catalog into the client, or
call a writing provider.

## How It Works

The visitor supplies the current hook, app or category, audience, problem,
desired outcome, and an optional first visual. The engine detects the source
intent, removes vague endings such as “total game changer,” preserves a short,
safe core from the submitted line, and reshapes that core through a compact
catalog of claim-reviewed structures. If the submitted line contains a risky
numeric, absolute, authority, or regulated claim, the tool does not repeat
that claim and anchors the alternatives to the app instead.

Every candidate must:

- Be distinct from the other five rewrites.
- Preserve a recognizable safe core from the submitted hook when one exists.
- Stay under the public overlay length limit.
- Contain no unresolved template slots.
- Remain below the source-similarity threshold.
- Avoid newly introduced numeric, absolute, authority, or regulated claims.

When a primary structure is unsafe or too similar, the engine uses the next
neutral fallback. The original and supplied context are also scanned so the
result can remind the visitor when human claim review is needed.

## Reused Product Patterns

The compact client catalog follows structures already present in Clipr and
Hook Lab, including audience/product framing, problem recognition, short
before/after cadence, and the deterministic “different way to look at this”
fallback. It intentionally stores only the small reviewed set needed by this
tool rather than shipping the full server template library.

## User Experience and Conversion

Each rewrite has its own test note and copy control. The result links to the
Hook Strength Grader and Hook-to-Visual Matchmaker, then points to paid
ClipStitchr plans. The secure mailing-list form remains optional and separate
from the free result.

## Relevant Files

```text
web/app/(content)/tools/app-ad-hook-rewriter/page.tsx
web/app/_components/tools/app-ad-hook-rewriter/
web/lib/clipstitchr/tools/appAdHookRewriter/
web/lib/clipstitchr/tools/publicHooks/
```

## Source References

- `web/lib/clipstitchr/resources/clipr/rawAppHookTemplates.ts` is the source
  catalog for the reviewed structural precedents.
- `web/lib/clipstitchr/server/hookLab/createHookLabDeterministicFallback.ts`
  supplies the safe fallback precedent.
- `docs/features/public-tool-batch-3-10-design.md` defines the approved output
  and privacy contract.

## Verification

```bash
npx vitest run \
  lib/clipstitchr/tools/appAdHookRewriter/rewriteAppAdHook.test.ts \
  app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterPage.test.tsx
```

The candid release status and next refinement are recorded in
`docs/features/public-tool-quality-register.md`.
