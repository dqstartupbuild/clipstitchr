# Product Demo Recording Checklist

## Purpose

The Product Demo Recording Checklist is an eighteen-item preparation resource
at `/tools/app-demo-recording-checklist`. It helps app teams prepare a readable,
privacy-safe demo before they record or hand off a source file.

## How It Works

The checklist covers four stages: planning, capture setup, the recorded
sequence, and file handoff. Advice accounts for direct phone recording,
desktop capture, mirrored devices, and emulators. Visitors can record their
capture method, supported statement, safe sample data, and filename notes.

Critical privacy, readability, claim, payoff, playback, and clean-original
items are marked `Must check`. The visible percentage reports completion only;
an unchecked blocker cannot be averaged into a ready decision.

## Use Cases

- Prepare privacy-safe sample data and remove notification risks.
- Set phone, desktop, or emulator capture behavior.
- Record clean handles, readable gestures, alternate takes, and a held payoff.
- Verify the original exported recording before editor handoff.

## Paid Boundary and Privacy

The checklist does not record, upload, inspect, repair, normalize, or export
media. Notes remain in the browser session and are not sent through the lead
form. Product Demo Readiness can inspect a local file later; paid ClipStitchr
owns persistent asset organization and production.

## Relevant Files

- `web/lib/clipstitchr/tools/appDemoRecordingChecklist/appDemoRecordingChecklistDefinition.ts`
- `web/lib/clipstitchr/tools/appDemoRecordingChecklist/appDemoRecordingChecklistDefinition.test.ts`
- `web/app/(content)/tools/app-demo-recording-checklist/page.tsx`
- `web/app/_components/tools/resources/AppDemoRecordingChecklistPage.test.tsx`

The implementation reuses `GuidedResourcePage`. It does not invoke Media Bunny
because the feature prepares recording rather than reading a media file.

## Verification

Definition tests prove exactly eighteen unique items, capture-method guidance,
critical blockers, and Markdown notes. The page test covers count, blocker copy,
download, lead source, canonical metadata, and paid conversion.

The candid release status and next refinement are recorded in
`docs/features/public-tool-quality-register.md`.
