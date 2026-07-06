# CLI Branded Output

The ClipStitchr CLI uses light branded terminal output for guided flows without
becoming a full-screen terminal app.

## What It Does

- Shows a small `ClipStitchr` header at the start of guided commands.
- Marks progress with `[info]`, `[..]`, `[ok]`, and `[warn]` labels.
- Prints setup details as key/value rows for `status` and `doctor`.
- Prints useful next commands after important actions.
- Keeps `clipstitchr products list` tab-separated for scripting.
- Supports plain output with `clipstitchr --plain ...` and `NO_COLOR=1`.

## How It Works

The terminal helpers live under `packages/clipstitchr-cli/src/terminal/`.
Formatting is dependency-free and uses ANSI escape codes only when stdout is an
interactive terminal.

`shouldUseTerminalColor` returns false when:

- stdout is not a TTY.
- `NO_COLOR` is set.
- `CLIPSTITCHR_PLAIN=1` is set by the global `--plain` option.

Command files call focused helpers such as `logBrandHeader`, `logStep`,
`logSuccess`, `logWarning`, `logKeyValue`, and `logNextCommand`. Raw ANSI codes
stay inside the terminal helpers.

## Source References

- `packages/clipstitchr-cli/src/commands/runCli.ts` defines `--plain` and sets
  `CLIPSTITCHR_PLAIN`.
- `packages/clipstitchr-cli/src/terminal/shouldUseTerminalColor.ts` controls
  whether color is allowed.
- `packages/clipstitchr-cli/src/terminal/colorize.ts` wraps text with ANSI
  codes when color is enabled.
- `packages/clipstitchr-cli/src/auth/login.ts` shows the branded device-flow
  login output.
- `packages/clipstitchr-cli/src/commands/runDemoMakeCommand.ts` shows branded
  recording and upload progress.
- `packages/clipstitchr-cli/src/commands/runStatusCommand.ts` and
  `packages/clipstitchr-cli/src/commands/runDoctorCommand.ts` show setup
  summaries.

## File Tree

```text
packages/clipstitchr-cli/src/
  terminal/
    TerminalAnsiCode.ts
    colorize.ts
    formatAccentText.ts
    formatBoldText.ts
    formatCommandText.ts
    formatErrorText.ts
    formatMutedText.ts
    formatSuccessText.ts
    formatWarningText.ts
    logBrandHeader.ts
    logInfo.ts
    logKeyValue.ts
    logNextCommand.ts
    logSection.ts
    logStep.ts
    logSuccess.ts
    logWarning.ts
    shouldUseTerminalColor.ts
    terminalAnsiCodes.ts
```
