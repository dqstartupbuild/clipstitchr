# Swapr - Feature Scope

> **Version:** 0.1 (Planning Definition)
> **Created:** 2026-05-07
> **Status:** Planning

---

## 1. Vision

**Swapr** is an AI-powered ClipStitchr feature that lets a user choose:

1. a saved photo of a person or character, and
2. a saved UGC video from the existing ClipStitchr UGC library,

then generate a new AI video where the person from the photo appears to follow the action, pose, motion, or performance from the selected UGC video.

The intended user-facing language is "swap the person in the video with the person from the photo." Technically, the first version should be scoped as **motion and appearance transfer**, not guaranteed frame-perfect face replacement. The selected UGC video acts as the reference motion video. The selected photo acts as the reference identity or character image.

The generated output should be saved back into ClipStitchr as a usable UGC-style asset so it can be previewed, downloaded, and selected in the existing UGC-then-Demo Stitchr workflow.

---

## 2. Product Meaning

### What "Swapr" Means

| User phrase | Product interpretation | Implementation meaning |
|-------------|------------------------|-------------------------|
| Select a photo | Choose the person, face, character, or appearance to use in the output | Pick a saved `PhotoAsset` |
| Select a video | Choose the UGC clip whose motion should drive the output | Pick a saved UGC `VideoClip`; Demo clips are excluded |
| Swap the person | Replace the visible performer conceptually | Generate a new video where the photo subject follows the reference motion |
| Swap locations | Optionally influence background or scene | Add scene controls or prompt fields, but do not guarantee exact background replacement in v1 |
| Use Replicate | Run the AI generation through Replicate server-side | Next.js API route calls Replicate with a secret token |
| Use clean/Kling v3 or v2.6 motion control | Use a Kling motion-control style model if it remains the best available option | Prefer `kwaivgi/kling-v3-motion-control`; evaluate `kwaivgi/kling-v2.6-motion-control` as fallback |

Working assumption: "clean models" means **Kling models**, based on the referenced v3/v2.6 motion-control wording.

---

## 3. Core Workflow

```
+---------------------+
| Upload / save photo |
| to Photo Library    |
+----------+----------+
           |
           v
+---------------------+
| Select UGC video    |
| from ClipStitchr library  |
| Demo videos hidden  |
+----------+----------+
           |
           v
+---------------------+
| Configure Swapr     |
| photo + UGC + scene |
+----------+----------+
           |
           v
+---------------------+
| Server creates      |
| Replicate job       |
+----------+----------+
           |
           v
+---------------------+
| Poll or webhook     |
| until completed     |
+----------+----------+
           |
           v
+---------------------+
| Persist generated   |
| video + poster      |
+----------+----------+
           |
           v
+---------------------+
| Save output as      |
| UGC-style clip      |
+---------------------+
```

---

## 4. Feature Requirements

### 4.1 Photo Upload and Library

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | Upload person/reference photos from file picker or drag-and-drop | Yes | Yes |
| 2 | Store uploaded photo files and metadata | R2 for files, Convex for metadata | R2 for files, Convex for metadata |
| 3 | Save uploaded photos as 1080 x 1920 portrait references; AI expansion is optional and off by default | Yes | Yes |
| 4 | Generate lightweight preview thumbnails for photo cards | Yes | Yes |
| 5 | Rename and delete uploaded photos | Yes | Yes |
| 6 | Validate accepted image types and size limits | Yes | Yes |
| 7 | Record user consent/ownership acknowledgement before AI use | Basic UI acknowledgement | Account-level policy and audit metadata |

### 4.2 UGC Video Selection

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | Show existing uploaded UGC videos as selectable motion references | Yes | Yes |
| 2 | Exclude Demo clips from Swapr selection | Yes | Yes |
| 3 | Use normalized 9:16 UGC blobs as the default reference video source | Yes | Yes |
| 4 | Respect default trim ranges where model duration limits require shorter clips | Yes | Yes |
| 5 | Allow a Swapr-specific trim range without changing the source UGC default trim | Yes | Yes |

### 4.3 Swapr Generation

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | Select one photo and one UGC video | Yes | Yes |
| 2 | Optional text prompt to guide motion, style, and scene | Yes | Yes |
| 3 | Optional scene mode: keep video scene, keep photo scene, or prompt new scene | Prototype | Yes, if model supports it reliably |
| 4 | Choose quality mode such as standard or pro when the selected model supports it | Yes | Yes |
| 5 | Create asynchronous Replicate prediction from server-side API route | Yes | Yes |
| 6 | Show queued, processing, succeeded, failed, and canceled states | Yes | Yes |
| 7 | Save successful output as a reusable UGC-style clip | Yes | Yes |
| 8 | Generate a poster image for the generated output | Yes | Yes |
| 9 | Normalize generated output to TikTok 9:16 if the model output is not already correct | Yes | Yes |

### 4.4 Output Reuse

| # | Feature | MVP | Prod |
|---|---------|-----|------|
| 1 | Preview generated Swapr output in the app | Yes | Yes |
| 2 | Download generated Swapr output directly | Yes | Yes |
| 3 | Make generated Swapr output selectable as a UGC clip in `/dashboard/stitchr` | Yes | Yes |
| 4 | Preserve provenance showing the output came from Swapr | Yes | Yes |
| 5 | Link back to source photo, source UGC clip, model, and prompt metadata | Yes | Yes |

---

## 5. Pages / Routes

```
/dashboard/swapr                 -> Swapr studio: choose photo, choose UGC video, configure, generate
/dashboard/avatars               -> Avatar photo upload, avatar descriptions, and generated avatar scenario photos
/dashboard/uploads?tab=ugc       -> Existing UGC library; UGC clips can feed Swapr
/dashboard/uploads?tab=swaps     -> Generated Swapr outputs; outputs are saved as reusable UGC-style clips
/dashboard/uploads?tab=stitches  -> Existing stitches library inside the unified Content Library
/dashboard/stitches              -> Compatibility redirect to `/dashboard/uploads?tab=stitches`
```

Avatar photos are uploaded, deleted, downloaded, described, and expanded into new scenario photos from `/dashboard/avatars`. Successful Swapr outputs are saved to the Swaps tab and remain selectable in Stitchr as UGC-style clips. The dashboard upload action for `/dashboard/uploads` handles UGC and Demo videos; avatar photo upload lives on the Avatars page. Avatar photos are only selected for Swapr from `/dashboard/swapr`, matching the way UGC videos are uploaded in the library but selected inside the Swapr studio. Photo AI expansion must be an explicit opt-in upload option, deselected by default.

---

## 6. Replicate / AI Model Direction

### Preferred Model Family

Use Replicate-hosted Kling motion-control models if they remain available and suitable at implementation time.

Current candidates checked on 2026-05-07:

| Candidate | Replicate model | Fit |
|-----------|-----------------|-----|
| Preferred | `kwaivgi/kling-v3-motion-control` | Transfers character motion from a reference video to a reference image. Better fit for "photo person follows UGC video motion." |
| Fallback / comparison | `kwaivgi/kling-v2.6-motion-control` | Motion-control model that may support reference-video or brush/path workflows depending on the exact API schema. Use only after schema verification. |

The selected model must be configurable through environment variables or server config so ClipStitchr can switch models without rewriting the feature.

### Confirmed Kling v3 Input Schema

The live Replicate schema for `kwaivgi/kling-v3-motion-control` was checked on 2026-05-07. The current latest version is `15430b300f8c044e8f9e3567fd6daadf6d62e9bb0cee23fdb7969d3b26542f40`.

Use these input keys:

| Key | Type | Swapr meaning |
|-----|------|---------------|
| `image` | file URI | Uploaded source photo / character image |
| `video` | file URI | Selected UGC motion reference video |
| `prompt` | string | Optional guidance for scene, motion, and style |
| `mode` | `std` or `pro` | Standard 720p or professional 1080p generation |
| `keep_original_sound` | boolean | Preserve audio from the selected UGC reference when possible |
| `character_orientation` | `image` or `video` | Use photo-facing direction, max 10s, or match video orientation, max 30s |

The implementation should not use outdated placeholder keys such as `reference_image` or `reference_video`.

### Model Behavior To Expect

Kling v3 motion control is a better conceptual match for Swapr because its documented behavior is: provide a reference image for appearance, provide a reference video for motion, and generate a new video that combines them.

This is not the same as deterministic video editing. The output may change face details, body shape, clothing, background, hand details, or timing. The UI and scope should avoid claims like "perfectly replaces the person" or "keeps the same location exactly."

Swapr must prepare uploaded photos as 9:16 references before sending them to the motion-control model. By default, non-9:16 photos should be locally crop-filled to 1080 x 1920 so no AI credits are used and no poor-aspect source is saved. If the user explicitly enables AI expansion during upload, ClipStitchr should build a 1080 x 1920 source canvas, preserve the original image area with a black mask, mark the missing portrait regions with a white mask, and call a Replicate image outpainting model before saving the photo asset. This gives the motion-control model a real portrait reference instead of a square image.

Current photo-expansion model checked on 2026-05-07:

| Candidate | Replicate model | Fit |
|-----------|-----------------|-----|
| Preferred | `black-forest-labs/flux-fill-pro` | Inpainting/outpainting model that accepts `image`, `mask`, `prompt`, `steps`, `guidance`, `safety_tolerance`, `prompt_upsampling`, and `output_format`. |

Photo outpainting should happen server-side through a ClipStitchr API route so the Replicate key remains private. The browser may create the source canvas and mask because that work does not require secrets.

The outpaint prompt must explicitly constrain the model to real-world scene continuation. It should ask for location, room, wall, floor, sky, furniture, clothing edges, hair edges, lighting, shadows, camera quality, and perspective to continue naturally. It must explicitly forbid social media interfaces, phone screens, app UI, websites, captions, usernames, like/comment bars, buttons, icons, frames, posters, logos, watermarks, templates, and graphic design elements.

Text artifacts are especially harmful because generated captions, signs, labels, and gibberish can make a Swapr source photo unusable. The outpaint prompt should put "no text of any kind" near the start, explicitly banning letters, words, numbers, captions, signs, labels, handwriting, typography, subtitles, UI text, menu text, posters, stickers, watermarks, and gibberish. If the model would otherwise fill an area with text, it should use plain texture, wall, floor, fabric, sky, furniture, or natural background.

The source canvas should not use pure white filler in masked areas because that can bias the model toward UI or template-like generations. Use a blurred, darkened extension of the original image as a low-frequency context guide, then mask those regions white so the outpainting model replaces them.

### Duration and Quality Constraints

The app must validate against the selected model's current schema before submission.

Known constraints to plan around:

- Some motion-control modes cap generation length, for example 10 seconds for image-oriented output and up to 30 seconds for video-oriented output in Kling v3 documentation.
- Some APIs require a minimum reference video duration.
- Higher quality modes may output 1080p but cost more and take longer.
- Standard modes may output 720p and require Media Bunny normalization before saving to ClipStitchr.

### Scene / Location Swapping

"Swap locations" should be treated as a scene-control layer, not a guaranteed MVP promise.

Possible modes:

| Scene mode | Meaning | MVP confidence |
|------------|---------|----------------|
| Keep reference video scene | Try to preserve the background/camera context of the selected UGC clip | Medium |
| Keep photo scene | Try to preserve the photo background while applying UGC motion | Low to medium |
| Prompt new scene | Prompt a new location such as "in a modern kitchen" or "on a city sidewalk" | Medium |
| No scene control | Let the model infer the scene from the photo, video, and prompt | High |

If exact location swapping becomes a hard requirement, it should be researched separately from the first Swapr MVP because it may require a different model, segmentation, inpainting, or video-to-video workflow.

---

## 7. Architecture Overview

### MVP: Local Library Plus Server-Side AI Call

Swapr is a server-gated paid-provider helper workflow because it depends on
Replicate. It cannot safely call Replicate directly from browser code because
the Replicate API token must remain secret.

```
+------------------------------------------+
| Browser                                  |
|                                          |
| Next.js UI                               |
| - Photo library                          |
| - UGC video selector                     |
| - Swapr studio                           |
| - Job status UI                          |
|                                          |
| Convex + R2                              |
| - Photo metadata and object refs         |
| - Normalized UGC video object refs       |
| - Swapr output objects and metadata      |
+-------------------+----------------------+
                    |
                    | multipart/form-data or signed asset URLs
                    v
+------------------------------------------+
| Next.js API Route                        |
| - Reads REPLICATE_API_TOKEN              |
| - Validates ownership/asset types        |
| - Calls Replicate                        |
| - Returns prediction/job status          |
+-------------------+----------------------+
                    |
                    v
+------------------------------------------+
| Replicate                                |
| - Kling motion-control prediction        |
| - Temporary output file                  |
+------------------------------------------+
```

### Production

```
+------------+      +--------------+      +----------------+
| Client     |<---->| Next.js API   |<---->| Convex         |
| Browser    |      | Routes        |      | metadata/jobs  |
+-----+------+      +------+-------+      +----------------+
      |                    |
      |                    v
      |             +--------------+
      |             | Replicate    |
      |             | predictions  |
      |             +------+-------+
      |                    |
      v                    v
+------------------------------------------+
| Cloudflare R2                            |
| - Photo files                            |
| - UGC reference files                    |
| - Generated Swapr outputs                |
| - Poster images                          |
+------------------------------------------+
```

Production should use webhooks for long-running predictions and immediately copy generated outputs from Replicate delivery URLs or file outputs into R2. Replicate API outputs are temporary, so they must not be treated as durable storage.

---

## 8. Data Model

### MVP Convex + R2 Types

```typescript
interface PhotoAsset {
  id: string;
  name: string;
  photoObject: R2ObjectReference;
  thumbnailObject?: R2ObjectReference;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
  consentAcknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface SwaprJob {
  id: string;
  sourcePhotoId: string;
  referenceUgcClipId: string;
  referenceTrimRange?: { start: number; end: number };
  prompt?: string;
  sceneMode: 'none' | 'keep-video-scene' | 'keep-photo-scene' | 'prompt-new-scene';
  modelId: string;
  modelVersion?: string;
  qualityMode?: 'std' | 'pro';
  orientationMode?: 'image' | 'video';
  replicatePredictionId?: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  errorMessage?: string;
  outputClipId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface SwaprOutputMetadata {
  source: 'swapr';
  sourcePhotoId: string;
  referenceUgcClipId: string;
  swaprJobId: string;
  modelId: string;
  modelVersion?: string;
  prompt?: string;
  sceneMode: 'none' | 'keep-video-scene' | 'keep-photo-scene' | 'prompt-new-scene';
}
```

Generated Swapr outputs should be stored as normal `VideoClip` records with `type: 'ugc'` plus `SwaprOutputMetadata`. This keeps the existing UGC picker useful without introducing a third clip type into the main UGC-then-Demo Stitchr flow.

### Production Data

In production:

- Convex stores metadata, ownership, job states, provenance, Replicate prediction IDs, and asset references.
- R2 stores photo files, generated output videos, generated poster images, and any temporary reference files that need stable URLs.
- Replicate outputs are copied to R2 as soon as the prediction succeeds.
- The database should not store large binary media directly.

---

## 9. Media Processing Policy

Swapr should continue ClipStitchr's TikTok-first media rules:

- Source UGC clips must already be normalized to 9:16 before they are selectable.
- Source photos must be normalized to 1080 x 1920 portrait references on upload. If AI expansion is deselected, use local crop-to-fill. If AI expansion is selected, use the image outpainting flow.
- If the model requires a shorter reference clip, create a temporary trimmed reference clip from the selected UGC using Media Bunny.
- Do not modify the original UGC video blob when making a Swapr reference clip.
- Generated Swapr output must be normalized to 9:16 before it is saved as a reusable UGC clip. Use crop-to-fill normalization for Swapr outputs so square or landscape model results do not become letterboxed videos.
- Generate a poster image for the output using the same generated-poster strategy as other ClipStitchr videos.
- Store output duration, dimensions, MIME type, and aspect ratio.
- If the AI model returns audio, preserve it unless the output must be transcoded and browser support prevents audio preservation.
- If the AI model returns no audio, save the clip as silent and make that clear in metadata.

---

## 10. API and Security Requirements

### Server-Side API Only

The Replicate API token must never be exposed to client-side code.

Required server endpoints:

| Endpoint | Purpose |
|----------|---------|
| `POST /api/swapr/photos/expand` | Send a 9:16 source image and mask to an image outpainting model and return the expanded portrait photo |
| `POST /api/swapr/jobs` | Validate selected assets, create a Replicate prediction, store initial job state |
| `GET /api/swapr/jobs/:id` | Return job status and output metadata |
| `POST /api/swapr/jobs/:id/cancel` | Cancel an active prediction if supported |
| `GET /api/swapr/output?url=...` | Proxy a completed Replicate output file so the browser can normalize it and persist the result to R2 + Convex |
| `POST /api/swapr/webhook` | Production webhook endpoint for Replicate completion events |

MVP can poll job status. Production should prefer webhooks so completed files are persisted quickly.

The current local `.env.local` key name is `REPLICATE_KEY`. The server code should also accept `REPLICATE_API_TOKEN` so deployment can use Replicate's standard naming convention.

### File Handling

Replicate supports hosted URLs, local file objects, and data URIs for input files. The implementation should prefer:

1. R2-hosted signed URLs in production.
2. Server-side `Blob`, `File`, or `Buffer` forwarding for MVP files up to the current Replicate client limit.
3. Data URIs only for very small images, not videos.

Large files should be trimmed or compressed before submission. Replicate's input-file docs currently describe local `Blob`, `File`, or `Buffer` uploads as suitable up to 100MB, but the exact file limit must still be verified against the selected model and client version during implementation.

### Privacy and Provider Disclosure

The selected model's provider policies must be disclosed before public launch. The Replicate Kling v3 model page currently states that data from that model is sent from Replicate to Kuaishou, so Swapr should not treat uploaded photos or videos as staying only inside ClipStitchr infrastructure once an AI generation is submitted.

### Consent and Misuse Controls

Because Swapr changes a person's appearance in video, it needs explicit product boundaries:

- Users must acknowledge that they have rights and consent to use the uploaded photo and reference video.
- The app should identify generated Swapr outputs as AI-generated in metadata and UI.
- The MVP should not promote deceptive impersonation, public-figure impersonation, adult content generation, harassment, or non-consensual identity use.
- Production should include account-level audit trails for who generated which output from which source assets.
- A visible watermark or export metadata flag should be considered before public launch.

---

## 11. UX Requirements

### Swapr Studio Layout

The Swapr screen should be a work-focused generation interface, not a marketing page.

Primary areas:

- Photo selector: grid/list of saved avatar photos, with upload and scenario generation handled from `/dashboard/avatars`.
- UGC selector: filtered list of UGC clips only.
- Preview column: selected photo, selected reference video, and generated output when ready.
- Controls: prompt, scene mode, quality mode, orientation/motion mode if supported.
- Job status: queued, processing, complete, failed, canceled.
- Output actions: save as UGC, download, use in Stitchr flow.

### Empty States

- No avatars: invite the user to upload a person/reference avatar photo.
- No UGC clips: link to the UGC upload tab.
- No selection: show side-by-side placeholders for photo and UGC video.
- Failed job: show the model error and allow retry with the same inputs.

### Copy Rules

Use careful language:

- Say "generate a new video using this photo and UGC motion."
- Say "scene prompt" or "background guidance" instead of guaranteeing a location swap.
- Avoid "perfect face swap", "deepfake", or "undetectable replacement."

---

## 12. Phased Rollout

### Phase 0 - Model Research

- [ ] Confirm current Replicate schemas for `kwaivgi/kling-v3-motion-control` and `kwaivgi/kling-v2.6-motion-control`.
- [ ] Run sample generations with one portrait photo and one normalized UGC clip.
- [ ] Test duration limits, orientation modes, quality modes, output dimensions, output audio, and average latency.
- [ ] Decide whether v3 is the default or whether v2.6 has a needed scene-control advantage.
- [ ] Document exact model input keys before implementation.

### Phase 1 - Swapr MVP

- [ ] Add photo upload and local photo library.
- [ ] Add `/dashboard/swapr`.
- [ ] Select one saved photo and one saved UGC clip.
- [ ] Exclude Demo videos from Swapr.
- [ ] Add optional prompt and basic scene mode.
- [ ] Add server-side Replicate API route using `REPLICATE_API_TOKEN`.
- [ ] Poll job status from the client.
- [ ] Persist successful output to R2 and Convex.
- [ ] Generate output poster image.
- [ ] Save output as a UGC-style clip for reuse in `/dashboard/stitchr`.

### Phase 2 - Backend Persistence

- [ ] Move photo and generated video storage to R2.
- [ ] Store photo, job, and output metadata in Convex.
- [ ] Add Replicate webhooks.
- [ ] Copy Replicate outputs into R2 immediately on completion.
- [ ] Add authenticated per-user libraries with Clerk.
- [ ] Add account-level usage and cost tracking.

### Phase 3 - Advanced Controls

- [ ] Batch-generate one photo across multiple UGC clips.
- [ ] Batch-generate multiple photos across one UGC clip.
- [ ] Add stronger scene/location controls if a suitable model supports them.
- [ ] Add before/after comparison.
- [ ] Add model presets for speed, quality, and scene consistency.
- [ ] Add moderation and export watermarking if needed for launch policy.

---

## 13. Non-Goals

- No use of Demo clips as Swapr motion references in the first version.
- No guarantee of exact face replacement or exact body preservation.
- No guarantee of exact background or location swapping.
- No real-time video swapping.
- No offline AI generation.
- No custom model training.
- No multi-person swapping in MVP.
- No public-figure or non-consensual identity workflows.
- No destructive edits to original photos or UGC videos.
- No promise that generated output will be longer than the selected model supports.

---

## 14. Key Constraints

1. **Server-side secret handling:** Replicate calls must go through a server route.
2. **External dependency:** Swapr is outside the browser-local media processing
   path and requires configured provider credentials, server auth, and rate
   limits.
3. **UGC-only video source:** only UGC clips can drive Swapr motion; Demo clips are excluded.
4. **TikTok-first output:** final saved output should be normalized to 9:16.
5. **Temporary AI outputs:** Replicate API outputs must be copied into app storage quickly.
6. **Consent-aware UX:** users must acknowledge rights to use identity/reference media.
7. **Model volatility:** exact model names, schemas, prices, and limits must be verified before implementation.

---

## 15. Success Criteria

- [ ] User can upload and save at least one photo.
- [ ] User can open Swapr and select a saved photo.
- [ ] User can select a saved UGC video as the motion reference.
- [ ] Demo videos are not selectable in Swapr.
- [ ] User can submit a Swapr job through a server-side Replicate integration.
- [ ] User can see job progress and completion/failure state.
- [ ] Successful output is persisted in ClipStitchr storage, not just linked from Replicate.
- [ ] Successful output has a generated poster image.
- [ ] Successful output appears as a UGC-style clip and can be used in the existing UGC-then-Demo Stitchr flow.
- [ ] The app records enough provenance to identify the source photo, source UGC clip, model, prompt, and generation time.

---

## 16. References Checked

- Replicate Kling v3 motion-control model: https://replicate.com/kwaivgi/kling-v3-motion-control
- Replicate Kling v2.6 motion-control model: https://replicate.com/kwaivgi/kling-v2.6-motion-control
- Replicate input files documentation: https://replicate.com/docs/topics/predictions/input-files
- Replicate prediction creation documentation: https://replicate.com/docs/topics/predictions/create-a-prediction
- Replicate webhooks documentation: https://replicate.com/docs/topics/webhooks
- Replicate output files documentation: https://replicate.com/docs/topics/predictions/output-files
- Replicate official models documentation: https://replicate.com/docs/topics/models/official-models
