# ClipStitchr CLI

Record product demos from a local app and upload finished demo files to your
ClipStitchr Demo library.

```bash
npx clipstitchr
```

The built-in recorder is manual by default: it opens your app in Chromium, you
click through the demo, then press Enter in the terminal when the take is done.
If your app requires login, sign in inside the recorder browser once. The CLI
keeps that app browser session in `.clipstitchr/browser-profile` so future
recordings can stay signed in.

Setup detects common nested app folders like `web/`, infers the start command,
skips the product picker when your account only has one product, and prefers a
localhost URL that is already running.

For local development against a preview app:

```bash
CLIPSTITCHR_API_URL=http://localhost:3000 npm run dev
```

The CLI stores project settings in `.clipstitchr.yml` and machine credentials in
`~/.clipstitchr/credentials.json`.
