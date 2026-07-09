# CLI Persistent TUI

The root `clipstitchr` command runs as one continuous terminal workspace. A
completed action returns input to the same mounted interface instead of printing
a fresh frame and creating another top-level prompt.

## User Experience

- Arrow keys move through the current menu and Enter chooses an action.
- Long menus stay inside a bounded window and follow the selected action.
- `/` opens the command composer from any menu. Pasted slash commands are
  accepted in one input event.
- Suggestions update locally while the user types. Tab accepts the highlighted
  command, subcommand, or option.
- Ctrl+P and Ctrl+N move backward and forward through commands used during the
  current session.
- Escape leaves the composer or returns from a submenu to the main menu.
- Completed commands and errors remain visible while the live menu and composer
  continue accepting input.
- Focused questions inside recording, setup, and destructive workflows keep
  using their existing prompts. The TUI yields input while those questions are
  open and resumes the same workspace afterward.
- While an action has control, the menu collapses to one working line so the
  action output and question are not surrounded by a duplicate interface.

The composer uses the existing deterministic slash-command registry. It does
not call AI or the ClipStitchr backend to generate suggestions.

## Runtime Design

`runInteractiveCommand` chooses the interface once:

1. Interactive terminals at least 56 columns wide mount `InteractiveTuiApp`
   through Ink. PTYs that do not report a usable width use an 80-column
   fallback.
2. `--plain`, `NO_COLOR=1`, narrow terminals, and non-TTY output use the
   existing Inquirer shell.
3. Direct Commander commands never mount the TUI, preserving stable output for
   scripts and pipes.

The Ink application owns menu, composer, cursor, suggestion, history, notice,
and running-action state. Menu actions and slash commands still call the same
services as direct CLI commands. Ink's console patching keeps normal command
logs readable above the live renderer. Before a delegated action starts, the
controller waits for Ink to release raw mode and then references and resumes
stdin. This keeps Inquirer questions alive instead of allowing Node to exit on
an unresolved prompt. The TUI runner unreferences stdin only when the workspace
actually closes.

Command helpers skip the repeated `ClipStitchr` brand while the TUI is active,
but retain their useful action subtitle and normal output. Direct commands keep
the complete brand header.

## Source References

- `packages/clipstitchr-cli/src/interactive/runInteractiveCommand.ts` selects
  the persistent or plain interface.
- `packages/clipstitchr-cli/src/interactiveTui/InteractiveTuiApp.tsx` composes
  the persistent workspace.
- `packages/clipstitchr-cli/src/interactiveTui/useInteractiveTuiController.ts`
  coordinates action transitions, notices, and running state.
- `packages/clipstitchr-cli/src/interactiveTui/useInteractiveTuiCommandComposer.ts`
  owns command editing, completion selection, and session history.
- `packages/clipstitchr-cli/src/interactiveTui/useInteractiveTuiMenuNavigation.ts`
  owns menu selection and keyboard navigation.
- `packages/clipstitchr-cli/src/interactiveTui/runInteractiveTuiMenuAction.ts`
  dispatches menu actions through existing services.
- `packages/clipstitchr-cli/src/interactiveTui/setInteractiveTuiStdinIsReferenced.ts`
  keeps delegated prompt input alive and releases it on exit.
- `packages/clipstitchr-cli/src/interactiveShell/dispatchSlashCommand.ts`
  remains the shared slash-command dispatcher.
- `packages/clipstitchr-cli/src/interactiveShell/getInteractiveTuiIsSupported.ts`
  owns fallback eligibility.

## File Tree

```text
packages/clipstitchr-cli/src/interactiveTui/
  InteractiveTuiApp.tsx
  InteractiveTuiActivityEntry.ts
  InteractiveTuiActivityItem.tsx
  InteractiveTuiActivityLog.tsx
  InteractiveTuiComposer.tsx
  InteractiveTuiHeader.tsx
  InteractiveTuiInput.ts
  InteractiveTuiMenu.tsx
  InteractiveTuiMode.ts
  InteractiveTuiNotice.tsx
  InteractiveTuiRunningView.tsx
  InteractiveTuiStatusBar.tsx
  InteractiveTuiSuggestions.tsx
  getInteractiveTuiMenuChoices.ts
  getInteractiveTuiVisibleChoices.ts
  getNextInteractiveTuiSelectionIndex.ts
  runInteractiveTui.tsx
  runInteractiveTuiMenuAction.ts
  setInteractiveTuiStdinIsReferenced.ts
  useInteractiveTuiActivity.ts
  useInteractiveTuiCommandComposer.ts
  useInteractiveTuiController.ts
  useInteractiveTuiExitInput.ts
  useInteractiveTuiMenuNavigation.ts
```

## Verification

The interactive TUI tests render the real Ink app, send terminal input, and
verify that menu navigation, slash execution, and Tab completion return to the
same workspace. Running-state tests verify that delegated questions get a clean
terminal handoff, and stdin lifecycle tests cover the prompt keepalive. Pure
tests cover menu reuse, selection wrapping, and action dispatch. The full CLI
suite continues covering the plain shell and direct commands.

This capability changes only local terminal interaction. It does not add or
change a backend operation, external provider call, or rate limit.
