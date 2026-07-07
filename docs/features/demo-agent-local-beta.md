# Demo Agent Local Beta

The Demo Agent local beta adds the guarded Phase 4 foundation. It is local-only,
policy-first, and starts with dry-run validation before allowing a recorded run.
Recording upload requires explicit review and approval.

## What It Does

- Adds `clipstitchr demo agent init`.
- Adds `clipstitchr demo agent check`.
- Adds `clipstitchr demo agent run --guide <id> --dry-run`.
- Adds guarded recording with `clipstitchr demo agent run --guide <id>`.
- Adds `clipstitchr demo agent export-log <run-id>`.
- Adds `clipstitchr demo auto` for one-command AI guide generation and guarded
  AI recording when account, repo, local app URL, and saved browser sign-in are
  already ready.
- Runs a guarded observe, plan, validate, execute, log, and stop loop.
- Saves local evidence under `.clipstitchr/agent-runs/<run-id>/`.
- Keeps screenshots and raw action logs local unless a reviewed recording is
  explicitly uploaded.
- Preserves safe optional `walkthrough.agentRun` metadata on upload snapshots.
- Supports opt-in model-backed planning with `--ai-planner`.

## Policy File

`clipstitchr demo agent init` creates:

```text
.clipstitchr/demo-agent-policy.json
```

The policy allows only localhost origins in the first beta. It stores allowed
routes, blocked text patterns, upload settings, action caps, recording caps, and
whether approval is required before upload. It can also store approved test
values for safe form typing. `.clipstitchr/` is ignored by Git, so local sample
paths and test-account notes stay out of the repository.

## Dry-Run Behavior

The dry-run opens the saved Playwright browser profile, navigates to the guide
start URL, asks the user to sign in with a test account if needed, observes the
page, plans one narrow action at a time, validates that action against policy,
executes only approved local browser actions, writes an action log, captures
screenshots, and saves a run summary.

The deterministic planner can capture screenshots, click visible buttons or
links that match the current guide step, type approved test values into matching
visible fields, and finish a step when no more safe action is needed. The
executor also supports local file upload actions, but upload remains blocked
unless the policy allows uploads, disables pre-upload approval, and names exactly
one approved local file.

Dry-run does not record video, upload media to ClipStitchr, create accounts,
purchase anything, delete data, publish content, use production accounts, or run
an LLM planner.

## Recording Behavior

Running without `--dry-run` first opens a non-recorded browser preflight so the
user can sign in with a test account. After that preflight closes, the CLI opens
a video-recorded browser context, captures interaction events, runs the same
guarded loop, saves `recording.mp4` beside the run evidence, and writes the
recording path into `run-summary.json`.

The CLI does not upload automatically. It asks the user to review the recording,
screenshots, and action log first. If the user approves, the upload includes
`walkthrough.agentRun` metadata with the run ID, action count, screenshot count,
stop reason, approval flag, and upload flag. If the agent stops before finishing
the guide, upload is skipped and the user gets a manual upload command instead.

## Evidence Tree

```text
.clipstitchr/agent-runs/<run-id>/
  action-log.jsonl
  recording.mp4
  screenshots/
  run-summary.json
```

`run-summary.json` includes the guide ID/source, policy hash, allowed origins,
start URL, start/end time, step timings, action count, screenshot count, stop
reason, optional recording path, and upload approval flags.

`action-log.jsonl` includes the planned action, policy decision, result, current
URL, and `urlBefore`/`urlAfter` values for each guarded action. Screenshot
entries also include the screenshot file name and fingerprint prefix.

The dry-run and recording loops accept an injectable planner. The deterministic
planner remains the default. With `--ai-planner`, the CLI asks
`POST /api/cli/demo-agent/plan` for one JSON browser-action DSL item based on
the simplified observation only. The server parser rejects unsupported action
types and CSS selectors, and the CLI policy validator still decides whether the
proposed action can run. The endpoint uses the shared text-writing provider
payload helper, but selects a dedicated planner model through
`CLI_DEMO_AGENT_PLANNER_MODEL_ID`, defaulting to `openai/gpt-5-mini`. If that
provider call fails, the CLI logs the provider error once and uses the
deterministic local planner for the rest of the run. Planner prompts include the
action keys already tried during the current step, and the model is told not to
repeat screenshots or other actions that have already failed to move the page
forward.

## One-Command AI Recording

`clipstitchr demo auto` is the guided one-command path. It requires the project
to already be linked, the CLI account session to be valid, the local app URL to
be known or running, and the saved browser profile to already be signed into the
app. Before writing the guide, it asks what the demo should show unless the user
passes `--goal`. That goal is sent to guide generation and to every model-backed
planner call, so requests such as "create a similar avatar using the latest UGC
clip" or "demonstrate running a batch stitch in Stitchr" steer both the
checklist and the browser actions.

It generates a guide with ClipStitchr AI, saves it locally, creates a localhost
policy if one does not exist, verifies the page in a non-recorded browser,
records with the model-backed planner, and skips upload prompts by default. The
generated guide receives scanned route context and is rejected if it asks for
presenter-only behavior, such as pointing out or highlighting UI without a
browser action the agent can perform. If the model-backed planner cannot
continue because required clips, connected accounts, selected assets, generated
results, or permissions are missing, it can stop with a plain-language reason
explaining what setup is needed.

If one of those setup requirements is missing, the command stops with the next
setup command instead of asking questions.

## Test Coverage

The CLI package includes a local `npm test` command. It builds the package, then
runs Node test files under `packages/clipstitchr-cli/test/demoAgent/` and
`packages/clipstitchr-cli/test/demoAuto/`.

Current coverage includes:

- Observer fixture coverage for visible headings, buttons, links, labels,
  inputs, and dialogs.
- Deterministic planner tests for screenshot-first, safe typing, safe clicking,
  and step completion.
- Policy validator tests for blocked text, external origins, disallowed routes,
  selector-only clicks, unapproved typing, upload approval, approved upload
  files, and wrong step completion.
- Playwright executor fixture tests for visible clicks, approved typing,
  approved local file upload, and visible-text waits.
- Full loop fixture tests for a safe multi-step guide flow, blocked observed
  page text, external navigation, disallowed routes, repeated page state, step
  timings, screenshot counts, auth walls, modal flows, long loading waits, 404
  page states, URL transition logging, time caps, action caps, and no-progress
  stops.
- Planner parser tests for supported JSON actions, unsupported action types,
  selector rejection, and approved test-value keys.
- Injected planner tests proving unsafe model-style proposals are blocked before
  execution.
- Upload-review tests proving incomplete runs, `--no-upload`, and declined
  review prompts do not upload, while approved uploads include safe
  `walkthrough.agentRun` metadata.
- Auto-demo helper tests for default goal, audience, step count, route-flow
  selection, planner fallback, and repeated-action fallback.

Remaining test coverage should focus on GUI recording smoke and production
smoke for model-backed planning.

## Source Files

- `packages/clipstitchr-cli/src/demoAgent/*`
- `packages/clipstitchr-cli/test/demoAgent/*`
- `packages/clipstitchr-cli/src/commands/runDemoAgentInitCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoAgentCheckCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoAgentRunCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoAutoCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoAgentExportLogCommand.ts`
- `web/app/api/cli/demo-agent/plan/route.ts`
- `web/lib/clipstitchr/server/cli/demoAgentPlanner/*`
- `web/lib/clipstitchr/server/createTextWritingPredictionInput.ts`
- `web/lib/clipstitchr/server/cli/demoWalkthrough/readCliDemoWalkthroughAgentRunMetadata.ts`
