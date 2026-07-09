# OpenAI Computer Relay And Native Helper

ClipStitchr can run OpenAI Computer Use in two modes for CLI demo recording.

## What It Does

- `--openai-mode direct` keeps the existing local-key behavior. The CLI calls
  OpenAI from the user's machine with local `OPENAI_API_KEY`.
- `--openai-mode relay` calls `POST /api/cli/openai/computer`. The CLI sends
  only the current task prompt or one screenshot response. ClipStitchr uses the
  server-side `OPENAI_API_KEY` and returns only the OpenAI response id plus
  computer-call actions.
- Relay mode never returns the OpenAI key to the CLI.
- Relay mode is explicit in terminal copy because screenshots pass through
  ClipStitchr servers before they reach OpenAI.
- `--surface browser` uses the existing Playwright browser adapter.
- `--surface macos-window` uses a local Swift helper to capture and control a
  selected visible macOS window.

## Mode Selection

`.clipstitchr.yml` can store:

```yaml
demoAgent:
  driver: openai-computer
  surface: browser
  openai:
    mode: relay
    model: gpt-5.5
```

The command line can override it:

```bash
clipstitchr demo agent --driver openai-computer --openai-mode relay
clipstitchr demo agent --driver openai-computer --openai-mode direct
clipstitchr demo agent --driver openai-computer --surface macos-window --openai-mode relay
```

When no mode is supplied, the CLI uses direct mode if a local OpenAI key exists.
If there is no local key and a valid ClipStitchr login exists, it uses relay.

## Relay API

The protected route is:

```text
POST /api/cli/openai/computer
```

It requires the normal CLI bearer token. The route validates the payload before
quota is consumed, consumes Convex rate limits before any OpenAI call, then
calls the OpenAI Responses API with the `computer` tool. The accepted payload is
intentionally small:

- `runId`
- `runStartedAt`
- `callIndex`
- `model`
- optional `previousResponseId`
- `input`, either the current task prompt string or one
  `computer_call_output` screenshot data URL

Limits:

- Prompt input is capped at 20,000 characters.
- Screenshot data URLs are capped at 8,000,000 base64 characters.
- A run is capped at 80 relay calls.
- A run must stay within 20 minutes of its start time.
- Convex enforces per-user hourly, per-user daily, per-run, global hourly, and
  shared provider-spend buckets.

## macOS Helper

The bundled helper source lives under:

```text
packages/clipstitchr-cli/native/macos-window-helper/
```

Install and check the helper with:

```bash
clipstitchr native init
clipstitchr native check
```

`clipstitchr native init` builds the bundled Swift helper and installs it to
`~/Library/Application Support/ClipStitchr/macos-window-helper` with metadata
for the current bundled source hash. Re-running the command is idempotent.
`clipstitchr native init --force` repairs or reinstalls the helper. Hidden
`native helper ...` commands remain available for older scripts.

The helper uses JSON over stdio. Supported commands are `check_permissions`,
`list_windows`, `select_window`, `capture_window`, `click`, `double_click`,
`move`, `drag`, `scroll`, `type_text`, `keypress`, and `wait`.

The helper needs macOS Screen Recording for screenshots and Accessibility for
input. If either permission is missing, the CLI stops before model actions and
prints the System Settings steps.

## Current Recording Boundary

Browser runs still save an MP4 through Playwright video recording. macOS window
runs currently save screenshots, run summary, and action logs. MP4 capture for
the selected native window remains with the existing manual native recorders
until a helper-owned video capture path is added.

## Source Files

- `web/app/api/cli/openai/computer/route.ts`
- `web/lib/clipstitchr/server/cli/openAiComputerRelay/*`
- `web/convex/rateLimiter.ts`
- `web/convex/rateLimits.ts`
- `packages/clipstitchr-cli/src/api/requestOpenAiComputerRelayResponse.ts`
- `packages/clipstitchr-cli/src/demoAgent/createOpenAiComputerRelayRequester.ts`
- `packages/clipstitchr-cli/src/demoAgent/runOpenAiComputerSurfaceDemoAgentLoop.ts`
- `packages/clipstitchr-cli/src/native/macosWindowHelper/*`
- `packages/clipstitchr-cli/native/macos-window-helper/*`
