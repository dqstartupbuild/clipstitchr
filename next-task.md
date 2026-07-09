# Next Task Notes

Use this file as the handoff list for the next agent session. Continue from the
current dirty working tree, do not revert existing changes, read `AGENTS.md`
first, and follow the atomic file rules.

## CLI Command Review Issues

## Target Demo Command Shape

The intended primary demo command shape should be:

- `clipstitchr demo` opens the interactive demo submenu.
- `clipstitchr demo manual` records a demo manually.
- `clipstitchr demo agent` records a demo with the automated AI agent.
- `clipstitchr demo agent --guide <id-or-path>` records with an existing guide.
- `clipstitchr demo upload <file>` uploads an existing demo file.
- `clipstitchr demo guide create` creates an AI walkthrough guide.
- `clipstitchr demo guide list` lists saved guides with readable names.
- `clipstitchr demo guide show <guide>` shows a guide by name, ID, or path.
- `clipstitchr demo guide edit <guide>` edits a guide by name, ID, or path.
- `clipstitchr demo guide delete <guide>` deletes a guide by name, ID, or path.
- `clipstitchr demo guide save-instructions <guide>` or another clearer name
  saves portable guide instructions locally.
- `clipstitchr demo policy init` creates and reviews the safety policy.
- `clipstitchr demo policy check` checks the saved safety policy.
- `clipstitchr demo policy edit` edits the saved safety policy.
- `clipstitchr demo logs <runId>` shows local logs for an automated demo run.

Keep old commands as aliases where practical, including `demo make`,
`demo auto`, `demo guide generate`, `demo agent init`, `demo agent check`,
`demo agent run`, and `demo agent export-log`.

## Target Queue Command Shape

The intended primary queue command shape should be:

- Remove or hide `clipstitchr library ...` commands from the primary CLI because
  browsing the library belongs in the dashboard.
- `clipstitchr queue` opens an interactive queue submenu.
- `clipstitchr queue stitch` queues the most recent active Stitch.
- `clipstitchr queue stitch <stitchId>` queues a specific Stitch.
- `clipstitchr queue stitch --all` queues all active Stitches sequentially.
- `clipstitchr queue swipe` queues the most recent active Swipe.
- `clipstitchr queue swipe <swipeId>` queues a specific Swipe.
- `clipstitchr queue swipe --all` queues all active Swipes sequentially.
- `clipstitchr queue --all` queues all active Stitches and Swipes sequentially
  in a random mixed order.
- `clipstitchr queue list` shows queued items for up to the next 24 hours.

Define "active" carefully during implementation. Expected meaning: ready,
queueable content such as finished Stitches with rendered videos and Swipes
that are ready to post. Keep sequential queueing one item at a time, not
parallel bulk requests.

## Target Batch Command Shape

The intended primary batch command shape should be:

- `clipstitchr stitchr new` starts a new Stitchr batch.
- `clipstitchr swipr new` starts new Swipr drafts.

Keep `clipstitchr stitchr batch` and `clipstitchr swipr batch` as
backward-compatible aliases where practical.

## Target Products Command Shape

The intended products command shape should be:

- `clipstitchr products` opens an interactive products submenu.
- `clipstitchr products list` lists saved products.
- `clipstitchr products create` creates a new product.
- `clipstitchr products use [productId]` chooses the product this repo records.

## Target Interactive CLI Shell

The intended interactive CLI should feel like one connected system:

- Running `clipstitchr` opens the main menu.
- All commands and submenus should be reachable from the main menu.
- Running a command from an interactive menu should return to the relevant menu
  instead of closing the CLI.
- Users should be able to go back to the previous menu.
- Users should be able to return to the main menu at any point.
- Users should be able to type `/{command}` from inside the interactive CLI to
  run any command directly without exiting.
- Direct terminal commands must still work for scripts and power users.

## Target TUI Experience

Add a stylized terminal UI for the persistent interactive CLI. It should make
ClipStitchr feel like a cohesive product system, while direct commands remain
script-friendly and plain output remains available.

## Target Native Command Shape

The intended primary native helper command shape should be:

- `clipstitchr native init` prepares this Mac for native/window demos.
- `clipstitchr native check` checks the installed helper and macOS permissions.

`clipstitchr native init` should build and install/copy the helper once to a
stable user-level location so it can be reused across all projects/products on
the same Mac. It should also repair missing, outdated, or broken installs.
Support `clipstitchr native init --force` if a user needs to force a reinstall.
Keep old `clipstitchr native helper ...` commands as aliases where practical,
but remove or hide build-only commands from normal user-facing help.

### Make `clipstitchr demo policy init` Fully Interactive

Current issue:

`clipstitchr demo agent init` currently creates a local demo agent policy with smart
defaults after asking for the local URL, but it does not let the user review,
add, edit, or remove every policy value during setup. The intended primary
command should be `clipstitchr demo policy init`.

Expected improvement:

- Keep the current quick-start defaults.
- Add an interactive review/edit flow during `demo policy init`.
- Let the user edit these policy fields:
  - allowed origins
  - allowed routes
  - live-site allowance
  - max actions
  - max recording seconds
  - approved test values
  - blocked text patterns
  - file upload allowance
  - approved upload files
  - review-before-upload behavior
  - test account notes
- Keep risky options explicit:
  - live origins should require clear approval
  - uploads should require selected approved files
  - action/time limits should stay within safe bounds
- Add a follow-up edit command if it fits the CLI shape, for example:
  `clipstitchr demo policy edit`
- Keep `clipstitchr demo agent init` and any related old policy setup commands
  as backward-compatible aliases during migration.
- Add or update tests for policy initialization, validation, and editing.
- Update CLI docs for the new setup/edit behavior.

Acceptance criteria:

- A first-time user can create a safe policy without opening JSON by hand.
- A returning user can update the policy from the CLI.
- Users can run `clipstitchr demo policy init`, `clipstitchr demo policy check`,
  and `clipstitchr demo policy edit`.
- Existing non-interactive/default behavior remains easy for quick local setup.

### Move Policy Commands Under `demo policy`

Current issue:

`clipstitchr demo agent init` and `clipstitchr demo agent check` are a lot to
type and are confusing because those commands manage the safety policy, not the
automated demo agent run itself.

Expected improvement:

- Use a clearer demo-scoped policy command group:
  - `clipstitchr demo policy init`
  - `clipstitchr demo policy check`
  - `clipstitchr demo policy edit`
- Keep backward-compatible aliases for existing `clipstitchr demo agent ...`
  commands so current users and docs do not break immediately.
- Revisit naming for commands that actually run the agent. For example,
  `clipstitchr demo agent run` should become a legacy alias while the primary
  automated recording command becomes `clipstitchr demo agent`.
- Update help text so users understand that a policy is the local safety
  rulebook for AI demo recording.
- Update README/docs and command tests for the final command names and aliases.

Acceptance criteria:

- Users can manage the policy with `clipstitchr demo policy ...` commands.
- Existing `clipstitchr demo agent init` and `clipstitchr demo agent check`
  still work as aliases.
- Help output makes the difference between policy setup and demo running clear.

### Explain `demo guide export-instructions` Use Cases In User Docs

Current issue:

The CLI guide doc mentions that `clipstitchr demo guide export-instructions`
creates a Markdown checklist for a local agent or teammate, but it does not
clearly explain when a user would use it. The landing-page CLI section does not
mention this use case at all.

Expected improvement:

- Update the customer CLI guide doc, currently
  `web/lib/clipstitchr/docs/clipstitchrCliDoc.ts`, to explain the use cases in
  plain language.
- Keep the explanation simple and similar to:
  - Use it to give instructions to a human recorder.
  - Use it to paste a plain-language plan into another AI or local agent tool.
  - Use it to review the walkthrough before recording.
  - Use it to share a demo plan without giving someone CLI/account access.
  - Use it to archive the plan used for a recording.
  - Use it to pair a guide with the matching local safety policy JSON.
- Make it clear that export means saving portable local files, not uploading,
  publishing, or sending anything.
- Consider whether the landing-page CLI section should hint at this, or whether
  it belongs only in the full CLI guide.
- If command naming changes, consider replacing `export-instructions` with a
  clearer primary command such as `instructions` or `save-instructions`, while
  keeping the old command as an alias.

Acceptance criteria:

- A user reading the CLI guide understands why they would export guide
  instructions.
- The docs clearly state what files are created and that nothing is uploaded.
- The wording is non-technical and fits the existing customer docs style.

### Give Demo Guides Human-Readable Names

Current issue:

Saved walkthrough guides are mainly referenced by generated IDs such as
`guide_123`. That makes `clipstitchr demo guide list` harder to scan and makes
commands like `clipstitchr demo guide show <guide>` less friendly because users
need to copy an ID instead of typing a memorable name.

Expected improvement:

- Add a human-readable guide name based on the main thing the guide
  demonstrates.
- Generate a simple, memorable name when a guide is created, for example from
  the goal/title/flow.
- Show that name prominently in `clipstitchr demo guide list`.
- Let all `<guide>` commands resolve either the existing guide ID/path or the
  human-readable name:
  - `clipstitchr demo guide show "upload flow"`
  - `clipstitchr demo guide edit "pricing page tour"`
  - `clipstitchr demo guide delete "onboarding checklist"`
  - `clipstitchr demo make --guide "upload flow"`
- Handle duplicate or ambiguous names clearly by asking the user to choose or
  by showing matching guide names with IDs.
- Keep IDs working for scripts and backwards compatibility.
- Update guide storage, tests, help text, README, and customer docs.

Acceptance criteria:

- `clipstitchr demo guide list` is easy for a non-technical user to scan.
- Users can run guide commands with the readable guide name instead of the ID.
- Existing ID and file-path based guide references still work.
- Ambiguous guide names fail with a clear, helpful message or an interactive
  chooser.

### Rename `demo guide generate` To `demo guide create`

Current issue:

`clipstitchr demo guide generate` sounds technical and provider-focused. The
user-facing action is creating a guide: the CLI asks a few setup questions, AI
drafts the guide, and the user reviews, edits, regenerates, saves, or discards
it.

Expected improvement:

- Make `clipstitchr demo guide create` the primary command.
- Keep `clipstitchr demo guide generate` as a backward-compatible alias.
- Update help text, README, customer docs, feature docs, and tests.
- Use plain wording in the command description, such as "Create an AI demo
  guide" or "Create a walkthrough guide."

Acceptance criteria:

- Users can run `clipstitchr demo guide create`.
- Existing `clipstitchr demo guide generate` still works.
- User-facing docs and help prefer `create`.

### Add An Interactive `clipstitchr demo` Menu

Current issue:

The root `clipstitchr` command opens an interactive menu, but running
`clipstitchr demo` only exposes subcommands through help/Commander behavior.
All demo-related work should be available from a focused interactive demo menu.

Expected improvement:

- Make `clipstitchr demo` open an interactive menu similar to the root
  `clipstitchr` menu.
- Include the main demo workflows:
  - create a demo manually (`clipstitchr demo manual`)
  - create a demo with the automated agent (`clipstitchr demo agent`)
  - create/manage demo guides (`clipstitchr demo guide ...`)
  - manage the safety policy (`clipstitchr demo policy ...`)
  - upload an existing demo (`clipstitchr demo upload`)
  - view agent run logs (`clipstitchr demo logs <runId>`)
  - native/window helper setup if it belongs in demo workflows
- Use plain menu labels instead of command names where possible.
- Preserve all existing direct commands for scripts and power users.
- Keep menu items consistent with any command renames such as
  `demo guide create` and `policy ...`.

Acceptance criteria:

- Running `clipstitchr demo` without a subcommand opens a useful demo menu.
- A non-technical user can discover manual recording, automated recording,
  guide creation, policy setup, and upload from that menu.
- The demo menu includes `demo manual`, `demo agent`, `demo upload`,
  `demo guide ...`, `demo policy ...`, and `demo logs`.
- Existing `clipstitchr demo ...` commands still work directly.

### Let The Main Menu Choose Manual Or Automated Demo Creation

Current issue:

The main `clipstitchr` interactive menu has a make-demo option, but it only
starts the manual recording path. Users should be able to choose whether they
want to record manually or let the automated agent create the demo.

Expected improvement:

- Update the root interactive menu's demo option so it asks how the user wants
  to make the demo:
  - manual recording
  - automated AI demo agent
- Route manual recording to the manual demo flow.
- Route automated recording to the automated agent flow.
- Make the copy simple, for example:
  - "Record it myself"
  - "Let AI record it for me"
- Keep safety messaging clear before automated runs, especially for live sites,
  screenshots through relay mode, and policy limits.

Acceptance criteria:

- Root `clipstitchr` menu no longer hides the automated demo path.
- Users can choose manual or automated demo creation from the menu.
- Direct commands for manual demos and the automated agent command keep
  working unchanged.

### Rename `demo make` To `demo manual`

Current issue:

`clipstitchr demo make` is the manual recording flow, but the word "make" does
not make that clear. The command should match the mental model of choosing
between a manual demo and an agent-recorded demo.

Expected improvement:

- Make `clipstitchr demo manual` the primary command for manual recording.
- Keep `clipstitchr demo make` as a backward-compatible alias.
- Update the root menu and `clipstitchr demo` menu to use plain labels like:
  - "Record it myself"
  - "Let AI record it for me"
- Update help text, README, customer docs, feature docs, and tests.
- Keep existing manual options available on `demo manual`, such as:
  - `--guide <id-or-path>`
  - `--no-guide`
  - `--no-upload`
  - `--output <path>`
  - `--product <id>`
  - `--start <command>`
  - `--url <url>`

Acceptance criteria:

- Users can run `clipstitchr demo manual`.
- Existing `clipstitchr demo make` still works as an alias.
- Help and docs clearly present manual recording as `demo manual` and automated
  recording as `demo agent`.

### Rename `demo agent export-log` To `demo logs`

Current issue:

`clipstitchr demo agent export-log <runId>` is hard to understand. The command
does not export a recording; it shows local evidence paths or writes a compact
JSON file with the run summary and action log. The user prefers the clearer
name `clipstitchr demo logs <runId>`.

Expected improvement:

- Make `clipstitchr demo logs <runId>` the primary command.
- Keep `clipstitchr demo agent export-log <runId>` as a backward-compatible
  alias during migration.
- Preserve the existing behavior:
  - without `--output`, print paths for summary, action log, and screenshots
  - with `--output <path>`, write one JSON file containing the run summary and
    action log text
- Use plain help text such as "Show local logs for an automated demo run."
- Update docs, README, help output, and tests.
- Decide whether `demo logs` belongs in the new interactive `clipstitchr demo`
  menu.

Acceptance criteria:

- Users can run `clipstitchr demo logs <runId>`.
- Existing `clipstitchr demo agent export-log <runId>` still works as an alias.
- Help and docs no longer describe this as exporting unless referring to the
  optional `--output` file.

### Fold `demo agent run` Into `demo agent` And Remove Dry Run

Current issue:

`clipstitchr demo agent run --guide <id-or-path>` overlaps heavily with
`clipstitchr demo auto`. The main difference is that `demo agent run` uses an
existing guide, while `demo auto` creates a new guide first. The user wants the
primary automated demo command to be `clipstitchr demo agent`, not
`clipstitchr demo auto`, and does not want a nested `run` command. `--dry-run`
also adds another mode that is confusing for users.

Expected improvement:

- Remove `--dry-run` from the primary user-facing flow.
- Make `clipstitchr demo agent` the single primary automated demo command.
- Keep `clipstitchr demo auto` as a backward-compatible alias if needed.
- Add `--guide <id-or-path>` to `clipstitchr demo agent`.
- When `--guide` is provided, `demo agent` should use that existing guide
  instead of creating a new AI guide.
- When no guide is provided, `demo agent` should create a new AI guide as
  `demo auto` does today.
- Consider making `clipstitchr demo agent run --guide <id-or-path>` a legacy
  alias to `clipstitchr demo agent --guide <id-or-path>` during migration, or
  hide it from primary help.
- Update the interactive demo menu so automated recording lets the user choose:
  - create a new guide/demo flow
  - use an existing guide
- For upload behavior:
  - ask for review/upload approval by default after the automated recording
  - skip upload review when `--no-upload` is passed
  - upload without prompting when `--upload` is passed
- Keep evidence logs/screenshots/run summaries so users can still review what
  happened after the run, even without a dry-run mode.

Acceptance criteria:

- A user can run an automated demo from an existing guide with:
  `clipstitchr demo agent --guide <id-or-path>`.
- A user can run an automated demo with a newly created guide with:
  `clipstitchr demo agent`.
- The primary docs and help no longer push `demo auto`, `demo agent run`, or
  `--dry-run`.
- Upload behavior is clear: default asks after review, `--no-upload` skips, and
  `--upload` uploads after the run without asking.
- Backward compatibility is handled intentionally for existing scripts.

### Rename Native Helper Setup To `native init`

Current issue:

`clipstitchr native helper build` and `clipstitchr native helper install`
currently do the same thing. `install` only builds the helper; it does not copy
it to a stable location or make it reusable across projects. The nested
`native helper ...` wording is also more technical than needed.

Expected improvement:

- Make `clipstitchr native init` the primary setup command for native/window
  demos.
- `native init` should build the Swift helper and install/copy it to a stable
  user-level location, for example under:
  `~/Library/Application Support/ClipStitchr/`.
- Future native/window demo runs should use the installed helper instead of
  rebuilding from the package/worktree each time.
- The installed helper should be shared across all repos/products on the same
  Mac.
- Add helper version metadata so the CLI can reinstall only when the bundled
  helper version changes.
- Make `clipstitchr native check` the primary command for verifying:
  - installed helper exists
  - helper version is compatible
  - Screen Recording permission
  - Accessibility permission
- Do not expose `clipstitchr native build` as a normal user-facing command.
- Make `clipstitchr native init` idempotent and repair-friendly instead:
  - install when missing
  - reinstall when outdated
  - repair when the installed helper is broken
  - support `--force` for a clean reinstall
- Keep existing commands as aliases during migration:
  - `clipstitchr native helper install`
  - `clipstitchr native helper check`
- Remove or hide `clipstitchr native helper build` from primary help. Keep it
  only as an internal/dev alias if the implementation still needs it.
- Update help text, README, customer docs, feature docs, and tests.

Benefits to explain in docs:

- Users install the helper once per Mac, not once per repo/product.
- Future native demos start faster because they do not rebuild the helper.
- macOS permissions are easier to understand because the helper path is stable.
- Switching projects keeps using the same installed helper.
- Updating can reinstall only when needed.

Acceptance criteria:

- Users can run `clipstitchr native init` to prepare the Mac for native demos.
- Users can run `clipstitchr native init --force` to repair/reinstall the
  helper.
- Users can run `clipstitchr native check` to verify setup and permissions.
- Native/window demo runs reuse the installed helper across projects.
- Existing `native helper ...` commands still work as aliases.

### Clarify Native Platform Support And Future Adapters

Current issue:

The current native helper work only implements automated native/window control
for visible macOS windows. Manual native recording already exists for iOS
Simulator and Android devices/emulators, but direct AI control for Android ADB
and Windows native apps is not implemented yet. The docs and command messages
should make that boundary clear.

Expected improvement:

- Make `clipstitchr native init` and `clipstitchr native check` OS-aware.
- On macOS:
  - install/check the macOS window helper
  - explain that it can control visible windows such as iOS Simulator, iPhone
    Mirroring, Android emulator windows, and selected desktop apps
- On Windows:
  - clearly say native window automation is not available yet
  - keep browser demos available through the normal browser path
- For Android:
  - clearly distinguish manual Android recording through `adb screenrecord`
    from future AI-controlled Android automation
  - do not imply direct Android ADB control exists yet
- Update docs to separate:
  - browser automation
  - macOS visible-window automation
  - iOS Simulator automation through the macOS window helper
  - Android emulator automation through the macOS window helper when visible
  - Android manual recording through ADB
  - future Android ADB automation
  - future Windows native automation
- Add future surface-adapter notes for:
  - `android-adb`, using ADB screenshots/input
  - `windows-window`, using Windows screen capture and input APIs

Acceptance criteria:

- Users on macOS understand what native automation can do today.
- Users on Windows receive a clear "not available yet" message for native
  window automation.
- Users understand Android support is currently manual recording or visible
  emulator-window control on macOS, not direct ADB-based AI control.
- The docs do not overclaim cross-platform native automation.

### Remove Library Commands And Expand Queue Commands

Current issue:

The CLI currently exposes `clipstitchr library ...` commands for clips,
Stitches, and Swipes. The user wants library browsing to stay in the dashboard
instead of the CLI. The queue command currently centers on Stitches, but queueing
should support both Stitches and Swipes and should not require users to copy IDs
for the common case.

Expected improvement:

- Remove or hide these from primary CLI help/docs:
  - `clipstitchr library clips`
  - `clipstitchr library stitches`
  - `clipstitchr library swipes`
- Keep compatibility aliases only if needed for existing scripts.
- Expand queue commands:
  - `clipstitchr queue stitch`
  - `clipstitchr queue stitch <stitchId>`
  - `clipstitchr queue stitch --all`
  - `clipstitchr queue swipe`
  - `clipstitchr queue swipe <swipeId>`
  - `clipstitchr queue swipe --all`
  - `clipstitchr queue --all`
- Make `queue stitch` without an ID add the most recent active/queueable Stitch.
- Make `queue swipe` without an ID add the most recent active/queueable Swipe.
- Make `queue stitch --all` add all active Stitches sequentially.
- Make `queue swipe --all` add all active Swipes sequentially.
- Make `queue --all` collect active Stitches and Swipes, randomize the mixed
  order, and add them sequentially.
- Verify and document the backend definition of "active":
  - expected for Stitches: finished/rendered and ready to post
  - expected for Swipes: ready to post/render/upload through the queue flow
- Ensure all bulk queue operations run one item at a time, not in parallel.
- Report partial failures clearly so users know which item failed and which
  items were already queued.
- Add or update backend routes if Swipe queueing is not available yet.
- Add or update abuse/rate limits before any new queueing backend operation.
- Update `docs/backend/rate-limits.md` if queue endpoints or limits change.
- Update help text, README, customer docs, feature docs, and tests.

Acceptance criteria:

- Dashboard remains the primary place to browse the library.
- Users can queue the latest active Stitch with `clipstitchr queue stitch`.
- Users can queue the latest active Swipe with `clipstitchr queue swipe`.
- Users can bulk queue active Stitches, active Swipes, or a randomized mix of
  both with `--all`.
- Existing queue-by-ID behavior still works for scripts.
- Bulk operations are sequential and provide clear success/failure output.

### Add An Interactive `clipstitchr queue` Menu

Current issue:

`clipstitchr queue` is currently only a command namespace for queueing content.
Users should be able to run `clipstitchr queue` and choose what to queue from a
focused submenu, similar to the root menu and planned demo/products menus.

Expected improvement:

- Make `clipstitchr queue` open an interactive queue submenu.
- Include queue workflows:
  - list queued items for up to the next 24 hours
  - queue the latest active Stitch
  - queue all active Stitches
  - queue the latest active Swipe
  - queue all active Swipes
  - queue all active Stitches and Swipes in a random mixed order
  - optionally queue a specific Stitch/Swipe by ID for power users
- Use clear menu labels, for example:
  - "Queue latest Stitch"
  - "Queue all Stitches"
  - "Queue latest Swipe"
  - "Queue all Swipes"
  - "Queue everything"
  - "Show upcoming queue"
- Preserve direct commands:
  - `clipstitchr queue stitch`
  - `clipstitchr queue stitch <stitchId>`
  - `clipstitchr queue stitch --all`
  - `clipstitchr queue swipe`
  - `clipstitchr queue swipe <swipeId>`
  - `clipstitchr queue swipe --all`
  - `clipstitchr queue --all`
  - `clipstitchr queue list`
- Update help text, README, customer docs, feature docs, and tests.

Acceptance criteria:

- Running `clipstitchr queue` without a subcommand opens a useful queue menu.
- Users can discover latest-item queueing, all-Stitches queueing, all-Swipes
  queueing, mixed queue-all, and upcoming queue listing from the menu.
- Existing direct queue commands keep working.

### Add Queue Listing For The Next 24 Hours

Current issue:

Users need a CLI way to see what is already queued soon, without opening the
dashboard. The user wants a way to list their queue for up to 24 hours.

Expected improvement:

- Add `clipstitchr queue list`.
- Show queued Stitches and Swipes scheduled/queued within the next 24 hours.
- Consider an option for a shorter window if useful, but do not allow more than
  24 hours from the CLI unless product requirements change.
- Include useful plain fields:
  - content type
  - title/caption preview if available
  - queue position or scheduled time if available
  - product/account context if available
  - status
- Keep output readable in normal terminal output and usable with `--plain`.
- Add this workflow to the interactive `clipstitchr queue` menu.
- Add or update backend route/query if needed.
- Decide whether this is read-only and intentionally not rate-limited, or add a
  read rate limit if it touches external Post Bridge APIs.
- Update `docs/backend/rate-limits.md` if a backend endpoint or limit changes.
- Update help text, README, customer docs, feature docs, and tests.

Acceptance criteria:

- Users can run `clipstitchr queue list`.
- The command shows upcoming queued Stitches and Swipes for no more than the
  next 24 hours.
- The queue submenu includes a "show upcoming queue" style option.
- Output is clear enough that users know what is about to post.

### Rename Stitchr/Swipr `batch` Commands To `new`

Current issue:

`clipstitchr stitchr batch` and `clipstitchr swipr batch` work, but the word
"batch" is less natural for users than starting something new. The user wants
the primary commands to use `new`.

Expected improvement:

- Make `clipstitchr stitchr new` the primary command for starting a Stitchr
  batch.
- Make `clipstitchr swipr new` the primary command for starting Swipr drafts.
- Keep backward-compatible aliases:
  - `clipstitchr stitchr batch`
  - `clipstitchr swipr batch`
- Preserve existing options:
  - Stitchr: `--product`, `--sound`, `--template`, `--time-zone`
  - Swipr: `--product`
- Update help text, README, customer docs, feature docs, and tests.
- Update the root interactive menu to use the new wording.

Acceptance criteria:

- Users can run `clipstitchr stitchr new`.
- Users can run `clipstitchr swipr new`.
- Existing `batch` commands still work as aliases for scripts.
- User-facing docs/help prefer `new`.

### Add An Interactive `clipstitchr products` Menu

Current issue:

`clipstitchr products` is currently only a command namespace. Users need to know
and type a subcommand such as `list`, `create`, or `use`. The user wants a
submenu when running `clipstitchr products`, similar to the root `clipstitchr`
menu and the planned `clipstitchr demo` menu.

Expected improvement:

- Make `clipstitchr products` open an interactive products submenu.
- Include the existing product workflows:
  - list saved products
  - create a new product
  - choose the product this repo records
- Use clear menu labels, for example:
  - "Show my products"
  - "Create a product"
  - "Use a product for this repo"
- Preserve direct commands:
  - `clipstitchr products list`
  - `clipstitchr products create`
  - `clipstitchr products use [productId]`
- Update help text, README, customer docs, feature docs, and tests.

Acceptance criteria:

- Running `clipstitchr products` without a subcommand opens a useful products
  menu.
- Users can discover list/create/use from the menu.
- Existing direct `products ...` commands keep working.

### Build A Persistent Interactive CLI Shell

Current issue:

The root `clipstitchr` command opens an interactive menu, but after a selected
command finishes, the CLI exits. Users then need to type `clipstitchr` or a
specific command again. Submenus also need to feel connected so the CLI behaves
more like one full system instead of a collection of disconnected commands.

Expected improvement:

- Make the interactive `clipstitchr` experience persistent.
- After a command is run from a menu, return the user to the relevant menu
  instead of closing the process.
- Make all commands and submenus reachable from the top-level menu:
  - demo
  - products
  - queue
  - Stitchr
  - Swipr
  - native setup/check
  - account/repo setup
  - status/doctor/update
- Add menu navigation:
  - Back to previous menu
  - Main menu
  - Exit
- Allow direct command entry from inside the interactive CLI with slash syntax,
  for example:
  - `/demo manual`
  - `/demo agent --guide "upload flow"`
  - `/queue stitch --all`
  - `/products use product_123`
  - `/status`
- Slash commands should reuse the same command handlers as direct terminal
  commands wherever possible.
- Keep direct terminal commands working exactly as they do now for scripts and
  power users.
- Make error handling menu-friendly:
  - show the error
  - offer to return to menu, retry, or exit when appropriate
- Avoid trapping users in the shell:
  - clear Exit option
  - Ctrl+C still exits cleanly
- Add tests for menu routing and slash-command parsing where possible.
- Update customer docs so users understand they can either use the interactive
  CLI or direct commands.

Acceptance criteria:

- Running `clipstitchr` opens the main menu.
- Every primary command/submenu is reachable from that menu.
- Commands launched from menus return to a menu after completion.
- Users can go back, return home, or exit.
- Users can run any command from inside the shell with `/{command}`.
- Direct commands still work for automation and scripts.

### Add A Stylized TUI

Current issue:

The CLI currently uses light branded terminal output and prompt-based menus. The
user wants a more stylized TUI so the persistent `clipstitchr` interactive mode
feels like a single full system.

Expected improvement:

- Add a stylized terminal UI for interactive mode.
- Use the TUI for the persistent `clipstitchr` shell and major submenus:
  - demo
  - queue
  - products
  - native
  - account/repo setup
  - status/doctor/update
- Make the UI feel polished but still practical:
  - clear header/brand area
  - current context/breadcrumb
  - menu list with keyboard navigation
  - command/status panel
  - recent result/error area
  - clear footer hints for Back, Main menu, Exit, and slash commands
- Keep direct commands non-TUI by default so scripts remain stable.
- Respect `--plain`, `NO_COLOR=1`, and non-interactive terminals by falling
  back to plain output.
- Avoid hiding important errors behind visual chrome.
- Keep copy simple and non-technical.
- Choose a maintained TUI approach that fits the current Node CLI stack. If a
  dependency is added, document why.
- Preserve accessibility basics:
  - readable contrast
  - no reliance on color alone
  - works at common terminal widths
  - graceful behavior when the terminal is too small
- Add tests around routing/state where feasible. Do not try to snapshot every
  terminal frame unless it is stable and useful.
- Update README and customer docs with a short note that users can choose the
  interactive TUI or direct commands.

Acceptance criteria:

- Running `clipstitchr` opens the stylized persistent TUI.
- Users can navigate all primary command groups from the TUI.
- Commands launched from the TUI return to the TUI after completion.
- Slash commands work inside the TUI.
- `--plain` and direct commands remain script-friendly.
- The TUI degrades cleanly in unsupported/non-interactive terminals.
