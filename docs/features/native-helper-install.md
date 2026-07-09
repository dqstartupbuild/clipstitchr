# Native Helper Install

The ClipStitchr CLI installs the macOS window helper once per Mac. This lets
repos reuse the same helper instead of rebuilding from each worktree. The helper
is only for macOS visible-window automation today.

## How It Works

- `clipstitchr native init` builds the bundled Swift helper and copies the
  executable to `~/Library/Application Support/ClipStitchr/macos-window-helper`.
- The install writes `macos-window-helper.json` with a hash of the bundled
  helper source.
- Re-running `native init` skips work when the installed helper matches the
  bundled hash.
- `clipstitchr native init --force` rebuilds and reinstalls the helper.
- `clipstitchr native check` starts the installed helper and checks Screen
  Recording and Accessibility permissions.
- On Windows and Linux, `native init` and `native check` explain that native
  visible-window automation is not available yet while browser demos remain
  available.
- `native helper install` and `native helper check` remain hidden aliases.

## Platform Boundaries

The macOS helper can control visible iOS Simulator, iPhone Mirroring, Android
emulator, and selected desktop app windows because they are windows on the Mac.
Android manual recording is separate: it uses `adb screenrecord` and does not
give the AI direct ADB control. Future adapter notes use `android-adb` for
direct Android ADB AI control and `windows-window` for Windows visible-window
control, but those adapters are not implemented today.

## Relevant Files

- `packages/clipstitchr-cli/src/commands/runNativeInitCommand.ts`
- `packages/clipstitchr-cli/src/commands/runNativeHelperCheckCommand.ts`
- `packages/clipstitchr-cli/src/native/macosWindowHelper/ensureMacosWindowHelperInstalled.ts`
- `packages/clipstitchr-cli/src/native/macosWindowHelper/getInstalledMacosWindowHelperExecutablePath.ts`
- `packages/clipstitchr-cli/src/native/macosWindowHelper/MacosWindowHelperClient.ts`

## Use Cases

Use `native init` before AI window recording on macOS. Use `native check` when
macOS permissions change or when window control stops working.
