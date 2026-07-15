# CLI Command Discovery

ClipStitchr's persistent terminal workspace can find a command from the part a
user remembers. The matcher is local, deterministic, and shared by completion
and command execution.

## User Experience

- `/policy` suggests the complete `/demo policy` command group and its
  subcommands.
- `/policy edit` selects `/demo policy edit` without requiring the user to
  remember the `demo` parent first.
- `/guide save` finds `/demo guide save-instructions`.
- `/queue all` finds queue options written canonically with `--all`.
- A single adjacent typo such as `/polciy` still finds policy commands.
- Tab inserts the highlighted canonical command. If the command needs another
  token or value, it adds a trailing space.
- Enter runs a complete highlighted command. If the highlighted entry is a
  command group or required-value option, Enter completes it and keeps editing
  active.
- Ctrl+P and Ctrl+N browse commands run during the current TUI session.

No AI model, ClipStitchr API, or third-party service is used for matching. The
result order is stable for the same registry and input.

## Matching Rules

`interactiveCommandDefinitions` is the canonical source for interactive
command text, descriptions, completion behavior, and optional human search
terms. `scoreInteractiveCommandDefinition` ranks matches in this order:

1. Exact canonical command or exact search term.
2. Full command or search-term prefix.
3. Consecutive canonical token prefixes.
4. Ordered canonical token prefixes with gaps.
5. Searchable tokens in any order.
6. Limited edit-distance fallback for one longer token.

Leading slash and option dashes are ignored during token comparison, but the
canonical suggestion always keeps the real command syntax. Registry order
breaks score ties so parent commands and related variants remain predictable.

## Local Workspace Context

The TUI also reads local state before it opens and after each completed action.
The header displays the selected product, whether this repo is linked, and
whether saved CLI credentials are usable for the selected API. Missing login or
repo setup appears at the top of the main menu. Native tools, settings checks,
and CLI update stay available under Setup and account.

This context read uses `.clipstitchr.yml` and
`~/.clipstitchr/credentials.json`. It does not fetch account or product data.

## Source References

- `packages/clipstitchr-cli/src/interactiveShell/interactiveCommandDefinitions.ts`
  defines searchable commands and completion behavior.
- `packages/clipstitchr-cli/src/interactiveShell/scoreInteractiveCommandDefinition.ts`
  assigns deterministic match scores.
- `packages/clipstitchr-cli/src/interactiveShell/getSlashCommandSuggestionMatches.ts`
  ranks and limits visible matches.
- `packages/clipstitchr-cli/src/interactiveTui/useInteractiveTuiCommandComposer.ts`
  owns editing, selection, completion, and history.
- `packages/clipstitchr-cli/src/interactiveTui/resolveInteractiveTuiCommandSubmission.ts`
  decides whether Enter completes or runs a suggestion.
- `packages/clipstitchr-cli/src/interactiveShell/readInteractiveShellContext.ts`
  reads local workspace context.
- `packages/clipstitchr-cli/src/interactiveShell/createInteractiveShellMainChoices.ts`
  orders context-aware main-menu actions.

## File Tree

```text
packages/clipstitchr-cli/src/
  interactiveShell/
    InteractiveCommandDefinition.ts
    InteractiveShellContext.ts
    getDamerauLevenshteinDistance.ts
    getInteractiveCommandSearchTokens.ts
    getInteractiveShellContext.ts
    getSlashCommandSuggestionMatches.ts
    interactiveCommandDefinitions.ts
    readInteractiveShellContext.ts
    scoreInteractiveCommandDefinition.ts
  interactiveTui/
    createInteractiveTuiSuggestionCompletionText.ts
    getInteractiveTuiContextText.ts
    resolveInteractiveTuiCommandSubmission.ts
    useInteractiveTuiCommandComposer.ts
```

## Verification

Pure tests cover command token ranking, natural option matching, typo distance,
Enter completion, canonical execution, and local context derivation. Ink tests
exercise the real composer, nested-command execution, context-aware onboarding,
and context refresh after a completed setup action.

This feature changes only local terminal behavior. It adds no backend operation
and does not change any rate limit.
