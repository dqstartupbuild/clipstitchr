# Demo AI Guide Generation

Demo AI guide generation adds a manual-first guide workflow to the ClipStitchr
CLI. Users can ask ClipStitchr to draft a short walkthrough checklist, review
or edit it locally, save it under `.clipstitchr/demo-guides`, and then record
with the existing `clipstitchr demo make --guide <id>` stepper.

## What It Does

- Adds `clipstitchr demo guide generate`, `list`, `show`, `edit`, `delete`, and
  `export-instructions`.
- Adds `POST /api/cli/demo-guides/generate` for bearer-token CLI sessions.
- Keeps recording manual. The generated guide never includes selectors,
  passwords, billing steps, destructive actions, or autonomous browser actions.
- Saves accepted guides with `source: "ai-assisted"` so upload walkthrough
  metadata can preserve where the checklist came from.

## How It Works

The CLI picks the current product, detects the local app type, scans local
routes, and asks what the demo should show. It sends product, app, selected
flow, available route context, goal, audience, and desired step count to the web
API.

The API verifies the CLI session, checks that the product belongs to the
session owner, consumes `cliDemoGuideGenerate`,
`cliDemoGuideGenerateGlobal`, and the shared provider bucket, then calls the
configured writing model through `TEXT_WRITING_MODEL_ID`.

The prompt asks for JSON only: one title, one plain-language goal, and 3-8
label-only steps that a guarded browser agent can actually perform. The parser
rejects malformed JSON, empty or oversized fields, too many or too few steps,
duplicate returned step IDs, unsafe labels, and presenter-only steps such as
"point out" or "highlight" instructions. If the first output does not parse, the
backend asks the model to repair the JSON once. If generation still fails, the
CLI falls back to the existing local checklist builder.

For `clipstitchr demo auto`, the CLI asks what the demo should show unless the
user passes `--goal`. The guide prompt treats that goal as the primary direction
and prefers matching scanned routes when available, so specific requests stay
focused on the requested tool or workflow instead of falling back to a generic
workspace tour.

## File Tree

- `packages/clipstitchr-cli/src/commands/runDemoGuideGenerateCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoGuideListCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoGuideShowCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoGuideEditCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoGuideDeleteCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoGuideExportInstructionsCommand.ts`
- `packages/clipstitchr-cli/src/api/generateDemoWalkthroughGuide.ts`
- `packages/clipstitchr-cli/src/demoGuide/*`
- `web/app/api/cli/demo-guides/generate/route.ts`
- `web/lib/clipstitchr/server/cli/demoGuides/*`
- `web/convex/cliProducts/getCliProductDocument.ts`
- `web/convex/rateLimiter.ts`
- `web/convex/rateLimits.ts`

## Rate Limits

`POST /api/cli/demo-guides/generate` uses:

- `cliDemoGuideGenerate`: 20/hour/user, burst 5.
- `cliDemoGuideGenerateGlobal`: 1,000/hour, burst 200, sharded.
- `cliprProviderSpendGlobal`: shared provider spend protection.

See `docs/backend/rate-limits.md` for operational verification steps.
