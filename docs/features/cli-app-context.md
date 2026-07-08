# CLI App Context

CLI App Context gives the guide writer and guarded demo agent a local map of
how the target app is actually used.

## What It Does

- Writes `.clipstitchr/app-context.json` from local source files.
- Stores a small pointer in `.clipstitchr.yml` with the context path,
  generation time, route count, and workflow count.
- Stores the selected product summary in `.clipstitchr.yml` so repo status has
  product context without another API call.
- Refreshes context during `clipstitchr link`, `clipstitchr init`,
  `clipstitchr demo agent init`, `clipstitchr demo guide generate`,
  `clipstitchr demo agent run`, and `clipstitchr demo auto`.
- Sends the capped context to AI guide generation and per-action agent planning.

## How It Works

The CLI detects the project directory, scans routes, and reads local
app/component source files under common folders such as `app`, `src/app`,
`pages`, `components`, and `src/components`. It skips test files,
`node_modules`, build output, `.next`, Git metadata, and `.clipstitchr`.

The scanner extracts user-visible strings from JSX text, common attributes such
as `label`, `title`, `placeholder`, and object labels. It classifies likely
feature labels, form fields, buttons, and workflow actions, then groups them by
route. Component paths are mapped back to known routes when possible, so a demo
request can be tied to visible app labels, form fields, picker sections, and
buttons instead of generic or invented controls.

The web API validates and caps this payload before any provider call. Prompts
treat the context as source-derived hints. The current browser observation still
wins: the agent can only click and type into controls that are visible in the
observed page, and the local policy validator still blocks unsafe actions.
Typing safe demo text is allowed for local app fields. Blocked policy language,
credentials, billing details, payment details, and real customer data remain
disallowed.
Guide and planner prompts use feature labels to connect abstract requests to the
app's real routes, field labels, card titles, mode controls, and buttons. They
still have to use exact observed controls when executing. For paired inputs such
as learn-from versus avoid, include versus exclude, or use versus block, the
planner chooses the field whose label matches the user's wording. Feedback
controls such as accept, reject, copy, or save-as-winner are reserved for goals
that explicitly ask to act on existing suggestions or items.

## File Tree

- `packages/clipstitchr-cli/src/project/ScannedAppContext.ts`
- `packages/clipstitchr-cli/src/project/ScannedWorkflowHint.ts`
- `packages/clipstitchr-cli/src/project/getAppContextCandidateIsFeatureLabel.ts`
- `packages/clipstitchr-cli/src/project/scanProjectWorkflowHints.ts`
- `packages/clipstitchr-cli/src/project/scanAndWriteAppContext.ts`
- `packages/clipstitchr-cli/src/project/writeScannedAppContext.ts`
- `packages/clipstitchr-cli/src/project/readScannedAppContext.ts`
- `packages/clipstitchr-cli/src/config/createProductConfigSummary.ts`
- `web/lib/clipstitchr/server/cli/appContext/*`
- `web/lib/clipstitchr/server/cli/demoGuides/createCliDemoGuidePrompt.ts`
- `web/lib/clipstitchr/server/cli/demoAgentPlanner/createCliDemoAgentPlannerPrompt.ts`

## Guardrails

The context snapshot is local and source-derived. It does not inspect browser
cookies, local storage, form values, database rows, uploaded media, screenshots,
or private runtime data. It may include user-visible copy from source files, so
it is stored under `.clipstitchr/` with the rest of the local agent artifacts.

The server reader caps route and workflow counts, string lengths, source file
references, and per-hint input/button/action lists. Rate limits for guide
generation and agent planning still run before model calls.
