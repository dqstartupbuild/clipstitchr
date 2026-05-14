# ClipStitchr — Project Scope

> **Version:** 0.1 (MVP Definition)
> **Created:** 2026-05-05
> **Status:** Planning

---

## 1. Vision

**ClipStitchr** helps overwhelmed marketers turn the clips they already have
into finished short-form ad videos without opening a traditional video editor.

The core pain is not just video processing. Many founders, small business
owners, and lean marketers record product demos, buy UGC b-roll, collect
reaction clips, and still publish very little because the editing workflow is
too much: find files, import clips, trim dead space, sequence the ad, add
metadata, export, save the output, and remember what was already used.

ClipStitchr turns that pile of raw marketing footage into a reusable content
library and a batch ad-creation workflow. Given up to **20 UGC clips** and **1
product demo**, a user can produce matching unique 9:16 ad variants - each
pairing a different UGC clip first with the same product demo second - in
minutes, without leaving the app.

The primary product is **Stitchr**. AI features like Clipr, Swapr, and Avatar Photo Generator are secondary helpers for
creating or extending source material when a user does not have enough usable
clips.

### Product Thesis

ClipStitchr is not a general video editor, AI playground, or social scheduler.
It is a practical ad-production workflow for people who dislike the repetitive
work of turning scattered UGC and product demos into finished short-form ads.

The product should make users feel that every uploaded clip has a job, every
demo can become multiple ad variations, and the content library is no longer a
dead-end folder on their computer.

See `docs/product/positioning.md`, `docs/product/copywriting-guide.md`, and
`docs/features/stitchr.md` for reusable product, marketing, and copy guidance.

---

## 2. Core Workflow

```
┌─────────────┐     ┌─────────────┐
│  Upload UGC │     │ Upload Demo │
│   Clips     │     │   Videos    │
└──────┬──────┘     └──────┬──────┘
       │                   │
       ▼                   ▼
┌──────────────────────────────────┐
│ Normalize uploads to TikTok 9:16 │
│   using Media Bunny in-browser   │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│        Video Library / Dashboard │
│  (browse, preview, organize)     │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  Select up to 20 UGC + 1 Demo    │
│ Tap/swipe previews: UGC → Demo   │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│          Click "Stitch"          │
│ Create one UGC → Demo ad per UGC │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ Download finished TikTok 9:16 ads│
└──────────────────────────────────┘
```

The workflow should optimize for reducing editing friction, not exposing every
possible editing control. Users should be able to upload, organize, stitch, and
export without thinking in terms of timelines, bins, codecs, or file-system
cleanup.

---

## 3. Tech Stack

| Layer              | Production Target              | MVP (Local Dev)           |
| ------------------ | ------------------------------ | ------------------------- |
| **Scaffolding**    | `npx create-starship-app`      | Same                      |
| **Framework**      | Next.js (from starship boilerplate) | Same                 |
| **Auth**           | Clerk                          | Clerk-protected dashboard |
| **Backend / DB**   | Convex                         | Convex                    |
| **Object Storage** | Cloudflare R2                  | Cloudflare R2             |
| **Video Engine**   | Media Bunny with optional server-side processing later | Media Bunny (browser) |

---

## 4. Feature Requirements

### 4.1 Video Upload & Library

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | Upload UGC reaction clips (drag & drop or file picker) | ✅ | ✅ |
| 2 | Upload product demo videos linked to a saved product | ✅ | ✅ |
| 3 | Categorize uploads as **UGC** or **Demo** | ✅ | ✅ |
| 4 | Normalize every uploaded video to TikTok 9:16 using Media Bunny | ✅ | ✅ |
| 5 | Preview normalized clips in-browser with generated poster images | ✅ | ✅ |
| 6 | Delete / rename clips | ✅ | ✅ |
| 7 | Set a non-destructive default trim range for each uploaded clip | ✅ | ✅ |
| 8 | Store normalized files and preview poster images in Cloudflare R2 | ✅ | ✅ |
| 9 | Store clip metadata, tags, trim ranges, and object references in Convex | ✅ | ✅ |

### 4.2 Video Stitching

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | User **selects** up to 20 UGC clips and one product-linked Demo clip | ✅ | ✅ |
| 2 | Preview each selected UGC clip followed immediately by the selected Demo clip | ✅ | ✅ |
| 3 | Copy upload default trims into each new Stitchr selection | ✅ | ✅ |
| 4 | Override copied trim ranges while stitching without changing upload defaults | ✅ | ✅ |
| 5 | Tap/swipe through selected UGC previews before stitching | ✅ | ✅ |
| 6 | Processing happens in-browser (no server-side rendering for MVP) | ✅ | ✅ |
| 7 | Click **"Stitch"** to create one UGC-then-Demo output per selected UGC clip | ✅ | ✅ |
| 8 | Progress indicator during normalization and stitching | ✅ | ✅ |
| 9 | Download each finished TikTok 9:16 video file | ✅ | ✅ |
| 10 | Select reusable shared-library music or generate separate 60 second background music for saved stitches and mix it only at download/export time | ✅ | ✅ |

### 4.3 Text Overlays

Stitchr supports one text overlay for the current export session. In batch
stitching, the same overlay is applied to every selected UGC + Demo output.
Multiple independent text layers remain future scope.

| # | Feature | MVP | Future |
|---|---------|-----|--------|
| 1 | Add one text overlay on top of the stitched video | ✅ | ✅ |
| 2 | Timeline control — set start time & end time for text appearance | ✅ | ✅ |
| 3 | Basic text styling (font size, color, position) | ✅ | ✅ |
| 4 | Apply one shared overlay across all outputs in a Stitchr batch | ✅ | ✅ |
| 5 | Multiple text layers | — | ✅ |

### 4.4 Dashboard & Navigation

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | Landing page with a **"Dashboard"** button | ✅ | ✅ |
| 2 | Dashboard shows workspace status, recent uploads, recent stitches, and Stitchr entry points | ✅ | ✅ |
| 3 | No login required — dashboard is directly accessible | — | — |
| 4 | Clerk-authenticated access to dashboard | ✅ | ✅ |
| 5 | Uploaded UGC clips and demo videos share the tabbed Content Library page | ✅ | ✅ |
| 6 | Uploaded Swapr avatar photos appear in the Avatars page; AI expansion is optional and off by default | ✅ | ✅ |
| 7 | Avatar photos store a detailed non-sensitive visual description of the person for scenario generation | ✅ | ✅ |
| 8 | Users can generate 1, 3, or 5 new avatar scenario photos from a selected Replicate image model | ✅ | ✅ |
| 9 | Swapr-generated outputs appear in the Content Library Swaps tab and remain reusable as UGC-style clips | ✅ | ✅ |
| 10 | Clipr-generated outputs appear in the Content Library Clips tab and remain reusable as UGC-style clips | ✅ | ✅ |
| 11 | Stitches appear in the Content Library Stitches tab; `/dashboard/stitches` redirects there for compatibility | ✅ | ✅ |
| 12 | The Content Library includes an All tab so users can view every saved video output type at once | ✅ | ✅ |
| 13 | The dashboard header upload action opens an upload selector for UGC, Demo, or Photo, then routes to the relevant page/tab with controls revealed | ✅ | ✅ |
| 14 | Demo upload and picker surfaces can filter demos by linked product | ✅ | ✅ |

### 4.5 AI-Assisted Content Supply (Secondary)

AI features help users create more source material when their real content
library is thin. They should support the Stitchr workflow, not replace it as the
main product promise.

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | AI photo expansion improves framing for saved avatar photos | ✅ | ✅ |
| 2 | Avatar photo generation creates additional reusable source photos | ✅ | ✅ |
| 3 | Swapr generates UGC-style video clips that can be saved back into the UGC library | ✅ | ✅ |
| 4 | AI features use rate limits, credit budgeting, and speed profiles because they create external provider cost | ✅ | ✅ |
| 5 | Clipr generates non-promotional short engagement Clips from saved product and avatar context | ✅ | ✅ |
| 6 | Clipr can select reusable shared-library music or generate a separate 60 second background music asset for export-time mixing | ✅ | ✅ |

Clipr uses hidden non-promotional hook templates only. Broader internal hook
assets can support Swipr and Stitchr auto-text, but direct product/ad hook
patterns must not leak into Clipr outputs.

Clipr music is optional and off by default. Users can select an existing shared
music-library track or generate a 60 second instrumental track. Generated music
is copied to the shared music library and to the user's personal object storage
when attached to their output. The app stores music in R2 separately from the
clean Clipr video and keeps editable metadata for enabled/disabled state and
volume.
Media Bunny mixes the music into a fresh downloadable file only during
export/download, so users can later remove music, regenerate it, or change
volume without altering the saved video.

Stitchr music follows the same non-destructive model for saved stitches. The
Stitchr build controls can select shared music or request new generated music,
and saved stitch cards can later select, generate, remove, regenerate,
enable/disable, or adjust volume. The clean stitched MP4 stays unchanged in R2;
Media Bunny creates the final music-mixed download on demand in the browser.

### 4.6 Longr Long-Form Builder

Longr is a standalone dashboard tool at `/dashboard/longr`. It is not a Stitchr
mode toggle.

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | User selects multiple saved UGC clips and/or Demo videos | ✅ | ✅ |
| 2 | Selection order becomes play order | ✅ | ✅ |
| 3 | Compact horizontal timeline strip supports drag reordering | ✅ | ✅ |
| 4 | One Build action creates a single combined 9:16 MP4 | ✅ | ✅ |
| 5 | Combined selected duration is capped at 5 minutes | ✅ | ✅ |
| 6 | Running duration total shows remaining time | ✅ | ✅ |
| 7 | Saved Longr outputs appear in the Content Library Longs tab | ✅ | ✅ |
| 8 | Shared music tracks can be added multiple times, duplicated, trimmed, moved, extended, removed, and mixed into the Longr output | ✅ | ✅ |

Longr uses the same browser-local Media Bunny output pattern as Stitchr, but it
accepts an arbitrary ordered sequence instead of a UGC-to-Demo pairing. It uses
the current default trim range for each source clip and saves one R2-backed
output with ordered segment metadata and optional music clip metadata in Convex.

### 4.7 Carousel Generation

Swipr creates TikTok-ready static carousel image sets. The MVP uses browser-local
canvas rendering for final export: one selected shared Background Library image
is reused across every image, and each image has its own text overlay using the
same styling, color, drag, and resize model as Stitchr text overlays. Saved
Swipes persist the editable carousel state, not rendered PNG images, so users can
reopen a Swipe, swap or upload/generate a different background, change text, and
download the latest saved version later. Saved Settings products provide the
preferred Swipr AI background context: users can save multiple named products
with product and audience details, and server-side GPT-4.1 enrichment stores
hidden inferred problem and audience pain-point metadata for generation prompts.
Swipr text generation can draw from the hidden app-promo hook library and
education-pattern templates, then applies editable generated text across the
selected slides.

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | User selects a saved Settings product for the Swipr product context | ✅ | ✅ |
| 2 | User chooses 3-8 carousel images | ✅ | ✅ |
| 3 | User selects a shared saved background, uploads one background image, or creates one rate-limited AI background | ✅ | ✅ |
| 4 | One background image is reused across every rendered carousel image | ✅ | ✅ |
| 5 | User adds and positions text independently on each image | ✅ | ✅ |
| 6 | Browser renders 9:16 PNG images and downloads them as one ZIP file | ✅ | ✅ |
| 7 | Saved Swipes appear in the Content Library Swipes tab and download from saved editable state | ✅ | ✅ |
| 8 | Uploaded/generated backgrounds save to shared R2-backed Background Library with hidden GPT-4.1-mini search metadata | ✅ | ✅ |
| 9 | Auto-generated Swipr slide text uses purpose-filtered hidden hook libraries | ✅ | ✅ |
| 10 | Pinterest or stock-library provider integration | — | ✅ |

---

## 5. Pages / Routes (MVP)

```
/                → Landing page (marketing + "Go to Dashboard" CTA)
/dashboard       → Authenticated main workspace
/dashboard/stitchr → Authenticated Stitchr video stitching interface
/dashboard/clipr → Authenticated Clipr engagement clip generator
/dashboard/swipr → Authenticated TikTok carousel image generator
/dashboard/swapr → Authenticated AI motion-transfer studio using saved photos with UGC clips or finished stitches
/dashboard/avatars → Authenticated avatar photo library with hidden-until-requested photo upload controls, avatar assignment, descriptions, and AI scenario photo generation
/dashboard/uploads → Authenticated Content Library with All, UGC, Clips, Demo, Swaps, Swipes, and Stitches tabs; UGC/Demo upload controls open from the header upload selector
/dashboard/stitches → Compatibility redirect to `/dashboard/uploads?tab=stitches`
```

---

## 6. Architecture Overview

### MVP (Backend-Backed)

```
┌──────────────────────────────────────────┐
│               Browser                     │
│                                           │
│  Next.js App                              │
│  ┌────────────────────────────────────┐   │
│  │  Landing Page  →  Dashboard        │   │
│  │                    │               │   │
│  │              Upload Panel          │   │
│  │              9:16 Normalizer       │   │
│  │              Video Library         │   │
│  │              Stitchr Studio        │   │
│  │                    │               │   │
│  │         ┌──────────┴──────────┐    │   │
│  │         │  Video Engine       │    │   │
│  │         │  (Media Bunny)      │    │   │
│  │         │                     │    │   │
│  │         └─────────────────────┘    │   │
│  └────────────────────────────────────┘   │
│                                           │
└──────────────────────────────────────────┘
          │                         │
          ▼                         ▼
┌────────────────┐          ┌────────────────┐
│    Convex      │          │ Cloudflare R2  │
│  metadata/DB   │          │ media objects  │
└────────────────┘          └────────────────┘
```

### Production Target

```
┌────────────┐      ┌──────────────┐      ┌────────────────┐
│   Client   │◄────►│  Next.js API │◄────►│    Convex      │
│  (Browser) │      │   Routes     │      │  (Backend/DB)  │
└─────┬──────┘      └──────────────┘      └────────────────┘
      │
      │  Auth via Clerk
      │
      ▼
┌────────────────┐
│ Cloudflare R2  │
│ (Object Store) │
└────────────────┘
```

---

## 7. Video Processing Engine — ✅ Media Bunny

**Decision:** Media Bunny is the chosen video processing engine for ClipStitchr.

**Implementation reference:** use the local Media Bunny docs in `docs/media-bunny/`, especially `docs/media-bunny/media-bunny-llms.md` and `docs/media-bunny/media-bunny-api.md`.

### Why Media Bunny

- **Browser-first TypeScript media toolkit** — supports reading, converting, and writing media files directly in the browser.
- **Upload-time normalization** — can resize, fit, crop, transcode, and track progress while converting uploads into a consistent 9:16 format.
- **Output control** — supports writing MP4/WebM-style outputs with explicit video dimensions, frame timing, and audio/video tracks.
- **Good MVP fit** — keeps rendering local and avoids external processing services for the first version.

### Processing Policy

- Every uploaded UGC and Demo video must be normalized before it is saved to the library.
- Normalized clips must use a TikTok-ready 9:16 canvas. The MVP target is `1080x1920` when browser encoding support allows it.
- Do not stretch source footage. For non-9:16 uploads, preserve the source aspect ratio inside the 9:16 output; crop/fill presets can be added later.
- Preview, Stitch, and Download must all use the same sequence: each normalized UGC clip starts first, and the selected normalized Demo clip starts immediately after that UGC clip ends.
- Clipr music export must not mutate the saved video. Export/download reads the
  clean saved Clipr video and optional R2 music object, then creates a temporary
  mixed MP4 in the browser with Media Bunny.
- Trimming is non-destructive metadata. Uploads store a default trim range. When clips are selected in Stitchr, the default trim range for each selected UGC and the selected Demo is copied into that Stitchr session and can be changed independently.
- Preview, Stitch, and Download must use the copied Stitchr trim ranges when present.
- The preview should let the user tap or swipe through each selected UGC + Demo sequence before export.
- Each final stitch must be a single 9:16 file using the same normalized assets shown in preview. A batch creates one final stitch per selected UGC clip.
- Clip and stitch cards should use the HTML video `poster` attribute for the static preview state. Generate poster images in the browser by seeking through early candidate frames, choosing the first visibly non-black frame, encoding it as JPEG, and storing it beside the video blob.
- Poster generation is infrastructure for video previews. User-authored thumbnail generation, thumbnail selection, and thumbnail editing remain out of scope for the MVP.

### Media Bunny API Map (MVP)

Use `docs/media-bunny/media-bunny-llms.md` as the implementation guide and `docs/media-bunny/media-bunny-api.md` as the API reference.

#### Upload Read / Validation

- Create an `Input` from each uploaded browser `File` with `new BlobSource(file)`.
- Use `ALL_FORMATS` during MVP unless bundle size becomes a problem; narrow to specific input formats later.
- Read metadata with `input.canRead()`, `input.getMimeType()`, `input.computeDuration()`, `input.getPrimaryVideoTrack()`, and `input.getPrimaryAudioTrack()`.
- Validate video dimensions and rotation with `videoTrack.getDisplayWidth()`, `videoTrack.getDisplayHeight()`, and `videoTrack.getRotation()`.
- Gate browser support with `videoTrack.canDecode()`, `audioTrack.canDecode()` when audio is present, `canEncodeVideo()`, `canEncodeAudio()`, `getFirstEncodableVideoCodec()`, and `getFirstEncodableAudioCodec()`.
- Dispose short-lived inputs with `input.dispose()` when metadata or processing is complete.

#### Upload Normalization

- Use `Conversion` for upload normalization because it handles one input file into one normalized output file.
- Create the normalized output with `new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() })`.
- Run `Conversion.init({ input, output, tracks: 'primary', video, audio })`, inspect `conversion.isValid` and `conversion.discardedTracks`, then call `conversion.execute()`.
- Set video conversion options to target TikTok format:
  - `width: 1080`
  - `height: 1920`
  - `fit: 'contain'` for MVP so source footage is not stretched
  - `allowRotationMetadata: false` so rotation is baked into the normalized output
  - `forceTranscode: true` so uploaded assets have consistent dimensions and codec settings
- Prefer MP4-compatible codecs. Prefer `avc` for video and `aac` for audio when browser support allows them.
- Use `conversion.onProgress` for upload-normalization progress.
- Store the normalized `BufferTarget.buffer` as a browser `Blob` only long enough to upload it to R2.
- After normalization succeeds, generate a poster `Blob` from the normalized video, upload the poster to R2, and save both R2 object references with the Convex clip record.

#### Sequence Preview

- Preview should use the normalized clip blobs, not the original uploads.
- Static preview state should use the generated poster blob through the video element's `poster` attribute.
- The preview player should use the same sequence as export: play the active UGC first, then start Demo immediately on the UGC `ended` event.
- When multiple UGC clips are selected, preview navigation should move between selected UGC clips while keeping the same selected Demo.
- The preview does not need to render a temporary stitched file for MVP; it only needs to prove the exact ordering and normalized 9:16 playback.

#### Stitched Export / Download

- Do not use `Conversion` for stitching because it is a single-input conversion abstraction, not a multi-input composition API.
- Create a fresh `Output` with `Mp4OutputFormat` and `BufferTarget` for each stitch. A multi-UGC Stitchr batch runs this one-output-per-UGC flow sequentially.
- Add one `VideoSampleSource` and, when at least one selected clip has audio, one `AudioSampleSource`.
- Add all output tracks before calling `output.start()`.
- Read normalized clips with `Input` + `BlobSource`, then use `VideoSampleSink` and `AudioSampleSink` to stream decoded samples.
- Re-timestamp samples before adding them to the output:
  - UGC samples start at `0`
  - Demo samples start at `ugcDuration`
  - For each sample, subtract the source track's first timestamp and add the output timeline offset
- Pipe video and audio concurrently or in short interleaved chunks so MP4 packet buffering does not hold an entire video track in memory while waiting for audio.
- Await every media-source `add(...)` call to respect Media Bunny backpressure.
- Close every `VideoSample` and `AudioSample` after it has been added.
- Close media sources when their streams are complete, then call `output.finalize()`.
- Convert the final `BufferTarget.buffer` into the downloadable video `Blob`, using `output.getMimeType()` for the blob type when available.
- Generate and store a poster `Blob` for each stitch after export succeeds.
- Dispose each stitched-export `Input` after its samples have been processed.
- Keep encoded-packet passthrough with `EncodedPacketSink`, `EncodedVideoPacketSource`, and `EncodedAudioPacketSource` as a later optimization only; MVP should re-encode from samples because it is more robust across separate input files.

#### Text Overlay Export

- Text overlays are rendered in-browser during Stitchr export.
- A Stitchr batch uses one shared text overlay configuration for every output.
- For one-file conversion flows, use `ConversionVideoOptions.process`.
- For custom export flows, use `VideoSampleSource` transform processing or draw onto a canvas before creating/adding a `VideoSample`.

### Trade-offs Accepted

| Concern | Mitigation |
|---------|------------|
| Browser codec support varies | Detect Media Bunny/WebCodecs support before processing and show an actionable unsupported-browser message |
| Upload normalization adds waiting time | Normalize once on upload, store the normalized blob, and show progress |
| Large files can pressure browser memory | Normalize one file at a time, upload outputs to R2, hydrate full blobs only on demand |

### Alternatives Considered (Not Selected)

| Option | Reason for rejection |
|--------|---------------------|
| WebCodecs API | Too low-level; no muxing built-in; limited browser support |
| Remotion | Requires server or Lambda for rendering; not purely client-side |
| MP4Box.js + Canvas | Too much custom media plumbing for normalization, stitching, and later overlays |

---

## 8. Data Model (MVP — Convex + R2)

```typescript
// Convex stores metadata and R2 object references. R2 stores every durable
// media object. Browser Blobs are temporary hydrated values for preview,
// export, generation, and download.

interface VideoClip {
  id: string;
  name: string;
  type: 'ugc' | 'demo';
  videoObject: R2ObjectReference; // normalized 9:16 clip in R2
  posterObject?: R2ObjectReference; // generated JPEG poster in R2
  posterVersion?: number; // capture algorithm version for backfilling stale posters
  width: number; // target 1080
  height: number; // target 1920
  aspectRatio: '9:16';
  duration: number; // seconds
  defaultTrimRange?: { start: number; end: number }; // seconds, non-destructive default
  createdAt: string; // ISO timestamp
}

interface Stitch {
  id: string;
  name: string;
  ugcClipId: string;
  demoClipId: string;
  ugcTrimRange?: { start: number; end: number }; // copied Stitchr trim
  demoTrimRange?: { start: number; end: number }; // copied Stitchr trim
  stitchObject: R2ObjectReference; // final 9:16 video in R2
  posterObject?: R2ObjectReference; // generated JPEG poster in R2
  posterVersion?: number; // capture algorithm version for backfilling stale posters
  width: number; // target 1080
  height: number; // target 1920
  aspectRatio: '9:16';
  duration: number; // ugc duration + demo duration
  createdAt: string;
}
```

---

## 9. Phased Rollout

### Phase 1 — MVP (Current Focus)

- [x] Scaffold project with `npx create-starship-app`
- [ ] Landing page with "Dashboard" button
- [ ] Dashboard with drag-and-drop video upload
- [ ] Media Bunny upload normalization to TikTok 9:16
- [ ] Video library (UGC vs Demo categorization)
- [ ] Video preview player for normalized uploads
- [ ] Generated poster images for normalized uploads and stitches
- [ ] UGC + Demo sequence preview with tap/swipe navigation across selected UGC clips
- [ ] Video stitching (each selected UGC immediately followed by the selected Demo → one 9:16 output per UGC)
- [ ] Shared text overlay applied across a Stitchr batch
- [ ] Download finished videos
- [x] Convex metadata and Cloudflare R2 object storage
- [x] Integrate Clerk authentication for dashboard and API routes

### Phase 2 — Backend Integration

- [x] Set up Convex backend (video metadata, user data)
- [x] Migrate file storage to Cloudflare R2
- [ ] User accounts with personal video libraries
- [ ] Cloud-synced projects

### Phase 3 — Production Polish

- [ ] Server-side video processing option (for speed / mobile)
- [ ] Matrix batch video creation (auto-generate all UGC × Demo combos)
- [ ] Video templates & presets
- [x] Single text overlay editor with timeline controls
- [ ] Advanced text styling (fonts, animations, shadows)
- [ ] Export quality settings
- [ ] Usage analytics
- [ ] Billing / subscription (if applicable)

### Phase 4 — Secondary AI-Assisted Content Supply and Editing

- [ ] Video trimming & cutting tools
- [ ] Swapr — upload saved avatar photos, create scenario photos, choose existing UGC clips or finished stitches, and generate AI motion-transfer UGC outputs through Replicate
- [ ] AI video analysis to detect optimal trim/cut points (e.g., scene changes, pauses, energy peaks)
- [ ] AI-suggested highlights — automatically surface the best moments from UGC clips
- [ ] Smart auto-edit — one-click to trim dead air, awkward pauses, or low-energy segments
- [ ] AI-generated captions / subtitles with timing

---

## 10. Non-Goals (MVP)

- ❌ Cloud storage
- ❌ Server-side video rendering
- ❌ Mobile-native app
- ❌ Collaborative editing
- ❌ Multiple text overlay layers — single shared overlay is supported
- ❌ User-authored thumbnail generation / thumbnail editing
- ❌ Destructive video cutting — trims are editable metadata only
- ❌ AI-first content platform positioning — AI supports source creation, while Stitchr remains the primary workflow

---

## 11. Key Constraints

1. **Browser-first:** All video processing must happen client-side in the MVP.
2. **No external services:** MVP should work fully offline after initial page load.
3. **Free tooling only:** No paid video processing APIs or licensed codecs.
4. **TikTok-first output:** All uploaded clips and stitches must be normalized to 9:16 before preview, stitching, or download.
5. **Fast iteration:** The starship boilerplate gives us Next.js + good defaults — build on top of it, don't fight it.

---

## 12. Success Criteria (MVP)

- [ ] User can upload 5 UGC clips and 1 demo video.
- [ ] Each uploaded video is normalized to TikTok 9:16 using Media Bunny before it appears in the usable library.
- [ ] Each uploaded video and stitch has a non-black generated poster image in its default/static preview state.
- [ ] User can select up to 20 UGC clips + the demo and tap/swipe through exact UGC-then-Demo previews.
- [ ] User can create stitched 9:16 videos where the Demo starts immediately after each UGC clip ends.
- [ ] A single text overlay can be applied consistently across all selected UGC + Demo outputs.
- [ ] All resulting 9:16 videos can be downloaded.
- [ ] User can create multiple finished ad variants from the same library without opening a traditional editor.
- [ ] Everything works on `localhost` with no external dependencies.
