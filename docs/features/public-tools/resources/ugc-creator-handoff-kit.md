# UGC Creator Handoff Kit

## Purpose

The UGC Creator Handoff Kit at `/tools/ugc-creator-handoff-kit` gives creators,
founders, and marketers a complete browser-local media-delivery playbook.

## Included Resources

The twenty-five-item kit includes:

- A delivery checklist for counts, originals, playback, and private files.
- A six-folder layout for openings, UGC, b-roll, demos, references, and docs.
- An upload manifest covering facts, creative content, issues, and status.
- A filename pattern, complete example, and replacement-file rule.
- Usage-information questions for people, material, placement, and records.
- A neutral missing-file message template.
- A specific, non-performance-based reshoot request template.

Editable note fields are included in copied and downloaded Markdown.

## Use Cases

- Prepare a delivery folder before sharing a transfer link.
- Help an editor find clips without opening every file.
- Identify missing files without silently substituting footage.
- Request one replacement take with an observable correction.

## Paid Boundary and Privacy

The page is not an upload portal and does not store files, pay creators, verify
rights, or create contracts. Usage prompts identify information for separate
review and are not legal advice. Handoff notes stay in the browser session.

## Relevant Files

- `web/lib/clipstitchr/tools/ugcCreatorHandoffKit/ugcCreatorHandoffKitDefinition.ts`
- `web/lib/clipstitchr/tools/ugcCreatorHandoffKit/ugcCreatorHandoffKitDefinition.test.ts`
- `web/app/(content)/tools/ugc-creator-handoff-kit/page.tsx`
- `web/app/_components/tools/resources/UgcCreatorHandoffKitPage.test.tsx`

The shared `GuidedResourcePage` owns check state, note editing, Markdown copy,
download, lead capture, guide, FAQ, pricing CTA, and discovery.

## Verification

Definition tests assert twenty-five unique items and all seven promised kit
artifacts. The page test proves the artifacts are immediately visible with the
correct route metadata, lead source, download, and paid path.

The candid release status and next refinement are recorded in
`docs/features/public-tools/portfolio/public-tool-quality-register.md`.
