# 50 App-Ad Hook Structures

## What It Does

The public route `/tools/app-ad-hook-structures` is a searchable collection of exactly 50 app-ad writing frameworks. Each framework includes a formula, a filled example, an opening visual, a misuse warning, and a claim guardrail.

The five framework families are direct clarity, problem reframe, demonstration, objection, and story and identity. Each family contains ten distinct structures.

## How It Works

`appAdHookStructures.ts` owns the fixed framework data. `appAdHookStructuresDefinition.ts` supplies the guide and filtering copy to the shared collection-resource page. Visitors can filter locally and copy any individual example while the complete collection remains visible.

The staged control retains whole-resource copy and Markdown download. In the approved `hybrid-v1` experience, accepted name-and-email capture unlocks the exact CSV swipe file in that browser. The CSV is generated locally from the same public framework data and does not send search text or examples to the server.

The page does not use AI, a provider request, performance data, or ClipStitchr's internal Hook library. It is an educational reference, not a personalized generator.

## Paid Boundary

The resource explains how to shape an opening. It does not turn a framework into a saved campaign idea, generate app-specific variants, record footage, assemble source clips, or create a finished ad.

## Use Cases

- Compare meaningfully different ways to frame the same app benefit.
- Identify why a draft hook feels vague or overloaded.
- Choose an opening visual before writing the rest of an ad.
- Notice where a framework could encourage an unsupported claim.

## Relevant Files

```text
web/app/(content)/tools/app-ad-hook-structures/
  page.tsx
  page.test.tsx
web/lib/clipstitchr/tools/appAdHookStructures/
  appAdHookStructures.ts
  appAdHookStructures.test.ts
  appAdHookStructuresDefinition.ts
  appAdHookStructuresFaqs.ts
```

The shared collection and format-aware portability components live in `web/app/_components/tools/resources/`. CSV creation lives in `web/lib/clipstitchr/tools/resources/createCollectionResourceCsv.ts`, and gate metadata lives in `web/lib/clipstitchr/tools/catalog/publicToolGateCatalog.ts`.

## Source References

The structures and examples are original project copy implementing `docs/features/public-tools/portfolio/public-tool-batch-16-50-design.md`. The title deliberately avoids the unsupported word “proven,” and the resource makes no conversion or performance claim.

## Verification

The data test enforces exactly 50 unique IDs, titles, and examples; five equal framework families; and all five promised content fields. Shared gate tests verify the collection stays public while the hybrid CSV is locked, then appears after browser unlock. Route tests cover canonical metadata, structured data, lead source, related links, control actions, and the paid CTA.

The candid release status and next refinement are recorded in
`docs/features/public-tools/portfolio/public-tool-quality-register.md`.
