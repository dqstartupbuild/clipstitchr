# ReelClaw vendor snapshot

This directory preserves a complete, immutable copy of the ReelClaw source
supplied at `/Users/starship/GitHub/reelclaw-main`.

## Stable snapshot name

The supplied tree does not declare a semantic version or include Git metadata.
Its stable vendor name is therefore content-addressed as `snapshot_bdeb17ca`,
using the first eight characters of its deterministic whole-tree SHA-256.

## Immutable boundary

- `upstream/` is the literal supplied tree. Do not edit files inside it.
- All 14 supplied files are preserved, including `README.md`, `SKILL.md`, every
  reference, the talking-video Python builder, the JSON template, poster, and
  example video.
- The supplied source contains no standalone `LICENSE`, `COPYING`, or `NOTICE`
  file. No supplied notice file was omitted.
- ClipStitchr adapters and product integration code must live outside
  `vendor/**` so project lint and type checks continue to cover that code.
- No upstream dependency was installed and no ReelClaw source, script, or media
  was executed while acquiring or verifying this snapshot.

## Verification

[`PROVENANCE.json`](./PROVENANCE.json) records the source path, copy time,
content fingerprint, file and directory counts, byte count, and source-tree
comparison. [`SHA256SUMS`](./SHA256SUMS) is the authoritative manifest.

The manifest contains one line per regular file in `upstream/`. Paths are
relative to `upstream/`, sorted bytewise with `LC_ALL=C`, and written as a
lowercase SHA-256 digest, two ASCII spaces, the path, and an LF newline.

From `web/`, verify the snapshot without importing or executing ReelClaw:

```bash
npm run reelclaw:verify-vendor
```

