# Demo Agent Beta

The Demo Agent beta adds the guarded Phase 4 foundation. It is policy-first,
local by default, and starts with dry-run validation before allowing a recorded
run. Recording upload requires explicit review and approval.

## What It Does

- Adds `clipstitchr demo policy init`, `clipstitchr demo policy check`, and
  `clipstitchr demo policy edit` for creating, validating, and changing the
  local safety policy without editing JSON.
- Keeps `clipstitchr demo agent init` and `clipstitchr demo agent check` as
  legacy aliases.
- Adds `clipstitchr demo agent` for AI guide creation and guarded recording.
- Adds guarded recording with `clipstitchr demo agent --guide <id>`.
- Adds `clipstitchr demo logs <run-id>`.
- Keeps `clipstitchr demo agent export-log <run-id>` as a legacy alias.
- Keeps `clipstitchr demo auto` and `clipstitchr demo agent run --guide <id>`
  as legacy aliases.
- Supports `--target live` for explicitly selected live or staging URLs.
- Runs a guarded observe, plan, validate, execute, log, and stop loop.
- Saves local evidence under `.clipstitchr/agent-runs/<run-id>/`.
- Keeps screenshots and raw action logs local unless a reviewed recording is
  explicitly uploaded.
- Preserves safe optional `walkthrough.agentRun` metadata on upload snapshots.
- Supports opt-in model-backed planning with `--ai-planner`.
- Supports `--driver openai-computer` for OpenAI Computer Use browser control.
  OpenAI is the default when `OPENAI_API_KEY` is available, or when a valid
  ClipStitchr login can use hosted relay mode. `structured-planner` remains the
  fallback and explicit cheap mode.
- Supports `--surface macos-window` for selected visible macOS windows through
  the local helper.

## Policy File

`clipstitchr demo policy init` creates:

```text
.clipstitchr/demo-agent-policy.json
```

The policy allows localhost origins by default. The setup flow shows the current
settings and lets the user accept safe defaults or edit them in Terminal. Live
or staging origins require a separate approval, which writes
`allowLiveOrigins: true` into the policy for the selected origin. File uploads
stay disabled unless the policy names at least one approved local file. The
policy stores allowed routes, blocked text patterns, upload settings, action
caps, recording caps, and whether approval is required before upload. It can
also store approved test values for safe form typing and test-account notes.
`.clipstitchr/` is ignored by Git, so local sample paths and notes stay out of
the repository. Run `clipstitchr demo policy edit` when app URLs, routes, test
values, blocked words, files, or limits change. Run
`clipstitchr demo policy check` when you want to verify the saved policy before
an agent run.

`clipstitchr demo policy init` also refreshes `.clipstitchr/app-context.json`.
That file gives the planner source-derived route, field, and button hints before
the browser run starts.

## Dry-Run Behavior

The dry-run opens the saved Playwright browser profile, navigates to the guide
start URL, pauses for a test-account sign-in only when the app shows a sign-in
screen, observes the page, plans one narrow action at a time, validates that
action against policy, executes only approved local browser actions, writes an
action log, captures screenshots, and saves a run summary.

The deterministic planner can capture screenshots, click visible buttons or
links that match the current guide step, type safe demo text into matching
visible fields, scroll the page to reach lower workflow controls, and finish a
step when no more safe action is needed. The model-backed planner can also
return the full guarded browser-action DSL for app demos: select options, press
approved keys, clear fields, scroll to text or controls, click the first
matching visible target, click an action inside a matching card, wait for jobs
or enabled controls, select visible cards through checkbox controls, choose
files from visible library cards, toggle switches, set modes, open menus, choose
menu items, close dialogs, drag visible items, set sliders, play or pause media,
seek media, trigger downloads, and click copy buttons. Policy
approved test values are still supported for reusable values, but they are no
longer required for normal local demo copy. The runtime checks user-visible
targets against the current observation before Playwright executes
policy-sensitive actions, so source-derived context cannot make the agent wait
on a hidden or missing control. The executor centers controls, fields, and
selectable cards in the recorded viewport before interaction so the captured
demo shows the workflow area being used. The executor also supports local file
upload actions, but upload remains blocked unless the policy allows uploads,
disables pre-upload approval, and names exactly one approved local file.

Dry-run does not record video, upload media to ClipStitchr, create accounts,
purchase anything, delete data, publish content, use production accounts, or run
an LLM planner.

When `openai-computer` is selected or used by default, dry-run uses the same
local browser and evidence directory, but the next visual action comes from
OpenAI Computer Use. The CLI executes returned computer actions through
Playwright, captures a screenshot, sends it back to OpenAI as
`computer_call_output`, and repeats until the current guide step is done. Direct
mode sends screenshots from the user's machine to OpenAI. Relay mode sends
screenshots through ClipStitchr's protected API, which calls OpenAI with the
server-side key and never returns that key to the CLI. If direct mode is
selected and `OPENAI_API_KEY` is missing, the CLI falls back to the structured
planner before the run starts.

With `--target live`, the browser starts at the selected live or staging URL and
skips the local start command. This lets the OpenAI Computer Use driver record
apps whose repository is not a web app, as long as there is a browser URL to
demonstrate.

## Recording Behavior

Running the agent opens a non-recorded browser preflight. If the
app asks for sign-in, the CLI asks the user to sign in with a test account and
waits before recording. After that preflight closes, the CLI opens a
video-recorded browser context, captures interaction events, runs the same
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
proposed action can run. The endpoint accepts common browser input roles such as
`combobox` and `textbox`, asks the model to use exact local paths for
route-opening steps, gives the model current page scroll availability, and
supports guarded `scroll`, `scrollToText`, and `scrollToControl` actions when
the needed field or section is below the current viewport. Observations include
control labels, disabled state, selected state, placeholders, and current field
values so the planner can avoid disabled controls and repeated data entry. It
retries once with the invalid output and parse error when the model returns
malformed JSON or an unsupported action shape. The
endpoint uses the shared text-writing provider payload helper, but selects a
dedicated planner model through `CLI_DEMO_AGENT_PLANNER_MODEL_ID`, defaulting to
`openai/gpt-5-mini`, at a lower planner temperature than creative text
generation. The CLI spaces model-backed planning requests apart and retries
retryable provider backpressure, including `ExpiredInQueue`, before treating the
planner as unavailable. The API returns `429` with `Retry-After` when the
planner provider queue is busy. If that provider call still fails after retry or
repair, the CLI logs the provider error once and uses the deterministic local
planner for the rest of the run.
Planner prompts include the action keys already tried during the current step,
and the model is told not to repeat screenshots or other actions that have
already failed to move the page forward. If the model repeats an
already-attempted action, the CLI uses the deterministic planner for that
decision without disabling model planning for the rest of the run. The CLI also
rejects actions whose `stepId` points at a different guide step, so the planner
cannot work ahead and leave the current step half-finished.

With `--driver openai-computer`, the browser-control loop bypasses the
server-side JSON action planner. The current guide step, origin policy, allowed
routes, blocked-action rules, and capped app context are sent with the task.
`--openai-mode direct` calls OpenAI from the CLI with a local key.
`--openai-mode relay` calls ClipStitchr's protected relay route.

Local iOS Simulator, Android emulator windows, iPhone Mirroring, and other
desktop windows can use `--surface macos-window`. The helper checks Screen
Recording and Accessibility before any model actions. Run `clipstitchr native
init` once per Mac to install or update the helper, and `clipstitchr native
check` to verify permissions. macOS window runs save screenshots and action
logs; full helper-owned MP4 capture is still a boundary, so `clipstitchr demo
manual` remains the full-video path for native devices.

## One-Command AI Recording

`clipstitchr demo agent` is the guided one-command path. It requires the project
to already be linked, the CLI account session to be valid, and either a known
local app URL or an explicitly selected live URL. Before writing the guide, it
asks what the demo should show unless the user passes `--goal`. That goal is
sent to guide generation and to every model-backed planner call, so requests
such as "create a customer profile from the latest import" or "demonstrate
running a batch export in the reports tool" steer both the checklist and the
browser actions.

It generates a guide with ClipStitchr AI, saves it locally, creates a localhost
policy if one does not exist, verifies the page in a non-recorded browser,
records with the selected driver, and skips upload prompts by default. The
generated guide receives scanned route context and is rejected if it asks for
presenter-only behavior, such as pointing out or highlighting UI without a
browser action the agent can perform. The guide writer and planner also receive
capped app context from `.clipstitchr/app-context.json`, including source-derived
feature labels, inputs, buttons, modes, and picker actions from the linked app.
Those hints are intentionally generic: when a workflow has paired positive and
negative fields, the model chooses the one whose label matches the user's goal;
when a workflow uses selectable cards, rows, tiles, or media items, the planner
uses the generic card-selection action instead of an app-specific rule. If the
model-backed planner cannot continue because required clips, connected accounts,
selected assets, generated results, or permissions are missing, it can stop with
a plain-language reason explaining what setup is needed.

If one of those setup requirements is missing, the command stops with the next
setup command instead of asking questions.

## Test Coverage

The CLI package includes a local `npm test` command. It builds the package, then
runs Node test files under `packages/clipstitchr-cli/test/demoAgent/` and
`packages/clipstitchr-cli/test/demoAuto/`.

Current coverage includes:

- Observer fixture coverage for visible headings, buttons, links, labels,
  inputs, dialogs, disabled controls, selected controls, placeholders, and
  current field values.
- Deterministic planner tests for screenshot-first, safe typing, safe clicking,
  and step completion.
- Policy validator tests for blocked text, external origins, disallowed routes,
  selector-only clicks, safe demo typing, upload approval, approved upload files,
  and wrong step completion.
- Playwright executor fixture tests for visible clicks, select-button fallback
  to checkbox controls, safe typing, approved local file upload, visible-text
  waits, selects, key presses, field clearing, scroll-to actions, card actions,
  card selection with viewport centering, library choices, toggles, mode
  switches, menus, dialogs, drag/drop, sliders, media controls, downloads, copy
  buttons, job waits, and enabled-control waits.
- Full loop fixture tests for a safe multi-step guide flow, blocked observed
  page text, external navigation, disallowed routes, repeated page state, step
  timings, screenshot counts, auth walls, modal flows, long loading waits, 404
  page states, URL transition logging, time caps, action caps, and no-progress
  stops.
- Planner parser tests for supported JSON actions, the full expanded browser
  action set, unsupported action types, selector rejection, approved test-value
  keys, and direct safe demo text.
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
- `packages/clipstitchr-cli/src/project/scanAndWriteAppContext.ts`
- `packages/clipstitchr-cli/src/project/scanProjectWorkflowHints.ts`
- `web/app/api/cli/demo-agent/plan/route.ts`
- `web/lib/clipstitchr/server/cli/appContext/*`
- `web/lib/clipstitchr/server/cli/demoAgentPlanner/*`
- `web/lib/clipstitchr/server/createTextWritingPredictionInput.ts`
- `web/lib/clipstitchr/server/cli/demoWalkthrough/readCliDemoWalkthroughAgentRunMetadata.ts`
