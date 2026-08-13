# Postiz vendor snapshot

This directory preserves an immutable copy of the complete tracked source tree
from the official Postiz repository at commit
`013db1dac7936054e77d40dd027ede0222771945`.

## Canonical source

- Repository: <https://github.com/gitroomhq/postiz-app>
- Default branch observed at fetch time: `main`
- Pinned commit: <https://github.com/gitroomhq/postiz-app/commit/013db1dac7936054e77d40dd027ede0222771945>
- Git tree: `817291b58d173470f330910f059d7ea26b97f0e1`
- Fetch date: `2026-08-12`

## Immutable boundary

- `upstream/` is the literal Git archive for the pinned commit. Do not edit it.
- All 929 tracked files are preserved, including hidden repository files,
  lockfiles, source, tests, assets, documentation, `LICENSE`, `CCLA.md`,
  `ICLA.md`, `SECURITY.md`, and build/deployment definitions.
- No upstream dependency was installed and no Postiz source or script was
  executed while acquiring or verifying the snapshot.
- ClipStitchr adapters and product integration code must live outside
  `vendor/**`. The vendor exclusion in TypeScript and ESLint must never be
  expanded to hide product-owned integration code.
- This snapshot is source and audit input only. It is not imported by the
  ClipStitchr application.

## Verification

[`PROVENANCE.json`](./PROVENANCE.json) records the repository, branch, commit,
tree object, acquisition time, preserved notices, file counts, and Git-object
verification. [`SHA256SUMS`](./SHA256SUMS) is the authoritative byte manifest.

The manifest contains one line per regular file in `upstream/`. Paths are
relative to `upstream/`, sorted bytewise with `LC_ALL=C`, and written as a
lowercase SHA-256 digest, two ASCII spaces, the path, and an LF newline. The
SHA-256 of that complete manifest is
`ce69e41feb70f7453520f95f3de538813958833c894582cf755eb1322473ecc7`.

From `web/`, verify every file without importing or executing Postiz:

```bash
npm run postiz:verify-vendor
```

[`INTEGRATION_COMPARISON.md`](./INTEGRATION_COMPARISON.md) records the focused
source and Git-history audit requested for Instagram, TikTok, YouTube, OAuth,
scheduling, analytics, security, and coexistence boundaries.
