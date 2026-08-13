# OpenCut Classic vendor snapshot

This directory preserves an immutable copy of the official OpenCut Classic
source tree at commit `cf5e79e919144200294fb9fed22a222592a0aeea`.

## Canonical source

- Repository: <https://github.com/opencut-app/opencut-classic>
- Default branch at fetch time: `main`
- Pinned commit: <https://github.com/opencut-app/opencut-classic/commit/cf5e79e919144200294fb9fed22a222592a0aeea>
- Git tree: `33e71daa26b9116be28f32adc8c96a6f34103f48`

The official OpenCut organization identifies this archived repository as the
original OpenCut codebase. The current rewrite repository also points users to
OpenCut Classic as the version to reach for today. This snapshot is therefore
the browser-editor baseline, not the incomplete rewrite scaffold.

The source itself confirms that distinction. In particular:

- `upstream/apps/web/src/app/editor/[project_id]/page.tsx` composes the editor
  provider, editor header, assets panel, properties panel, preview, and timeline.
- `upstream/apps/web/src/timeline/` contains timeline state, interactions,
  snapping, placement, resizing, keyframes, playback, and track components.
- `upstream/apps/web/src/preview/` contains the interactive preview viewport and
  transform controls.
- `upstream/apps/web/src/export/` and
  `upstream/apps/web/src/components/editor/export-button.tsx` contain browser
  export behavior.
- `upstream/apps/web/src/app/projects/page.tsx` creates, opens, duplicates,
  renames, and deletes saved editor projects.

## Immutable boundary

- `upstream/` is the literal Git archive for the pinned commit. Do not edit it.
- All tracked files are preserved, including the root `LICENSE`, lockfiles,
  documentation, browser application, desktop work, Rust packages, tests, and
  repository metadata files.
- ClipStitchr adapters and integration code must live outside `vendor/**` so
  project lint and type checks continue to cover that code.
- No upstream dependencies were installed and no upstream source was executed
  while acquiring or verifying this snapshot.

## Verification

[`PROVENANCE.json`](./PROVENANCE.json) records the repository, branch, commit,
tree object, acquisition time, file counts, and Git-object verification.
[`SHA256SUMS`](./SHA256SUMS) is the authoritative content manifest.

The manifest contains one line per regular file in `upstream/`. Paths are
relative to `upstream/`, sorted bytewise with `LC_ALL=C`, and written as a
lowercase SHA-256 digest, two ASCII spaces, the path, and an LF newline.

From `web/`, verify all files without importing or executing OpenCut:

```bash
npm run opencut:verify-vendor
```

