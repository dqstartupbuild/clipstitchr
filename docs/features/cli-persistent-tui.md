# CLI Persistent TUI

The root `clipstitchr` command runs as one continuous terminal workspace. A
completed action returns input to the same mounted interface instead of printing
a fresh frame and creating another top-level prompt.

## User Experience

- Arrow keys move through the current menu and Enter chooses an action.
- Long menus stay inside a bounded window and follow the selected action.
- `/` opens the command composer from any menu. Pasted slash commands are
  accepted in one input event.
- Suggestions update locally while the user types. Command tokens can be
  entered without their full parent path, so `/policy edit` finds
  `/demo policy edit`. Natural option tokens such as `/queue all` work without
  typing option punctuation, and a nearby typo in a longer token is tolerated.
- Tab accepts the highlighted command, subcommand, or option. Enter runs a
  complete highlighted command. For a command group or required-value option,
  Enter completes the group and leaves the composer open for the next token.
- Ctrl+P and Ctrl+N move backward and forward through commands used during the
  current session.
- Home, End, Ctrl+A, and Ctrl+E move within the command line. Arrow keys move
  through suggestions, then through history when no suggestions are available.
- Escape leaves the composer or returns from a submenu to the main menu.
- The header shows the selected product plus local repo and account connection
  state. The main menu puts missing account or repo setup first and refreshes
  that local context after each action.
- Completed commands and errors remain visible while the live menu and composer
  continue accepting input.
- A completed action opens a result view instead of immediately replacing its
  output with the action list. Page Up and Page Down move through longer output.
  Back returns to the originating action menu; Main menu, slash command, and
  Exit remain directly available.
- Menu height follows the current terminal row count. Shorter terminals show a
  smaller moving choice window so the ClipStitchr header remains on screen.
- The interactive workspace uses the terminal's alternate screen. It starts at
  the top, keeps one header above menus and results, and restores the previous
  terminal screen when the CLI exits.
- Focused questions inside recording, setup, and destructive workflows keep
  using their existing prompts. The TUI yields input while those questions are
  open and resumes the same workspace afterward.
- While an action has control, the menu collapses to one working line so the
  action output and question are not surrounded by a duplicate interface.

The composer uses one deterministic command registry shared by suggestion and
completion behavior. Search ranks exact commands, prefixes, ordered command
tokens, meaningful aliases, and limited typo matches. It does not call AI or
the ClipStitchr backend to generate suggestions. Header context reads only the
local project config and saved CLI credentials.

## Runtime Design

`runInteractiveCommand` chooses the interface once:

1. Interactive terminals at least 56 columns wide mount `InteractiveTuiApp`
   through Ink. PTYs that do not report a usable width use an 80-column
   fallback.
2. `--plain`, `NO_COLOR=1`, narrow terminals, and non-TTY output use the
   existing Inquirer shell.
3. Direct Commander commands never mount the TUI, preserving stable output for
   scripts and pipes.

The Ink application owns menu, result, composer, cursor, suggestion, history,
notice, and running-action state. Menu actions and slash commands still call the
same services as direct CLI commands. While an action runs, normal console
output is buffered without terminal color codes instead of being printed above
the header. After completion, the alternate screen resets to the top and that
captured output is rendered in a bounded result page.
Before a delegated action starts, the controller waits for Ink to release raw
mode and then references and resumes stdin. It references and resumes stdin
again after the action succeeds, fails, or is canceled because Inquirer may
pause the stream while cleaning up its prompt. This keeps both the question and
the restored menu alive. The TUI runner unreferences stdin only when the
workspace actually closes.

Command helpers skip the repeated `ClipStitchr` brand while the TUI is active,
but retain their useful action subtitle and normal output. Direct commands keep
the complete brand header.

## Source References

- `packages/clipstitchr-cli/src/interactive/runInteractiveCommand.ts` selects
  the persistent or plain interface.
- `packages/clipstitchr-cli/src/interactiveTui/InteractiveTuiApp.tsx` composes
  the persistent workspace.
- `packages/clipstitchr-cli/src/interactiveTui/useInteractiveTuiController.ts`
  coordinates menu, action, result, and running transitions.
- `packages/clipstitchr-cli/src/interactiveTui/captureInteractiveTuiActionOutput.ts`
  retains normal action output for the result view.
- `packages/clipstitchr-cli/src/interactiveTui/InteractiveTuiResultOutput.tsx`
  renders the bounded, pageable result.
- `packages/clipstitchr-cli/src/interactiveTui/createInteractiveTuiResultChoices.ts`
  defines result navigation.
- `packages/clipstitchr-cli/src/interactiveTui/getInteractiveTuiMaximumVisibleChoices.ts`
  keeps menus inside the available terminal rows.
- `packages/clipstitchr-cli/src/interactiveTui/enterInteractiveTuiScreen.ts`
  opens and clears the alternate terminal screen.
- `packages/clipstitchr-cli/src/interactiveTui/resetInteractiveTuiScreen.ts`
  anchors a completed result at the top of the screen.
- `packages/clipstitchr-cli/src/interactiveTui/exitInteractiveTuiScreen.ts`
  restores the user's original terminal screen.
- `packages/clipstitchr-cli/src/interactiveTui/useInteractiveTuiCommandComposer.ts`
  owns command editing, completion selection, and session history.
- `packages/clipstitchr-cli/src/interactiveShell/interactiveCommandDefinitions.ts`
  defines canonical interactive commands and completion behavior.
- `packages/clipstitchr-cli/src/interactiveShell/scoreInteractiveCommandDefinition.ts`
  ranks deterministic command matches.
- `packages/clipstitchr-cli/src/interactiveShell/readInteractiveShellContext.ts`
  reads local product, repo, and account context.
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
  InteractiveTuiComposer.tsx
  InteractiveTuiHeader.tsx
  InteractiveTuiInput.ts
  InteractiveTuiMenu.tsx
  InteractiveTuiMode.ts
  InteractiveTuiNotice.tsx
  InteractiveTuiOutputStream.ts
  InteractiveTuiRunningView.tsx
  InteractiveTuiResultAction.ts
  InteractiveTuiResultOutput.tsx
  InteractiveTuiStatusBar.tsx
  InteractiveTuiSuggestions.tsx
  captureInteractiveTuiActionOutput.ts
  createInteractiveTuiSuggestionCompletionText.ts
  createInteractiveTuiResultChoices.ts
  enterInteractiveTuiScreen.ts
  exitInteractiveTuiScreen.ts
  getInteractiveTuiContextText.ts
  getInteractiveTuiMaximumVisibleChoices.ts
  getInteractiveTuiMenuChoices.ts
  getInteractiveTuiResultPageSize.ts
  getInteractiveTuiVisibleChoices.ts
  getInteractiveTuiVisibleResultLines.ts
  getNextInteractiveTuiSelectionIndex.ts
  runInteractiveTui.tsx
  runInteractiveTuiMenuAction.ts
  resolveInteractiveTuiCommandSubmission.ts
  resetInteractiveTuiScreen.ts
  setInteractiveTuiStdinIsReferenced.ts
  useInteractiveTuiCommandComposer.ts
  useInteractiveTuiController.ts
  useInteractiveTuiExitInput.ts
  useInteractiveTuiMenuNavigation.ts
  useInteractiveTuiResultOutputNavigation.ts
```

## Verification

The interactive TUI tests render the real Ink app, send terminal input, and
verify menu navigation, ranked token lookup, canonical Enter execution, Tab
completion, retained results, result navigation, context refresh, and return to
the same workspace. Running-state tests verify that delegated questions get a
clean terminal handoff, and stdin lifecycle tests cover the prompt keepalive.
Pure tests cover ranking, typo distance, local context, menu reuse, selection
wrapping, and action dispatch. The full CLI suite continues covering the plain
shell and direct commands.

This capability changes only local terminal interaction. It does not add or
change a backend operation, external provider call, or rate limit.
