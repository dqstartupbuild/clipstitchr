# UGC Opening-Line Prompt Cards

## What It Does

The public route `/tools/ugc-opening-line-prompt-cards` gives creators exactly 24 prompts for recording natural app-ad openings. The collection has six categories—problem, surprise, objection, demo, confession, and outcome—with four prompts in each category.

Every card contains:

- A question or direction the creator can answer in their own words.
- A practical delivery note.
- An alternate take to capture as a separate clip.
- A proof guardrail for keeping the statement honest.

## How It Works

`ugcOpeningLinePrompts.ts` owns the fixed prompt-card data. The shared collection browser handles category filtering, text search, individual copy, complete-resource copy, and Markdown download. No recording, search, or filter input leaves the browser.

The cards are original static content. They do not call AI or import ClipStitchr's Hook library.

## Paid Boundary

The prompts help a creator capture reusable opening takes. They are not complete scripts and do not record, store, edit, stitch, or export video. Finished production stays in ClipStitchr's paid workflow.

## Use Cases

- Give a creator direction without forcing a word-for-word script.
- Capture main and alternate openings during one shoot.
- Separate a spoken opening from reusable demo footage.
- Flag a statement that depends on experience or proof the creator does not have.

## Relevant Files

```text
web/app/(content)/tools/ugc-opening-line-prompt-cards/
  page.tsx
  page.test.tsx
web/lib/clipstitchr/tools/ugcOpeningLinePrompts/
  ugcOpeningLinePrompts.ts
  ugcOpeningLinePrompts.test.ts
  ugcOpeningLinePromptsDefinition.ts
  ugcOpeningLinePromptsFaqs.ts
```

Shared collection rendering lives in `web/app/_components/tools/resources/`. Catalog metadata lives in `web/lib/clipstitchr/tools/catalog/publicToolCatalog.ts`.

## Source References

The prompts are original project copy created from the approved contract in `docs/features/public-tool-batch-16-50-design.md`. They do not claim to predict ad performance.

## Verification

The pure data test proves the exact 24-card count, uniqueness, six-category distribution, and required delivery, alternate, and proof sections. The page test proves the whole collection renders with the lead source, structured data, copy/download controls, related route, canonical metadata, and paid handoff.

The candid release status and next refinement are recorded in
`docs/features/public-tool-quality-register.md`.
