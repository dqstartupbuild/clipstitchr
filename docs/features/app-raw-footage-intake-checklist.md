# App Raw Footage Intake Checklist

## Purpose

The App Raw Footage Intake Checklist at
`/tools/app-raw-footage-intake-checklist` creates a copyable request for clean,
organized app-ad source footage.

## How It Works

Visitors select requested source roles and add quantities or directions for
openings, UGC talking takes, b-roll, app demos, and CTAs. The remaining checks
cover original-file delivery, one-take-per-file organization, clean versions,
folders and naming, deadlines, clean handles, privacy-safe demos, audio,
pronunciation, usage questions, consent evidence, manifests, unavailable
items, review owners, and replacement requests.

All twenty-seven checks and visitor notes appear in copied or downloaded
Markdown. Unchecked deliverable roles remain visible as unselected so the
recipient can see what was and was not requested.

## Use Cases

- Scope raw footage before a creator begins filming.
- Request original files that remain reusable across multiple ad concepts.
- Define safe demo data, clean audio, naming, and handoff expectations.
- Collect usage questions and consent-record ownership for separate review.

## Paid Boundary and Privacy

The feature does not receive, store, inspect, transfer, or transform files. It
does not create a contract or verify rights. Notes remain in the browser
session and are separate from optional mailing-list capture. Paid ClipStitchr
handles persistent assets and production after approved footage exists.

## Relevant Files

- `web/lib/clipstitchr/tools/appRawFootageIntake/appRawFootageIntakeDefinition.ts`
- `web/lib/clipstitchr/tools/appRawFootageIntake/appRawFootageIntakeDefinition.test.ts`
- `web/app/(content)/tools/app-raw-footage-intake-checklist/page.tsx`
- `web/app/_components/tools/resources/AppRawFootageIntakePage.test.tsx`

The resource reuses `GuidedResourcePage` and
`createGuidedResourceMarkdown`; it adds no backend or media operation.

## Verification

Definition tests assert twenty-seven unique checks, required intake areas,
selected-role output, and visitor notes. The page test covers immediate access,
the handoff promise, lead source, canonical metadata, and paid path.

The candid release status and next refinement are recorded in
`docs/features/public-tool-quality-register.md`.
