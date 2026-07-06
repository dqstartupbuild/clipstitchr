# Demo CLI Tool

The Demo CLI lets a user type one command, record or choose a product demo, and
send it to the ClipStitchr Demo library.

```bash
clipstitchr
```

The npm package lives outside the web app at `packages/clipstitchr-cli`. The web
app only owns the production API surfaces the CLI needs: machine login, product
selection/creation, R2 upload signing, upload completion, and upload status.

## What It Does

- `clipstitchr` opens a guided prompt for making a demo, uploading an existing
  demo, connecting the repo, or checking setup.
- `clipstitchr login` opens the browser and connects the machine to the user's
  ClipStitchr account.
- `clipstitchr init` writes `.clipstitchr.yml` with the product, local app URL,
  start command, and full-size recording defaults.
- `clipstitchr init` detects common nested app folders like `web/`, skips the
  product picker when the account has one product, and prefers a localhost URL
  that is already running.
- `clipstitchr scan` detects likely demo flows from local app routes.
- `clipstitchr demo make` records a local web/Expo-web app in a normal desktop
  Chromium window, converts the recording to MP4, and offers to upload it.
- `clipstitchr demo make` captures click and cursor timing while recording web
  demos so the media worker can add smart zooms around the parts the user
  interacts with.
- `clipstitchr demo make` can also record an already-running iOS Simulator or
  Android device/emulator for iOS, Android, and React Native projects.
- `clipstitchr demo upload ./demo.mp4` uploads an existing MP4/MOV/WebM file to
  the Demo library.
- `clipstitchr products list` prints saved product IDs and names for scripting.

## Auth Flow

The CLI uses a first-party device flow instead of storing a Clerk browser token.

1. The CLI calls `POST /api/cli/auth/device`.
2. The server creates a short-lived device authorization in Convex and returns a
   user code plus `/cli/connect?code=...`.
3. The CLI opens that URL.
4. The user signs in with Clerk in the normal web app and approves the code.
5. The CLI polls `POST /api/cli/auth/token`.
6. After approval, the server creates a 90-day CLI session and returns one
   bearer token.
7. The CLI stores the token in `~/.clipstitchr/credentials.json`.

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
6. The CLI polls `GET /api/cli/uploads/{clipId}` until the normalized Demo
   appears in the Library.

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

Recording is manual by default. The CLI opens the app in Chromium, the user
clicks through the demo, and the user presses Enter in the terminal when the
take is done. This keeps the first shipped recorder predictable and avoids an AI
agent clicking through private or destructive flows without explicit guardrails.
The CLI prints the recording instructions before Chromium opens so the user
knows to return to the terminal after finishing the browser walkthrough.

Target app authentication is handled through a persistent Playwright browser
profile in `.clipstitchr/browser-profile`. If the app being recorded requires a
login, the user can sign in during the first recording and reuse that browser
session on later recordings. The `.clipstitchr/` folder is ignored by Git so
target-app cookies and local browser state stay off the repo.

If Playwright's Chromium browser is missing, `clipstitchr demo make` asks the
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
and warns if the capture looks landscape for a mobile demo.

`clipstitchr doctor` reports native setup status when the project is iOS,
Android, or React Native: Xcode command line tools, booted iOS Simulator, ADB,
and connected Android device.

## File Tree

```text
packages/clipstitchr-cli/
  package.json
  src/api/
  src/auth/
  src/commands/
  src/config/
  src/interactive/
  src/native/
  src/project/
  src/recording/
  src/upload/
  src/cli.ts

web/app/api/cli/
  auth/device/route.ts
  auth/approve/route.ts
  auth/token/route.ts
  auth/revoke/route.ts
  me/route.ts
  products/route.ts
  uploads/demo/route.ts
  uploads/demo/complete/route.ts
  uploads/[clipId]/route.ts

web/app/cli/connect/
  CliConnectPageClient.tsx
  page.tsx

web/convex/cliAuth/
web/convex/cliProducts/
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
npm run dev -- demo make
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

## Production Checklist

- Deploy the web app with the CLI API routes and Convex schema/functions.
- Run Convex codegen/deploy so `cliDeviceAuthorizations` and `cliSessions`
  exist.
- Keep `RATE_LIMIT_API_SECRET`, Clerk, Convex, and R2 environment variables set
  in production.
- Confirm `/cli/connect` works after Clerk sign-in redirects.
- Run `clipstitchr login --api https://your-production-domain`.
- Run `clipstitchr demo upload ./demo.mp4` against production.
- Run `npm pack --dry-run` and inspect the package contents.
- Publish to npm from `packages/clipstitchr-cli`.
- Reserve the package name quickly if the production launch date is later.
- Add a Homebrew tap only after the npm package is stable; npm is the first
  supported distribution path.
