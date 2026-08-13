# LazyReel v0.1.0 vendor snapshot

This directory preserves a complete, immutable copy of the LazyReel source
snapshot supplied at `/Users/starship/GitHub/lazyreel-master`.

## Boundary

- `upstream/` is the literal upstream tree. Do not edit files inside it.
- ClipStitchr adapters and product integration code must live outside
  `vendor/**` so project checks continue to cover that code.
- Upstream notices, source, corpus, documentation, wiki pages, companion
  skills, pipeline files, and committed build artifacts are preserved together.
- Do not import or execute `upstream/mcp/src/index.ts`. That module starts an
  MCP stdio server as a module side effect. ClipStitchr integrations should call
  focused adapter functions instead of loading the MCP entry point.

## Provenance

[`PROVENANCE.json`](./PROVENANCE.json) records the source path, snapshot ID,
copy time, previously observed inventory fingerprint, and authoritative manifest
details. The historical whole-tree fingerprint is retained for traceability,
but the original command that produced it is unavailable. Exact-copy checks use
the reproducible per-file manifest in [`SHA256SUMS`](./SHA256SUMS).

`SHA256SUMS` contains one line per regular file in `upstream/`. Paths are
relative to `upstream/`, sorted bytewise with `LC_ALL=C`, and written as a
lowercase SHA-256 digest, two ASCII spaces, the path, and an LF newline. The
SHA-256 digest of that complete manifest is recorded in `PROVENANCE.json`.

From `web/`, verify the snapshot without running upstream code:

```bash
npm run lazyreel:verify-vendor
```
