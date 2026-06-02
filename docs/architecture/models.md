# AI Models

Last updated: 2026-06-02.

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

## Short-Form Text Generation

Environment variable: `SHORT_FORM_TEXT_MODEL_ID`

Default: `anthropic/claude-4.5-haiku`

This shared model is used for Clipr hook selection and scripts, Stitchr
auto-text, and Swipr auto-text. `CLIPR_HOOK_MODEL_ID` is still accepted as a
backward-compatible fallback when `SHORT_FORM_TEXT_MODEL_ID` is not set.

| Model ID | Status | Workflow |
| --- | --- | --- |
| `anthropic/claude-4.5-haiku` | Default | Sends `prompt`, `system_prompt`, and `max_tokens: 1200`. |
| `openai/gpt-4.1` | Supported | Sends `prompt`, `system_prompt`, `temperature: 0.65`, and `max_completion_tokens: 1200`. |

## Other AI Usage

| Usage | Configuration | Default or Current Model | Notes |
| --- | --- | --- | --- |
| Upload image metadata analysis | `REPLICATE_UPLOAD_ANALYSIS_MODEL_ID` | `openai/gpt-4.1-mini` | Used for avatar/photo images and video poster fallback analysis. |
| Swipr background metadata analysis | `REPLICATE_UPLOAD_ANALYSIS_MODEL_ID` | `openai/gpt-4.1-mini` | Shares the upload image analysis model with a background-specific prompt. |
| Upload video action analysis | `REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID` | `google/gemini-3-flash` | Used for full-video UGC/demo action analysis before falling back to poster analysis when needed. |
| Product enrichment | `PRODUCT_ENRICHMENT_MODEL_ID` | `openai/gpt-4.1` | Generates hidden product strategy metadata when saving Settings products. |
| Clipr hook, script, Swipr auto-text, and Stitchr auto-text | `SHORT_FORM_TEXT_MODEL_ID` | `anthropic/claude-4.5-haiku` | Text generation returns structured JSON or short-form copy. `CLIPR_HOOK_MODEL_ID` remains a fallback. See Short-Form Text Generation above for supported request workflows. |
| Clipr avatar still image | `AVATAR_PHOTO_MODEL_ID` | `openai/gpt-image-2` | Uses the same avatar photo generation model, prompt builder, and input parameters as avatar photo generation, but creates one source still for the full-script avatar video. |
| Clipr avatar video and voice | `CLIPR_AVATAR_VIDEO_MODEL_ID` | `prunaai/p-video-avatar` | Generates the full-script talking avatar video with the selected voice. |
| Clipr and Stitchr background music | `CLIPR_MUSIC_MODEL_ID` | `stability-ai/stable-audio-2.5` | Generates a 60 second instrumental music bed when the user opts in. The MP3 is copied to R2 as a separate editable asset and mixed into the clean video only during export/download. |
| Clipr text-to-speech | `CLIPR_TTS_MODEL_ID` | `elevenlabs/v3` | Legacy/reserved; active Clipr voice generation is handled by `prunaai/p-video-avatar`. |
| Swapr motion-transfer video | hard-coded in `app/api/swapr/jobs/route.ts` | `kwaivgi/kling-v3-motion-control` | Used for Swapr job creation and mirrored in the client optimistic job state. |
| Swapr photo expansion | hard-coded in `app/api/swapr/photos/expand/route.ts` | `black-forest-labs/flux-fill-pro` | Used for optional 9:16 source-photo outpainting. |

## Adding Another Model

When adding a model to an existing AI usage:

- Add a model-family helper when the model needs a different prompt or input
  schema.
- Keep the route rate limit before the provider call.
- Add focused tests for the generated Replicate input payload.
- Update this file and `docs/backend/rate-limits.md`.
