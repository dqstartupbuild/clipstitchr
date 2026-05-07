# Clipr MVP Implementation Plan

> Status: planning-only document. No MVP application code should be changed until this plan has been reviewed.

## 1. Inputs Investigated

### Product Scope

- `project-scope.md`
  - MVP routes are `/`, `/dashboard`, `/dashboard/create`, `/ugc`, `/demos`, and `/created`.
  - Uploads are UGC clips and Demo videos.
  - Every uploaded clip must be normalized to TikTok 9:16 before it is usable.
  - Preview and export must use the same sequence: UGC plays first, Demo starts immediately after UGC ends.
  - Output is a single downloadable 9:16 video.
  - Text overlays are post-MVP.
  - Thumbnail generation and thumbnail editing are out of scope.

### Code Structure Rules

- `coding-guidelines.md`
  - One file, one purpose.
  - One React component per file.
  - One hook, utility, action, or helper per file.
  - Shared types live in dedicated files unless exclusively coupled to a single export.
  - Avoid files whose purpose needs "and" in the name.

### Media Bunny References

- `docs/media-bunny/media-bunny-llms.md`
  - Primary guide source for reading files, conversion, media sinks, media sources, output formats, and browser codec support.
- `docs/media-bunny/media-bunny-api.md`
  - Type/signature reference for imports, constructors, options, and return values.
- Relevant implementation decisions from those docs:
  - Use `Input` + `BlobSource` to read uploaded browser `File`/`Blob` objects.
  - Use `Conversion` for one-input upload normalization.
  - Use `Output` + `Mp4OutputFormat` + `BufferTarget` for normalized files and created videos.
  - Use `VideoSampleSink` / `AudioSampleSink` to read normalized clips for multi-input stitching.
  - Use `VideoSampleSource` / `AudioSampleSource` to write stitched output.
  - Re-timestamp samples with `sample.setTimestamp(...)`.
  - Await all media source `add(...)` calls for backpressure.
  - Close `VideoSample` and `AudioSample` instances after use.
  - Dispose `Input` instances after processing.

### Boilerplate Structure / SEO

- `web/app/layout.tsx`
  - Keeps root metadata, `metadataBase`, JSON-LD scripts, and optimized fonts.
- `web/lib/site.ts`
  - Central source for brand metadata, default descriptions, static sitemap pages, canonical helpers, and OG image helpers.
- `web/lib/metadata.ts`
  - Central non-content metadata helper.
- `web/app/robots.ts`, `web/app/sitemap.ts`, `web/app/feed.xml/route.ts`, `web/app/llms.txt/route.ts`
  - Existing discovery routes to preserve.
- `web/app/(content)/*`
  - Existing blog/legal route group to preserve.
- `web/content-collections.ts`, `web/lib/content/*`, `web/content/blog/*`
  - Existing content system to preserve.
- `web/next.config.ts`
  - Existing CSP/security header center. Must remain the one place for shared security headers.

### Design Source

- `assets/mockup/mockup.png`
  - 1536 x 1024 full product/design-system mockup.
  - Visual direction:
    - White/off-white application background.
    - Purple primary brand color family.
    - Dark navy text.
    - Compact SaaS dashboard composition.
    - Sidebar dashboard, upload button, stat cards, recent uploads, created videos, and create-video CTA.
    - Landing hero with a product preview image/card, compact feature blocks, and bottom conversion band.
    - Blog/legal pages retained visually.
  - Post-MVP mockup elements to avoid as implemented features:
    - Text overlay editor.
    - Thumbnail editor.
    - Generated/custom thumbnails.
- `assets/brand/icon.png`, `assets/brand/logo.png`, `assets/brand/text.png`
  - 1536 x 1024 PNG brand assets.
  - These should be copied into public/static locations for use by `next/image`, favicon metadata, header, sidebar, footer, and OG fallback.

## 2. Implementation Principles

1. Preserve the boilerplate SEO/content foundation.
   - Keep App Router structure.
   - Keep `site.ts`, `metadata.ts`, sitemap, robots, feed, llms, and content collections.
   - Update metadata values and static page list, rather than removing the systems.

2. Keep heavy browser-only features out of the server bundle.
   - Media Bunny, IndexedDB, and file APIs are browser-only.
   - Route pages should remain thin server components where possible.
   - Dashboard/create interactive surfaces should be client components.

3. Follow atomic splitting.
   - Every component, hook, utility, type, and constant gets its own focused file.
   - Avoid barrels unless a single barrel has a clear routing/integration purpose; default plan avoids barrels.

4. Match the mockup, but keep MVP scope honest.
   - Recreate the visual language: purple accents, compact panels, dashboard layout, rounded-but-not-overlarge cards, and product-like page density.
   - Do not implement text overlays or thumbnails as MVP functionality.
   - Replace mockup thumbnail-oriented cards with real normalized video previews.

5. Media Bunny-first video pipeline.
   - Normalize on upload and store normalized blobs.
   - Preview from normalized blobs.
   - Stitch from normalized blobs.
   - Download final stitched blob.

## 3. Dependencies To Add

### `web/package.json`

Planned dependency additions:

- `mediabunny`
  - Core media engine for reading, converting, writing, sinks, and sources.
- `@mediabunny/aac-encoder`
  - Fallback AAC encoder when the browser cannot natively encode AAC.
- `lucide-react`
  - Icon source for UI controls and buttons, matching frontend guidance.

### `web/package-lock.json`

- Updated by `npm install mediabunny @mediabunny/aac-encoder lucide-react`.

## 4. Asset Copy Plan

These are copies from root `assets/`; the originals remain unchanged.

### `web/public/brand/icon.png`

- Copy from `assets/brand/icon.png`.
- Used for compact brand marks and sidebar/header identity.

### `web/public/brand/logo.png`

- Copy from `assets/brand/logo.png`.
- Used where the full symbol mark is appropriate.

### `web/public/brand/text.png`

- Copy from `assets/brand/text.png`.
- Used where the wordmark/text asset is needed.

### `web/public/mockups/clipr-product-mockup.png`

- Copy from `assets/mockup/mockup.png`.
- Used as a design-faithful landing/product preview asset if needed.

### `web/app/icon.png`

- Copy from `assets/brand/icon.png`.
- Lets Next App Router expose an app icon/favicon through file conventions.

### `web/public/og/default.png`

- Copy from `assets/mockup/mockup.png` as a temporary OG fallback asset.
- This preserves the boilerplate OG image path currently generated by `createOgImageUrl("/")`.
- A custom 1200 x 630 OG image can replace it later.

## 5. Route Plan

### Existing Routes To Keep

```text
web/app/layout.tsx
web/app/robots.ts
web/app/sitemap.ts
web/app/feed.xml/route.ts
web/app/llms.txt/route.ts
web/app/(content)/layout.tsx
web/app/(content)/blog/page.tsx
web/app/(content)/privacy/page.tsx
web/app/(content)/terms/page.tsx
```

### Routes To Modify

#### `web/app/page.tsx`

- Replace boilerplate landing page with Clipr landing page.
- Keep it as a server component.
- Compose atomic landing components.
- Keep page content indexable and metadata-driven.

### Routes To Add

#### `web/app/dashboard/page.tsx`

- Server route entry for the MVP dashboard.
- Exports page metadata with canonical `/dashboard`.
- Renders the client dashboard workspace shell.

#### `web/app/dashboard/create/page.tsx`

- Server route entry for video creation.
- Exports page metadata with canonical `/dashboard/create`.
- Renders the client creation studio shell.

## 6. Metadata / SEO Plan

### `web/lib/site.ts`

Modify:

- `defaultTitle`
  - Use Clipr product title from mockup/product scope.
- `defaultDescription`
  - Mention browser-based UGC + demo stitching and TikTok 9:16 output.
- `keywords`
  - Add focused terms such as `UGC video editor`, `TikTok video maker`, `product demo videos`, `browser video stitching`.
- `ctaUrl`
  - Change from `"#"` to `"/dashboard"`.
- `ctaLabel`
  - Change to `Go to Dashboard`.
- `staticPages`
  - Keep `/`, `/blog`, `/privacy`, `/terms`.
  - Add `/dashboard`, `/dashboard/create`, `/ugc`, `/demos`, and `/created` so sitemap includes the MVP app routes.

Do not remove:

- `createCanonicalUrl`
- `createOgAssetPath`
- `createOgImageUrl`
- `createWebsiteJsonLd`
- `createOrganizationJsonLd`

### `web/lib/llms.ts`

Modify site context so LLM discovery describes Clipr as the browser-first UGC/demo stitching application, while still mentioning the blog and RSS if retained.

### `web/app/layout.tsx`

Modify:

- Replace Geist Sans with `Plus_Jakarta_Sans` from `next/font/google` to match the mockup typography.
- Keep `Geist_Mono` or replace only if needed for code/technical labels.
- Keep metadata export and JSON-LD scripts.
- Keep root layout server-rendered.

## 7. Global Styling Plan

### `web/app/globals.css`

Modify:

- Replace current dark orange boilerplate design tokens with the mockup design system:
  - `--background: #f3f4f6`
  - `--surface: #ffffff`
  - `--surface-muted: #f8f7ff`
  - `--text-primary: #111827`
  - `--text-secondary: #64748b`
  - `--accent: #6c47ff`
  - `--accent-light: #8d68ff`
  - `--accent-dark: #4f2ee8`
  - `--border: #e5e7eb`
- Keep Tailwind v4 `@theme inline` integration.
- Replace oversized pill/button styles with compact SaaS button styles.
- Add accessible focus-visible styles.
- Add app shell and utility classes only if they are truly global.
- Remove purely decorative dark-grid/orb styling from the old boilerplate landing page.
- Keep `.prose-legal`, but update colors and spacing to match the mockup legal cards.

## 8. Layout / Shared Component Plan

### `web/app/site-header.tsx`

Modify:

- Keep shared header concept.
- Use copied brand asset via `next/image`.
- Landing variant links: Features, How it Works, Blog, Pricing placeholder, Dashboard CTA.
- Content variant links: Home, Blog, Dashboard.
- Avoid losing `next/link` navigation.

### `web/app/site-footer.tsx`

Modify:

- Use mockup footer layout.
- Keep legal links.
- Add Dashboard link.
- Keep dynamic year and site metadata.

### `web/app/_components/BrandMark.tsx`

Create:

- One component for compact Clipr brand mark.
- Uses `next/image` with `web/public/brand/icon.png`.
- Supports a small label from `site.name`.

### `web/app/_components/PageShell.tsx`

Create:

- Shared constrained page container for public pages only.
- Does not include dashboard app state.

### `web/app/_components/PrimaryButtonLink.tsx`

Create:

- Link-styled primary CTA component.
- Uses `next/link`.
- Supports one optional lucide icon.

### `web/app/_components/SecondaryButtonLink.tsx`

Create:

- Link-styled secondary CTA component.
- Uses `next/link`.

## 9. Landing Page Component Plan

### `web/app/_components/landing/LandingPage.tsx`

Create:

- Composes the landing page sections.
- Server component.
- Imports section components only.

### `web/app/_components/landing/LandingHero.tsx`

Create:

- H1 inspired by mockup: `Stitch. Style. Share. All in your browser.`
- Copy adjusted to MVP: UGC + demo stitching, TikTok-ready 9:16 output, browser-local processing.
- CTA to `/dashboard`.
- Secondary CTA scrolls to workflow/features.

### `web/app/_components/landing/LandingPreview.tsx`

Create:

- Visual product preview panel based on mockup dashboard/editor frame.
- Uses static mockup-derived layout, not actual interactive editor.
- Avoids showing text overlays as implemented MVP functionality.

### `web/app/_components/landing/LandingFeatureGrid.tsx`

Create:

- Three compact feature items:
  - Upload UGC + demo clips.
  - Normalize to 9:16.
  - Stitch UGC then Demo and download.

### `web/app/_components/landing/LandingWorkflow.tsx`

Create:

- Workflow section that explains upload, normalize, preview, create, download.
- Uses concise scan-friendly cards.

### `web/app/_components/landing/LandingBottomBand.tsx`

Create:

- Bottom purple band inspired by mockup.
- CTA to dashboard.

## 10. Dashboard Route Component Plan

### `web/app/dashboard/DashboardPageClient.tsx`

Create:

- Client component entry for `/dashboard`.
- Owns dashboard page-level loading and interactions through hooks.
- Composes dashboard layout, upload panel, stats, library sections, and created video section.

### `web/app/_components/dashboard/DashboardShell.tsx`

Create:

- App shell for dashboard screens.
- Handles sidebar + main content layout.
- Accepts children.

### `web/app/_components/dashboard/DashboardSidebar.tsx`

Create:

- Sidebar inspired by mockup.
- Links: Dashboard, Uploads, UGC Clips, Demo Videos, Created Videos, Create Video.
- Uses `next/link` and lucide icons.

### `web/app/_components/dashboard/DashboardHeader.tsx`

Create:

- Dashboard top row with welcome copy and Upload action.
- Upload action routes focus to upload panel or links to dashboard upload area.

### `web/app/_components/dashboard/DashboardStats.tsx`

Create:

- Displays UGC count, Demo count, Created count.
- Composes individual `DashboardStatCard`.

### `web/app/_components/dashboard/DashboardStatCard.tsx`

Create:

- One stat card component.
- Receives icon, label, value.

### `web/app/_components/dashboard/UploadPanel.tsx`

Create:

- Drag/drop and file-picker upload surface.
- Lets user choose clip type: UGC or Demo.
- Shows Media Bunny normalization progress.
- Delegates state to hooks rather than implementing storage/media logic directly.

### `web/app/_components/dashboard/ClipTypeTabs.tsx`

Create:

- Segmented control for UGC/Demo upload classification.

### `web/app/_components/dashboard/UploadQueueList.tsx`

Create:

- Shows currently processing uploads and errors.

### `web/app/_components/dashboard/VideoLibrarySection.tsx`

Create:

- Section shell for Recent Uploads.
- Receives clips and title.

### `web/app/_components/dashboard/VideoClipCard.tsx`

Create:

- Displays normalized video preview, filename, type, duration, and delete/rename controls.
- Uses actual video blob object URL.

### `web/app/_components/dashboard/CreatedVideosSection.tsx`

Create:

- Section shell for created videos.

### `web/app/_components/dashboard/CreatedVideoCard.tsx`

Create:

- Displays created video preview, duration, date, and download/delete actions.

### `web/app/_components/dashboard/DashboardEmptyState.tsx`

Create:

- Empty state for no clips or no created videos.

### `web/app/_components/dashboard/CreateVideoCallout.tsx`

Create:

- Purple callout linking to `/dashboard/create`.

## 11. Create Video Route Component Plan

### `web/app/dashboard/create/CreateVideoPageClient.tsx`

Create:

- Client component entry for `/dashboard/create`.
- Loads normalized clips and created videos from IndexedDB.
- Owns selected UGC clip, selected Demo clip, preview state, stitch progress, and create/download result through hooks.

### `web/app/_components/create/CreateVideoShell.tsx`

Create:

- Wraps creation studio layout.
- Reuses dashboard sidebar style, with main studio content.

### `web/app/_components/create/CreateVideoHeader.tsx`

Create:

- Header with Back to Dashboard link and Create Video action.

### `web/app/_components/create/ClipPickerPanel.tsx`

Create:

- Composes UGC and Demo selectors.

### `web/app/_components/create/UgcClipSelector.tsx`

Create:

- Lists normalized UGC clips for selection.

### `web/app/_components/create/DemoClipSelector.tsx`

Create:

- Lists normalized Demo clips for selection.

### `web/app/_components/create/SelectableClipRow.tsx`

Create:

- One selectable row/card for either UGC or Demo clip.

### `web/app/_components/create/SequencePreviewPanel.tsx`

Create:

- Preview panel for UGC-then-Demo sequence.
- Uses normalized clip blobs.

### `web/app/_components/create/SequenceVideoPlayer.tsx`

Create:

- Actual client video player.
- Plays UGC first.
- On UGC `ended`, immediately switches to Demo.
- Exposes restart behavior.

### `web/app/_components/create/CreateProgressPanel.tsx`

Create:

- Shows stitching status/progress.

### `web/app/_components/create/DownloadCreatedVideoPanel.tsx`

Create:

- Shows final created video and download button after creation completes.

### `web/app/_components/create/CreateVideoEmptyState.tsx`

Create:

- Empty state when required UGC or Demo clips are missing.
- Links back to dashboard upload area.

## 12. UI Primitive Plan

### `web/app/_components/ui/Button.tsx`

Create:

- Shared button component for real `<button>` actions.
- Supports `variant`, `size`, disabled/loading states, and optional icon.

### `web/app/_components/ui/IconButton.tsx`

Create:

- Square icon-only button with accessible `aria-label`.

### `web/app/_components/ui/Panel.tsx`

Create:

- Reusable panel/card shell.
- Radius capped to match design guidance.

### `web/app/_components/ui/ProgressBar.tsx`

Create:

- Progress bar for normalization and stitching.

### `web/app/_components/ui/Badge.tsx`

Create:

- Compact status/type badge.

### `web/app/_components/ui/VideoPreview.tsx`

Create:

- Generic video preview component.
- Accepts object URL, label, aspect behavior, and controls flag.

## 13. Types Plan

### `web/lib/clipr/types/ClipType.ts`

Create:

- Exports `type ClipType = "ugc" | "demo";`

### `web/lib/clipr/types/VideoClip.ts`

Create:

- Exports `VideoClip` interface matching MVP data model.
- Includes normalized blob, dimensions, aspect ratio, duration, and timestamps.

### `web/lib/clipr/types/CreatedVideo.ts`

Create:

- Exports `CreatedVideo` interface matching MVP data model.

### `web/lib/clipr/types/UploadQueueItem.ts`

Create:

- Tracks upload filename, clip type, status, progress, and error.

### `web/lib/clipr/types/ProcessingStatus.ts`

Create:

- Shared union for `idle`, `reading`, `normalizing`, `stitching`, `complete`, and `error`.

### `web/lib/clipr/types/ClipMetadata.ts`

Create:

- Metadata extracted from Media Bunny before storage.

### `web/lib/clipr/types/OutputCodecs.ts`

Create:

- Browser-supported output codec selection result.

## 14. Constants Plan

### `web/lib/clipr/constants/databaseName.ts`

Create:

- Exports `CLIPR_DATABASE_NAME = "clipr-mvp"`.

### `web/lib/clipr/constants/databaseVersion.ts`

Create:

- Exports current IndexedDB version.

### `web/lib/clipr/constants/objectStoreNames.ts`

Create:

- Exports `videoClips` and `createdVideos` store names.

### `web/lib/clipr/constants/tiktokOutputSize.ts`

Create:

- Exports `TIKTOK_OUTPUT_WIDTH = 1080` and `TIKTOK_OUTPUT_HEIGHT = 1920`.

### `web/lib/clipr/constants/acceptedVideoTypes.ts`

Create:

- Accepted upload MIME hints for file input.

### `web/lib/clipr/constants/mediaBunnyCodecPreferences.ts`

Create:

- Preferred video/audio codec order for MP4 output.

## 15. IndexedDB Storage Plan

### `web/lib/clipr/storage/openCliprDatabase.ts`

Create:

- Opens IndexedDB.
- Wires `onupgradeneeded`.

### `web/lib/clipr/storage/upgradeCliprDatabase.ts`

Create:

- Creates object stores and indexes.

### `web/lib/clipr/storage/getObjectStore.ts`

Create:

- Utility to open a transaction and return one object store.

### `web/lib/clipr/storage/requestToPromise.ts`

Create:

- Converts `IDBRequest` to a typed `Promise`.

### `web/lib/clipr/storage/saveVideoClip.ts`

Create:

- Saves one normalized `VideoClip`.

### `web/lib/clipr/storage/getVideoClips.ts`

Create:

- Reads all normalized clips.

### `web/lib/clipr/storage/deleteVideoClip.ts`

Create:

- Deletes one normalized clip.

### `web/lib/clipr/storage/saveCreatedVideo.ts`

Create:

- Saves one created stitched video.

### `web/lib/clipr/storage/getCreatedVideos.ts`

Create:

- Reads all created videos.

### `web/lib/clipr/storage/deleteCreatedVideo.ts`

Create:

- Deletes one created video.

### `web/lib/clipr/storage/clearCliprDatabase.ts`

Create:

- Clears MVP stores.
- Useful for development/debug UI if exposed later.

## 16. Media Bunny Processing Plan

### `web/lib/clipr/media/createMediaInput.ts`

Create:

- Creates `Input` from `BlobSource`.
- Uses `ALL_FORMATS`.

### `web/lib/clipr/media/createMp4Output.ts`

Create:

- Creates `Output` with `Mp4OutputFormat` and `BufferTarget`.

### `web/lib/clipr/media/registerAacEncoderIfNeeded.ts`

Create:

- Uses `canEncodeAudio("aac")`.
- Registers `@mediabunny/aac-encoder` when native AAC encoding is not available.

### `web/lib/clipr/media/getSupportedOutputCodecs.ts`

Create:

- Uses `Mp4OutputFormat`, `getFirstEncodableVideoCodec`, and `getFirstEncodableAudioCodec`.
- Returns chosen codecs and any support warnings.

### `web/lib/clipr/media/getClipMetadata.ts`

Create:

- Reads duration, primary tracks, dimensions, rotation, and decodability from `Input`.

### `web/lib/clipr/media/createVideoBlobFromBuffer.ts`

Create:

- Converts `ArrayBuffer` from `BufferTarget` into a `Blob`.

### `web/lib/clipr/media/normalizeUploadedVideo.ts`

Create:

- Uses `Conversion`.
- Normalizes one uploaded file to `1080x1920`.
- Uses `fit: "contain"`, `allowRotationMetadata: false`, `forceTranscode: true`.
- Emits progress callbacks.
- Returns normalized blob and metadata.

### `web/lib/clipr/media/createRetimedVideoSample.ts`

Create:

- Clones or mutates a `VideoSample` timestamp for stitched output.

### `web/lib/clipr/media/createRetimedAudioSample.ts`

Create:

- Clones or mutates an `AudioSample` timestamp for stitched output.

### `web/lib/clipr/media/copyVideoSamplesToSource.ts`

Create:

- Reads video samples from a normalized clip with `VideoSampleSink`.
- Applies timeline offset.
- Adds samples to `VideoSampleSource`.
- Closes samples.

### `web/lib/clipr/media/copyAudioSamplesToSource.ts`

Create:

- Reads audio samples from a normalized clip with `AudioSampleSink`.
- Applies timeline offset.
- Adds samples to `AudioSampleSource`.
- Closes samples.

### `web/lib/clipr/media/stitchNormalizedVideos.ts`

Create:

- Creates output.
- Adds output tracks before `output.start()`.
- Processes UGC samples at offset `0`.
- Processes Demo samples at offset `ugcDuration`.
- Finalizes output and returns created video blob.
- Emits progress callbacks.

### `web/lib/clipr/media/getVideoMimeType.ts`

Create:

- Calls `output.getMimeType()` when available.
- Provides fallback `video/mp4`.

## 17. Hook Plan

### `web/lib/clipr/hooks/useObjectUrl.ts`

Create:

- Creates and revokes object URLs for video blob previews.

### `web/lib/clipr/hooks/useClipLibrary.ts`

Create:

- Loads clips and created videos from IndexedDB.
- Exposes refresh/delete helpers.

### `web/lib/clipr/hooks/useUploadProcessor.ts`

Create:

- Handles selected files.
- Calls `normalizeUploadedVideo`.
- Saves normalized clips.
- Updates upload queue state.

### `web/lib/clipr/hooks/useCreateVideo.ts`

Create:

- Calls `stitchNormalizedVideos`.
- Saves `CreatedVideo`.
- Tracks stitch status/progress/error.

### `web/lib/clipr/hooks/useSequenceVideoPlayer.ts`

Create:

- Handles UGC-then-Demo playback state for `SequenceVideoPlayer`.

## 18. Utility Plan

### `web/lib/clipr/utils/createId.ts`

Create:

- Uses `crypto.randomUUID()` with fallback if needed.

### `web/lib/clipr/utils/formatDuration.ts`

Create:

- Formats seconds as `00:32` style duration.

### `web/lib/clipr/utils/formatBytes.ts`

Create:

- Formats file/blob sizes for upload queue.

### `web/lib/clipr/utils/formatDate.ts`

Create:

- Formats created/uploaded dates for cards.

### `web/lib/clipr/utils/getDownloadFileName.ts`

Create:

- Builds names like `clipr-ugc-demo-2026-05-07.mp4`.

### `web/lib/clipr/utils/filterClipsByType.ts`

Create:

- Filters clips by `ugc` or `demo`.

## 19. Content / Legal Plan

### `web/app/(content)/blog/page.tsx`

Modify:

- Restyle to match mockup's light Clipr blog page.
- Keep content collections query helpers.
- Keep route metadata.

### `web/app/(content)/privacy/page.tsx`

Modify:

- Update copy to accurately describe local IndexedDB video storage for MVP.
- Restyle to match mockup legal card layout.

### `web/app/(content)/terms/page.tsx`

Modify:

- Update copy to describe browser-local MVP behavior.
- Restyle to match mockup legal card layout.

### Optional `web/app/(content)/cookie/page.tsx`

Create only if time allows:

- Mockup includes Cookie Policy.
- Could be added after core MVP if legal page parity matters.

### Optional `web/app/(content)/disclaimer/page.tsx`

Create only if time allows:

- Mockup includes Disclaimer.
- Could be added after core MVP if legal page parity matters.

## 20. Maintenance Docs Plan

### `docs/maintenance/clear-indexeddb.md`

Modify:

- Remove stale thumbnail wording.
- Keep database name `clipr-mvp`.
- Mention normalized clips and created videos only.

## 21. Intended Structure Tree

```text
.
├── AGENTS.md
├── assets
│   ├── brand
│   │   ├── icon.png
│   │   ├── logo.png
│   │   └── text.png
│   └── mockup
│       └── mockup.png
├── coding-guidelines.md
├── docs
│   ├── maintenance
│   │   └── clear-indexeddb.md
│   └── media-bunny
│       ├── media-bunny-api.md
│       └── media-bunny-llms.md
├── implementation-plan.md
├── project-scope.md
└── web
    ├── app
    │   ├── (content)
    │   │   ├── blog
    │   │   │   └── page.tsx
    │   │   ├── layout.tsx
    │   │   ├── privacy
    │   │   │   └── page.tsx
    │   │   └── terms
    │   │       └── page.tsx
    │   ├── _components
    │   │   ├── BrandMark.tsx
    │   │   ├── PageShell.tsx
    │   │   ├── PrimaryButtonLink.tsx
    │   │   ├── SecondaryButtonLink.tsx
    │   │   ├── create
    │   │   │   ├── ClipPickerPanel.tsx
    │   │   │   ├── CreateProgressPanel.tsx
    │   │   │   ├── CreateVideoEmptyState.tsx
    │   │   │   ├── CreateVideoHeader.tsx
    │   │   │   ├── CreateVideoShell.tsx
    │   │   │   ├── DemoClipSelector.tsx
    │   │   │   ├── DownloadCreatedVideoPanel.tsx
    │   │   │   ├── SelectableClipRow.tsx
    │   │   │   ├── SequencePreviewPanel.tsx
    │   │   │   ├── SequenceVideoPlayer.tsx
    │   │   │   └── UgcClipSelector.tsx
    │   │   ├── dashboard
    │   │   │   ├── ClipTypeTabs.tsx
    │   │   │   ├── CreateVideoCallout.tsx
    │   │   │   ├── CreatedVideoCard.tsx
    │   │   │   ├── CreatedVideosSection.tsx
    │   │   │   ├── DashboardEmptyState.tsx
    │   │   │   ├── DashboardHeader.tsx
    │   │   │   ├── DashboardShell.tsx
    │   │   │   ├── DashboardSidebar.tsx
    │   │   │   ├── DashboardStatCard.tsx
    │   │   │   ├── DashboardStats.tsx
    │   │   │   ├── UploadPanel.tsx
    │   │   │   ├── UploadQueueList.tsx
    │   │   │   ├── VideoClipCard.tsx
    │   │   │   └── VideoLibrarySection.tsx
    │   │   ├── landing
    │   │   │   ├── LandingBottomBand.tsx
    │   │   │   ├── LandingFeatureGrid.tsx
    │   │   │   ├── LandingHero.tsx
    │   │   │   ├── LandingPage.tsx
    │   │   │   ├── LandingPreview.tsx
    │   │   │   └── LandingWorkflow.tsx
    │   │   └── ui
    │   │       ├── Badge.tsx
    │   │       ├── Button.tsx
    │   │       ├── IconButton.tsx
    │   │       ├── Panel.tsx
    │   │       ├── ProgressBar.tsx
    │   │       └── VideoPreview.tsx
    │   ├── dashboard
    │   │   ├── DashboardPageClient.tsx
    │   │   ├── create
    │   │   │   ├── CreateVideoPageClient.tsx
    │   │   │   └── page.tsx
    │   │   └── page.tsx
    │   ├── feed.xml
    │   │   └── route.ts
    │   ├── globals.css
    │   ├── icon.png
    │   ├── layout.tsx
    │   ├── llms.txt
    │   │   └── route.ts
    │   ├── page.tsx
    │   ├── robots.ts
    │   ├── site-footer.tsx
    │   ├── site-header.tsx
    │   └── sitemap.ts
    ├── content
    │   ├── README.md
    │   └── blog
    │       └── getting-started.mdx
    ├── lib
    │   ├── clipr
    │   │   ├── constants
    │   │   │   ├── acceptedVideoTypes.ts
    │   │   │   ├── databaseName.ts
    │   │   │   ├── databaseVersion.ts
    │   │   │   ├── mediaBunnyCodecPreferences.ts
    │   │   │   ├── objectStoreNames.ts
    │   │   │   └── tiktokOutputSize.ts
    │   │   ├── hooks
    │   │   │   ├── useClipLibrary.ts
    │   │   │   ├── useCreateVideo.ts
    │   │   │   ├── useObjectUrl.ts
    │   │   │   ├── useSequenceVideoPlayer.ts
    │   │   │   └── useUploadProcessor.ts
    │   │   ├── media
    │   │   │   ├── copyAudioSamplesToSource.ts
    │   │   │   ├── copyVideoSamplesToSource.ts
    │   │   │   ├── createMediaInput.ts
    │   │   │   ├── createMp4Output.ts
    │   │   │   ├── createRetimedAudioSample.ts
    │   │   │   ├── createRetimedVideoSample.ts
    │   │   │   ├── createVideoBlobFromBuffer.ts
    │   │   │   ├── getClipMetadata.ts
    │   │   │   ├── getSupportedOutputCodecs.ts
    │   │   │   ├── getVideoMimeType.ts
    │   │   │   ├── normalizeUploadedVideo.ts
    │   │   │   ├── registerAacEncoderIfNeeded.ts
    │   │   │   └── stitchNormalizedVideos.ts
    │   │   ├── storage
    │   │   │   ├── clearCliprDatabase.ts
    │   │   │   ├── deleteCreatedVideo.ts
    │   │   │   ├── deleteVideoClip.ts
    │   │   │   ├── getCreatedVideos.ts
    │   │   │   ├── getObjectStore.ts
    │   │   │   ├── getVideoClips.ts
    │   │   │   ├── openCliprDatabase.ts
    │   │   │   ├── requestToPromise.ts
    │   │   │   ├── saveCreatedVideo.ts
    │   │   │   ├── saveVideoClip.ts
    │   │   │   └── upgradeCliprDatabase.ts
    │   │   ├── types
    │   │   │   ├── ClipMetadata.ts
    │   │   │   ├── ClipType.ts
    │   │   │   ├── CreatedVideo.ts
    │   │   │   ├── OutputCodecs.ts
    │   │   │   ├── ProcessingStatus.ts
    │   │   │   ├── UploadQueueItem.ts
    │   │   │   └── VideoClip.ts
    │   │   └── utils
    │   │       ├── createId.ts
    │   │       ├── filterClipsByType.ts
    │   │       ├── formatBytes.ts
    │   │       ├── formatDate.ts
    │   │       ├── formatDuration.ts
    │   │       └── getDownloadFileName.ts
    │   ├── content
    │   │   ├── mdx-components.tsx
    │   │   ├── queries.ts
    │   │   ├── schema.ts
    │   │   └── seo.ts
    │   ├── llms.ts
    │   ├── metadata.ts
    │   ├── og
    │   │   └── server-resolver.ts
    │   └── site.ts
    ├── next.config.ts
    ├── package-lock.json
    ├── package.json
    └── public
        ├── brand
        │   ├── icon.png
        │   ├── logo.png
        │   └── text.png
        ├── mockups
        │   └── clipr-product-mockup.png
        └── og
            ├── .gitkeep
            └── default.png
```

## 22. Implementation Sequence

1. Add dependencies.
2. Copy brand/mockup assets into `web/public` and `web/app/icon.png`.
3. Update site metadata and global design tokens.
4. Refactor shared header/footer while preserving SEO/layout behavior.
5. Implement landing page components.
6. Implement Clipr types/constants/utils.
7. Implement IndexedDB storage helpers.
8. Implement Media Bunny normalization and stitching helpers.
9. Implement hooks that wire storage and media helpers into React state.
10. Implement dashboard route and components.
11. Implement create-video route and components.
12. Restyle blog/privacy/terms to match the mockup without removing content/SEO systems.
13. Update maintenance doc stale thumbnail reference.
14. Run verification:
    - `npm run typecheck`
    - `npm run lint`
    - `npm run test`
    - `npm run build`
15. Start dev server with `npm run dev`.
16. Verify in browser:
    - Landing page visual parity with mockup.
    - Dashboard opens without auth.
    - Upload UGC and Demo clips.
    - Uploaded clips normalize to 9:16.
    - IndexedDB persists normalized clips.
    - Create page previews UGC then Demo.
    - Create Video produces one downloadable 9:16 video.
    - Blog/legal/discovery routes still work.

## 23. Known Risks / Decisions To Validate During Implementation

- Browser codec support varies. The app must show clear errors when Media Bunny cannot decode or encode a selected file.
- MP4 + AAC may require `@mediabunny/aac-encoder`; if the fallback has bundling constraints, document them in `next.config.ts` or a dedicated setup note.
- Large videos can exceed memory limits with `BufferTarget`. MVP will keep `BufferTarget`, but errors must be surfaced clearly.
- `fit: "contain"` avoids stretching but may letterbox non-9:16 uploads. This matches the current MVP scope; crop/cover presets can be added later.
- The mockup shows text and thumbnail features, but those remain excluded from MVP.
- If implementation discovers that any planned file is unnecessary or should be split further to satisfy atomic guidelines, update this plan before proceeding with that structural change.
