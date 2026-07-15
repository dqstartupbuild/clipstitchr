# CLI Queue Submenu

`clipstitchr queue` opens a focused queue menu for common Post Bridge queue
actions. Direct commands such as `clipstitchr queue stitch --all` and
`clipstitchr queue swipe swipe_123` still work for scripts.

## Menu Actions

- Show upcoming queue for the next 24 hours.
- Queue latest Stitch.
- Queue all Stitches.
- Queue latest Swipe.
- Queue all Swipes.
- Queue everything.
- Queue a specific Stitch by ID.
- Queue a specific Swipe by ID.

The submenu routes to the same command runners as the direct commands.
`Show upcoming queue` uses `clipstitchr queue list`. Bulk queue actions stay
sequential and report partial failures through the shared queue result logger.

## Relevant Files

- `packages/clipstitchr-cli/src/queueMenu/createQueueMenuChoices.ts`
- `packages/clipstitchr-cli/src/queueMenu/runQueueMenuAction.ts`
- `packages/clipstitchr-cli/src/queueMenu/runQueueMenuCommand.ts`
- `packages/clipstitchr-cli/src/commands/runQueueAllCommand.ts`
- `packages/clipstitchr-cli/src/commands/runQueueStitchCommand.ts`
- `packages/clipstitchr-cli/src/commands/runQueueSwipeCommand.ts`
