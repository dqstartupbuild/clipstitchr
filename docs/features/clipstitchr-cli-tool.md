# ClipStitchr CLI Tool

The ClipStitchr CLI lets a user type one command from a product repo, record or
upload a product demo, start new content creation, and add ready work to the
Post Bridge queue.

```bash
clipstitchr
```

The npm package lives outside the web app at `packages/clipstitchr-cli`. The web
app owns the production API surfaces the CLI needs: machine login, product
selection/creation, R2 upload signing, upload completion, upload status, batch
creation, bounded library reads for queue selection, and queueing ready content.

## What It Does

- `clipstitchr` opens a persistent main menu for demos, products, queueing,
  Stitchr, Swipr, native setup/checks, account/repo setup, status, doctor, and
  updates.
- Completed actions keep their output in a result view with Back, Main menu,
  Exit, and slash-command controls for direct commands such as `/demo manual`,
  `/queue stitch --all`, `/products use product_123`, and `/status`.
- `clipstitchr --help`, `clipstitchr help`, and
  `clipstitchr help demo manual` show the available command options.
- `clipstitchr --version` prints the installed CLI version.
- `clipstitchr link` connects the current repo to a ClipStitchr product.
- `clipstitchr init` remains as a developer-friendly alias for repo setup.
- `clipstitchr link` and `clipstitchr init` capture local app context in
  `.clipstitchr/app-context.json` so AI guide writing and the guarded demo
  agent can use real routes, feature labels, fields, and buttons from the app.
- `clipstitchr unlink` removes the repo link and can optionally remove
  repo-local browser profile and recording files.
- `clipstitchr status` prints the current account, repo, product, local app,
  and recording browser status.
- `clipstitchr update` checks npm for the latest published CLI version and can
  run the global npm update.
- `clipstitchr login` opens the browser and connects the machine to the user's
  ClipStitchr account.
- `clipstitchr init` writes `.clipstitchr.yml` with the product, local app URL,
  start command, and full-size recording defaults.
- `clipstitchr init` detects common nested app folders like `web/`, skips the
  product picker when the account has one product, and prefers a localhost URL
  that is already running.
- `clipstitchr scan` detects likely demo flows from local app routes.
- `clipstitchr demo manual` can create or reuse a saved walkthrough checklist
  before recording.
- `clipstitchr demo manual --guide <id-or-path>` reuses a saved guide, and
  `clipstitchr demo manual --no-guide` records without the guided stepper.
- `clipstitchr demo manual` records a local web/Expo-web app in a normal desktop
  Chromium window, converts the recording to MP4, and offers to upload it.
- `clipstitchr demo manual` captures click and cursor timing while recording web
  demos so the media worker can add smart zooms around the parts the user
  interacts with.
- `clipstitchr demo manual` can also record an already-running iOS Simulator or
  Android device/emulator for iOS, Android, and React Native projects.
- `clipstitchr demo upload ./demo.mp4` uploads an existing MP4/MOV/WebM file to
  the Demo library.
- `clipstitchr stitchr new` starts today's Stitchr Batch from the terminal.
- `clipstitchr swipr new` queues Swipr draft creation from the user's saved
  dashboard batch settings.
- `clipstitchr stitchr batch` and `clipstitchr swipr batch` remain hidden
  compatibility aliases for existing scripts.
- `clipstitchr queue stitch`, `clipstitchr queue swipe`, and
  `clipstitchr queue --all` add ready active work to the user's Post Bridge
  queue without asking for a date or time.
- `clipstitchr queue list` shows queued Stitches and Swipes coming up in the
  next 24 hours.
- `clipstitchr library ...` commands remain hidden compatibility aliases for
  old scripts; browsing belongs in the dashboard.
- `clipstitchr products` opens a focused product menu.
- `clipstitchr products list` prints saved product IDs and names for scripting.
- `clipstitchr products create` creates a product from the terminal, and
  `clipstitchr products create --use` also saves it to the repo config.
- `clipstitchr products use` lets the user pick or create the product this repo
  should use.
- `clipstitchr --plain ...` disables branded terminal colors for logs,
  screenshots, and CI. `NO_COLOR=1` does the same thing.

## Customer Education Surfaces

The CLI is now part of the public product offer, not only a terminal tool for
existing users.

- The main landing page includes `LandingCliSection`, which explains the CLI as
  the repo-side way to record demos, start new work, and queue finished work.
- The toolkit grid includes a "CLI for repo-side work" feature card that points
  to the same guide.
- `/docs/clipstitchr-cli` is backed by `clipstitchrCliDoc` in the customer docs
  collection, so the guide gets static metadata, sitemap coverage, and the
  normal docs sidebar. Command blocks use `CustomerDocCommandBlock` and include
  a copy button.
- `/docs/demo-cli` remains a legacy lookup alias through `legacyCustomerDocSlugs`
  so older links still resolve to the current guide.
- Account settings includes `SettingsClipstitchrCliPanel`, which shows the npm
  install command with a copy button and opens the setup guide in a new tab
  without adding a sidebar item.

## Auth Flow

The CLI uses a first-party device flow instead of storing a Clerk browser token.

1. The CLI calls `POST /api/cli/auth/device`.
2. The server creates a short-lived device authorization in Convex and returns a
   user code plus `/cli/connect?code=...`.
3. The CLI opens that URL.
4. If the user is signed out, `/cli/connect` sends them to Clerk sign-in and
   back to the same connect URL.
5. The user confirms the browser code matches the terminal code and clicks
   Connect this machine. If the URL was opened without a code, the page lets
   the user type the terminal code in the browser.
6. The CLI polls `POST /api/cli/auth/token`.
7. After approval, the server creates a 90-day CLI session and returns one
   bearer token.
8. The CLI stores the token in `~/.clipstitchr/credentials.json`.

The terminal never asks the user to type the code back in. The code exists so
the user can confirm that the browser approval is for the same CLI session that
is waiting in Terminal.

Convex stores only hashed device codes and hashed session tokens. Raw bearer
tokens are only shown to the CLI once.

## Upload Flow

The CLI does not stream large videos through the Next.js server.

1. The CLI calls `POST /api/cli/uploads/demo` with the chosen product, file
   size, and content type.
2. The server verifies the CLI session, verifies the product belongs to the
   session owner, consumes the normal R2 upload rate limits, and returns a signed
   R2 PUT URL.
3. The CLI uploads the local file directly to R2 with `Content-Type` and
   `Content-Length` headers.
4. The CLI calls `POST /api/cli/uploads/demo/complete`.
5. The server consumes upload video-analysis limits and queues the same
   `upload-normalization` media job used by browser uploads. CLI web recordings
   can include `layout: "smart-screen-demo"` plus click/cursor timing metadata.
   Guided recordings can also include walkthrough guide and step timing
   metadata for future chapters, captions, zooms, and edit decisions.
6. The CLI polls `GET /api/cli/uploads/{clipId}` until the normalized Demo
   appears in the Library.

## Batch And Queue Flow

Batch and queue commands are documented in
`docs/features/cli-batch-and-queue.md`.

`clipstitchr stitchr new` calls `POST /api/cli/stitchr/batches`, which
verifies the CLI bearer token, requires the saved or passed product ID, creates
product-scoped Stitchr Batch tasks through `stitchrBatch.plan`, and dispatches
the provider worker. The CLI route does not run the browser-session foreground
hook planner; the provider worker still creates fallback hook text and
finalization jobs for tasks that need text.

`clipstitchr swipr new` calls `POST /api/cli/swipr/batches`, which verifies
the CLI bearer token, creates a unique on-demand Swipr batch through
`cliSwipr.planCliSwiprBatch`, and dispatches the provider worker. This keeps
Swipr CLI creation aligned with the dashboard's saved batch settings instead of
asking the user to hand-build slides in the terminal.

`clipstitchr stitchr batch` and `clipstitchr swipr batch` still call the same
routes, but they are hidden from primary help so new users see the clearer
`new` commands first.

`clipstitchr queue stitch` calls `POST /api/cli/queue/stitches`. The route
verifies the Stitch belongs to the CLI session owner, requires a finished saved
Stitch video, uploads that video to Post Bridge without deleting the saved R2
asset, creates a queued Post Bridge post with `useQueue`, and attaches the post
reference back to the Stitch.

`clipstitchr queue swipe` calls `POST /api/cli/queue/swipes`. The route
verifies the Swipe belongs to the CLI session owner, requires a saved rendered
Swipe image, uploads that image to Post Bridge without deleting the saved R2
asset, creates a queued Post Bridge post with `useQueue`, and attaches the post
reference back to the Swipe. Full Swipe carousel or video rendering still stays
in the dashboard because that output is browser-rendered before upload.

`clipstitchr queue list` calls `GET /api/cli/queue/list`. The route verifies
the CLI bearer token, consumes the CLI Post Bridge read limit, loads Post Bridge
posts, filters them to queued or scheduled posts within 24 hours, and joins each
post to local Stitch/Swipe source mapping when available.

## Interactive Shell Flow

The root `clipstitchr` command mounts one persistent Ink workspace instead of a
sequence of one-action prompts. The workspace keeps a current menu state
(`main`, `demo`, `products`, `queue`, `native`, or `account`), command history,
and local product/repo/account context. Missing account or repo setup appears
first on the main menu. Once setup exists, the routine creation, queue, product,
and demo actions stay first. Native setup, doctor, and update remain under Setup
and account. Selecting an action runs the same command handler used by the
direct command path, refreshes local context, then opens a retained result view
in the same mounted workspace.

The result view buffers normal command output while the action runs. It keeps a
bounded page visible after completion, supports Page Up and Page Down for longer
output, and offers Back to the originating menu, Main menu, slash command, and
Exit controls. Choosing Back restores the action list; the list is not restored
automatically. Menu choice count adapts to terminal rows so the brand header
remains visible in shorter windows.

Slash commands are parsed locally, support quoted values, and dispatch to the
same command handlers as direct commands. The composer is available from every
menu. Tab accepts the selected completion. Enter runs complete commands and
expands command groups or options that still need a value. Ctrl+P and Ctrl+N
move through command history, and Escape returns to menu navigation. If an
action fails, the error stays visible in the result and the current menu remains
usable. Ctrl+C exits without printing a stack trace while the workspace is idle.

Slash command autocomplete uses a shared local registry of command names,
subcommands, option names, completion behavior, and meaningful search terms.
Deterministic ranking handles exact values, prefixes, ordered or partial command
tokens, natural option tokens, and limited typo tolerance. This lets
`/policy edit` find `/demo policy edit` without hiding the canonical command.
Typed values remain runnable through a "run exactly what you typed" fallback.
Suggestions do not use AI or call ClipStitchr APIs. The workspace header reads
only `.clipstitchr.yml` and saved local CLI credentials.

## Products Menu Flow

`clipstitchr products` opens a small menu with `Show my products`,
`Create a product`, and `Use a product for this repo`. The menu calls the same
handlers as `products list`, `products create`, and `products use`, so scripts
and direct terminal commands keep the same behavior.

## Recording Behavior

The first built-in recorder supports web apps and Expo web targets. It detects
common app folders such as `web/`, infers the start command from the app package
manager, checks common localhost ports, opens Chromium with a fixed 1440x900
desktop viewport, records that same 1440x900 frame with Playwright, then
converts the WebM to an MP4 while preserving the recorded dimensions. The fixed
viewport prevents browser chrome or window-maximize behavior from creating empty
padding below the recorded page.

During web recordings, the CLI captures clicks and throttled cursor movement in
the recording browser. Those events are sent with the upload completion request
so the media worker can render the Demo with a fit-with-background layout and
smooth zooms around interaction points. The captured metadata does not include
typed text, cookies, form values, screenshots, page HTML, or app data.

When the CLI starts the local app, it runs the start command in its own process
group and stops that group after recording. This prevents orphaned local dev
servers from keeping ports like `3000` busy after a recording is canceled.

Recording is guided and manual by default. Before recording, the CLI can create
a saved checklist from the product, selected local flow, app type, and the
user's goal. Saved guides live in `.clipstitchr/demo-guides/*.json`, and the
last used guide ID is stored in `.clipstitchr.yml`.

Repo setup also writes `.clipstitchr/app-context.json`, a source-derived map of
routes, workflow hints, form labels, and button names. Guide generation and
model-backed agent planning send a capped version of this context to the API so
requests like "use Hook Lab to add hooks" can map to visible controls such as
`Hooks to learn from` and `Save Hook Lab`.

When a guide is active, the CLI prints the full checklist, opens the recording
target, and steps through the guide in the terminal:

```text
Step 2 of 5: Upload a sample clip. Press Enter when this step is done.
```

Each completed step creates timing metadata. The upload completion request sends
the guide and timings as `walkthrough`, so the media job snapshot has enough
context for later chapters, captions, smart zooms, and Quick Edit decisions.

The user still clicks manually. This keeps the first shipped recorder
predictable and avoids an AI agent clicking through private or destructive flows
without explicit guardrails. `--no-guide` records one free-form take, and
`--guide <id-or-path>` reuses a guide by saved ID or JSON file path.

AI-assisted guide generation and the future autonomous browser agent are
planned in `docs/features/demo-ai-guide-and-agent-plan.md`. The current shipped
CLI intentionally keeps recording manual so the user stays in control while the
guide, click, and timing metadata mature.

Recording duration is guidance, not a hard stop. The CLI saves
`recommendedDurationSeconds` and `longRecordingWarningSeconds` in
`.clipstitchr.yml`; older `durationLimitSeconds` values are read as the
recommended duration for backward compatibility. New recordings warn after the
long-recording threshold, defaulting to 2 minutes, but continue until the user
presses Enter. After the MP4 is saved, the CLI reads the final duration, prints
the length, and warns before upload when the recording is long.

Most demos are easiest to edit when they are 30-90 seconds. Longer takes are
valid for apps with loading screens, AI generation, exports, or other processing
steps. ClipStitchr can use Quick Edit to remove pauses, waiting time, and dead
space while preserving the before/after result.

Target app authentication is handled through a persistent Playwright browser
profile in `.clipstitchr/browser-profile`. If the app being recorded requires a
login, the user can sign in during the first recording and reuse that browser
session on later recordings. The `.clipstitchr/` folder is ignored by Git so
target-app cookies and local browser state stay off the repo.

If Playwright's Chromium browser is missing, `clipstitchr demo manual` asks the
user whether to install the recording browser now, runs the matching Playwright
install command, then retries browser launch. `clipstitchr doctor` also reports
whether the recording browser is installed.

Native iOS, Android, and React Native projects use manual device recording. The
CLI does not build, sign, or launch native apps because those flows depend on
local schemes, signing teams, Expo dev builds, Metro state, and connected
devices. Instead, it checks the local recording tools, asks the user to open the
app in the simulator/emulator/device, starts recording, waits for the user to
walk through the demo, stops recording, and uploads the resulting MP4.

For iOS, the CLI uses `xcrun simctl io <device> recordVideo` against a booted
iOS Simulator. If no simulator is running, it can open Simulator and asks the
user to boot a simulator and open the app. After recording, the CLI checks the
saved dimensions and warns if the capture looks landscape for a mobile demo.

For Android and React Native Android, the CLI uses `adb shell screenrecord`,
pulls the MP4 back to the local `.clipstitchr/recordings` folder, and removes
the temporary device file. After recording, the CLI checks the saved dimensions
and warns if the capture looks landscape for a mobile demo. Android's platform
recorder may stop around 3 minutes even though ClipStitchr does not impose its
own 60-second cutoff.

`clipstitchr doctor` reports native setup status when the project is iOS,
Android, or React Native: Xcode command line tools, booted iOS Simulator, ADB,
and connected Android device.

## Terminal UX

The interactive shell uses one Ink/React renderer for its header, menus,
command composer, deterministic suggestions, retained results, and keyboard
hints. It uses the terminal's alternate screen and resets completed results to
the top, so output never appears on both sides of the header. Exiting restores
the previous terminal screen. Existing focused questions from recording and
setup workflows temporarily take input while their action runs, then return to
the same mounted workspace. The menu collapses to one working line during this
handoff, and the controller keeps stdin referenced after Ink releases raw mode
so an unanswered Inquirer prompt cannot let the process exit. It references and
resumes stdin again when the prompt-backed action returns because prompt cleanup
may pause the stream. Command helpers also avoid printing a second ClipStitchr
brand while the persistent workspace is active.

Guided flows still show progress states, setup key/value rows, success
confirmations, warnings, and copyable next commands. Direct commands do not use
the TUI frame, which keeps scripting output stable.

The persistent renderer only starts when stdout is an interactive terminal.
`--plain` sets
`CLIPSTITCHR_PLAIN=1` inside the process, and `NO_COLOR=1` is respected by the
shared terminal helpers. The interactive shell also falls back to the plain
prompt when stdout is not a TTY or the terminal is narrower than 56 columns.
`clipstitchr products list` stays tab-separated so it remains useful for
scripting.

## Guided Demo To Agent Plan

The walkthrough system is the first production-safe layer of the eventual demo
agent workflow.

1. Walkthrough Guide: the CLI asks what the user wants to show, creates a simple
   checklist, saves it to `.clipstitchr/demo-guides`, and shows it before
   recording.
2. Guided Recorder: the CLI records step timings while the user manually clicks
   through the app. Web recordings also include click and cursor timing.
3. AI-Assisted Script: a future server-side writer can generate better guides
   from product name, target audience, selected route, app type, and user goal.
   This should still require user review before recording.
4. Full AI Agent: a future recorder can drive the browser only after guardrails
   exist for demo/test credentials, route allowlists, app reset or seed data,
   max recording time, screenshots, action logs, stop-if-stuck behavior,
   destructive-action blocking, and user approval before upload.

The downloadable-agent option should be treated as a companion path rather than
the first implementation. ClipStitchr can export the guide as instructions for
the user's own coding agent, but the CLI-owned guide and timing metadata remains
the source of truth that upload processing understands.

## File Tree

```text
packages/clipstitchr-cli/
  LICENSE
  package.json
  src/api/
  src/auth/
  src/commands/
    findCliHelpCommand.ts
    runLibraryClipsCommand.ts
    runLibraryStitchesCommand.ts
    runLibrarySwipesCommand.ts
    runProductsCreateCommand.ts
    runProductsUseCommand.ts
    runQueueStitchCommand.ts
    runHelpCommand.ts
    runStatusCommand.ts
    runStitchrBatchCommand.ts
    runSwiprBatchCommand.ts
    runUnlinkCommand.ts
    runUpdateCommand.ts
  src/config/
    deleteProjectConfig.ts
    hasProjectConfig.ts
  src/demoGuide/
    createDemoWalkthroughGuide.ts
    createDemoWalkthroughGuideSteps.ts
    filterDemoWalkthroughGuidesForProduct.ts
    printDemoWalkthroughGuide.ts
    runDemoWalkthroughStepper.ts
    selectDemoWalkthroughGuide.ts
    writeDemoWalkthroughGuide.ts
  src/interactive/
  src/interactiveShell/
  src/native/
  src/project/
    scanAndWriteAppContext.ts
    scanProjectWorkflowHints.ts
  src/recording/
    defaultLongRecordingWarningSeconds.ts
    defaultRecommendedRecordingDurationSeconds.ts
    formatRecordingDuration.ts
    getBrowserProfileDirectoryPath.ts
    getRecordingsDirectoryPath.ts
    logRecordingBrowserOpeningMessage.ts
    readRecordingVideoDuration.ts
    resolveRecordingGuidance.ts
    startLongRecordingWarningTimer.ts
  src/terminal/
    colorize.ts
    logBrandHeader.ts
    logSuccess.ts
  src/update/
  src/upload/
  src/cli.ts

web/app/api/cli/
  auth/device/route.ts
  auth/approve/route.ts
  auth/token/route.ts
  auth/revoke/route.ts
  library/clips/route.ts
  library/stitches/route.ts
  library/swipes/route.ts
  me/route.ts
  products/route.ts
  queue/stitches/route.ts
  stitchr/batches/route.ts
  swipr/batches/route.ts
  uploads/demo/route.ts
  uploads/demo/complete/route.ts
  uploads/[clipId]/route.ts

web/app/cli/connect/
  CliConnectPageClient.tsx
  page.tsx

web/app/_components/docs/
  CustomerDocCommandBlock.tsx

web/app/_components/landing/
  LandingCliSection.tsx

web/app/_components/settings/
  SettingsClipstitchrCliPanel.tsx

web/app/_components/ui/
  CopyTextButton.tsx

web/lib/clipstitchr/docs/
  clipstitchrCliDoc.ts
  legacyCustomerDocSlugs.ts

web/lib/clipstitchr/server/cli/demoWalkthrough/
  readCliDemoWalkthroughMetadata.ts

web/convex/cliAuth/
web/convex/cliLibrary/
web/convex/cliPostBridge/
web/convex/cliProducts/
web/convex/cliRateLimits/
web/convex/cliSwipr/
web/convex/cliUploads/
```

## Local Development

Run the web app from `web/`:

```bash
npm run dev
```

Run the CLI against the local web app:

```bash
cd packages/clipstitchr-cli
CLIPSTITCHR_API_URL=http://localhost:3000 npm run dev
```

Useful direct commands:

```bash
npm run dev -- login
npm run dev -- init
npm run dev -- scan
npm run dev -- demo manual
npm run dev -- demo manual --no-guide
npm run dev -- demo upload ./demo.mp4
```

## Publishing

The package name `clipstitchr` was available on npm when checked on
July 5, 2026. Check again before publishing because package availability can
change.

First-time npm publish flow:

```bash
cd packages/clipstitchr-cli
npm login
npm whoami
npm run typecheck
npm pack --dry-run
npm publish
```

The package runs `npm run build` during `prepack`, so `dist/` is created for the
published package without committing build output.

The CLI package is MIT licensed. Keep `packages/clipstitchr-cli/LICENSE` in the
npm tarball so users receive the license text with the package.

## Production Checklist

- Deploy the web app with the CLI API routes and Convex schema/functions.
- Run Convex codegen/deploy so `cliDeviceAuthorizations` and `cliSessions`
  exist.
- Keep `RATE_LIMIT_API_SECRET`, Clerk, Convex, and R2 environment variables set
  in production.
- Confirm `/cli/connect` works after Clerk sign-in redirects.
- Run `clipstitchr login --api https://your-production-domain`.
- Run `clipstitchr demo manual --api https://your-production-domain --no-upload`
  and confirm `.clipstitchr/demo-guides/*.json` is created when the guide flow
  is accepted.
- Run `clipstitchr demo upload ./demo.mp4` against production.
- Run `npm pack --dry-run` and inspect the package contents.
- Publish to npm from `packages/clipstitchr-cli`.
- Reserve the package name quickly if the production launch date is later.
- Add a Homebrew tap only after the npm package is stable; npm is the first
  supported distribution path.
