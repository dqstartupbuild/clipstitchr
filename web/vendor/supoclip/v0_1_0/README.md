# SupoClip v0.1.0 vendor snapshot

This directory preserves the complete SupoClip source tree supplied at
`/Users/starship/GitHub/supoclip-main`.

## Boundary

- `upstream/` is the literal supplied tree. Do not edit files inside it.
- No upstream module, script, worker, migration, build, or installer was run to
  create this snapshot.
- No upstream dependencies were installed.
- SupoClip adapters and ClipStitchr product integration must live outside this
  directory so application checks cover the owned code.
- Source, assets, tests, documentation, lockfiles, hidden configuration,
  scripts, and the upstream `LICENSE` are preserved without omissions.

## Provenance and integrity

[`PROVENANCE.json`](./PROVENANCE.json) records the supplied path, 0.1.0 version
evidence, copy method, source comparison, file and directory counts, and the
authoritative snapshot fingerprint.

[`SHA256SUMS`](./SHA256SUMS) contains one line for every regular file under
`upstream/`. Paths are relative to `upstream/`, sorted bytewise with
`LC_ALL=C`, and written as a lowercase SHA-256 digest, two ASCII spaces, the
path, and an LF newline. The SHA-256 of the complete manifest is the snapshot
fingerprint recorded in `PROVENANCE.json`.

The verifier reads files only. It rejects absolute, duplicate, non-canonical,
or boundary-escaping manifest paths; rejects symlinks and other unsupported
filesystem entries; detects added, removed, or modified files; and checks the
directory count.

From `web/`, run the standalone verifier without executing upstream code:

```bash
node vendor/supoclip/v0_1_0/verify-snapshot.mjs
```

Run the focused verification tests with:

```bash
npx vitest run vendor/supoclip/v0_1_0/verification
```
