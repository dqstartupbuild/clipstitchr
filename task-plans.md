# ClipStitchr CLI Task Plans

This file is the implementation handoff for the CLI command review work that
was previously listed in `next-task.md`.

## Execution Rules

- Complete every task in this file. The intended outcome is all tasks complete,
  not a partial pass.
- Start by reading `AGENTS.md`, `coding-guidelines.md`, and any feature docs
  touched by the task.
- Continue from the current working tree. Do not revert user changes unless the
  user explicitly asks.
- Follow the atomic file rules: one component, helper, type, command runner, or
  focused concept per file.
- Commit each task separately as you go, immediately after the task is complete
  and verified. Use the suggested commit message unless the final change needs
  a more precise message.
- Run the most relevant tests after each task. Prefer the CLI package tests for
  CLI work, and add web tests only when web code changes.
- When a task adds or changes a user-triggered backend operation, identify the
  abuse surface, add or update server-side rate limits before expensive work,
  and update `docs/backend/rate-limits.md`.
- Keep backward-compatible aliases where practical, but hide legacy commands
  from primary help and docs when they are no longer the preferred command.
- Keep user-facing copy plain, human, and non-technical.
- After all tasks below are complete and committed, make one final separate
  commit that bumps the CLI package version to `0.2.0`.

## Global Target CLI Shape

- `clipstitchr` opens the persistent interactive CLI.
- `clipstitchr demo` opens the demo submenu.
- `clipstitchr demo manual` records a demo manually.
- `clipstitchr demo agent` records a demo with the automated AI agent.
- `clipstitchr demo agent --guide <id-or-path>` records with an existing guide.
- `clipstitchr demo upload <file>` uploads an existing demo file.
- `clipstitchr demo guide create` creates an AI walkthrough guide.
- `clipstitchr demo guide list` lists saved guides with readable names.
- `clipstitchr demo guide show <guide>` shows a guide by name, ID, or path.
- `clipstitchr demo guide edit <guide>` edits a guide by name, ID, or path.
- `clipstitchr demo guide delete <guide>` deletes a guide by name, ID, or path.
- `clipstitchr demo guide save-instructions <guide>` saves portable guide
  instructions locally. Keep `export-instructions` as a legacy alias.
- `clipstitchr demo policy init` creates and reviews the safety policy.
- `clipstitchr demo policy check` checks the saved safety policy.
- `clipstitchr demo policy edit` edits the saved safety policy.
- `clipstitchr demo logs <runId>` shows local logs for an automated demo run.
- `clipstitchr queue` opens the queue submenu.
- `clipstitchr queue stitch`, `clipstitchr queue stitch <stitchId>`, and
  `clipstitchr queue stitch --all` queue Stitches.
- `clipstitchr queue swipe`, `clipstitchr queue swipe <swipeId>`, and
  `clipstitchr queue swipe --all` queue Swipes.
- `clipstitchr queue --all` queues all active Stitches and Swipes sequentially
  in a randomized mixed order.
- `clipstitchr queue list` shows queued items for up to the next 24 hours.
- Hide or de-emphasize `clipstitchr library ...` commands because browsing
  belongs in the dashboard.
- `clipstitchr stitchr new` starts a new Stitchr batch.
- `clipstitchr swipr new` starts new Swipr drafts.
- Keep `stitchr batch`, `swipr batch`, `demo make`, `demo auto`,
  `demo guide generate`, `demo agent init`, `demo agent check`,
  `demo agent run`, and `demo agent export-log` as compatibility aliases where
  practical.
- `clipstitchr products` opens the products submenu.
- `clipstitchr products list`, `clipstitchr products create`, and
  `clipstitchr products use [productId]` stay available as direct commands.
- `clipstitchr native init` prepares this Mac for native/window demos.
- `clipstitchr native check` checks the installed helper and macOS permissions.
- `clipstitchr native init --force` repairs or reinstalls the native helper.

## 1. Make `clipstitchr demo policy init` Fully Interactive

Goal: First-time users can create a safe local demo agent policy from the CLI
without opening JSON by hand, and returning users can review and edit the saved
policy.

Implementation:

- Keep the current quick-start policy defaults.
- Add a review/edit flow for allowed origins, allowed routes, live-site
  allowance, max actions, max recording seconds, approved test values, blocked
  text patterns, file upload allowance, approved upload files,
  review-before-upload behavior, and test account notes.
- Require explicit approval before allowing live origins.
- Require selected approved files before uploads are allowed.
- Clamp action and time limits to safe bounds in the policy validation path.
- Add a reusable policy editor flow so `demo policy init` and
  `demo policy edit` share behavior without duplicating logic.

Docs:

- Update CLI README, customer CLI docs, and the demo agent feature docs with the
  new setup and edit flow.

Tests:

- Add or update tests for policy creation, policy normalization, policy editing,
  risky option validation, and legacy default behavior.

Acceptance:

- `clipstitchr demo policy init` creates a safe policy interactively.
- `clipstitchr demo policy edit` updates an existing policy from the CLI.
- Quick local setup remains easy for users who accept defaults.

Suggested commit: `Add interactive demo policy setup`

## 2. Move Policy Commands Under `demo policy`

Goal: Make policy setup and checking clearly belong to the safety policy, not
the automated demo runner.

Implementation:

- Add a `demo policy` command group with `init`, `check`, and `edit`.
- Wire `demo policy init` to the interactive setup from task 1.
- Wire `demo policy check` to the existing policy check behavior.
- Keep `demo agent init` and `demo agent check` as compatibility aliases.
- Update help descriptions so users understand the policy is the local safety
  rulebook for AI demo recording.

Docs:

- Update README, customer CLI docs, and feature docs to prefer
  `demo policy ...`.
- Mention old `demo agent init/check` only as legacy aliases when useful.

Tests:

- Add command registration/help tests for the new policy commands and aliases.
- Keep existing policy command tests passing through the alias path.

Acceptance:

- Users can run `clipstitchr demo policy init`, `check`, and `edit`.
- Existing `clipstitchr demo agent init` and `clipstitchr demo agent check`
  still work.

Suggested commit: `Move demo policy commands`

## 3. Explain Guide Instruction Export Use Cases In User Docs

Goal: Users understand why and when to save portable guide instructions.

Implementation:

- Keep the current export behavior unless task 5 or another rename task changes
  the primary command name.
- Explain that saved instructions are local files only. They are not uploaded,
  published, or sent anywhere.
- Describe use cases in plain language: human recorder handoff, another AI or
  local agent tool, pre-recording review, sharing without account access,
  archiving the plan, and pairing instructions with the matching safety policy.
- Decide after the command rename work whether the primary command should be
  `save-instructions`, with `export-instructions` as an alias.

Docs:

- Update `web/lib/clipstitchr/docs/clipstitchrCliDoc.ts`.
- Add a short mention to the landing-page CLI section only if that section
  already covers guides at the same level of detail.

Tests:

- Run the relevant web typecheck or docs tests if the customer docs are typed.

Acceptance:

- A user reading the CLI guide understands why to save guide instructions.
- The docs clearly state what files are created and that nothing is uploaded.

Suggested commit: `Explain guide instruction exports`

## 4. Give Demo Guides Human-Readable Names

Goal: Saved walkthrough guides are easy to scan and can be referenced by a
memorable name instead of only a generated ID.

Implementation:

- Add a human-readable guide name to the saved guide model.
- Generate a simple name from the guide title, goal, or main demonstrated flow
  when a guide is created.
- Preserve existing guide IDs and file paths for scripts and compatibility.
- Update guide resolution so `show`, `edit`, `delete`, manual recording, and
  automated recording accept ID, path, or readable name.
- If a name is ambiguous, fail with a helpful list of matching names and IDs, or
  use an interactive chooser when the terminal is interactive.
- Keep storage migration tolerant: existing saved guides without names should
  still load and should display a generated fallback name.

Docs:

- Update README, customer CLI docs, and guide feature docs.

Tests:

- Add tests for guide name creation, list display, name resolution, ID
  resolution, path resolution, missing names, and ambiguous names.

Acceptance:

- `demo guide list` shows readable names prominently.
- Guide commands work with readable names, IDs, and paths.
- Ambiguous names produce a clear next step.

Suggested commit: `Add readable demo guide names`

## 5. Rename `demo guide generate` To `demo guide create`

Goal: Use the clearer user-facing verb `create` for AI walkthrough guide
creation.

Implementation:

- Add `clipstitchr demo guide create` as the primary command.
- Keep `clipstitchr demo guide generate` as a compatibility alias.
- Prefer help text such as `Create a walkthrough guide`.
- Update menus and direct command examples to use `create`.

Docs:

- Update README, customer CLI docs, and guide feature docs to prefer
  `demo guide create`.

Tests:

- Add command tests that verify `create` runs the guide generation flow and
  `generate` still works as an alias.

Acceptance:

- Users can run `clipstitchr demo guide create`.
- Existing `clipstitchr demo guide generate` still works.

Suggested commit: `Rename demo guide create command`

## 6. Add An Interactive `clipstitchr demo` Menu

Goal: Running `clipstitchr demo` opens a focused demo menu instead of only
showing command help.

Implementation:

- Add a demo submenu that exposes manual recording, automated recording, guide
  creation and management, policy setup/check/edit, upload, logs, and native
  helper setup when appropriate.
- Use plain labels such as `Record it myself`, `Let AI record it for me`,
  `Create a guide`, `Check my safety policy`, and `Upload a demo`.
- Preserve every direct `clipstitchr demo ...` command for scripts.
- Return to the demo submenu after actions once the persistent shell task is in
  place.

Docs:

- Update README and customer CLI docs to mention `clipstitchr demo` as the
  discoverable menu entry.

Tests:

- Add menu routing tests where the interactive prompts can be isolated.

Acceptance:

- Running `clipstitchr demo` without a subcommand opens a useful demo menu.
- The menu exposes manual recording, AI recording, guide work, policy work,
  uploads, and logs.

Suggested commit: `Add demo submenu`

## 7. Let The Main Menu Choose Manual Or Automated Demo Creation

Goal: The root interactive menu should not hide the automated demo path behind
the manual recording action.

Implementation:

- Change the root menu demo action to ask whether the user wants to record
  manually or let AI record.
- Route `Record it myself` to the manual demo flow.
- Route `Let AI record it for me` to the automated demo agent flow.
- Keep safety copy clear before automated runs, especially for live sites,
  relay screenshots, and policy limits.

Docs:

- Update README and customer CLI docs if they describe the root menu.

Tests:

- Add menu routing tests for the two demo choices.

Acceptance:

- Users can choose manual or automated demo creation from the root menu.
- Direct manual and automated commands continue to work.

Suggested commit: `Expose AI demo recording in main menu`

## 8. Rename `demo make` To `demo manual`

Goal: Make the manual recording command match the user's choice between manual
and AI-created demos.

Implementation:

- Add `clipstitchr demo manual` as the primary manual recording command.
- Keep `clipstitchr demo make` as a compatibility alias.
- Preserve existing manual options: `--guide`, `--no-guide`, `--no-upload`,
  `--output`, `--product`, `--start`, and `--url`.
- Update root and demo menus to use labels like `Record it myself`.

Docs:

- Update README, customer CLI docs, and manual/demo feature docs to prefer
  `demo manual`.

Tests:

- Add command tests that verify `manual` and `make` both reach the same handler
  and support the same options.

Acceptance:

- Users can run `clipstitchr demo manual`.
- Existing `clipstitchr demo make` still works.

Suggested commit: `Rename manual demo command`

## 9. Rename `demo agent export-log` To `demo logs`

Goal: Use a shorter command name that describes showing local logs for an
automated demo run.

Implementation:

- Add `clipstitchr demo logs <runId>` as the primary command.
- Keep `clipstitchr demo agent export-log <runId>` as a compatibility alias.
- Preserve existing behavior: without `--output`, print summary, action log,
  and screenshot paths; with `--output`, write a compact JSON file.
- Update help text to say `Show local logs for an automated demo run`.
- Include logs in the demo submenu. Prompt for the run ID when needed.

Docs:

- Update README, customer CLI docs, and demo agent feature docs.
- Avoid the word `export` except when describing the optional `--output` file.

Tests:

- Add command tests for `demo logs`, `--output`, and the legacy alias.

Acceptance:

- Users can run `clipstitchr demo logs <runId>`.
- Existing `demo agent export-log` still works.

Suggested commit: `Rename demo agent logs command`

## 10. Fold `demo agent run` Into `demo agent` And Remove Dry Run

Goal: Make `clipstitchr demo agent` the primary automated demo command, whether
it creates a new guide or uses an existing one.

Implementation:

- Add options directly to `demo agent`, including `--guide <id-or-path>`.
- When `--guide` is provided, use the existing guide.
- When no guide is provided, create a new AI guide using the current `demo auto`
  path before recording.
- Add upload behavior flags: default asks for review/upload approval after the
  run, `--no-upload` skips upload, and `--upload` uploads without prompting.
- Remove `--dry-run` from primary help and docs. If legacy dry-run support is
  kept for compatibility, hide it and do not present it as a normal user path.
- Keep `demo auto` and `demo agent run --guide ...` as compatibility aliases
  where practical.
- Preserve evidence logs, screenshots, and run summaries for review after each
  run.

Docs:

- Update README, customer CLI docs, and demo agent feature docs to prefer
  `demo agent` and `demo agent --guide ...`.

Tests:

- Add command tests for `demo agent`, `demo agent --guide`, upload flag
  behavior, and legacy aliases.
- Keep existing automated run tests passing after handler extraction.

Acceptance:

- `clipstitchr demo agent` records with a newly created guide.
- `clipstitchr demo agent --guide <id-or-path>` records with an existing guide.
- Primary help and docs no longer push `demo auto`, `demo agent run`, or
  `--dry-run`.

Suggested commit: `Promote demo agent command`

## 11. Rename Native Helper Setup To `native init`

Goal: Users install the native helper once per Mac and reuse it across repos.

Implementation:

- Add `clipstitchr native init` as the primary setup command.
- Build the Swift helper and install or copy it to a stable user-level path,
  such as `~/Library/Application Support/ClipStitchr/`.
- Add helper version metadata so the CLI reinstalls only when the bundled helper
  changes.
- Make setup idempotent: install when missing, reinstall when outdated, repair
  when broken, and force reinstall with `--force`.
- Add `clipstitchr native check` as the primary verification command.
- Make native/window demo runs use the installed helper instead of rebuilding
  from the current package or worktree.
- Keep `native helper install` and `native helper check` as compatibility
  aliases.
- Hide `native helper build` from normal user-facing help. Keep it only as an
  internal or developer alias if still useful.

Docs:

- Update README, customer CLI docs, native helper feature docs, and command
  messages with the once-per-Mac install model.

Tests:

- Add tests for install path resolution, version metadata, idempotent init,
  forced reinstall, compatibility aliases, and check behavior.

Acceptance:

- `clipstitchr native init` prepares the Mac for native demos.
- `clipstitchr native init --force` repairs or reinstalls the helper.
- `clipstitchr native check` verifies setup and permissions.
- Native demos reuse the installed helper across projects.

Suggested commit: `Add native init command`

## 12. Clarify Native Platform Support And Future Adapters

Goal: Documentation and command messages accurately describe what native
automation can do today.

Implementation:

- Make `native init` and `native check` OS-aware.
- On macOS, install/check the macOS window helper and explain it controls
  visible windows such as iOS Simulator, iPhone Mirroring, Android emulator
  windows, and selected desktop apps.
- On Windows, clearly say native window automation is not available yet while
  browser demos remain available.
- For Android, distinguish manual Android recording through `adb screenrecord`
  from visible emulator-window control on macOS and future direct ADB AI
  control.
- Add future adapter notes for `android-adb` and `windows-window` without
  implying they exist today.

Docs:

- Update README, customer CLI docs, and native/OpenAI Computer feature docs to
  separate browser automation, macOS visible-window automation, iOS Simulator,
  Android emulator-window control on macOS, Android manual recording through
  ADB, future Android ADB automation, and future Windows native automation.

Tests:

- Add tests for platform-specific native messages where feasible.

Acceptance:

- macOS users understand what native automation can do today.
- Windows users get a clear not-available-yet message for native window
  automation.
- Docs do not overclaim Android or Windows AI control.

Suggested commit: `Clarify native platform support`

## 13. Remove Library Commands And Expand Queue Commands

Goal: Keep library browsing in the dashboard and make queueing useful for both
Stitches and Swipes without forcing users to copy IDs for common cases.

Implementation:

- Remove or hide `clipstitchr library clips`, `library stitches`, and
  `library swipes` from primary CLI help and docs. Keep compatibility aliases
  only if needed.
- Add `queue stitch`, `queue stitch <stitchId>`, and `queue stitch --all`.
- Add `queue swipe`, `queue swipe <swipeId>`, and `queue swipe --all`.
- Add root-level `queue --all` to collect active Stitches and Swipes, randomize
  the mixed order, and queue them one at a time.
- Define active/queueable content in implementation and docs: expected
  Stitches are finished/rendered and ready to post; expected Swipes are ready to
  post/render/upload through the queue flow.
- Make no-ID `queue stitch` and `queue swipe` choose the most recent active
  item rather than requiring an interactive library browser.
- Ensure bulk queueing is sequential, not parallel.
- Report partial failures with enough detail to show what queued and what
  failed.
- Add or update backend routes for Swipe queueing if they do not exist.
- Add or update abuse and rate limits before new queueing backend work runs.

Docs:

- Update README, customer CLI docs, queue/batch feature docs, and
  `docs/backend/rate-limits.md` if backend endpoints or limits change.

Tests:

- Add CLI tests for latest Stitch, latest Swipe, queue by ID, all Stitches, all
  Swipes, mixed all, sequential execution, partial failure output, and hidden
  library help.
- Add backend route/rate-limit tests if routes change.

Acceptance:

- Dashboard remains the primary place to browse the library.
- Users can queue the latest active Stitch or Swipe.
- Users can bulk queue active Stitches, active Swipes, or a randomized mix.
- Existing queue-by-ID behavior still works.

Suggested commit: `Expand queue commands`

## 14. Add An Interactive `clipstitchr queue` Menu

Goal: Running `clipstitchr queue` opens a focused queue menu.

Implementation:

- Add a queue submenu with options to show upcoming queue items, queue latest
  Stitch, queue all Stitches, queue latest Swipe, queue all Swipes, queue
  everything, and optionally queue a specific Stitch or Swipe by ID.
- Use clear labels such as `Queue latest Stitch`, `Queue all Stitches`,
  `Queue latest Swipe`, `Queue all Swipes`, `Queue everything`, and
  `Show upcoming queue`.
- Preserve direct commands for scripts.

Docs:

- Update README and customer CLI docs to mention the queue submenu.

Tests:

- Add menu routing tests for the queue submenu.

Acceptance:

- Running `clipstitchr queue` without a subcommand opens a useful queue menu.
- Existing direct queue commands keep working.

Suggested commit: `Add queue submenu`

## 15. Add Queue Listing For The Next 24 Hours

Goal: Users can see what is already queued soon without opening the dashboard.

Implementation:

- Add `clipstitchr queue list`.
- Show queued Stitches and Swipes scheduled or queued within the next 24 hours.
- Do not allow a CLI window beyond 24 hours unless product requirements change.
- Include content type, title or caption preview, queue position or scheduled
  time, product/account context when available, and status.
- Keep output readable in normal terminal output and usable with `--plain`.
- Add the workflow to the queue submenu.
- Add or update a backend route/query if needed.
- Decide whether the endpoint is intentionally not rate-limited because it is
  read-only, or add a read limit if it touches external Post Bridge APIs.

Docs:

- Update README, customer CLI docs, feature docs, and
  `docs/backend/rate-limits.md` if an endpoint or limit changes.

Tests:

- Add CLI tests for the 24-hour cap, normal output, plain output, empty queue,
  and mixed Stitch/Swipe rows.
- Add backend tests if a new route is added.

Acceptance:

- Users can run `clipstitchr queue list`.
- The command shows no more than the next 24 hours.
- The queue submenu includes a show-upcoming option.

Suggested commit: `Add queue listing command`

## 16. Rename Stitchr/Swipr `batch` Commands To `new`

Goal: Use the more natural `new` command for starting Stitchr and Swipr work.

Implementation:

- Add `clipstitchr stitchr new` as the primary command for starting a Stitchr
  batch.
- Add `clipstitchr swipr new` as the primary command for starting Swipr drafts.
- Keep `stitchr batch` and `swipr batch` as compatibility aliases.
- Preserve options: Stitchr `--product`, `--sound`, `--template`,
  `--time-zone`; Swipr `--product`.
- Update root menu wording to prefer starting new Stitchr/Swipr work.

Docs:

- Update README, customer CLI docs, and batch/queue feature docs to prefer
  `new`.

Tests:

- Add command tests for `new`, aliases, and option parity.

Acceptance:

- Users can run `clipstitchr stitchr new` and `clipstitchr swipr new`.
- Existing `batch` commands still work.

Suggested commit: `Rename batch commands to new`

## 17. Add An Interactive `clipstitchr products` Menu

Goal: Running `clipstitchr products` opens a focused products menu.

Implementation:

- Add a products submenu with options to list saved products, create a product,
  and choose the product this repo records.
- Use labels such as `Show my products`, `Create a product`, and
  `Use a product for this repo`.
- Preserve direct `products list`, `products create`, and
  `products use [productId]` commands.

Docs:

- Update README and customer CLI docs to mention the products submenu.

Tests:

- Add menu routing tests for list/create/use.

Acceptance:

- Running `clipstitchr products` without a subcommand opens a useful products
  menu.
- Existing direct product commands keep working.

Suggested commit: `Add products submenu`

## 18. Build A Persistent Interactive CLI Shell

Goal: The interactive CLI feels like one connected system instead of a single
prompt that exits after each command.

Implementation:

- Make `clipstitchr` open a persistent main menu.
- After commands launched from menus finish, return to the relevant menu.
- Make all primary groups reachable from the main menu: demo, products, queue,
  Stitchr, Swipr, native setup/check, account/repo setup, status, doctor, and
  update.
- Add navigation actions: Back, Main menu, and Exit.
- Let users type slash commands from inside the shell, such as
  `/demo manual`, `/demo agent --guide "upload flow"`, `/queue stitch --all`,
  `/products use product_123`, and `/status`.
- Reuse direct command handlers for slash commands wherever possible.
- Keep direct terminal commands unchanged for scripts.
- Make error handling menu-friendly: show the error, then offer retry, return
  to menu, or exit when appropriate.
- Ensure Ctrl+C exits cleanly.

Docs:

- Update README and customer CLI docs so users know they can use either the
  interactive CLI or direct commands.

Tests:

- Add tests for menu state routing, slash-command parsing, slash-command
  dispatch, error recovery, and exit behavior where feasible.

Acceptance:

- Every primary command group is reachable from `clipstitchr`.
- Commands launched from menus return to a menu.
- Users can go back, return home, exit, and run slash commands.
- Direct commands still work for automation.

Suggested commit: `Add persistent interactive CLI shell`

## 19. Add A Stylized TUI

Goal: The persistent interactive CLI has a polished terminal UI while direct
commands remain script-friendly.

Implementation:

- Add a stylized terminal UI for interactive mode and major submenus: demo,
  queue, products, native, account/repo setup, status, doctor, and update.
- Include a clear brand/header area, current context or breadcrumb, keyboard
  menu list, command/status panel, recent result/error area, and footer hints
  for Back, Main menu, Exit, and slash commands.
- Keep direct commands non-TUI by default.
- Respect `--plain`, `NO_COLOR=1`, and non-interactive terminals by falling
  back to plain prompt/output behavior.
- Choose a maintained TUI approach that fits the current Node CLI stack. If a
  dependency is added, document why.
- Keep errors visible and readable, including in narrow terminals.
- Avoid relying on color alone for meaning.

Docs:

- Update README and customer CLI docs with a short note that users can choose
  the interactive TUI or direct commands.
- Document any new dependency if one is added.

Tests:

- Test routing/state and fallback behavior. Avoid brittle snapshots of every
  terminal frame unless there is a stable rendering boundary.

Acceptance:

- Running `clipstitchr` opens the stylized persistent TUI in supported
  terminals.
- Slash commands work inside the TUI.
- `--plain`, non-interactive terminals, and direct commands remain stable.
- The TUI degrades cleanly when unsupported or too small.

Suggested commit: `Add interactive CLI TUI`

## 20. Final CLI Version Bump To `0.2.0`

Goal: Mark the completed CLI command review work with a final CLI package
version bump.

Implementation:

- Perform this only after tasks 1 through 19 are complete, tested, and
  committed.
- Bump `packages/clipstitchr-cli/package.json` from the current version to
  `0.2.0`.
- Update the matching package lockfile entry or entries.
- Do not bundle feature work into this commit.

Docs:

- Update changelog or release notes only if the repo already has a matching CLI
  release documentation pattern.

Tests:

- Run `npm run typecheck` and `npm test` from `packages/clipstitchr-cli`.
- Run the package build if the tests do not already build.

Acceptance:

- CLI package metadata reports version `0.2.0`.
- The version bump is the final separate commit after all task commits.

Suggested commit: `Bump CLI to 0.2.0`
