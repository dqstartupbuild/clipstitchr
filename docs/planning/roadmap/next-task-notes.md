# Next Task Notes

Use this file as the handoff pointer for the next agent session. Continue from
the current working tree, do not revert existing changes, read `AGENTS.md`
first, and follow the atomic file rules.

The full task breakdown now lives in the
[CLI task plans](../cli/task-plans.md).

## Required Implementation Direction

- Complete every task in `docs/planning/cli/task-plans.md`.
- Commit each task separately as you go.
- Run the relevant tests for each task before committing it.
- Keep backward-compatible command aliases where the plan calls for them.
- Update docs alongside code changes.
- After all tasks are complete and committed, make one final separate commit
  that bumps the CLI version to `0.2.0`.
