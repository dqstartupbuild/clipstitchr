# Demo AI Guide Generation

Demo AI guide generation adds a manual-first guide workflow to the ClipStitchr
CLI. Users can ask ClipStitchr to draft a short walkthrough checklist, review
or edit it locally, save it under `.clipstitchr/demo-guides`, and then record
with the existing `clipstitchr demo manual --guide <id>` stepper.
Saved guides also get a readable `name` so users can run commands with a
memorable guide name instead of copying an ID.

## What It Does

- Adds `clipstitchr demo guide create`, `list`, `show`, `edit`, `delete`, and
  `save-instructions`.
- Keeps `demo guide generate` and `demo guide export-instructions` as legacy
  aliases.
- Shows readable guide names in `demo guide list` and resolves guides by name,
  ID, or file path.
- Adds `POST /api/cli/demo-guides/generate` for bearer-token CLI sessions.
- Keeps recording manual. The generated guide never includes selectors,
  passwords, billing steps, destructive actions, or autonomous browser actions.
- Saves accepted guides with `source: "ai-assisted"` so upload walkthrough
  metadata can preserve where the checklist came from.

## How It Works

The CLI picks the current product, detects the local app type, scans local
routes, refreshes `.clipstitchr/app-context.json`, and asks what the demo should
show. It sends product, app, selected flow, available route context, capped app
workflow context, goal, audience, and desired step count to the web API.

The API verifies the CLI session, checks that the product belongs to the
session owner, consumes `cliDemoGuideGenerate`,
`cliDemoGuideGenerateGlobal`, and the shared provider bucket, then calls the
configured guide-writing model through `CLI_DEMO_GUIDE_MODEL_ID`, defaulting to
`openai/gpt-5-mini`.

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
workspace tour. App context adds real source-derived feature, field, and button
labels, so a request to add hooks in Hook Lab can become a guide that opens
`/dashboard/hooks`, types safe demo examples into `Hooks to learn from`, and
saves with `Save Hook Lab` when those controls exist.

## File Tree

- `packages/clipstitchr-cli/src/commands/runDemoGuideGenerateCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoGuideListCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoGuideShowCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoGuideEditCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoGuideDeleteCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoGuideExportInstructionsCommand.ts`
- `packages/clipstitchr-cli/src/api/generateDemoWalkthroughGuide.ts`
- `packages/clipstitchr-cli/src/project/scanAndWriteAppContext.ts`
- `packages/clipstitchr-cli/src/project/scanProjectWorkflowHints.ts`
- `packages/clipstitchr-cli/src/demoGuide/*`
- `packages/clipstitchr-cli/src/demoGuide/createDemoWalkthroughGuideName.ts`
- `packages/clipstitchr-cli/src/demoGuide/resolveDemoWalkthroughGuide.ts`
- `web/app/api/cli/demo-guides/generate/route.ts`
- `web/lib/clipstitchr/server/cli/appContext/*`
- `web/lib/clipstitchr/server/cli/demoGuides/*`
- `web/lib/clipstitchr/server/getCliDemoGuideModelId.ts`
- `web/lib/clipstitchr/constants/defaultCliDemoGuideModelId.ts`
- `web/convex/cliProducts/getCliProductDocument.ts`
- `web/convex/rateLimiter.ts`
- `web/convex/rateLimits.ts`

## Rate Limits

`POST /api/cli/demo-guides/generate` uses:

- `cliDemoGuideGenerate`: 20/hour/user, burst 5.
- `cliDemoGuideGenerateGlobal`: 1,000/hour, burst 200, sharded.
- `cliprProviderSpendGlobal`: shared provider spend protection.

See `docs/backend/rate-limits.md` for operational verification steps.
