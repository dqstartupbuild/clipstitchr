# Clipr Demo Mode

Clipr Demo mode creates one short silent clip from an existing saved Demo video.
It is meant for testing whether Seedance can remix a screen recording into a
phone-in-hand UGC-style product shot.

## Behavior

- The user chooses Demo mode manually on the Clipr page.
- The user selects one saved Demo clip from the content library.
- Clipr validates the selected Demo clip on the server before queuing provider
  work.
- The provider worker sends the Demo video URL to Seedance as
  `reference_videos: [url]`.
- The prompt references the source as `[Video1]` and asks for one continuous
  vertical phone-in-hand shot.
- The output is finalized by the media worker, saved as a Clipr clip, and kept
  silent.

Demo mode is not included in the Any-mode random pool and is not available to
Clipr automation yet because it needs a specific Demo source clip.

## Provider Notes

Demo mode uses `bytedance/seedance-2.0` internally. Seedance documentation lists
short reference videos as supported multimodal inputs, but this is still an
experimental path. Long Demo videos, real-person moderation, product UI
fidelity, and provider policy checks can still cause failures.

Reaction and B-roll do not use Seedance anymore. Their active visual model
choices are Kling v3 and Veo 3.1.

## File Tree

- `web/app/_components/clipr/CliprDemoClipPanel.tsx`
  - Manual Demo source selector.
- `web/app/dashboard/clipr/CliprPageClient.tsx`
  - Shows Demo mode controls and sends `demoClipId`.
- `web/lib/clipstitchr/server/clipr/readCliprJobCreateRequest.ts`
  - Reads `demoClipId` only for Demo mode.
- `web/lib/clipstitchr/server/clipr/loadCliprJobInputDocuments.ts`
  - Validates the selected Demo clip through Convex.
- `web/lib/clipstitchr/server/createCliprDemoTextGeneration.ts`
  - Creates local Clipr metadata for Demo mode.
- `web/lib/clipstitchr/server/createCliprDemoVideoInput.ts`
  - Builds the Seedance `reference_videos` payload.
- `web/lib/clipstitchr/server/createCliprDemoVideoOutput.ts`
  - Saves the generated provider output into R2.
- `web/services/provider-worker/runProviderWorker.ts`
  - Runs the Demo branch and queues media finalization.

## Rate Limits

Demo mode consumes Clipr job-create and Clipr video-generation limits. It skips
hook/script, avatar-still, voice, music, and lip-sync limits.
