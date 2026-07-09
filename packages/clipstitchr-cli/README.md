# ClipStitchr CLI

Record guided product demos from a local or live app, upload finished demo
files, start new content, and queue ready content in ClipStitchr.

```bash
npx clipstitchr
```

Running `clipstitchr` opens a persistent main menu. You can move between Demo,
Products, Queue, Native, and Account menus, run an action, and land back in the
same menu when it finishes. Choose `Demos`, then pick `Record it myself` for
manual recording or `Let AI record it for me` for a policy-guarded AI run with
a saved guide.
Every menu also has Back, Main menu, Exit, and Type a slash command actions.
Slash commands let you stay in the interactive shell while running direct
commands, such as `/demo manual`, `/demo agent --guide "Checkout flow"`,
`/queue stitch --all`, `/products use product_123`, and `/status`.
Run `clipstitchr queue` when you want a focused queue menu for latest, all, or
specific Stitch and Swipe queue actions.

Useful commands:

```bash
clipstitchr help
clipstitchr --version
clipstitchr link
clipstitchr status
clipstitchr update
clipstitchr demo
clipstitchr demo agent
clipstitchr demo agent --guide "Checkout flow"
clipstitchr demo agent --driver openai-computer
clipstitchr demo agent --driver openai-computer --openai-mode relay
clipstitchr demo agent --driver openai-computer --target live --url https://example.com
clipstitchr demo agent --driver openai-computer --surface macos-window --openai-mode relay
clipstitchr demo guide create
clipstitchr demo guide list
clipstitchr demo guide show "Checkout flow"
clipstitchr demo guide edit "Checkout flow"
clipstitchr demo guide delete guide_123
clipstitchr demo guide save-instructions guide_123
clipstitchr demo policy init
clipstitchr demo policy check
clipstitchr demo policy edit
clipstitchr demo agent --guide guide_123 --driver openai-computer
clipstitchr demo agent --guide guide_123 --driver openai-computer --target live --url https://example.com
clipstitchr demo agent --guide guide_123 --no-upload
clipstitchr demo logs agent_run_123
clipstitchr demo manual
clipstitchr demo manual --guide "Checkout flow"
clipstitchr demo manual --no-guide
clipstitchr demo upload ./demo.mp4
clipstitchr stitchr new
clipstitchr swipr new
clipstitchr queue
clipstitchr queue list
clipstitchr queue stitch
clipstitchr queue stitch --all
clipstitchr queue swipe
clipstitchr queue swipe --all
clipstitchr queue --all
clipstitchr products
clipstitchr products list
clipstitchr products create --use
clipstitchr products use
clipstitchr native init
clipstitchr native init --force
clipstitchr native check
clipstitchr unlink
clipstitchr --plain status
```

If the repo is linked, your ClipStitchr account is connected, and the saved
browser profile is already signed into your app, `clipstitchr demo agent`
writes a guide with ClipStitchr AI and records the demo with the guarded AI
agent in one command. Use `clipstitchr demo agent --guide "Checkout flow"` when
you want to record from an existing guide. It can use localhost by default, or
a live/staging URL with `--target live`. It saves the guide, MP4, screenshots,
action log, and run summary locally. By default it asks you to review before
upload. Use `--no-upload` to keep the MP4 local or `--upload` to upload without
the review prompt.

The built-in recorder can also create a simple walkthrough checklist before
each demo. Run `clipstitchr demo` when you want a focused menu for recording,
AI recording, guides, safety policy setup, uploads, and logs. You can run
`clipstitchr demo guide create` directly to draft a guide with
ClipStitchr first, review it, edit it, and save it for the next recording.
Saved guides get readable names like `Checkout flow`, and `demo guide list`
shows those names first. You can use a guide name, ID, or file path with
`demo guide show`, `edit`, `delete`, `save-instructions`, `demo manual
--guide`, and `demo agent --guide`.
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
ask to install it before recording starts. `clipstitchr demo agent` is
non-interactive, so it tells you the install command to run instead.

Creation commands let you start Stitchr and Swipr draft work from Terminal.
`clipstitchr stitchr new` creates today's Stitchr batch from recent UGC and
Demo clips. `clipstitchr swipr new` queues Swipr drafts using your dashboard
batch settings. Existing scripts can keep using the hidden `stitchr batch` and
`swipr batch` aliases. Queue commands add ready active content to your Post
Bridge queue without asking for a date or time. `clipstitchr queue list` shows
queued Stitches and Swipes coming up in the next 24 hours.
`clipstitchr queue stitch` picks the latest ready active Stitch unless you pass an ID,
`clipstitchr queue swipe` picks the latest ready active Swipe, and `--all`
queues active items one at a time. Dashboard browsing remains the best way to
inspect your whole Library. CLI Swipe queueing uses the saved rendered Swipe
image; open the dashboard when you need to render and queue the full carousel
or video version.

The interactive shell uses a styled terminal frame with the current menu,
recent status, keyboard hints, slash-command examples, and navigation reminders.
When the terminal is too narrow, is not interactive, or uses `--plain` or
`NO_COLOR=1`, the CLI falls back to simple prompt output. Direct commands stay
plain and script-friendly.

Setup detects common nested app folders like `web/`, infers the start command,
skips the product picker when your account only has one product, and prefers a
localhost URL that is already running.

Run `clipstitchr products` when you want a focused menu for listing products,
creating a new product, or choosing the product this repo should use. Direct
commands such as `clipstitchr products list`, `clipstitchr products create`,
and `clipstitchr products use` still work for scripts.

`clipstitchr link` connects the current repo to a product. `clipstitchr init`
does the same thing for developers who expect an init command. `clipstitchr
unlink` removes the repo connection without logging the whole machine out.

For native demos, browser recording works everywhere the recorder browser runs.
Manual native recording can capture an already-running iOS Simulator or Android
device/emulator; Android manual recording uses `adb screenrecord` when Android
tools are installed. Automatic OpenAI demos can use `--surface macos-window` on
macOS to select and control a visible window such as iOS Simulator, iPhone
Mirroring, an Android emulator window, or a selected desktop app. Run
`clipstitchr native init` once per Mac to install the helper under
`~/Library/Application Support/ClipStitchr/`, and run `clipstitchr native init
--force` to repair it. `clipstitchr native check` verifies the helper plus
Screen Recording and Accessibility permissions. On Windows, native
visible-window automation is not available yet, but browser demos still work.
Future adapter notes use `windows-window` for Windows visible-window control and
`android-adb` for direct Android ADB AI control; those adapters are not shipped
today. Window runs currently save screenshots/action logs; full helper-owned
MP4 capture is still handled by the manual native recorder path.

For local development against a preview app:

```bash
CLIPSTITCHR_API_URL=http://localhost:3000 npm run dev
```

The CLI stores project settings in `.clipstitchr.yml`, saved walkthroughs in
`.clipstitchr/demo-guides`, local browser state in `.clipstitchr`, and machine
credentials in `~/.clipstitchr/credentials.json`.
