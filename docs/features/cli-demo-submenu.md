# CLI Demo Submenu

`clipstitchr demo` opens a focused interactive menu for demo work. It keeps the
direct command surface unchanged while giving users one place to find manual
recording, AI recording, guide work, policy setup, uploads, run logs, and macOS
window setup when available.

## How It Works

- `runCli` gives the `demo` command an action for the no-subcommand case.
- `runDemoMenuCommand` shows the prompt and passes the selected action to the
  menu router.
- `runDemoMenuAction` dispatches to the same command handlers used by direct
  terminal commands.
- `createDemoMenuChoices` adds the macOS setup option only on macOS.

## Relevant Files

- `packages/clipstitchr-cli/src/demoMenu/createDemoMenuChoices.ts`
- `packages/clipstitchr-cli/src/demoMenu/runDemoMenuAction.ts`
- `packages/clipstitchr-cli/src/demoMenu/runDemoMenuCommand.ts`
- `packages/clipstitchr-cli/src/commands/runCli.ts`

## User Flow

Users can run `clipstitchr demo`, choose `Record it myself`, `Let AI record it
for me`, `Create a guide`, `Check my safety policy`, `Upload a demo`, or
`Show AI run logs`. Direct commands such as `clipstitchr demo guide create`
continue to work for scripts.
