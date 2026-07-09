# ClipStitchr CLI

Record guided product demos from a local or live app, upload finished demo
files, start batch content, and queue finished Stitches in ClipStitchr.

```bash
npx clipstitchr
```

Useful commands:

```bash
clipstitchr help
clipstitchr --version
clipstitchr link
clipstitchr status
clipstitchr update
clipstitchr demo auto
clipstitchr demo auto --driver openai-computer
clipstitchr demo auto --driver openai-computer --openai-mode relay
clipstitchr demo auto --driver openai-computer --target live --url https://example.com
clipstitchr demo auto --driver openai-computer --surface macos-window --openai-mode relay
clipstitchr demo guide generate
clipstitchr demo guide list
clipstitchr demo guide show "Checkout flow"
clipstitchr demo guide edit "Checkout flow"
clipstitchr demo guide delete guide_123
clipstitchr demo guide export-instructions guide_123
clipstitchr demo policy init
clipstitchr demo policy check
clipstitchr demo policy edit
clipstitchr demo agent init
clipstitchr demo agent check
clipstitchr demo agent run --guide "Checkout flow" --dry-run
clipstitchr demo agent run --guide "Checkout flow"
clipstitchr demo agent run --guide guide_123 --ai-planner --dry-run
clipstitchr demo agent run --guide guide_123 --driver openai-computer
clipstitchr demo agent run --guide guide_123 --driver openai-computer --target live --url https://example.com
clipstitchr demo agent run --guide guide_123 --no-upload
clipstitchr demo agent export-log agent_run_123
clipstitchr demo make
clipstitchr demo make --guide "Checkout flow"
clipstitchr demo make --no-guide
clipstitchr demo upload ./demo.mp4
clipstitchr stitchr batch
clipstitchr swipr batch
clipstitchr library clips --kind demo
clipstitchr library stitches --ready
clipstitchr library swipes
clipstitchr queue stitch
clipstitchr products list
clipstitchr products create --use
clipstitchr products use
clipstitchr native helper build
clipstitchr native helper check
clipstitchr unlink
clipstitchr --plain status
```

If the repo is linked, your ClipStitchr account is connected, and the saved
browser profile is already signed into your app, `clipstitchr demo auto` writes
the guide with ClipStitchr AI and records the demo with the guarded AI agent in
one command. It can use localhost by default, or a live/staging URL with
`--target live`. It saves the guide, MP4, screenshots, action log, and run
summary locally without asking questions. It does not upload automatically.

The built-in recorder can also create a simple walkthrough checklist before
each demo. You can run `clipstitchr demo guide generate` to draft a guide with
ClipStitchr first, review it, edit it, and save it for the next recording.
Saved guides get readable names like `Checkout flow`, and `demo guide list`
shows those names first. You can use a guide name, ID, or file path with
`demo guide show`, `edit`, `delete`, `export-instructions`, `demo make
--guide`, and `demo agent run --guide`.
During recording, the terminal walks through each step and records section
timing metadata for ClipStitchr to use later for chapters, captions, smart
zooms, and editing decisions. Use `--no-guide` when you want one free-form take,
or `--guide` when you want to reuse a saved guide from
`.clipstitchr/demo-guides`.

Recording is still manual by default: the CLI opens your app in Chromium, you
click through the demo, then press Enter in the terminal as each step is done.
If your app requires login, sign in inside the recorder browser once. The CLI
keeps that app browser session in `.clipstitchr/browser-profile` so future
recordings can stay signed in.

The demo agent beta is policy guarded. `clipstitchr demo policy init` creates
the local safety settings and lets you review them before saving.
`clipstitchr demo policy check` confirms the saved policy is valid. Localhost
app URLs are the default. Live or staging URLs need a separate yes before they
are allowed. File uploads stay off unless you name the exact local files the
agent may use. Run `clipstitchr demo policy edit` when routes, test values,
blocked words, upload files, or time limits need to change. `clipstitchr demo
auto` creates the same safe policy automatically when one does not exist.

The automatic agent uses OpenAI Computer Use when `OPENAI_API_KEY` is available
locally, or the hosted ClipStitchr relay when you are logged in and no local key
is available. Relay mode sends screenshots through ClipStitchr servers and
never sends a server OpenAI key back to the CLI. If neither direct nor relay
mode is available, it falls back to the structured planner. `clipstitchr demo
agent init` and `clipstitchr demo agent check` still work as legacy aliases,
but new setup should use `demo policy`. The same policy validator always
decides what can run.

Most demos work best around 30-90 seconds. Longer recordings are allowed, and
the CLI warns after about 2 minutes without stopping the recording. That is
useful for apps with longer loading, AI generation, or processing steps because
ClipStitchr can cut pauses and waiting time during Quick Edit.

If the recording browser is not installed yet, interactive recording commands
ask to install it before recording starts. `clipstitchr demo auto` is
non-interactive, so it tells you the install command to run instead.

Batch commands let you start Stitchr and Swipr draft creation from Terminal.
`clipstitchr stitchr batch` creates today's Stitchr batch from recent UGC and
Demo clips. `clipstitchr swipr batch` queues Swipr drafts using your dashboard
batch settings. `clipstitchr queue stitch` adds a finished Stitch to your Post
Bridge queue without asking for a date or time.

The CLI uses light branded terminal output for guided flows, setup checks,
recording progress, upload progress, success states, warnings, and next
commands. Use `--plain` or `NO_COLOR=1` when you want uncolored output for logs
or screenshots.

Setup detects common nested app folders like `web/`, infers the start command,
skips the product picker when your account only has one product, and prefers a
localhost URL that is already running.

`clipstitchr link` connects the current repo to a product. `clipstitchr init`
does the same thing for developers who expect an init command. `clipstitchr
unlink` removes the repo connection without logging the whole machine out.

For native demos, the CLI can manually record an already-running iOS Simulator
or Android device/emulator. Automatic OpenAI demos can also use
`--surface macos-window` to select a visible macOS window such as Simulator,
iPhone Mirroring, or an emulator. The helper needs Screen Recording and
Accessibility permissions and currently saves screenshots/action logs; full
helper-owned MP4 capture is still handled by the manual native recorder path.

For local development against a preview app:

```bash
CLIPSTITCHR_API_URL=http://localhost:3000 npm run dev
```

The CLI stores project settings in `.clipstitchr.yml`, saved walkthroughs in
`.clipstitchr/demo-guides`, local browser state in `.clipstitchr`, and machine
credentials in `~/.clipstitchr/credentials.json`.
