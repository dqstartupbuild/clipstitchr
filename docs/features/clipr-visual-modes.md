# Clipr Visual Modes

> Status: implemented
> Last updated: 2026-06-14

## Summary

Clipr supports these concrete generation modes:

- `Reaction`: one silent 4-10 second reaction shot from the selected avatar.
- `B-roll`: one silent 4-10 second day-in-the-life shot related to the saved
  product.
- `Script`: the existing talking-avatar Clipr flow with hook/script generation,
  voice, optional music, and lip sync. This mode is hidden while
  `web/lib/clipstitchr/constants/isCliprScriptModeEnabled.ts` is `false`.

The backend still accepts legacy `Any` and `Script` values. While Script mode is
hidden, both manual and automated Script requests resolve to Reaction or B-roll
before provider work.

## User Experience

Manual Clipr currently shows a mode picker with `Reaction` and `B-roll`. If
`isCliprScriptModeEnabled` is flipped to `true`, Script mode appears again and
shows the script idea, voice, and music controls. Reaction and b-roll hide voice
and music because those outputs are silent.

Reaction and B-roll use Kling v3 by default. `CLIPR_VISUAL_VIDEO_MODEL_ID` can
override the visual model to another supported option, currently Veo 3.1.

The automation settings panel has the same visible Clipr mode choices.
Automated Reaction and B-roll jobs reserve the 8 second visual target. Script
appears in automation only when `isCliprScriptModeEnabled` is `true`; Script
jobs reserve the normal 60 second target.

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

## Demo Prompting

Demo mode remixes one saved Demo video into a silent 4-10 second vertical shot.
It uses the selected Demo clip as a reference video and asks Seedance to place
the demo naturally on a phone screen held in someone's hand while preserving the
important screen flow as much as possible.

Demo mode is supported by the backend/finalization path for existing generated
demos, but it is not shown in the current mode picker and is not part of Clipr
automation because it needs an explicit Demo source clip.

## Provider Models

Script mode uses:

- `prunaai/p-video-avatar`

Reaction and b-roll can use:

- `kwaivgi/kling-v3-video` by default
- `google/veo-3.1` through `CLIPR_VISUAL_VIDEO_MODEL_ID`

For visual modes, providers that support audio controls receive
`generate_audio: false`. The media worker strips audio during finalization so
saved visual clips stay silent.

Demo mode uses `bytedance/seedance-2.0` internally with `reference_videos` and
`[Video1]` prompt language. Seedance reference videos are limited by the model's
short-reference constraints, so Demo mode is an experimental test path for
turning existing Demo clips into phone-in-hand b-roll.

## Worker Flow

Manual and automated jobs use the same durable worker shape:

1. Save the requested mode/model and resolved mode/model on the Clipr job.
2. Consume job-create and video-generation limits before the provider job is
   queued. Script, Reaction, and B-roll also consume avatar-still limits; Demo
   mode skips avatar-still generation.
3. Consume hook/script and voice limits only for Script mode.
4. Consume music limits only for Script mode when music is generated.
5. Create a Clipr text plan. Script mode calls the hook/script model; visual
   modes create a local single-scene visual plan.
6. Generate the avatar still with mode-specific still-image instructions unless
   the job is Demo mode.
7. Generate the avatar or demo remix video using the resolved model.
8. Create a `clipr-finalization` media job.
9. The media worker normalizes to 9:16, strips audio for visual modes, captures
   a poster, and saves non-demo Clipr output as UGC. Demo remixes save as Demo
   clips.

## File Tree

Key implementation files:

```text
web/lib/clipstitchr/resources/clipr/reaction-source-prompts.json
web/app/_components/clipr/CliprModeToggle.tsx
web/app/_components/settings/AutomationCliprModePicker.tsx
web/app/dashboard/clipr/CliprPageClient.tsx
web/convex/automationClipr.ts
web/convex/cliprJobs.ts
web/convex/getCliprGeneratedClipStorageFields.ts
web/convex/getVideoClipLibraryKind.ts
web/convex/rateLimits.ts
web/lib/clipstitchr/constants/cliprGenerationModeOptions.ts
web/lib/clipstitchr/constants/isCliprScriptModeEnabled.ts
web/lib/clipstitchr/constants/cliprVideoModelOptions.ts
web/lib/clipstitchr/server/createCliprBrollVisualPrompt.ts
web/lib/clipstitchr/server/createCliprJobTextGeneration.ts
web/lib/clipstitchr/server/createCliprJobVideoOutput.ts
web/lib/clipstitchr/server/createCliprReactionVisualPrompt.ts
web/lib/clipstitchr/server/createCliprVisualTextGeneration.ts
web/lib/clipstitchr/server/createCliprVisualVideoInput.ts
web/lib/clipstitchr/server/getCliprReactionSourcePrompts.ts
web/lib/clipstitchr/server/getCliprVisualVideoModelId.ts
web/lib/clipstitchr/utils/getCliprResolvedGenerationMode.ts
web/lib/clipstitchr/utils/getResolvedCliprVideoModelId.ts
web/services/provider-worker/runProviderWorker.ts
web/services/media-worker/runMediaWorker.mjs
```

## Maintenance Notes

Keep the manual mode selector and automation mode picker aligned with
`isCliprScriptModeEnabled`. Visual model choice is now a backend setting so UI
tests should not expect a model selector.

If new visual models are added, verify the current Replicate input schema before
editing code. Add the model to `cliprVideoModelOptions`, update
`createCliprVisualVideoInput`, and keep finalization audio stripping enabled for
all visual modes unless the product intentionally adds audio later.
