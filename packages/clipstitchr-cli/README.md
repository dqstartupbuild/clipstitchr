# ClipStitchr CLI

Record guided product demos from a local app, upload finished demo files, start
batch content, and queue finished Stitches in ClipStitchr.

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
clipstitchr demo guide generate
clipstitchr demo guide list
clipstitchr demo guide show guide_123
clipstitchr demo guide edit guide_123
clipstitchr demo guide delete guide_123
clipstitchr demo guide export-instructions guide_123
clipstitchr demo agent init
clipstitchr demo agent check
clipstitchr demo agent run --guide guide_123 --dry-run
clipstitchr demo agent run --guide guide_123
clipstitchr demo agent run --guide guide_123 --ai-planner --dry-run
clipstitchr demo agent run --guide guide_123 --driver openai-computer
clipstitchr demo agent run --guide guide_123 --no-upload
clipstitchr demo agent export-log agent_run_123
clipstitchr demo make
clipstitchr demo make --guide guide_123
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
clipstitchr unlink
clipstitchr --plain status
```

If the repo is linked, your ClipStitchr account is connected, and the saved
browser profile is already signed into your app, `clipstitchr demo auto` writes
the guide with ClipStitchr AI and records the demo with the guarded local AI
agent in one command. It saves the guide, MP4, screenshots, action log, and run
summary locally without asking questions. It does not upload automatically.

The built-in recorder can also create a simple walkthrough checklist before
each demo. You can run `clipstitchr demo guide generate` to draft a guide with
ClipStitchr first, review it, edit it, and save it for the next recording.
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

The local demo agent beta is policy guarded. `clipstitchr demo auto` creates the
policy automatically when one does not exist. Use the lower-level
`clipstitchr demo agent init`, `check`, and `run` commands when you want to
inspect the policy, run a dry-run, or record from an existing guide. The same
local policy validator always decides what can run.

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

For native demos, the CLI records an already-running iOS Simulator or Android
device/emulator. Open the app to the screen you want, then let the CLI start and
stop the recording. Android recording depends on `adb screenrecord`, which may
stop around 3 minutes.

For local development against a preview app:

```bash
CLIPSTITCHR_API_URL=http://localhost:3000 npm run dev
```

The CLI stores project settings in `.clipstitchr.yml`, saved walkthroughs in
`.clipstitchr/demo-guides`, local browser state in `.clipstitchr`, and machine
credentials in `~/.clipstitchr/credentials.json`.
