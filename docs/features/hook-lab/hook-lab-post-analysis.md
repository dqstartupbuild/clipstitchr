# Hook Lab Post Analysis

Hook Lab is a focused saved-post analyzer at `/dashboard/hooks`. A signed-in
user can paste one public TikTok video URL or Instagram Reel/video-post URL,
save the post, and receive a full-video report in a dialog.

## Supported use cases

- Save a public TikTok video post.
- Save a public Instagram Reel or video post.
- Keep the source URL, creator attribution, caption, publication time, public
  metrics, thumbnail, analysis status, and completed report.
- Open a completed report without leaving Hook Lab.
- Retry a failed analysis.
- Delete a saved post and its stored thumbnail.

Private posts, photo posts, carousels, removed posts, live streams, and social
pages without a downloadable video are not supported.

## User flow

1. The user pastes a URL into `HookLabPostComposer`.
2. `readCreateHookLabPostRequest` accepts only canonical public TikTok video or
   Instagram post/Reel URLs.
3. `hookLabPosts.create` saves one idempotent row for that owner and canonical
   URL.
4. The API reserves the user and global post-analysis rate limits, then creates
   a `hook-lab-post-analysis` provider job.
5. The provider worker runs the configured Apify actor for the source platform.
6. The actor result supplies the downloadable video, attribution, caption,
   publication time, and any available public metrics.
7. The worker downloads the video with size, duration, timeout, redirect, and
   public-network protections.
8. The source video is placed in a temporary private R2 object so the configured
   Gemini model can read the full video.
9. Gemini returns structured JSON with a complete timestamped timeline,
   execution scores, metric-grounded performance reasoning, limitations,
   confidence, and transferable lessons.
10. The parser rejects reports that do not cover the video from its opening to
    its ending or that leave a large unexplained timeline gap.
11. Convex stores the completed report and the UI exposes it through
    `HookLabPostAnalysisDialog`.
12. Temporary local and R2 source-video files are deleted. Only the saved post,
    report, and thumbnail remain.

The completed report uses the same warm dark surface, border, typography,
header, close control, and shadow treatment as other dashboard dialogs. Its
header remains outside the report's scrolling region, so the close control
stays reachable while reading a long timeline. The shared dashboard dialog
viewport preserves the report's top edge on short screens and accounts for
mobile safe areas.

## Analysis contract

The model receives the entire video, its measured duration, the source caption,
publication time, platform, and public metrics captured during ingestion. The
prompt explicitly treats post content as untrusted data.

The report contains:

- a plain-language content summary;
- the opening and its likely scroll-stopping effect;
- the video format and edit structure;
- the explicit or implied call to action;
- a timestamped play-by-play for the full runtime;
- clearly readable on-screen text and audible speech/sound when available;
- overall, opening, pacing, and platform-fit execution scores from 0 to 100;
- an engagement explanation grounded only in metrics the provider returned;
- likely retention strengths and drop-off risks labeled as inference;
- specific strengths, weak spots, missing-data limitations, and confidence;
- transferable lessons that do not copy the source post.

The scores measure short-form execution. They are not percentile rankings and
do not claim access to private platform analytics. Hook Lab never invents watch
time, retention curves, impressions, reach, follower count, traffic sources, or
audience demographics.

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

`hookLabPosts` is the only Hook Lab table. Important fields include:

- ownership and identity: `ownerId`, `id`, `requestKey`;
- source: `platform`, `canonicalUrl`, `sourcePostId`, `sourceCreatedAt`,
  `sourceText`;
- attribution: `authorName`, `authorUsername`, `authorProfileUrl`;
- public metrics: plays, likes, comments, shares, and saves when available;
- media: `thumbnailObject`, `durationSeconds`;
- report: `analysis`, `analysisModel`, `analysisVersion`, `promptVersion`,
  `providerPredictionId`, `analyzedAt`;
- ingestion lineage: `providerRunId`, `providerDatasetId`;
- state: `status`, `failureCode`, `failureMessage`, timestamps.

No generated variations, reusable writing memories, approval feedback,
avoid-lists, saved setups, or Stitchr generation plans are stored by Hook Lab.

## Rate limits and abuse protection

The create and retry routes call `consumeHookLabPostAnalysis` before creating a
provider job. Current limits are 30 analyses per user per day with burst 5 and
1,000 globally per day with burst 200 across five shards. The operation also
reserves shared provider spend. Convex metadata writes, deletes, and signed R2
operations keep their independent limits and ownership checks.

Remote video fetching rejects private network destinations, unsafe redirects,
oversized downloads, non-video responses, slow responses, and videos outside
the configured duration limit.

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
```

## Verification

- Run URL canonicalization and source-adapter tests.
- Run parser coverage tests for full-runtime timelines and gap rejection.
- Run the provider worker `--check` command.
- Exercise create, completed-report dialog, retry, and delete with a real
  pointer in the browser.
- Confirm temporary R2 source videos are removed after both success and failure.
- Confirm the saved report never shows a metric that the social provider did
  not return.
