# ClipStitchr — Project Scope

> **Version:** 0.1 (MVP Definition)
> **Created:** 2026-05-05
> **Status:** Planning

---

## 1. Vision

**ClipStitchr** is a web application that lets users upload UGC (User-Generated Content) reaction clips and product demo videos, normalize them to TikTok-ready 9:16 format, then seamlessly stitch them together to produce polished marketing videos — all from the browser.

Given **5 UGC clips** and **1 product demo**, a user can produce **5 unique 9:16 videos** — each pairing a different UGC clip (first) with the same product demo (second) — in minutes, without leaving the app.

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
│     Select UGC + Demo Clip       │
│   Preview: UGC, then Demo        │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│     Click "Stitch Video"         │
│ Stitch: UGC immediately → Demo   │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ Download single TikTok 9:16 file │
└──────────────────────────────────┘
```

---

## 3. Tech Stack

| Layer              | Production Target              | MVP (Local Dev)           |
| ------------------ | ------------------------------ | ------------------------- |
| **Scaffolding**    | `npx create-starship-app`      | Same                      |
| **Framework**      | Next.js (from starship boilerplate) | Same                 |
| **Auth**           | Clerk                          | Clerk-protected dashboard |
| **Backend / DB**   | Convex                         | None — local state only   |
| **Object Storage** | Cloudflare R2                  | IndexedDB (blob storage)  |
| **Video Engine**   | Media Bunny with optional server-side processing later | Media Bunny (browser) |

---

## 4. Feature Requirements

### 4.1 Video Upload & Library

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | Upload UGC reaction clips (drag & drop or file picker) | ✅ | ✅ |
| 2 | Upload product demo videos | ✅ | ✅ |
| 3 | Categorize uploads as **UGC** or **Demo** | ✅ | ✅ |
| 4 | Normalize every uploaded video to TikTok 9:16 using Media Bunny | ✅ | ✅ |
| 5 | Preview normalized clips in-browser with generated poster images | ✅ | ✅ |
| 6 | Delete / rename clips | ✅ | ✅ |
| 7 | Set a non-destructive default trim range for each uploaded clip | ✅ | ✅ |
| 8 | Store normalized files and preview poster images in local storage / IndexedDB | ✅ | — |
| 9 | Store normalized files and preview poster images in Cloudflare R2 | — | ✅ |

### 4.2 Video Stitching

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | User **selects** one UGC clip and one Demo clip | ✅ | ✅ |
| 2 | Preview selection as UGC clip followed immediately by Demo clip | ✅ | ✅ |
| 3 | Copy upload default trims into each new Stitchr selection | ✅ | ✅ |
| 4 | Override copied trim ranges while stitching without changing upload defaults | ✅ | ✅ |
| 5 | Click **"Stitch Video"** to stitch them with the same UGC-then-Demo sequence | ✅ | ✅ |
| 6 | Processing happens in-browser (no server-side rendering for MVP) | ✅ | ✅ |
| 7 | Output a single combined TikTok 9:16 video file | ✅ | ✅ |
| 8 | Progress indicator during normalization and stitching | ✅ | ✅ |
| 9 | Download finished video | ✅ | ✅ |

### 4.3 Text Overlays (Post-MVP)

Text overlays are planned for later, but they are not required for the MVP.

| # | Feature | MVP | Future |
|---|---------|-----|--------|
| 1 | Add text on top of the stitched video | — | ✅ |
| 2 | Timeline control — set start time & end time for text appearance | — | ✅ |
| 3 | Basic text styling (font size, color, position) | — | ✅ |
| 4 | Multiple text layers | — | ✅ |

### 4.4 Dashboard & Navigation

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | Landing page with a **"Dashboard"** button | ✅ | ✅ |
| 2 | Dashboard shows workspace status, recent uploads, recent stitches, and Stitchr entry points | ✅ | ✅ |
| 3 | No login required — dashboard is directly accessible | — | — |
| 4 | Clerk-authenticated access to dashboard | ✅ | ✅ |
| 5 | Uploaded UGC clips and demo videos share a tabbed uploads library page | ✅ | ✅ |
| 6 | Uploaded Swapr photos appear in the uploads library Photos tab; AI expansion is optional and off by default | ✅ | ✅ |
| 7 | Stitches have a dedicated library page | ✅ | ✅ |
| 8 | A unified upload control supports UGC, Demo, and Photo uploads from the dashboard header action | ✅ | ✅ |

---

## 5. Pages / Routes (MVP)

```
/                → Landing page (marketing + "Go to Dashboard" CTA)
/dashboard       → Authenticated main workspace
/dashboard/stitchr → Authenticated Stitchr video stitching interface
/dashboard/swapr → Authenticated AI motion-transfer studio using saved photos and UGC clips
/dashboard/uploads → Authenticated upload library with UGC, Demo, and Photos tabs; unified upload controls open from header action
/dashboard/stitches → Authenticated stitches library
```

---

## 6. Architecture Overview

### MVP (Local-First)

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
│  IndexedDB                                │
│  (video blobs, poster blobs, metadata)    │
└──────────────────────────────────────────┘
```

### Production

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
- Preview, Stitch Video, and Download must all use the same sequence: the normalized UGC clip starts first, and the normalized Demo clip starts immediately after the UGC clip ends.
- Trimming is non-destructive metadata. Uploads store a default trim range. When a clip is selected in Stitchr, the default trim range is copied into that Stitchr session and can be changed independently.
- Preview, Stitch Video, and Download must use the copied Stitchr trim ranges when present.
- The final stitch must be a single 9:16 file using the same normalized assets shown in preview.
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
- Store the normalized `BufferTarget.buffer` as a browser `Blob` in IndexedDB.
- After normalization succeeds, generate a poster `Blob` from the normalized video and store it with the clip record.

#### Sequence Preview

- Preview should use the normalized clip blobs, not the original uploads.
- Static preview state should use the generated poster blob through the video element's `poster` attribute.
- The preview player should use the same sequence as export: play UGC first, then start Demo immediately on the UGC `ended` event.
- The preview does not need to render a temporary stitched file for MVP; it only needs to prove the exact ordering and normalized 9:16 playback.

#### Stitched Export / Download

- Do not use `Conversion` for stitching because it is a single-input conversion abstraction, not a multi-input composition API.
- Create a fresh `Output` with `Mp4OutputFormat` and `BufferTarget` for each stitch.
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

#### Future Text Overlays

- Text overlays should be implemented after MVP with a canvas-based `process` function.
- For one-file conversion flows, use `ConversionVideoOptions.process`.
- For custom export flows, use `VideoSampleSource` transform processing or draw onto a canvas before creating/adding a `VideoSample`.

### Trade-offs Accepted

| Concern | Mitigation |
|---------|------------|
| Browser codec support varies | Detect Media Bunny/WebCodecs support before processing and show an actionable unsupported-browser message |
| Upload normalization adds waiting time | Normalize once on upload, store the normalized blob, and show progress |
| Large files can pressure IndexedDB storage | Keep MVP local-first, surface storage errors clearly, and add cloud storage in Phase 2 |

### Alternatives Considered (Not Selected)

| Option | Reason for rejection |
|--------|---------------------|
| WebCodecs API | Too low-level; no muxing built-in; limited browser support |
| Remotion | Requires server or Lambda for rendering; not purely client-side |
| MP4Box.js + Canvas | Too much custom media plumbing for normalization, stitching, and later overlays |

---

## 8. Data Model (MVP — Local)

```typescript
// Stored in IndexedDB

interface VideoClip {
  id: string;
  name: string;
  type: 'ugc' | 'demo';
  blob: Blob; // normalized 9:16 clip used for preview and stitching
  posterBlob?: Blob; // generated JPEG poster used by the video poster attribute
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
  blob: Blob; // final 9:16 video: UGC immediately followed by Demo
  posterBlob?: Blob; // generated JPEG poster used by the video poster attribute
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
- [ ] UGC + Demo sequence preview
- [ ] Video stitching (UGC immediately followed by Demo → single 9:16 output)
- [ ] Download finished videos
- [ ] All data stored locally (IndexedDB)
- [x] Integrate Clerk authentication for dashboard and API routes

### Phase 2 — Backend Integration

- [ ] Set up Convex backend (video metadata, user data)
- [ ] Migrate file storage to Cloudflare R2
- [ ] User accounts with personal video libraries
- [ ] Cloud-synced projects

### Phase 3 — Production Polish

- [ ] Server-side video processing option (for speed / mobile)
- [ ] Batch video creation (auto-generate all UGC × Demo combos)
- [ ] Video templates & presets
- [ ] Text overlay editor with timeline controls
- [ ] Advanced text styling (fonts, animations, shadows)
- [ ] Export quality settings
- [ ] Usage analytics
- [ ] Billing / subscription (if applicable)

### Phase 4 — AI-Powered Editing

- [ ] Video trimming & cutting tools
- [ ] Swapr — upload saved photos, choose existing UGC clips, and generate AI motion-transfer UGC outputs through Replicate
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
- ❌ Text overlays — planned after MVP
- ❌ User-authored thumbnail generation / thumbnail editing
- ❌ Destructive video cutting — trims are editable metadata only

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
- [ ] User can select any UGC + the demo and preview the exact UGC-then-Demo sequence.
- [ ] User can create a stitched 9:16 video where the Demo starts immediately after the UGC clip ends.
- [ ] All 5 resulting 9:16 videos can be downloaded.
- [ ] Everything works on `localhost` with no external dependencies.
