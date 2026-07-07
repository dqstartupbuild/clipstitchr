# AI Models

Last updated: 2026-06-16.

This file lists the model IDs ClipStitchr can use for each AI-backed workflow.
Model IDs are Replicate model references unless noted otherwise. Versioned IDs
using `owner/model:version` are accepted by the server and sent to Replicate as
`version` predictions.

## Avatar Photo Generation

Environment variable: `AVATAR_PHOTO_MODEL_ID`

Default: `openai/gpt-image-2`

| Model ID | Status | Workflow |
| --- | --- | --- |
| `openai/gpt-image-2` | Default | Sends `prompt`, `input_images`, `aspect_ratio: "2:3"`, `number_of_images: 1`, `output_format: "jpeg"`, speed-tier `quality`, `background: "opaque"`, and `moderation: "auto"`. Prompts refer to the uploaded image as the reference image. |
| `minimax/image-01` | Supported | Sends `prompt`, `aspect_ratio: "3:4"`, `number_of_images: 1`, `prompt_optimizer: false`, and the uploaded reference photo as `subject_reference`. Prompts refer to the uploaded image as the subject reference image and ask MiniMax to preserve the character identity while changing wardrobe, scene, pose, and lighting. |

Avatar generation still runs one Replicate prediction per requested output so
each output receives a unique outfit, location, pose, style, and lighting prompt.
MiniMax Image-01 sends reference images from Replicate to MiniMax under that
provider's privacy policy and terms.

## Swipr AI Background Generation

Environment variable: `SWIPR_BACKGROUND_MODEL_ID`

Default: `openai/gpt-image-2`

| Model ID | Status | Workflow |
| --- | --- | --- |
| `openai/gpt-image-2` | Default | Sends `prompt`, `aspect_ratio: "2:3"`, `number_of_images: 1`, `output_format: "jpeg"`, `quality: "low"`, `background: "opaque"`, and `moderation: "auto"`. Prompts ask for 2:3 framing because the app crops to 9:16 after generation. |
| `prunaai/p-image` | Supported | Sends `prompt`, `aspect_ratio: "9:16"`, and `prompt_upsampling: false`. Prompts ask directly for a 9:16 photography backdrop and avoid downstream app/ad/carousel wording. Product context is sanitized to remove UI/mockup trigger terms before prompting. |
| `prunaai/wan-2.2-image` | Supported | Sends `prompt`, `juiced: false`, `megapixels: 2`, `aspect_ratio: "9:16"`, `output_format: "jpg"`, and `output_quality: 80`. Prompts ask directly for a 9:16 photography backdrop and avoid downstream app/ad/carousel wording. Product context is sanitized to remove UI/mockup trigger terms before prompting. |

The Swipr background route creates a product-aware variation brief for every AI
generation. The brief selects a category-specific scene pack, randomly chooses a
matching preset when the UI does not supply one, and records the selected scene,
lighting, camera angle, surface, palette, and composition in the hidden
background details.

## Text And Script Writing

Environment variable: `TEXT_WRITING_MODEL_ID`

Legacy fallback variable: `CLIPR_HOOK_MODEL_ID`

Default: `anthropic/claude-sonnet-4.6`

| Model ID | Status | Workflow |
| --- | --- | --- |
| `anthropic/claude-sonnet-4.6` | Default | Sends `prompt`, `system_prompt`, and `max_tokens` to Replicate for Clipr hook/script generation, Swipr auto-text, Stitchr auto-text, provider-worker Clipr script jobs, and automation text drafts. |
| `anthropic/claude-opus-4.6` | Supported | Uses the same Replicate input schema as Sonnet 4.6 for higher-cost writing tests. |

Claude text models on Replicate use `max_tokens`, while the older OpenAI text
path used `max_completion_tokens`. The shared
`createTextWritingPredictionInput` helper also keeps Claude requests at
Replicate's 1024-token minimum, so small JSON planning calls such as the CLI demo
agent can ask for compact output without sending an invalid provider payload.
Keep new writing calls on that helper so future tools inherit the correct
provider input shape.

## Other AI Usage

| Usage | Configuration | Default or Current Model | Notes |
| --- | --- | --- | --- |
| Upload image metadata analysis | `REPLICATE_UPLOAD_ANALYSIS_MODEL_ID` | `openai/gpt-5-mini` | Used for avatar/photo images and video poster fallback analysis. |
| Swipr background metadata analysis | `REPLICATE_UPLOAD_ANALYSIS_MODEL_ID` | `openai/gpt-5-mini` | Shares the upload image analysis model with a background-specific prompt. |
| Upload video action analysis | `REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID`; backup `REPLICATE_UPLOAD_VIDEO_FALLBACK_MODEL_ID` | `google/gemini-3-flash`; backup `lucataco/qwen2-vl-7b-instruct:bf57361c75677fc33d480d0c5f02926e621b2caa2000347cb74aeae9d2ca07ee` | Uses Gemini for full-video UGC/demo action analysis, including manual saved-clip scoring. If Gemini fails, tries the Qwen video fallback before falling back to poster analysis. |
| Stitch score analysis | `REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID`; backup `REPLICATE_UPLOAD_VIDEO_FALLBACK_MODEL_ID` | `google/gemini-3-flash`; backup `lucataco/qwen2-vl-7b-instruct:bf57361c75677fc33d480d0c5f02926e621b2caa2000347cb74aeae9d2ca07ee` | Scores saved Stitches from the rendered MP4 when available. If Gemini fails, tries the Qwen video fallback before falling back to poster/context analysis. |
| Product enrichment | `PRODUCT_ENRICHMENT_MODEL_ID` | `openai/gpt-4.1` | Generates hidden product strategy metadata when saving Settings products. |
| Clipr hook, script, Swipr auto-text, and Stitchr auto-text | `TEXT_WRITING_MODEL_ID`; legacy `CLIPR_HOOK_MODEL_ID` fallback | `anthropic/claude-sonnet-4.6` | Text generation returns structured JSON or short-form copy. `anthropic/claude-opus-4.6` is also supported for higher-cost writing tests. |
| Clipr avatar still image | `AVATAR_PHOTO_MODEL_ID` | `openai/gpt-image-2` | Uses the same avatar photo generation model, prompt builder, and input parameters as avatar photo generation, but creates one source still for the full-script avatar video. |
| Clipr avatar video | `CLIPR_AVATAR_VIDEO_MODEL_ID` | `prunaai/p-video-avatar` | Generates the full-script talking avatar video. When TTS is enabled, Clipr passes generated speech audio into this model. |
| Clipr visual video | `CLIPR_VISUAL_VIDEO_MODEL_ID` | `kwaivgi/kling-v3-video` | Generates silent Reaction and B-roll clips. `google/veo-3.1` is supported as an override. Unsupported or stale model values fall back to Kling. |
| Clipr text-to-speech | `CLIPR_TTS_MODEL_ID` | `elevenlabs/v3` | Generates the Clipr narration track before avatar video generation. Set to `none` for the hidden p-video-avatar built-in fallback. |
| Clipr lip sync | `CLIPR_LIP_SYNC_MODEL_ID` | `pixverse/lipsync` | Optional second pass after avatar video generation. Supported values are `none`, `bytedance/latentsync:637ce1919f807ca20da3a448ddc2743535d2853649574cd52a933120e9b9e293`, and `pixverse/lipsync`. LatentSync runs as one pass; PixVerse uses 30 second segments before stitching the lip-synced outputs. |
| Swapr motion-transfer video | hard-coded in `app/api/swapr/jobs/route.ts` | `kwaivgi/kling-v3-motion-control` | Used for Swapr job creation and mirrored in the client optimistic job state. |
| Swapr photo expansion | hard-coded in `app/api/swapr/photos/expand/route.ts` | `black-forest-labs/flux-fill-pro` | Used for optional 9:16 source-photo outpainting. |

## Adding Another Model

When adding a model to an existing AI usage:

- Add a model-family helper when the model needs a different prompt or input
  schema.
- Keep the route rate limit before the provider call.
- Add focused tests for the generated Replicate input payload.
- Update this file and `docs/backend/rate-limits.md`.

The upload video fallback model is pinned to a Replicate version because this
community model does not currently work through Replicate's unversioned
model-name prediction endpoint. Overrides are expected to use the Qwen-style
Replicate input schema: `media`, `prompt`, and `max_new_tokens`.
