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
proposed action can run.

## Test Coverage

The CLI package includes a local `npm test` command. It builds the package, then
runs Node test files under `packages/clipstitchr-cli/test/demoAgent/`.

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

Remaining test coverage should focus on GUI recording smoke and production
smoke for model-backed planning.

## Source Files

- `packages/clipstitchr-cli/src/demoAgent/*`
- `packages/clipstitchr-cli/test/demoAgent/*`
- `packages/clipstitchr-cli/src/commands/runDemoAgentInitCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoAgentCheckCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoAgentRunCommand.ts`
- `packages/clipstitchr-cli/src/commands/runDemoAgentExportLogCommand.ts`
- `web/lib/clipstitchr/server/cli/demoWalkthrough/readCliDemoWalkthroughAgentRunMetadata.ts`
