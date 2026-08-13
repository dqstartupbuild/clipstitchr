# Supplied OpenCut rewrite snapshot

This directory preserves the complete source tree supplied at
`/Users/starship/GitHub/OpenCut-main` for the Studio Beta implementation.

## Why both OpenCut snapshots exist

The supplied tree is the newer rewrite scaffold. Its web editor route currently
renders `Coming soon`, and its own README directs users to OpenCut Classic for a
working editor. It is retained literally so the supplied source, roadmap, brand
assets, Rust packages, and future rewrite architecture remain traceable.

The working browser-editor parity baseline is separately pinned at
`../classic_cf5e79e/`. ClipStitchr integration code lives outside both immutable
vendor boundaries.

## Immutable boundary

- `upstream/` is an archive-mode copy of the complete supplied tree.
- No source, notice, configuration, lockfile, brand asset, or test was omitted.
- No upstream dependency was installed and no upstream source or script was
  executed during acquisition or verification.
- Do not edit files beneath `upstream/`.

## Verification

`PROVENANCE.json` records the supplied source path, acquisition result, counts,
and manifest identity. `SHA256SUMS` contains one SHA-256 record for every
regular file under `upstream/`.

From `web/`, verify the snapshot without importing OpenCut:

```bash
npm run opencut-rewrite:verify-vendor
```

The focused verifier test is intentionally outside the application's normal
vendor exclusion and can be run explicitly:

```bash
npx vitest run --config vendor/opencut/rewrite_supplied_8eefd45a/verification/vitest.config.mjs
```
