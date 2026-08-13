# Studio Beta Editor

## What it does

Studio Edit is a Product-scoped browser video editor at
`/dashboard/studio/edit`. It keeps classic ClipStitchr tools unchanged while
providing a separate Studio Beta workspace for combining Library clips,
Stitches, Studio uploads, text, captions, voice, and music.

The route is server-gated by the Studio Beta access model. The editor client is
loaded lazily after that gate passes. Projects autosave to Convex with immutable
save revisions, source and export media use owner-scoped R2 objects, and a
completed export can be saved to the active Product's existing Library.

## User workflow

1. Open Studio Edit with an active Product.
2. Create a project or reopen an active or archived project.
3. Add Product Library media, a saved Stitch, or a local image, video, or audio
   file. Text and caption layers can be created directly.
4. Arrange layers on the timeline and adjust timing, trim, split, transform,
   crop, rotation, opacity, audio, speed, typography, captions, and a small
   transition set.
5. Preview with frame-stepped transport controls. Undo, redo, and keyboard
   shortcuts remain local and immediate while the current snapshot autosaves.
6. Export a fresh MP4 in the browser. The result and poster are uploaded to
   Studio R2 and can be recorded in the active Product's Library.

## Architecture

The project format is `StudioEditorProjectV1`. It contains versioned scenes,
tracks, and layers with durable source identities only. Persisted snapshots do
not contain signed URLs. The source catalog resolves owned `videoClip` and
`stitch` records; uploaded files use `studioUpload` references. The schema also
reserves `studioOutput` references for later Studio phases.

Pure editor commands own add, update, remove, reorder, trim, and split behavior.
The history reducer wraps those commands for bounded undo and redo. Convex owns
project create, autosave, archive, reopen, get, and list operations with
optimistic revision checks and idempotency receipts. Every successful create,
autosave, archive, or reopen also appends an immutable snapshot revision. Recent
saved versions are readable in the editor without confusing them with local
undo and redo.

Browser export uses a new Media Bunny `Output`. Visual frames are read with
`CanvasSink`, composed onto a project canvas at the project frame rate, and
written through `CanvasSource`. Audio is read with `AudioBufferSink`, mixed in
an `OfflineAudioContext`, and written through `AudioBufferSource`. This is a
multi-source composition path and does not use Media Bunny's single-input
`Conversion` API.

The current browser export limit is ten minutes. Work that exceeds reliable
browser limits is not presented as an available background export until a
separate authenticated renderer is wired.

## OpenCut source baseline

The supplied `/Users/starship/GitHub/OpenCut-main` tree is the in-progress
rewrite scaffold. Its editor route renders `Coming soon`, so it is preserved as
source evidence but is not the working parity baseline.

The complete supplied rewrite is preserved literally at
`web/vendor/opencut/rewrite_supplied_8eefd45a/upstream` (127 files; manifest
SHA-256 `79b88f98506e83debf245a4dd66ba019f93e1dff2243fbb8238de8eb1a3632e5`).
Verify it with `npm run opencut-rewrite:verify-vendor`. No upstream code was
executed while copying or verifying it.

The working browser baseline is the official OpenCut Classic repository:

- Repository: `https://github.com/opencut-app/opencut-classic.git`
- Commit: `cf5e79e919144200294fb9fed22a222592a0aeea`
- Git tree: `33e71daa26b9116be28f32adc8c96a6f34103f48`
- Literal snapshot: `web/vendor/opencut/classic_cf5e79e/upstream`
- Files: 1,128 Git-visible files
- Snapshot digest: `c9ef06efaa180f2976b7d34bf589fa95ff8314959603096e68311046683ff502`
- Verification: `cd web && npm run opencut:verify-vendor`

The imported tree is preserved literally. ClipStitchr-owned integration code
lives outside the vendor boundary and follows the repository's atomic file
rules.

## Parity checklist

| Capability | Studio status | Proof or boundary |
| --- | --- | --- |
| Project create, autosave, archive, reopen | Included | Versioned Convex records, immutable revision history, optimistic revisions, idempotency, focused tests |
| Product Library and Stitch sources | Included | Rate-reserved owned source catalog with durable keys |
| Local image, video, voice, and music upload | Included | Studio R2 upload route and typed layer creation |
| Video, image, text, voice, music, and caption layers | Included | Strict `StudioEditorLayer` union and populated preview |
| Timeline ordering | Included | Three-track timeline with reorder commands and visible playhead |
| Frame-accurate trim and split | Included | Project-FPS snapping and source-bound validation |
| Crop, scale, position, rotation, opacity | Included | Inspector, preview, and export composition |
| Volume, mute, fades, and playback speed | Included | Preview/export audio scheduling and focused gain tests |
| Text and caption styling | Included | Typography, caption cue, and draw-path controls |
| Transitions | Included subset | None, crossfade, and dip where supported by the layer kind |
| Undo, redo, keyboard shortcuts | Included | Bounded pure history plus Space, S, Delete, and Cmd/Ctrl-Z variants |
| Browser preview | Included | Source synchronization and frame-stepped transport |
| Browser export | Included | Fresh Media Bunny output, mixed audio, MP4 result |
| R2 and Product Library save | Included | Owned media/poster uploads and existing `videoClips.save` path |
| Desktop Rust or Tauri shell | Excluded | Browser-only Next.js target |
| OpenCut auth, marketing, and duplicate file library | Excluded | Clerk, Studio access, Products, Library, and R2 replace them |
| OPFS or IndexedDB project persistence | Excluded | Convex project snapshots and owned R2 media replace it |
| Advanced keyframes, filters, grading, and effects | Excluded | Not required for the working Studio slice; no inactive controls are shown |
| Freeze frame | Excluded | Disabled in the Classic baseline and not reintroduced |
| Full upstream transition/adjustment roadmap | Excluded | Upstream marks portions as coming soon; Studio exposes only its tested subset |
| Multi-scene authoring UI | Excluded | The schema supports scenes; the current UI edits its primary scene |
| Arbitrary font-file rendering in the editor | Excluded | Current editor offers safe installed font choices; custom fonts belong to Studio Clips |
| Live audio waveforms | Excluded | Audio remains editable and audible without a decorative waveform placeholder |
| Server/background export | Excluded for now | Browser export is capped at ten minutes; no dead background control is rendered |
| Direct Studio Clips and Studio Stitch handoffs | Included | Destination routes reload durable owned output/source identifiers for the active Product |

## Security and rate limits

Every project and source-catalog entry point independently requires Clerk
authentication, exact Studio Beta access, and an active Product owned by the
caller. Rate limits do not substitute for ownership. Project snapshots are
strictly validated and capped at 256 KiB. Signed media URLs are short-lived and
are never persisted in project JSON.

Project writes consume the `studioEditorProjectWrite` owner and global buckets.
The source catalog consumes `studioEditorStaticRead` owner and global buckets
atomically before reading records. Uploads and export uploads use the existing
Studio R2 URL and byte budgets. Saving an export to the Library uses the
existing authenticated video-clip save protection.

## File tree

- `web/app/dashboard/studio/edit`: gated route, lazy client, and editor styles
- `web/app/_components/studio/editor`: atomic workbench components
- `web/lib/clipstitchr/hooks/studioEditor`: project, source, playback, upload,
  autosave, export, and shortcut hooks
- `web/lib/clipstitchr/studio/editor`: versioned project model, commands,
  validation, serialization, and history
- `web/lib/clipstitchr/media/studioEditor`: preview/export media composition
- `web/lib/clipstitchr/types/studioEditor`: public editor contracts
- `web/convex/studioEditorProjects`: Product-scoped project lifecycle and
  immutable save revisions
- `web/convex/studioEditorMedia`: owned source catalog
- `web/convex/studioEditorRateLimits`: owner/global reservations
- `web/vendor/opencut/classic_cf5e79e`: literal upstream snapshot and verifier
- `web/vendor/opencut/rewrite_supplied_8eefd45a`: literal supplied rewrite and
  verifier

## Testing and verification

Focused tests cover project validation, serialization, commands, trim/split,
local undo/redo, durable revision history, ownership, idempotency, snapshot bounds, source catalogs, audio gain,
source resolution, export assembly, transport, source cards, and route access.
TypeScript and focused ESLint are required in addition to the vendor integrity
check. Browser QA covers desktop and mobile layouts, pointer and keyboard input,
project/layer controls, transport, focus visibility, and overflow.

The local component workflow was exercised at 1440×900 and 390×844 with real
pointer and keyboard input. Add, edit, select, undo, redo, play, pause, and
source-layer actions responded; the fresh-tab console was clean. That pass moved
the preview ahead of secondary source controls, corrected sub-44-pixel actions,
and fixed a mobile intrinsic-width leak so the timeline and contact sheet scroll
inside their own regions instead of widening the page. Direct navigation to the
real route under development bypass still returned the read-only Studio
unavailable surface, confirming that the fixture did not weaken access control.

## Known limitations

- Export depends on browser codec support and available memory.
- The present UI edits one scene even though the data model is scene-aware.
- Provider-backed background rendering is not wired or advertised.
- Studio Clips and Studio Stitch outputs can open the editor through durable
  Product-scoped handoffs; an unavailable or mismatched source fails safely.
- Existing classic Stitchr, Hook Lab, Schedule, and Analytics remain unchanged.
