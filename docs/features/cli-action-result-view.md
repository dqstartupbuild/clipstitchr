# CLI Action Result View

The persistent ClipStitchr terminal keeps completed action output on screen
until the user decides where to go next. It does not immediately replace a
product list, status report, queue result, or setup summary with the previous
action menu.

## User Experience

After a menu action or slash command finishes, the workspace shows:

- the ClipStitchr header and current product/repo/account context;
- a bounded Result section containing the action's terminal output;
- `Back to <menu>` to restore the originating action list;
- `Main menu` when the result came from a submenu;
- `Type a slash command` and `Exit`;
- Page Up and Page Down navigation when the result has more lines.

Errors use the same result state. Any output produced before the failure stays
visible, followed by the error message. Escape returns to the originating menu,
and `/` opens the command composer without first restoring the action list.

The ordinary action list is also bounded by terminal height. This keeps the
ClipStitchr header visible when the terminal has fewer rows while arrow-key
navigation continues to follow the selected action. Result mode removes the
larger keyboard status box and always shows all result controls, leaving room
for multiple result lines before paging.

Menu mode uses the same compact layout principle: shortcut help takes one line,
and the command editor appears only after `/` is pressed. The menu row budget
leaves six visible choices on a 16-row terminal and up to nine on larger ones.

## Runtime Design

`captureInteractiveTuiActionOutput` temporarily wraps `console.log`,
`console.warn`, and `console.error` for one action. It buffers a plain-text copy
with terminal control codes removed instead of printing output above the live
header. The original console methods are restored in `finally`, including when
the action fails.

The TUI enters the terminal's alternate screen when it starts. After an action,
the controller clears that screen and moves the cursor home before rendering
the retained result, which keeps the header anchored above every result. Exit
restores the terminal screen that was visible before ClipStitchr launched.

The controller stores the captured lines and changes from `running` to `result`
instead of changing directly back to `menu`. Result controls are supplied by
`createInteractiveTuiResultChoices`. `result:back` is the only control that
restores the originating action menu. Main menu, slash command, Escape, and Exit
retain their existing meanings.

Result lines and menu choices have separate bounded windows. Result Page Up and
Page Down input changes only the output page; Up and Down continue selecting a
result control. Terminal row calculations reserve space for the header and all
result controls while prioritizing multiple output lines.

## Source References

- `packages/clipstitchr-cli/src/interactiveTui/captureInteractiveTuiActionOutput.ts`
  captures one action's plain terminal output.
- `packages/clipstitchr-cli/src/interactiveTui/useInteractiveTuiController.ts`
  owns result state and transitions.
- `packages/clipstitchr-cli/src/interactiveTui/InteractiveTuiResultOutput.tsx`
  renders the current output page.
- `packages/clipstitchr-cli/src/interactiveTui/createInteractiveTuiResultChoices.ts`
  defines result controls.
- `packages/clipstitchr-cli/src/interactiveTui/useInteractiveTuiResultOutputNavigation.ts`
  handles Page Up and Page Down.
- `packages/clipstitchr-cli/src/interactiveTui/getInteractiveTuiMaximumVisibleChoices.ts`
  adjusts action-menu height to terminal rows.
- `packages/clipstitchr-cli/src/interactiveTui/enterInteractiveTuiScreen.ts`
  anchors the full-screen workspace.
- `packages/clipstitchr-cli/src/interactiveTui/resetInteractiveTuiScreen.ts`
  clears prompt or action output before a retained result renders.
- `packages/clipstitchr-cli/src/interactiveTui/exitInteractiveTuiScreen.ts`
  restores the original terminal screen.

## File Tree

```text
packages/clipstitchr-cli/src/interactiveTui/
  InteractiveTuiResultAction.ts
  InteractiveTuiResultOutput.tsx
  InteractiveTuiOutputStream.ts
  captureInteractiveTuiActionOutput.ts
  createInteractiveTuiResultChoices.ts
  enterInteractiveTuiScreen.ts
  exitInteractiveTuiScreen.ts
  getInteractiveTuiMaximumVisibleChoices.ts
  getInteractiveTuiResultPageSize.ts
  getInteractiveTuiVisibleResultLines.ts
  resetInteractiveTuiScreen.ts
  useInteractiveTuiResultOutputNavigation.ts
```

## Verification

Pure tests cover console restoration, retained output on success and failure,
result controls, page bounds, and terminal-row menu limits. Ink tests run the
real persistent app, print product output, verify that the action list stays
hidden, and confirm Back restores the originating menu.

This feature changes only local terminal behavior. It adds no backend operation
and does not change any rate limit.
