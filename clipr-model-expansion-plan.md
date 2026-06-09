# Clipr Model Expansion Investigation

Reviewed: 2026-06-08

## Summary

Clipr should not try to match Arcads or MakeUGC quality by swapping
`prunaai/p-video-avatar` for one larger video model. The stronger direction is
a multi-step composer:

1. Plan a short UGC script from product and audience context.
2. Generate high-quality narration with ElevenLabs v3.
3. Generate short avatar and b-roll shots with the model best suited to each
   shot.
4. Preserve exact product demos by stitching real uploaded demo footage, not by
   asking a generative model to recreate product UI or product behavior.
5. Normalize and assemble the final 9:16 MP4 through the existing media worker
   and Media Bunny/ffmpeg-style finalization path.

Keep `prunaai/p-video-avatar` as the low-cost talking-head fallback. Add a
provider adapter layer before adding all of the proposed models to the UI.
Several proposed models can use a photo as a first frame or reference, but most
cannot ingest a finished voice track. That matters: ElevenLabs v3 improves
voice quality only when the video model accepts external audio for lip sync, or
when Clipr is willing to overlay narration that is not lip-synced to the face.

## Current Clipr Flow In This Repo

Relevant local files reviewed:

- `project-scope.md`
- `docs/features/clipr.md`
- `docs/backend/rate-limits.md`
- `docs/backend/provider-automation-workflows.md`
- `web/lib/clipstitchr/server/createCliprAvatarVideo.ts`
- `web/lib/clipstitchr/server/createCliprAvatarVideoInput.ts`
- `web/lib/clipstitchr/server/createCliprSceneAvatarImage.ts`
- `web/lib/clipstitchr/server/clipr/runCliprJobCreation.ts`
- `web/services/provider-worker/runProviderWorker.ts`
- `web/services/media-worker/runMediaWorker.mjs`

Current implementation shape:

- `POST /api/clipr/jobs` validates input, consumes job/script/still/video/music
  limits, creates a queued `cliprJobs` record, and creates one durable
  `manual-clipr` provider job.
- The provider worker generates script text, generates one avatar still, runs
  `CLIPR_AVATAR_VIDEO_MODEL_ID` defaulting to `prunaai/p-video-avatar`, saves
  provider outputs to R2, and creates a `clipr-finalization` media job.
- The media worker downloads the generated avatar video, normalizes it to the
  app's TikTok 9:16 output, creates a poster, stores the final MP4/poster in R2,
  and finalizes the Clipr library record.
- Optional Clipr music is already separate from the clean Clipr video and mixed
  at export/download time.

This is a good foundation. New models should be added as provider worker
adapters, not as long-running Next.js route calls.

## Important Distinction

There are three different model capability classes in the proposed list:

| Class | What it means | Models in this investigation |
| --- | --- | --- |
| Avatar/lip-sync model | Takes a face image and script or audio, produces a talking person | `prunaai/p-video-avatar` |
| Post-process lip-sync model | Takes an existing person video plus speech audio, returns a video with mouth motion aligned to that audio | `bytedance/latentsync`, `pixverse/lipsync` |
| Generative video with image/reference input | Takes text plus a first-frame or reference image, may generate native audio, but usually does not accept your finished narration audio | `google/veo-3.1`, `kwaivgi/kling-v2.5-turbo-pro`, `kwaivgi/kling-v2.6`, `kwaivgi/kling-v3-video`, `openai/sora-2`, `openai/sora-2-pro` |
| Multimodal reference video/audio model | Takes images, short videos, and short audio references for guided generation | `bytedance/seedance-2.0` |

For Clipr talking-head videos, external ElevenLabs narration only fully helps
when the video path accepts that audio for lip sync. In this list, the practical
paths are:

- `prunaai/p-video-avatar` with its `audio` input.
- `prunaai/p-video-avatar` fed by ElevenLabs v3 audio, then optionally
  post-processed through LatentSync or PixVerse lip sync.
- `bytedance/seedance-2.0` with `reference_audios`, but only in short pieces and
  with at least one reference image or video.
- A separate lip-sync pass is now a first-class experiment, but it works best on
  short talking-head segments rather than one full 30-60 second monologue.

For Sora, Veo, and most Kling variants, ElevenLabs audio can still be mixed into
the final MP4, but the actor's mouth will not reliably match unless the model
itself generated the dialogue from the prompt.

## Model Capability Matrix

The schemas below are from the current Replicate model schema pages unless
noted otherwise.

Re-check each provider schema before implementation. These hosted video model
contracts change more often than normal application APIs.

| Model | Photo support | Audio support | Good Clipr use | Product/demo support |
| --- | --- | --- | --- | --- |
| `prunaai/p-video-avatar` | Required `image` first frame. Works well from the generated avatar still. | Accepts `audio`; otherwise uses `voice_script`, `voice`, `voice_prompt`, and `voice_language`. Uploaded audio takes priority. | Best low-cost talking-head baseline and the easiest ElevenLabs integration. | Weak for product demos. It is avatar-centered, not product-scene centered. |
| `bytedance/latentsync:637ce1919f807ca20da3a448ddc2743535d2853649574cd52a933120e9b9e293` | No photo input. It needs a source `video`; Clipr should pass the generated avatar video. | Required/primary `audio` input plus optional `seed` and `guidance_scale`. | Best open LatentSync-style second pass after ElevenLabs plus p-video-avatar. | Only changes the speaker mouth area in an existing video. It does not generate product demos. |
| `pixverse/lipsync` | No photo input. It needs a source `video`; Clipr should pass the generated avatar video. | Required `audio` input. | Simple second-pass lip sync adapter with `video` and `audio` fields. PixVerse platform docs cap lip-sync videos at 30 seconds, so Clipr splits 60 second jobs into 30 second lip-sync segments and stitches them back together. | Only edits a person video to match speech audio. It cannot place or preserve product demos by itself. |
| `google/veo-3.1` | Optional `image` first frame, optional `last_frame`, and `reference_images` 1-3. Reference images only work with 16:9 and 8 seconds. | `generate_audio` creates native audio. No uploaded narration input in the Replicate schema. | High-quality b-roll, lifestyle scenes, product ambience, or native-audio mini scenes. | Good for product photos and visual context. Not reliable for exact UI/product demos. No reference video input. |
| `kwaivgi/kling-v2.5-turbo-pro` | Optional `image` for image-to-video. | No audio input and no native-audio toggle in the current schema. | Silent b-roll and motion shots to sit under ElevenLabs narration. | Useful for visual product b-roll from a product image. Not for exact demos. |
| `kwaivgi/kling-v2.6` | Optional `start_image`. | `generate_audio` creates synchronized native audio from the prompt. No uploaded narration input. | Short native-audio scenes from a starting avatar or product image. | Product photos can anchor a scene. Not for exact product recordings. |
| `kwaivgi/kling-v3-video` | Optional `start_image` and `end_image`; supports multi-shot JSON through `multi_prompt`. | Optional `generate_audio`; no uploaded narration input. | Higher-quality short scenes, controlled shot sequences, b-roll, intro/outro shots. | Good for product/lifestyle shots from stills; not exact UI demos. |
| `bytedance/seedance-2.0` | Optional first-frame `image`, `last_frame_image`, or up to 9 `reference_images`. First/last frame cannot be combined with reference images. | Native `generate_audio`; up to 3 `reference_audios` totaling max 15s, requiring at least one reference image or video. | Best candidate for segmented ElevenLabs audio plus avatar/product references. Needs short segments. | Strongest proposed model for product references because it supports up to 3 `reference_videos` totaling max 15s, plus reference images and audio. Still not deterministic enough for exact software demos. |
| `openai/sora-2` | Optional `input_reference` as first frame, same aspect ratio as output. | Generates synced audio from the prompt. No uploaded narration input in Replicate schema. OpenAI's direct docs list audio as output-only. | High-quality concept clips, hooks, cinematic b-roll. | Good for non-human product/brand frames. Direct OpenAI docs currently say input images with human faces are rejected, so avatar photos are risky through direct OpenAI. No product video input. |
| `openai/sora-2-pro` | Same `input_reference` behavior as Sora 2. | Same as Sora 2. | Higher-quality final b-roll or hero shots where cost is justified. | Same as Sora 2; better polish, not exact demo control. |
| `elevenlabs/v3` | Not a video model. | Text-to-speech. Replicate schema exposes `prompt`, `voice`, `language_code`, `speed`, `style`, `stability`, `similarity_boost`, `previous_text`, and `next_text`. Official ElevenLabs API uses model ID `eleven_v3`. | Best dedicated voice path. Use for clean narration assets, then pass to audio-capable avatar/lip-sync models or mix at final export. | Useful for narration over real product demos and b-roll. |

## How To Use Each Model In Clipr

### `prunaai/p-video-avatar`

Use this for direct talking-head generation.

Current app path:

- `image`: generated avatar still URL.
- `voice_script`: Clipr script.
- `voice`, `voice_language`, `voice_prompt`: current built-in voice selection.
- `video_prompt`: current talking-person prompt.
- `resolution`: `720p` today, possibly `1080p` for higher tiers.

ElevenLabs path:

- Generate an ElevenLabs v3 audio file from the Clipr script.
- Save that audio file to R2 as a durable provider output.
- Pass the R2 signed URL or uploaded file as `audio`.
- Continue passing `image` and `video_prompt`.
- Keep `voice_script` for metadata only if helpful, but do not rely on it for
  timing because the uploaded audio drives speech.

Implementation note: this is the safest first upgrade because it changes the
voice source without changing the avatar-video model.

### Lip-sync second-pass models

Use these after Clipr has already generated a talking-head video and an
ElevenLabs speech file.

Common Clipr flow:

- Generate ElevenLabs v3 narration from the final script.
- Generate the avatar video with `prunaai/p-video-avatar`, passing that audio
  into the model's `audio` field.
- Save both generated speech and generated avatar video to R2.
- Pass signed R2 URLs into the chosen lip-sync model.
- Save the lip-synced output as the avatar video object that the media worker
  finalizes.

Model-specific inputs:

- `bytedance/latentsync:637ce1919f807ca20da3a448ddc2743535d2853649574cd52a933120e9b9e293`:
  `video`, `audio`, optional `seed`, optional `guidance_scale`.
- `pixverse/lipsync`: `video`, `audio`. Current implementation splits 60 second
  Clipr jobs into 30 second video/audio segments, runs PixVerse per segment, and
  stitches the lip-synced outputs back together.

Implemented behavior:

- `bytedance/latentsync` remains allowed for current 30 and 60 second Clipr jobs.
- `pixverse/lipsync` is segmented for 60 second Clipr jobs.
- Provider-worker ffmpeg is required for PixVerse segmentation.

These models do not replace the avatar-video model. They need an existing video
with a face. They are for improving mouth alignment after high-quality speech
generation, not for generating b-roll, product footage, or accurate demos.

### `google/veo-3.1`

Use this for visual scenes, not as the first talking-avatar upgrade.

Recommended Clipr inputs:

- `prompt`: include the script beat, shot type, camera movement, product context,
  and any native dialogue only if using `generate_audio: true`.
- `aspect_ratio`: `9:16` for Clipr output unless using `reference_images`.
- `duration`: 4, 6, or 8 seconds.
- `image`: use a generated avatar still or product/lifestyle image as the first
  frame.
- `reference_images`: use 1-3 product or style references only when willing to
  output 16:9 and 8 seconds, then crop/normalize later.
- `generate_audio`: `false` when using ElevenLabs final narration; `true` when
  intentionally testing Veo native audio.

Avoid promising lip sync with ElevenLabs on this path. There is no uploaded
audio field in the current schema.

### `kwaivgi/kling-v2.5-turbo-pro`

Use this as a cost/quality b-roll generator.

Recommended Clipr inputs:

- `prompt`: one visual beat, no dependency on exact speech.
- `image`: product image, avatar still, or brand/lifestyle still.
- `aspect_ratio`: `9:16` for text-to-video; ignored when `image` is present.
- `duration`: 5 or 10 seconds.

Audio approach:

- Generate silent visual b-roll.
- Mix ElevenLabs narration in the final Clipr composer.
- Do not use it for talking-head segments that need mouth sync.

### `kwaivgi/kling-v2.6`

Use this for native-audio short scenes from text or an image.

Recommended Clipr inputs:

- `prompt`: include quoted dialogue only when testing native audio.
- `start_image`: avatar/product still when image anchoring is needed.
- `aspect_ratio`: `9:16` for text-to-video; ignored if `start_image` determines
  shape.
- `duration`: 5 or 10 seconds.
- `generate_audio`: `true` for native model audio tests, `false` when overlaying
  ElevenLabs narration.

This is useful for high-quality short UGC-like scenes, but it does not replace a
lip-sync path with external narration.

### `kwaivgi/kling-v3-video`

Use this for higher-quality short shots and controlled multi-shot segments.

Recommended Clipr inputs:

- `prompt`: visual prompt up to 2500 characters.
- `start_image`: product image or avatar still.
- `end_image`: optional end frame for transition-style shots.
- `multi_prompt`: JSON array of shot definitions when composing up to 6 shots.
- `duration`: 3-15 seconds.
- `mode`: `standard` for tests, `pro` for quality; reserve higher-cost options
  for explicit tiers if exposed.
- `generate_audio`: `true` for native-audio tests, `false` for ElevenLabs final
  narration.

This is a strong b-roll/scene model, but no uploaded audio means no reliable
ElevenLabs lip sync.

### `bytedance/seedance-2.0`

Use this as the primary experimental model for reference-rich Clipr and product
demo experiments.

Recommended Clipr inputs:

- `prompt`: describe the shot and reference labels explicitly, such as
  `[Image1] is the avatar reference`, `[Image2] is the product`, and `[Audio1]
  is the narration timing`.
- `reference_images`: up to 9 images for character consistency, product look,
  style, and scene composition.
- `reference_videos`: up to 3 videos with total duration max 15 seconds for
  motion transfer, style reference, and editing.
- `reference_audios`: up to 3 audio files with total duration max 15 seconds.
  Requires at least one reference image or reference video.
- `duration`: `-1` for intelligent duration or 5-15 seconds for controlled
  segments.
- `aspect_ratio`: `9:16` or `adaptive`.
- `resolution`: `720p` in the current Replicate schema.
- `generate_audio`: `true` when using native/reference audio behavior; test
  `false` when treating it as visual-only.

This model strongly favors a segmented Clipr composer because its audio and
reference-video limits top out at 15 seconds. It is the best candidate in this
list for "avatar plus product plus demo reference" experiments, but exact
product demos should still use real uploaded demo clips.

### `openai/sora-2`

Use this for high-quality prompt/image-to-video shots, not external-audio avatar
lip sync.

Recommended Replicate inputs:

- `prompt`: detailed visual and native-audio prompt.
- `input_reference`: optional first-frame image, same aspect ratio as output.
- `seconds`: 4, 8, or 12.
- `aspect_ratio`: `portrait` for 720x1280 Clipr output.

Direct OpenAI API notes:

- OpenAI's Video API supports `sora-2` and `sora-2-pro`, asynchronous job
  creation, polling or webhooks, and MP4 download.
- Official model docs list text and image as inputs, audio and video as outputs.
- OpenAI's Sora guide currently says input images with human faces are rejected.
  That makes direct OpenAI Sora a poor fit for avatar-photo talking heads until
  that policy changes.

Use Sora for product/brand/lifestyle b-roll and high-quality hooks, then stitch
real demo footage or overlay narration afterward.

### `openai/sora-2-pro`

Use this like Sora 2, but reserve it for higher-quality paid tiers or manual
experiments.

Recommended Replicate inputs:

- Same as Sora 2.
- `resolution`: `standard` or `high`.

Because cost is higher and there is no uploaded audio path, this should not be
the default Clipr model. It is a premium b-roll/hero-shot candidate.

### `elevenlabs/v3`

Use this as a dedicated voice/narration provider, not as a video model.

Recommended Clipr inputs through Replicate:

- `prompt`: script text, optionally with performance tags.
- `voice`: selected ElevenLabs voice.
- `language_code`: from product/user locale.
- `style`, `stability`, `similarity_boost`, `speed`: expose as hidden model
  profile settings first, not as consumer UI.
- `previous_text` and `next_text`: use when generating segmented audio to keep
  cadence more consistent between adjacent segments.

Recommended direct ElevenLabs API path:

- Use the Create speech or Stream speech endpoint with `model_id: "eleven_v3"`.
- Consider direct ElevenLabs if you need the full voice library, cloned voices,
  dialogue endpoints, or account-level voice management.
- Use Replicate `elevenlabs/v3` first if keeping all provider work under the
  existing Replicate client is more important than voice-library breadth.

Store every generated narration file in R2 with metadata:

- TTS provider and model.
- Voice ID/name.
- Prompt/script.
- Duration and content type.
- Segment ID if generated as a segmented composer step.

## Recommended Architecture

Add a provider registry rather than branching on raw model IDs inside the worker.

Suggested server concepts:

- `CliprVideoModelId`: stable app-level ID, such as `p-video-avatar`,
  `veo-3.1`, `kling-v2.6`, `seedance-2.0`, `sora-2-pro`.
- `CliprVideoModelCapability`: booleans and limits such as `acceptsFirstFrame`,
  `acceptsReferenceImages`, `acceptsReferenceVideos`, `acceptsUploadedAudio`,
  `generatesNativeAudio`, `maxDurationSeconds`, `allowedDurations`,
  `supportsPortrait`, `supportsHumanFaceReference`.
- One adapter per model, following the repo's one-file-one-purpose rule.
- One prompt/input builder per model.
- One output normalizer that converts Replicate/OpenAI/ElevenLabs output into
  the existing R2 object shape.

Do not let the client send arbitrary provider model IDs. The client may request
an app-level option; the server must resolve it through an allowlist.

Persist the chosen model in the job input snapshot and final Clipr metadata.
This is needed for debugging, cost analysis, and exact job recreation.

## Environment Variables vs Dev UI Toggle

Use both, with different responsibilities.

### Production/default configuration

Use environment variables for default behavior:

- `CLIPR_AVATAR_VIDEO_MODEL_ID`: default `prunaai/p-video-avatar`.
- `CLIPR_TTS_MODEL_ID`: default `elevenlabs/v3`; set to `none` to use the
  hidden p-video-avatar built-in voice fallback.
- `CLIPR_LIP_SYNC_MODEL_ID`: default `pixverse/lipsync`; supported values are
  `none`,
  `bytedance/latentsync:637ce1919f807ca20da3a448ddc2743535d2853649574cd52a933120e9b9e293`,
  and `pixverse/lipsync`.
- Future provider registry work can add `CLIPR_VIDEO_MODEL_ID` and
  `CLIPR_TTS_PROVIDER_ID` as app-level aliases.

Why env vars:

- Stable for production and automation.
- Easy to roll back.
- Avoids exposing expensive model choices to normal users before pricing and
  quality are known.
- Keeps autopilot deterministic.

### Development/testing override

Use environment variables for local testing rather than browser controls:

- `CLIPR_TTS_MODEL_ID=elevenlabs/v3` is the default; set `none` for the
  p-video-avatar built-in voice fallback.
- `CLIPR_LIP_SYNC_MODEL_ID=pixverse/lipsync` is the default; set the LatentSync
  model ID above to re-test the cheaper fallback, or `none` to disable the
  second pass.
- Restart the Next dev server or provider worker after changing these values so
  new queued jobs snapshot the updated model IDs.
- The server validates resolved values against the allowlist before queueing the
  provider job. `providerJobs.inputSnapshotJson` and `cliprJobs.providerModels`
  record what actually ran.

## Should Clipr Split Scripts Into Multiple Clips?

Yes. This is the most important quality change.

The current "one full-script avatar video" model is simple and cheap, but it
creates repetitive talking-head clips. Higher-quality UGC services usually feel
better because they combine script writing, voice, presenter shots, b-roll,
captions, product shots, pacing, music, and editing. I cannot verify Arcads'
private stack, but the product pattern is a multi-model edit pipeline, not one
model call.

Recommended composer structure:

1. Generate a script with timed beats, not just a paragraph.
2. Split into 4-8 second scenes:
   - Hook talking-head.
   - Product/problem b-roll.
   - Presenter reaction or explanation.
   - Real product demo segment from the user's library.
   - Closing insight, not a hard CTA if Clipr remains non-promotional.
3. Generate ElevenLabs v3 audio per segment, using `previous_text` and
   `next_text` for context.
4. For avatar/lip-sync segments:
   - Use `p-video-avatar` with the segment audio.
   - Test `seedance-2.0` with segment audio plus avatar reference.
5. For b-roll:
   - Use Veo/Kling/Sora/Seedance from product photos or prompt-only scenes.
   - Generate silent b-roll and mix narration in final assembly, or use native
     model audio only for non-narrated ambience.
6. For exact demos:
   - Use real uploaded Demo clips from the ClipStitchr library.
   - Trim and insert them in the composer.
7. Stitch the segment MP4s and audio tracks into one final 9:16 output in the
   media worker.

Segmenting also improves cost control. Failed segments can be retried without
regenerating the whole video, and expensive models can be used only for shots
where they matter.

## Product Demo Accuracy

For product photos:

- Best among proposed models: `bytedance/seedance-2.0`, `google/veo-3.1`,
  `openai/sora-2-pro`, `openai/sora-2`, `kwaivgi/kling-v3-video`.
- Use references to preserve product appearance, packaging, color, and scene
  style.
- Still expect hallucination in labels, UI details, hands, and fine typography.

For product recordings or product demos:

- Best among proposed models: `bytedance/seedance-2.0`, because it accepts
  short `reference_videos` totaling max 15 seconds.
- Adjacent model to evaluate later: `kwaivgi/kling-v2.6-motion-control`, because
  its schema supports image and reference video motion control.
- Not suitable from the proposed list for exact demo video input:
  `p-video-avatar`, `google/veo-3.1`, `kwaivgi/kling-v2.5-turbo-pro`,
  `kwaivgi/kling-v2.6`, `kwaivgi/kling-v3-video`, `openai/sora-2`,
  `openai/sora-2-pro`.

For accurate demos, the product should use the existing ClipStitchr strength:
real user-uploaded Demo videos normalized to 9:16, then stitch generated UGC or
talking-head segments around the real demo. Generative models can create
intro/outro, b-roll, lifestyle, and transition footage, but they should not be
trusted to accurately recreate a SaaS UI flow, physical product procedure, or
compliance-sensitive claim.

## Suggested Rollout

### Phase 1 - Voice upgrade with minimal video risk

- Done in this working tree: add an ElevenLabs v3 TTS provider adapter.
- Done in this working tree: generate one full-script audio file.
- Done in this working tree: feed that audio to `prunaai/p-video-avatar`
  through its `audio` input.
- Done in this working tree: keep p-video-avatar's old built-in voice path as a
  hidden fallback when `CLIPR_TTS_MODEL_ID=none`.
- Done in this working tree: store clean TTS audio in R2 under
  `clipr-speech/...`.
- Done in this working tree: keep the existing Clipr avatar video/voice seconds
  bucket as the pre-queue abuse guard and document that it now covers TTS and
  optional lip sync.

### Phase 1b - Lip-sync quality test

- Done in this working tree: add a server-side allowlist for
  `bytedance/latentsync:637ce1919f807ca20da3a448ddc2743535d2853649574cd52a933120e9b9e293`,
  and `pixverse/lipsync`.
- Done in this working tree: add `CLIPR_LIP_SYNC_MODEL_ID` for env-only
  switching.
- Done in this working tree: after ElevenLabs plus p-video-avatar, optionally
  run the chosen lip-sync model and send that output to the existing media
  finalization job.
- Next: compare PixVerse vs LatentSync vs no second pass on the same avatar,
  script, and voice.
- Next: inspect stitched PixVerse segment boundaries for visual/audio jumps.

### Phase 2 - Provider registry and dev-only model switcher

- Add a server-side model catalog with capability metadata.
- Add app-level model IDs and input builders.
- Add a dev/admin model switcher on Clipr.
- Persist selected model IDs in job snapshots and final metadata.
- Keep production default on p-video-avatar until quality/cost tests say
  otherwise.

### Phase 3 - Single-shot visual model experiments

- Add visual-only adapters for Veo, Kling, Sora, and Seedance.
- Generate one short clip from the same script/scene prompt and avatar/product
  references.
- Normalize and save outputs into Clips for manual review.
- Compare results on identity consistency, product fidelity, lip sync, latency,
  cost, and moderation failures.

### Phase 4 - Segment composer

- Change Clipr script generation to output a scene plan.
- Generate segment-level audio and video.
- Add segment records to the Clipr job snapshot.
- Let media worker assemble segments into one final Clipr video.
- Support real Demo clip insertion from the library.

### Phase 5 - Product-demo aware generation

- Add optional product photo and demo references to Clipr jobs.
- Use Seedance reference videos only for short, non-critical motion/style
  guidance.
- Prefer exact uploaded Demo clips for any product flow the user expects to be
  accurate.

## Rate Limit Requirements

Any implementation must update `docs/backend/rate-limits.md` before it is
complete.

Add limits before provider work for:

- ElevenLabs/Replicate TTS characters per hour/day/month per user.
- TTS generated seconds per hour/day/month per user.
- Video generated seconds per model family per hour/day/month per user.
- Premium model generated seconds for Sora Pro, Veo, Kling v3, and Seedance.
- Reference media uploads/download signed URLs and bytes.
- Global provider spend units per hour/day.
- Segment count per Clipr job.
- Max total final Clipr duration.

Keep authorization separate from rate limits. Every referenced avatar photo,
product image, demo clip, generated audio object, and generated video segment
must still be ownership-checked.

## Open Questions Before Implementation

- Should Clipr stay non-promotional, or should there be a separate promotional
  mode for generated ads with product demos?
- Should users be allowed to upload product photos directly in Clipr, or should
  Clipr only use saved product/demo library assets?
- Does the business want direct ElevenLabs API access for the full voice library
  and voice cloning, or is Replicate's `elevenlabs/v3` wrapper enough for the
  first test?
- Is avatar identity consistency more important than cinematic quality? If yes,
  keep p-video-avatar or avatar/lip-sync models first. If no, test Sora/Veo/Kling
  visual scenes sooner.
- What is the acceptable generated-video cost per saved Clipr output by plan?

## Source Links

Local project sources:

- `project-scope.md`
- `docs/features/clipr.md`
- `docs/backend/rate-limits.md`
- `docs/backend/provider-automation-workflows.md`
- `coding-guidelines.md`

Replicate model schemas:

- [prunaai/p-video-avatar schema](https://replicate.com/prunaai/p-video-avatar/api/schema)
- [bytedance/latentsync schema](https://replicate.com/bytedance/latentsync/api/schema)
- [pixverse/lipsync schema](https://replicate.com/pixverse/lipsync/api/schema)
- [google/veo-3.1 schema](https://replicate.com/google/veo-3.1/api/schema)
- [kwaivgi/kling-v2.5-turbo-pro schema](https://replicate.com/kwaivgi/kling-v2.5-turbo-pro/api/schema)
- [kwaivgi/kling-v2.6 schema](https://replicate.com/kwaivgi/kling-v2.6/api/schema)
- [kwaivgi/kling-v3-video schema](https://replicate.com/kwaivgi/kling-v3-video/api/schema)
- [bytedance/seedance-2.0 schema](https://replicate.com/bytedance/seedance-2.0/api/schema)
- [openai/sora-2 schema on Replicate](https://replicate.com/openai/sora-2/api/schema)
- [openai/sora-2-pro schema on Replicate](https://replicate.com/openai/sora-2-pro/api/schema)
- [elevenlabs/v3 schema](https://replicate.com/elevenlabs/v3/api/schema)

Provider docs:

- [Replicate official models](https://replicate.com/docs/topics/models/official-models/)
- [Replicate input files](https://replicate.com/docs/topics/predictions/input-files)
- [Replicate output files](https://replicate.com/docs/topics/predictions/output-files)
- [Replicate create a prediction](https://replicate.com/docs/topics/predictions/create-a-prediction/)
- [OpenAI video generation with Sora](https://platform.openai.com/docs/guides/video-generation)
- [OpenAI Sora 2 model page](https://developers.openai.com/api/docs/models/sora-2)
- [ElevenLabs Eleven v3 overview](https://help.elevenlabs.io/hc/en-us/articles/35869054119057-What-is-Eleven-v3)
- [ElevenLabs API quickstart](https://elevenlabs.io/docs/eleven-api/quickstart)
- [ElevenLabs Text to Speech API](https://elevenlabs.io/text-to-speech-api)
