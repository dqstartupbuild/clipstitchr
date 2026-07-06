# ClipStitchr CLI

Record product demos from a local app and upload finished demo files to your
ClipStitchr Demo library.

```bash
npx clipstitchr
```

For local development against a preview app:

```bash
CLIPSTITCHR_API_URL=http://localhost:3000 npm run dev
```

The CLI stores project settings in `.clipstitchr.yml` and machine credentials in
`~/.clipstitchr/credentials.json`.
