# Dashboard Library Storage

ClipStitchr keeps dashboard library state in one persistent client provider:

- `web/app/dashboard/layout.tsx` wraps all dashboard routes with `DashboardLibraryProvider`.
- `useClipLibrary()` and `usePhotoLibrary()` read from that shared context, so navigation between `/dashboard`, `/dashboard/uploads`, `/dashboard/stitchr`, `/dashboard/swapr`, and `/dashboard/stitches` does not remount separate clip/photo library loaders.
- The provider stores clip/photo metadata in React state and caches full records only after a caller asks for them through `loadClip(id)` or `loadPhoto(id)`.

## IndexedDB Stores

Database version `4` splits large blobs from list metadata:

| Store | Purpose |
| --- | --- |
| `videoClipMetadata` | Clip names, tags, type, dimensions, duration, trim defaults, sizes, generated `posterBlob`, and `posterVersion`. |
| `videoClipBlobs` | Full normalized video `Blob` by clip id. |
| `photoAssetMetadata` | Photo names, tags, dimensions, sizes, preparation metadata, and generated `thumbnailBlob`. |
| `photoAssetBlobs` | Full normalized photo `Blob` and optional original photo `Blob` by photo id. |
| `createdVideos` | Stitched exports. These still store the export `Blob` with the stitch record. |

Older `videoClips` and `photoAssets` stores are migrated into the split stores during the version `4` IndexedDB upgrade if they exist.

## Read Policy

List-oriented dashboard views should render from metadata records:

- Clip/photo library pages load metadata and small preview images first.
- `getVideoClips()` and `getPhotoAssets()` read metadata through cursor pages over the `createdAt` index instead of `getAll()`.
- Full video blobs are loaded only for preview playback, trim dialogs, Stitchr preview/export, Swapr generation, and direct downloads.
- Full photo blobs are loaded only for Swapr generation and direct downloads.

When adding a new feature, prefer passing `VideoClipMetadata` or `PhotoAssetMetadata` through list UI. Fetch the full record as late as possible with `loadClip(id)`, `loadPhoto(id)`, `getVideoClip(id)`, or `getPhotoAsset(id)`.

## Schema Changes

For future IndexedDB schema changes:

1. Bump `CLIPSTITCHR_DATABASE_VERSION`.
2. Add or update stores in `upgradeClipStitchrDatabase`.
3. Keep metadata stores blob-light except for generated poster/thumbnail blobs.
4. Use cursor reads for list pages and reserve full blob reads for user-requested preview/export work.
