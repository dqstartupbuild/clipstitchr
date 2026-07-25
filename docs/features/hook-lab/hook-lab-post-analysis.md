# Hook Lab Post Analysis

Each completed Hook Lab analysis consumes 1 creation credit. The credit is
reserved before the provider job is queued, committed only after the analysis
is saved, and released if dispatch or analysis fails. Retrying a failed post is
a new usage only when that retry completes successfully.

Hook Lab is a focused saved-post analyzer at `/dashboard/hooks`. A signed-in
user can paste one public TikTok or Instagram video or slideshow URL, save the
post, and receive a complete report in a dialog.

## Supported use cases

- Save a public TikTok video post.
- Save a public TikTok photo/slideshow post.
- Save a public Instagram Reel or video post.
- Save a public Instagram image or carousel post.
- Paste canonical browser links, TikTok mobile short links, Instagram share
  links, or share text that contains one supported URL.
- Keep the source URL, creator attribution, caption, publication time, public
  metrics, thumbnail, analysis status, and completed report.
- Open a completed report without leaving Hook Lab.
- Re-analyze a completed report without deleting or re-importing the saved post.
- Retry a failed analysis.
- Delete a saved post and its stored thumbnail.

Private posts, removed posts, live streams, and social pages without
downloadable video or image media are not supported. YouTube was investigated
but remains disabled: one downloader Actor produced no dataset item under the
project's $0.50 run cap, and a lower-cost candidate timed out on a 19-second
public test video. Shipping either would create a control that looks supported
but is not dependable.

## User flow

1. The user pastes a URL into `HookLabPostComposer`.
2. `extractHookLabSourceUrl` pulls a supported HTTPS URL out of mobile share
   text. The platform and canonicalization helpers accept canonical, mobile,
   short, photo, Reel, post, TV, and share-path variants.
3. `hookLabPosts.create` saves one idempotent row for that owner and canonical
   URL.
4. The API reserves the user and global post-analysis rate limits, then creates
   a `hook-lab-post-analysis` provider job.
5. The provider worker runs the configured Apify actor for the source platform.
6. The actor result supplies downloadable video or image media, attribution,
   caption, publication time, and any available public metrics.
7. The worker downloads media with size, timeout, redirect, MIME, and
   public-network protections. A slideshow is capped at 20 images and rendered
   with ffmpeg as one 1080x1920 MP4 with three seconds per slide.
8. The source video or rendered slideshow is placed in a temporary private R2
   object so the configured Gemini model can read the complete post.
9. Gemini returns structured JSON with a complete timestamped timeline,
   forensic visual and audio observations, likely subtext, cultural context,
   recreation essentials, execution scores, metric-grounded performance
   reasoning, limitations, confidence, and versioned format analysis.
10. The parser rejects reports that do not cover the video from its opening to
    its ending or that leave a large unexplained timeline gap.
11. Convex stores the completed report and the UI exposes it through
    `HookLabPostAnalysisDialog`.
12. Temporary local images, rendered/source video, and R2 media are deleted.
    Only the saved post, report, and thumbnail remain.

Completed reports include a `Re-analyze` action and a clear one-credit notice
in the dialog header. It uses the same owner checks, analysis limits, credit lifecycle, and
provider-job pipeline as a failed-analysis retry. The saved post and reusable
social-provider lineage stay in place. The previous report remains stored
until the replacement succeeds, and the dialog closes after the new job is
successfully queued so the post card can show live analysis progress.

The completed report is organized as a three-view workspace:

- **Quick read** is the default and keeps the summary, hook, format recipe,
  keep/adapt/leave-behind guidance, and product-script action in one short
  reading path.
- **Full breakdown** contains the forensic report in four native disclosures:
  play-by-play, visual mechanics and meaning, source words, and performance.
  The play-by-play starts open while secondary evidence starts collapsed.
- **Your script** is isolated from the source analysis and opens in a formatted
  reading view. Editing is an explicit mode rather than nine text fields shown
  by default. Reopening the report loads the newest saved adaptation associated
  with that source post before offering to create another one.

The tabs use an accessible Base UI primitive with keyboard navigation. The
header and view selector remain outside each panel's scrolling region, so the
close control and report navigation stay reachable on long timelines. The
shared dashboard dialog viewport preserves the top edge on short screens and
accounts for mobile safe areas.

## Analysis contract

The model receives the entire video, its measured duration, the source caption,
publication time, platform, and public metrics captured during ingestion. The
prompt explicitly treats post content as untrusted data.

The report contains:

- a plain-language content summary;
- the original caption in its own field;
- a dedicated ordered list of distinct on-screen text;
- the opening and its likely scroll-stopping effect;
- the video format and edit structure;
- the explicit or implied call to action;
- a timestamped play-by-play for the full runtime;
- timeline-specific on-screen text and audible speech/sound when available;
- facial expression, gaze, posture, gesture, and body-language changes;
- every story-relevant object and its placement in the frame;
- the exact order of touches and object movements plus visible reactions before
  and after each action;
- cuts, zooms, speed changes, pauses, music, silence, and sound effects at the
  beat where they occur;
- contradictions, awkwardness, surprise, escalation, and comedy when directly
  visible;
- likely subtext and cultural context explicitly labeled as interpretation;
- the exact expressions, props, positions, action order, timing, words, sounds,
  reveals, and payoffs essential to recreating the effect;
- overall, opening, pacing, and platform-fit execution scores from 0 to 100;
- an engagement explanation grounded only in metrics the provider returned;
- likely retention strengths and drop-off risks labeled as inference;
- specific strengths, weak spots, missing-data limitations, and confidence;
- transferable lessons from the source post;
- a first-three-second breakdown covering the first frame, unresolved tension,
  sound-off meaning, first payoff, and ad obviousness;
- proof-device and product-role classifications;
- the signature moment or object that the post depends on;
- reusable opening, narrative, retention, CTA, and edit structure;
- directly observed evidence kept separate from clearly labeled inference;
- possible copyability warnings that are never presented as proven causes.

The scores measure short-form execution. They are not percentile rankings and
do not claim access to private platform analytics. Hook Lab never invents watch
time, retention curves, impressions, reach, follower count, traffic sources, or
audience demographics.

The provider prompt version is `hook-lab-post-analysis-v4`, and newly saved
reports use analysis version `post-analysis-v4`. Older reports remain readable
because the forensic timeline and meaning fields are optional in the durable
schema.

## Model

Hook Lab uses the same full-video model selector used by clip and Stitch score
analysis:

```text
REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID
```

The default is `google/gemini-3-flash`. The selected model ID, Replicate
prediction ID, analysis version, prompt version, and analysis time are retained
on the saved post for traceability.

## Data model

`hookLabPosts` stores source analysis. Important fields include:

- ownership and identity: `ownerId`, `id`, `requestKey`;
- source: `platform`, `canonicalUrl`, `sourcePostId`, `sourceCreatedAt`,
  `sourceText`, `mediaKind`;
- attribution: `authorName`, `authorUsername`, `authorProfileUrl`;
- public metrics: plays, likes, comments, shares, and saves when available;
- media: `thumbnailObject`, `durationSeconds`;
- report: `analysis`, `analysisModel`, `analysisVersion`, `promptVersion`,
  `providerPredictionId`, `analyzedAt`;
- ingestion lineage: `providerRunId`, `providerDatasetId`;
- state: `status`, `failureCode`, `failureMessage`, timestamps.

Generated product adaptations are stored separately in the owner-scoped
`hookLabCreativeBriefs` table. See
`docs/features/hook-lab/format-to-product-briefs.md` for its contract and
credit lifecycle.

## Rate limits and abuse protection

The create and retry routes call `consumeHookLabPostAnalysis` before creating a
provider job. Completed-post re-analysis uses the retry route and the same
limits. Current limits are 90 analyses per user per day with burst 15 and
3,000 globally per day with burst 600 across five shards. The operation also
reserves shared provider spend. Convex metadata writes, deletes, and signed R2
operations keep their independent limits and ownership checks.

Remote media fetching rejects private network destinations, unsafe redirects,
oversized downloads, unexpected MIME types, slow responses, and rendered or
source videos outside the configured duration limit. Slideshow images share the
same 100 MiB total cap as video imports.

## File tree

```text
web/app/dashboard/hooks/
  HookLabPageClient.tsx
  page.tsx
web/app/_components/hooks/
  HookLabPost*.tsx
web/app/api/hook-lab/posts/
  route.ts
  createHookLabPostRoute.ts
  readCreateHookLabPostRequest.ts
  [id]/retry/
web/app/api/hook-lab/templates/
  route.ts
  getHookLibraryTemplatesRoute.ts
web/convex/hookLabPosts/
  create.ts
  list.ts
  get.ts
  retry.ts
  remove.ts
  getForProvider.ts
  prepareProviderRun.ts
  recordProviderRun.ts
  completeAnalysisFromProvider.ts
  failAnalysisFromProvider.ts
  markAnalysisDispatchFailed.ts
web/services/provider-worker/hookLab/
  analyzeHookLabPost.ts
  loadHookLabPostSource.ts
  createHookLabPostAnalysis.ts
  createHookLabPostAnalysisPrompt.ts
  parseHookLabPostAnalysis.ts
  processHookLabPostAnalysis.ts
  prepareHookLabSourceMedia.ts
  createHookLabSlideshowVideo.ts
```

## Verification

- Run URL extraction, canonicalization, and source-adapter tests.
- Render a real two-image slideshow through the worker ffmpeg command and
  confirm its duration, dimensions, and MIME type.
- Run parser coverage tests for full-runtime timelines and gap rejection.
- Run the provider worker `--check` command.
- Exercise create, completed-report dialog, retry, and delete with a real
  pointer in the browser.
- Confirm temporary R2 source videos are removed after both success and failure.
- Confirm the saved report never shows a metric that the social provider did
  not return.
