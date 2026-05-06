# Clipr — Project Scope

> **Version:** 0.1 (MVP Definition)
> **Created:** 2026-05-05
> **Status:** Planning

---

## 1. Vision

**Clipr** is a web application that lets users upload UGC (User-Generated Content) reaction clips and product demo videos, then seamlessly stitch them together to produce polished marketing videos — all from the browser.

Given **5 UGC clips** and **1 product demo**, a user can produce **5 unique videos** — each pairing a different UGC clip (first) with the same product demo (second) — in minutes, without leaving the app.

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
│        Video Library / Dashboard │
│  (browse, preview, organize)     │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│     Select UGC + Demo Clip       │
│     Click "Create Video"         │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│   Stitch: UGC first → Demo second│
│   Add text overlays (timeline)   │
│   Edit thumbnail                 │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│     Preview & Download           │
└──────────────────────────────────┘
```

---

## 3. Tech Stack

| Layer              | Production Target              | MVP (Local Dev)           |
| ------------------ | ------------------------------ | ------------------------- |
| **Scaffolding**    | `npx create-starship-app`      | Same                      |
| **Framework**      | Next.js (from starship boilerplate) | Same                 |
| **Auth**           | Clerk                          | None — open dashboard     |
| **Backend / DB**   | Convex                         | None — local state only   |
| **Object Storage** | Cloudflare R2                  | IndexedDB (blob storage)  |
| **Video Engine**   | FFmpeg.wasm → server-side FFmpeg | FFmpeg.wasm (browser)    |

---

## 4. Feature Requirements

### 4.1 Video Upload & Library

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | Upload UGC reaction clips (drag & drop or file picker) | ✅ | ✅ |
| 2 | Upload product demo videos | ✅ | ✅ |
| 3 | Categorize uploads as **UGC** or **Demo** | ✅ | ✅ |
| 4 | Preview uploaded clips in-browser | ✅ | ✅ |
| 5 | Delete / rename clips | ✅ | ✅ |
| 6 | Store files in local storage / IndexedDB | ✅ | — |
| 7 | Store files in Cloudflare R2 | — | ✅ |

### 4.2 Video Stitching / Creation

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | User **selects** one UGC clip and one Demo clip | ✅ | ✅ |
| 2 | Click **"Create Video"** to stitch them (UGC first, Demo second) | ✅ | ✅ |
| 3 | Processing happens in-browser (no server-side rendering for MVP) | ✅ | ✅ |
| 4 | Output a single combined video file | ✅ | ✅ |
| 5 | Progress indicator during stitching | ✅ | ✅ |
| 6 | Download finished video | ✅ | ✅ |

### 4.3 Text Overlays

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | Add text on top of the stitched video | ✅ | ✅ |
| 2 | Timeline control — set start time & end time for text appearance | ✅ | ✅ |
| 3 | Basic text styling (font size, color, position) | ✅ | ✅ |
| 4 | Multiple text layers | ✅ | ✅ |

### 4.4 Thumbnail Editing

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | Auto-generate thumbnail from a frame in the video | ✅ | ✅ |
| 2 | User can select which frame to use as thumbnail | ✅ | ✅ |
| 3 | Add text / overlays to the thumbnail | ✅ | ✅ |
| 4 | Export thumbnail as image file | ✅ | ✅ |

### 4.5 Dashboard & Navigation

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | Landing page with a **"Dashboard"** button | ✅ | ✅ |
| 2 | Dashboard shows all uploaded clips + created videos | ✅ | ✅ |
| 3 | No login required — dashboard is directly accessible | ✅ | — |
| 4 | Clerk-authenticated access to dashboard | — | ✅ |

---

## 5. Pages / Routes (MVP)

```
/                → Landing page (marketing + "Go to Dashboard" CTA)
/dashboard       → Main workspace
/dashboard/create → Video creation / stitching interface
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
│  │              Video Library         │   │
│  │              Creation Studio       │   │
│  │                    │               │   │
│  │         ┌──────────┴──────────┐    │   │
│  │         │  Video Engine       │    │   │
│  │         │  (FFmpeg.wasm)      │    │   │
│  │         │                     │    │   │
│  │         └─────────────────────┘    │   │
│  └────────────────────────────────────┘   │
│                                           │
│  IndexedDB                                │
│  (video blobs, metadata, thumbnails)      │
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

## 7. Video Processing Engine — ✅ FFmpeg.wasm

**Decision:** FFmpeg.wasm is the chosen video processing engine for Clipr.

### Why FFmpeg.wasm

- **Full FFmpeg in the browser** — handles concatenation, text overlays (`drawtext` filter), and thumbnail extraction natively.
- **Single dependency** covers all current and near-future video editing needs.
- **Free and open source** — no licensing concerns.
- **Well-documented** with an active community.
- **Clear upgrade path** — can be swapped for server-side FFmpeg in production for better performance on large files.

### Trade-offs Accepted

| Concern | Mitigation |
|---------|------------|
| Large WASM bundle (~25 MB) | Lazy-load only when user enters the creation studio; cache aggressively via service worker |
| Slower than native FFmpeg | Acceptable for MVP; server-side processing planned for Phase 3 |
| Requires `SharedArrayBuffer` (COOP/COEP headers) | Configure Next.js response headers accordingly |

### Alternatives Considered (Not Selected)

| Option | Reason for rejection |
|--------|---------------------|
| WebCodecs API | Too low-level; no muxing built-in; limited browser support |
| Remotion | Requires server or Lambda for rendering; not purely client-side |
| MP4Box.js + Canvas | Insufficient editing capabilities for text overlays and future features |

---

## 8. Data Model (MVP — Local)

```typescript
// Stored in IndexedDB

interface VideoClip {
  id: string;
  name: string;
  type: 'ugc' | 'demo';
  blob: Blob;
  thumbnailBlob: Blob | null;
  duration: number; // seconds
  createdAt: string; // ISO timestamp
}

interface CreatedVideo {
  id: string;
  name: string;
  ugcClipId: string;
  demoClipId: string;
  blob: Blob;
  thumbnailBlob: Blob | null;
  textOverlays: TextOverlay[];
  duration: number;
  createdAt: string;
}

interface TextOverlay {
  id: string;
  text: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  x: number;         // position
  y: number;
  fontSize: number;
  color: string;
}
```

---

## 9. Phased Rollout

### Phase 1 — MVP (Current Focus)

- [x] Scaffold project with `npx create-starship-app`
- [ ] Landing page with "Dashboard" button
- [ ] Dashboard with drag-and-drop video upload
- [ ] Video library (UGC vs Demo categorization)
- [ ] Video preview player
- [ ] Video stitching (UGC + Demo → single output)
- [ ] Text overlay editor with timeline controls
- [ ] Thumbnail editor (frame selection + text overlay)
- [ ] Download finished videos
- [ ] All data stored locally (IndexedDB)
- [ ] No authentication required

### Phase 2 — Backend Integration

- [ ] Integrate Clerk authentication
- [ ] Set up Convex backend (video metadata, user data)
- [ ] Migrate file storage to Cloudflare R2
- [ ] User accounts with personal video libraries
- [ ] Cloud-synced projects

### Phase 3 — Production Polish

- [ ] Server-side video processing option (for speed / mobile)
- [ ] Batch video creation (auto-generate all UGC × Demo combos)
- [ ] Video templates & presets
- [ ] Advanced text styling (fonts, animations, shadows)
- [ ] Export quality settings
- [ ] Usage analytics
- [ ] Billing / subscription (if applicable)

### Phase 4 — AI-Powered Editing

- [ ] Video trimming & cutting tools
- [ ] AI video analysis to detect optimal trim/cut points (e.g., scene changes, pauses, energy peaks)
- [ ] AI-suggested highlights — automatically surface the best moments from UGC clips
- [ ] Smart auto-edit — one-click to trim dead air, awkward pauses, or low-energy segments
- [ ] AI-generated captions / subtitles with timing

---

## 10. Non-Goals (MVP)

- ❌ User accounts / authentication
- ❌ Cloud storage
- ❌ Server-side video rendering
- ❌ Mobile-native app
- ❌ Collaborative editing
- ❌ Video trimming / cutting — deferred to **Phase 4** with AI-powered smart cuts (only full-clip concatenation for now)

---

## 11. Key Constraints

1. **Browser-first:** All video processing must happen client-side in the MVP.
2. **No external services:** MVP should work fully offline after initial page load.
3. **Free tooling only:** No paid video processing APIs or licensed codecs.
4. **Fast iteration:** The starship boilerplate gives us Next.js + good defaults — build on top of it, don't fight it.

---

## 12. Success Criteria (MVP)

- [ ] User can upload 5 UGC clips and 1 demo video.
- [ ] User can select any UGC + the demo and create a stitched video.
- [ ] Text overlays can be added with configurable timing.
- [ ] Thumbnails can be customized per created video.
- [ ] All 5 resulting videos can be downloaded.
- [ ] Everything works on `localhost` with no external dependencies.
