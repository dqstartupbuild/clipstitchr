# OpenAI Computer Demo Agent

The OpenAI Computer demo agent lets `clipstitchr demo auto` and
`clipstitchr demo agent run` control a local browser with OpenAI Computer Use
instead of the structured JSON action planner.

## What It Does

- Adds `openai-computer` as a demo-agent driver.
- Keeps `structured-planner` as the default and fallback driver.
- Runs OpenAI Computer Use from the local CLI with `OPENAI_API_KEY`.
- Sends screenshots directly from the user's machine to OpenAI.
- Uses Playwright as the local browser "hands" for clicks, typing, scrolling,
  keypresses, drag, move, wait, and screenshots.
- Logs every executed action, screenshot, URL before/after value, and policy
  decision under `.clipstitchr/agent-runs/<run-id>/`.
- Keeps screenshots local as evidence unless the reviewed MP4 is uploaded.

## Setup

```yaml
demoAgent:
  driver: openai-computer
  openai:
    model: gpt-5.5
```

The same driver can be selected for a single run:

```bash
clipstitchr demo auto --driver openai-computer
clipstitchr demo agent run --guide guide_123 --driver openai-computer
```

`clipstitchr init` asks whether to use OpenAI Computer Use for automatic demos.
If `OPENAI_API_KEY` is missing, it still saves the preference but warns that
runs will fall back to `structured-planner` until the key exists.

## How It Works

The CLI opens the existing isolated Playwright browser profile and navigates to
the local app URL. For each guide step, it sends OpenAI a short task prompt with
the current guide step, local origin policy, route policy, blocked-action rules,
and capped source-derived app context from `.clipstitchr/app-context.json`.

When OpenAI returns a `computer_call`, the CLI executes the batched
`actions[]` through Playwright. After the batch, the CLI captures a viewport
PNG, saves it to the run evidence directory, and sends it back as
`computer_call_output` with `detail: "original"`. The loop repeats until OpenAI
stops calling the computer tool, then the current guide step is marked done.

This follows OpenAI's current Computer Use guide:
`https://platform.openai.com/docs/guides/tools-computer-use`.

## Guardrails

The OpenAI driver reuses the local demo-agent policy:

- Allowed origins must be local origins.
- Allowed routes are checked before and after actions.
- Observed page text is checked against blocked patterns before actions.
- Typed text is checked against blocked patterns before Playwright types it.
- The same max action and max recording time caps apply.
- Auth, billing, publishing, destructive actions, secret entry, and file upload
  are blocked by prompt rules and local policy checks.
- Upload still requires human review of the recording, screenshots, and action
  log.

If `OPENAI_API_KEY` is missing, the CLI uses the structured planner. If an
OpenAI request or visual action fails during a run, the loop stops with a clear
stop reason in `action-log.jsonl` and `run-summary.json`.

## File Tree

- `packages/clipstitchr-cli/src/demoAgent/runOpenAiComputerDemoAgentLoop.ts`
- `packages/clipstitchr-cli/src/demoAgent/requestOpenAiComputerResponse.ts`
- `packages/clipstitchr-cli/src/demoAgent/executeOpenAiComputerAction.ts`
- `packages/clipstitchr-cli/src/demoAgent/runDemoAgentDriverLoop.ts`
- `packages/clipstitchr-cli/src/demoAgent/resolveDemoAgentCommandDriver.ts`
- `packages/clipstitchr-cli/src/demoAgent/createOpenAiComputerInitialInput.ts`
- `packages/clipstitchr-cli/src/demoAgent/createOpenAiComputerScreenshotOutput.ts`
- `packages/clipstitchr-cli/src/demoAgent/captureOpenAiComputerScreenshot.ts`
- `packages/clipstitchr-cli/test/demoAgent/runOpenAiComputerDemoAgentLoop.test.ts`
- `packages/clipstitchr-cli/test/demoAgent/executeOpenAiComputerAction.test.ts`
- `packages/clipstitchr-cli/test/demoAgent/resolveDemoAgentCommandDriver.test.ts`

## Use Cases

- Run `clipstitchr demo auto --driver openai-computer` when the existing
  structured planner is too rigid for a visual workflow.
- Keep `structured-planner` for cheap deterministic local runs.
- Use `clipstitchr demo agent run --guide <id> --driver openai-computer
  --dry-run` to inspect screenshots and logs before recording.
