# OpenAI Computer Demo Agent

The OpenAI Computer demo agent lets `clipstitchr demo auto` and
`clipstitchr demo agent run` control a browser with OpenAI Computer Use
instead of the structured JSON action planner.

## What It Does

- Adds `openai-computer` as a demo-agent driver.
- Uses `openai-computer` as the default driver when `OPENAI_API_KEY` is
  available.
- Keeps `structured-planner` as the no-key fallback and explicit cheap mode.
- Runs OpenAI Computer Use from the local CLI with `OPENAI_API_KEY`.
- Sends screenshots directly from the user's machine to OpenAI.
- Uses Playwright as the local browser "hands" for clicks, typing, scrolling,
  keypresses, drag, move, wait, and screenshots.
- Can target either a localhost app or an explicitly selected live/staging site.
- Logs every executed action, screenshot, URL before/after value, and policy
  decision under `.clipstitchr/agent-runs/<run-id>/`.
- Keeps screenshots local as evidence unless the reviewed MP4 is uploaded.

## Setup

```yaml
demoAgent:
  driver: openai-computer
  target: live
  liveUrl: https://example.com
  openai:
    model: gpt-5.5
```

The same driver can be selected for a single run:

```bash
clipstitchr demo auto --driver openai-computer
clipstitchr demo auto --driver openai-computer --target live --url https://example.com
clipstitchr demo agent run --guide guide_123 --driver openai-computer
clipstitchr demo agent run --guide guide_123 --driver openai-computer --target live --url https://example.com
```

`clipstitchr init` asks whether to use OpenAI Computer Use for automatic demos.
When OpenAI Computer Use is selected, it also asks whether automatic demos
should use the live site by default and stores that URL under
`demoAgent.liveUrl`. If `OPENAI_API_KEY` is missing, it still saves the
preference but warns that runs will fall back to `structured-planner` until the
key exists.

The key must be present in the local shell that runs the CLI. A key stored only
in Vercel can power deployed server routes, but it is not available to the
local screenshot/action loop unless the user exports it locally.

## How It Works

The CLI opens the existing isolated Playwright browser profile and navigates to
the selected target URL. If the page is a sign-in screen, the CLI pauses and
asks the user to sign in with a test account before recording starts. It then
checks that the browser returned to an allowed app page. For each guide step, it
sends OpenAI a short task
prompt with the current guide step, origin policy, route policy, blocked-action
rules, and capped source-derived app context from
`.clipstitchr/app-context.json`.

When OpenAI returns a `computer_call`, the CLI executes the batched
`actions[]` through Playwright. After the batch, the CLI captures a viewport
PNG, saves it to the run evidence directory, and sends it back as
`computer_call_output` with `detail: "original"`. The loop repeats until OpenAI
stops calling the computer tool, then the current guide step is marked done.

This follows OpenAI's current Computer Use guide:
`https://platform.openai.com/docs/guides/tools-computer-use`.

## Guardrails

The OpenAI driver reuses the demo-agent policy:

- Allowed origins are local by default.
- Live origins require an explicit `allowLiveOrigins: true` policy created by
  `--target live` or the saved `demoAgent.target: live` setting.
- Allowed routes are checked before and after actions.
- Observed page text is checked against blocked patterns before actions.
- Typed text is checked against blocked patterns before Playwright types it.
- The same max action and max recording time caps apply.
- Auth, billing, publishing, destructive actions, secret entry, and file upload
  are blocked by prompt rules and local policy checks.
- Upload still requires human review of the recording, screenshots, and action
  log.

If `OPENAI_API_KEY` is missing, the CLI uses the structured planner. Users can
also request that mode directly with `--driver structured-planner`. If an
OpenAI request or visual action fails during a run, the loop stops with a clear
stop reason in `action-log.jsonl` and `run-summary.json`.

## Target Modes

`local` is the default target. It uses `target.url`, a detected running
localhost URL, and the local start command when needed.

`live` uses the explicit `--url`, the selected product website URL, or
`demoAgent.liveUrl`. Localhost URLs are rejected in live mode so the selection
is unambiguous. The local start command is skipped for live runs. Automatic
guide generation for live targets asks for signed-out public-page flows unless
the user explicitly requests an auth preflight.

The browser agent can record non-web project types only in live mode with
OpenAI Computer Use, because it still needs a browser URL to control. This makes
demo recording available for apps such as native mobile, desktop, or backend
projects when they have a live or staging web surface to demonstrate.

## Native Device Boundary

OpenAI can guide a native app only when the CLI provides both screenshots and a
safe way to execute returned actions. The current implemented path is browser
control through Playwright, so local native projects should use one of these
paths:

- `clipstitchr demo auto --target live --url <live-or-staging-url>` when the
  product has a web surface to demonstrate.
- `clipstitchr demo make` when the demo must happen in an iOS Simulator,
  Android emulator/device, screen-mirrored phone, or iPhone Mirroring window.

Android automation can be built on ADB screenshots plus `input tap`, `input
text`, key events, and swipes. iOS Simulator can screenshot and record video
through `xcrun simctl`, but `simctl` does not provide tap/type/drag actions.
iPhone Mirroring and screen-mirroring control need a macOS window-capture and
Accessibility input adapter. Until those native adapters exist, the CLI does
not claim direct local device control.

## File Tree

- `packages/clipstitchr-cli/src/demoAgent/runOpenAiComputerDemoAgentLoop.ts`
- `packages/clipstitchr-cli/src/demoAgent/getDemoAgentObservationHasAuthState.ts`
- `packages/clipstitchr-cli/src/demoAgent/getDemoAgentUrlIsAuthRoute.ts`
- `packages/clipstitchr-cli/src/demoAgent/createDemoAgentUnsupportedTargetMessage.ts`
- `packages/clipstitchr-cli/src/demoAgent/resolveDemoAgentTargetMode.ts`
- `packages/clipstitchr-cli/src/demoAgent/resolveDemoAgentTargetUrl.ts`
- `packages/clipstitchr-cli/src/demoAgent/getDemoAgentProjectCanUseTarget.ts`
- `packages/clipstitchr-cli/src/demoAgent/requestOpenAiComputerResponse.ts`
- `packages/clipstitchr-cli/src/demoAgent/executeOpenAiComputerAction.ts`
- `packages/clipstitchr-cli/src/demoAgent/runDemoAgentDriverLoop.ts`
- `packages/clipstitchr-cli/src/demoAgent/resolveDemoAgentCommandDriver.ts`
- `packages/clipstitchr-cli/src/demoAgent/createOpenAiComputerInitialInput.ts`
- `packages/clipstitchr-cli/src/demoAgent/createOpenAiComputerScreenshotOutput.ts`
- `packages/clipstitchr-cli/src/demoAgent/captureOpenAiComputerScreenshot.ts`
- `packages/clipstitchr-cli/test/demoAgent/runOpenAiComputerDemoAgentLoop.test.ts`
- `packages/clipstitchr-cli/test/demoAgent/resolveDemoAgentTargetMode.test.ts`
- `packages/clipstitchr-cli/test/demoAgent/resolveDemoAgentTargetUrl.test.ts`
- `packages/clipstitchr-cli/test/demoAgent/getDemoAgentProjectCanUseTarget.test.ts`
- `packages/clipstitchr-cli/test/demoAgent/executeOpenAiComputerAction.test.ts`
- `packages/clipstitchr-cli/test/demoAgent/resolveDemoAgentCommandDriver.test.ts`

## Use Cases

- Run `clipstitchr demo auto --driver openai-computer` when the existing
  structured planner is too rigid for a visual workflow.
- Keep `structured-planner` for cheap deterministic local runs by selecting it
  explicitly.
- Use `clipstitchr demo agent run --guide <id> --driver openai-computer
  --dry-run` to inspect screenshots and logs before recording.
