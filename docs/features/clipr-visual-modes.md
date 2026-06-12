# Clipr Visual Modes

> Status: implemented
> Last updated: 2026-06-12

## Summary

Clipr now supports three concrete generation modes:

- `Script`: the existing talking-avatar Clipr flow with hook/script generation,
  voice, optional music, and lip sync.
- `Reaction`: one silent 4-10 second reaction shot from the selected avatar.
- `B-roll`: one silent 4-10 second day-in-the-life shot related to the saved
  product.

The UI and automation settings also support `Any`, which resolves to one of the
three concrete modes per job. `Any` is deterministic from the job ID so retries
keep the same mode.

## User Experience

Manual Clipr shows a mode picker with `Any`, `Script`, `Reaction`, and
`B-roll`. Script mode shows the script idea, voice, and music controls.
Reaction and b-roll hide voice and music because those outputs are silent.

Manual Clipr also has a temporary video model selector while visual model
quality is being tested. `Auto` picks the default supported model for the
resolved mode.

The automation settings panel has the same Clipr mode choices. Automated Script
jobs reserve the normal 60 second target. Automated Reaction and B-roll jobs
reserve the 8 second visual target.

## Reaction Source Prompts

Reaction mode samples descriptions from:

```text
web/lib/clipstitchr/resources/clipr/reaction-source-prompts.json
```

The file contains 320 sanitized descriptions exported from production UGC clips.
Each description is a motion reference only: it keeps reaction timing, camera
angle, gaze direction, facial expression, head movement, and hand placement. It
removes person identity, age, gender, wardrobe, environment, product/object
details, speech, account IDs, object keys, media URLs, and raw video files.

The prompt builder samples four descriptions per reaction job and combines them
with a seeded emotion such as shock, sadness, disbelief, happiness, confusion,
or relief. These descriptions are used as motion and expression references, not
as user-facing copy.

## B-roll Prompting

B-roll mode creates one continuous silent shot from the product context. The
prompt asks for a simple real-world action that fits the product and audience.
Examples include exercise movement for a calisthenics product or practical
job-site work for a plumbing company.

B-roll prompts explicitly avoid montages, scene cuts, tutorials, talking-head
delivery, product UI shots, captions, logos, and on-screen text.

## Provider Models

Script mode uses:

- `prunaai/p-video-avatar`

Reaction and b-roll can use:

- `kwaivgi/kling-v3-video`
- `bytedance/seedance-2.0`
- `google/veo-3.1`
- `openai/sora-2`
- `openai/sora-2-pro`

For visual modes, providers that support audio controls receive
`generate_audio: false`. Sora models are prompted for silence and the media
worker strips audio during finalization so saved visual clips stay silent.

## Worker Flow

Manual and automated jobs use the same durable worker shape:

1. Save the requested mode/model and resolved mode/model on the Clipr job.
2. Consume job-create, avatar-still, and video-generation limits before the
   provider job is queued.
3. Consume hook/script and voice limits only for Script mode.
4. Consume music limits only for Script mode when music is generated.
5. Create a Clipr text plan. Script mode calls the hook/script model; visual
   modes create a local single-scene visual plan.
6. Generate the avatar still with mode-specific still-image instructions.
7. Generate the avatar video using the resolved model.
8. Create a `clipr-finalization` media job.
9. The media worker normalizes to 9:16, strips audio for visual modes, captures
   a poster, and saves the final Clip.

## File Tree

Key implementation files:

```text
web/lib/clipstitchr/resources/clipr/reaction-source-prompts.json
web/app/_components/clipr/CliprModeToggle.tsx
web/app/_components/clipr/CliprVideoModelSelect.tsx
web/app/_components/settings/AutomationCliprModePicker.tsx
web/app/dashboard/clipr/CliprPageClient.tsx
web/convex/automationClipr.ts
web/convex/cliprJobs.ts
web/convex/rateLimits.ts
web/lib/clipstitchr/constants/cliprGenerationModeOptions.ts
web/lib/clipstitchr/constants/cliprVideoModelOptions.ts
web/lib/clipstitchr/server/createCliprBrollVisualPrompt.ts
web/lib/clipstitchr/server/createCliprJobTextGeneration.ts
web/lib/clipstitchr/server/createCliprJobVideoOutput.ts
web/lib/clipstitchr/server/createCliprReactionVisualPrompt.ts
web/lib/clipstitchr/server/createCliprVisualTextGeneration.ts
web/lib/clipstitchr/server/createCliprVisualVideoInput.ts
web/lib/clipstitchr/server/getCliprReactionSourcePrompts.ts
web/lib/clipstitchr/utils/getCliprResolvedGenerationMode.ts
web/lib/clipstitchr/utils/getResolvedCliprVideoModelId.ts
web/services/provider-worker/runProviderWorker.ts
web/services/media-worker/runMediaWorker.mjs
```

## Maintenance Notes

The temporary model selector should be removed once the winning visual providers
are chosen. When that happens, keep the mode selector and replace the manual
model choice with the final default model mapping.

If new visual models are added, verify the current Replicate input schema before
editing code. Add the model to `cliprVideoModelOptions`, update
`createCliprVisualVideoInput`, and keep finalization audio stripping enabled for
all visual modes unless the product intentionally adds audio later.
