# ClipStitchr CLI

Record product demos from a local app and upload finished demo files to your
ClipStitchr Demo library.

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
clipstitchr demo make
clipstitchr demo upload ./demo.mp4
clipstitchr products list
clipstitchr products create --use
clipstitchr products use
clipstitchr unlink
```

The built-in recorder is manual by default: it opens your app in Chromium, you
click through the demo, then press Enter in the terminal when the take is done.
If your app requires login, sign in inside the recorder browser once. The CLI
keeps that app browser session in `.clipstitchr/browser-profile` so future
recordings can stay signed in.

If the recording browser is not installed yet, the CLI asks to install it before
recording starts.

Setup detects common nested app folders like `web/`, infers the start command,
skips the product picker when your account only has one product, and prefers a
localhost URL that is already running.

`clipstitchr link` connects the current repo to a product. `clipstitchr init`
does the same thing for developers who expect an init command. `clipstitchr
unlink` removes the repo connection without logging the whole machine out.

For native demos, the CLI records an already-running iOS Simulator or Android
device/emulator. Open the app to the screen you want, then let the CLI start and
stop the recording.

For local development against a preview app:

```bash
CLIPSTITCHR_API_URL=http://localhost:3000 npm run dev
```

The CLI stores project settings in `.clipstitchr.yml` and machine credentials in
`~/.clipstitchr/credentials.json`.
