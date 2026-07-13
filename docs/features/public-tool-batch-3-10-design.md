# Public Tool Batch 3–10 Design

## Understanding

This batch expands the public `/tools` library from two tools to ten. The eight
new tools are the previously approved priorities 3–10 from the app-marketing
lead-magnet portfolio:

1. Product Demo Readiness Checker
2. Hook Strength Grader for App Ads
3. UGC Ad Brief Builder for Apps
4. App Ad Hook Rewrite Tool
5. 9:16 App Demo Video Checker
6. App Ad Creative Test Plan Generator
7. Hook-to-Visual Matchmaker for App Ads
8. App UGC Production Cost Calculator

The audience is intentionally narrow: app founders and app marketers who are
already planning short-form app ads. The goal is smaller, higher-intent search
traffic that can join the mailing list or move to a paid ClipStitchr account.
ClipStitchr has no free product plan or trial. The public tools are free
planning and diagnostic resources, not a free editing workflow.

The result of each tool must be useful before any email is requested. Mailing
list capture sits beside the result, and every product conversion points to
paid plans. No tool in this batch exports a finished video or recreates the
paid Stitchr workflow.

## Assumptions and Non-Functional Requirements

- Tools are deterministic and browser-local unless a server is essential.
- User-entered text, numbers, filenames, and media metadata are not sent to
  analytics.
- Uploaded videos remain in the browser and are never sent to an API, R2,
  Convex, or a provider.
- Text results may be copied. Video reports are visible on the page but are not
  downloadable files.
- Results remain available if a provider is down because this batch has no
  provider dependency.
- Cost calculations use USD in the first version and clearly show their
  assumptions. The tool does not claim to provide market-rate benchmarks.
- The test-plan tool plans creative variables, not ad-platform campaign
  settings, bidding, or media buying.
- The brief builder covers one creator concept at a time and does not provide
  legal advice about contracts or usage rights.
- Video guidance uses ClipStitchr's durable 9:16 production baseline. It is not
  presented as certification for every ad network's mutable requirements.
- Existing per-client, per-email, and global tool-lead limits continue to
  protect the only shared backend operation added to these pages.

## Considered Approaches

### Recommended: shared catalog with local tool engines

A typed public-tool catalog owns each tool's identity, path, summaries, SEO
keywords, discovery relationships, sitemap values, and fixed analytics name.
Each tool keeps its own focused input, result, calculation, and UI files. A
single allowlisted lead endpoint accepts a catalog key in the route and fixes
that source server-side.

This keeps each tool atomic while removing the manual registration points that
would otherwise drift across the index, sitemap, LLM listing, analytics, lead
validation, and related-tool links. Local engines give visitors instant
results and add no provider, storage, or processing cost.

### Rejected: clone every existing page and lead route

Cloning the first two tools would be fast for one page, but eight copies would
create repeated tool identity, source unions, API routes, index cards, and
discovery links. That makes SEO and backend validation easy to update
inconsistently.

### Rejected: server-side AI for every writing tool

Provider-generated answers could create more prose variation, but would add
latency, cost, failure modes, prompt maintenance, and abuse limits without
materially improving these tightly scoped planning outputs. The tools instead
combine bounded user context with curated patterns already reflected in Hook
Lab and the existing App Hook Generator.

## Shared Architecture

### Public tool catalog

The catalog is plain TypeScript data, safe for server and client imports. Each
entry includes:

- A stable key and canonical `/tools/...` path.
- Public name, eyebrow, index summary, metadata description, and keywords.
- An icon key resolved by one UI-only component.
- Related tool keys used by generalized discovery links.
- Sitemap change frequency and priority.
- Fixed TikTok content identity.

The tool-key tuple is the source of truth for `ToolLeadSource`. Convex keeps an
explicit validator built from the same fixed values because the database
boundary must still reject unknown strings.

The catalog supplies the `/tools` cards, static sitemap entries, `llms.txt`
reading paths, fixed TikTok page metadata, and related-tool navigation. Page
files still own Next.js metadata exports because route metadata is a page
responsibility.

### Mailing-list route

All tools submit name and email to `/api/tools/[tool]/lead`. The route accepts
only a known catalog key and passes that fixed source to the existing shared
handler. The body cannot choose its own source.

The existing same-origin requirement, JSON/content checks, 2 KB streamed body
limit, field normalization, opaque duplicate response, secret-gated Convex
mutation, and per-client, per-email, and global limits remain unchanged. An
unknown tool returns a non-success response before Convex is called.

### Page composition

Each route follows the existing public tool shape:

1. `ToolStructuredData`
2. Tool-specific hero
3. Tool-specific interactive client component
4. `ToolLeadCaptureForm`
5. Tool-specific plain-language guide
6. Visible FAQ matching `FAQPage` data
7. Related tools and the `/tools` hub

Each distinct component, hook, function, type, and constant remains in its own
focused file. Shared form controls and result cards are reused only where they
have one clear responsibility.

## Tool Contracts

### 3. Product Demo Readiness Checker

Canonical route: `/tools/product-demo-readiness-checker`

The visitor selects one local video, chooses its intended use (`short-form
ad`, `organic post`, or `landing page`), and answers eight questions with Yes,
Not sure, or No. Captions may also be Not applicable.

The questions cover:

- A useful product moment appears in the first two seconds.
- The demo focuses on one outcome.
- The action and its result are both visible.
- The interface is readable at phone size.
- Personal, secret, or customer data is hidden.
- Spoken words have captions.
- The viewer gets a clear next step.
- Dead time has been removed.

Automatic local checks cover file readability, video decode support,
resolution, audio decode when audio exists, and a clearly labeled duration
planning guideline for the selected use. Landscape footage is not an automatic
failure; the result explains that ClipStitchr can reframe wide demos with its
existing background-layout workflow.

Applicable checks receive full points for Yes/pass, half points for Not
sure/warning, and no points for No/fail. Unreadable UI, exposed private data,
or an undecodable video is a blocker regardless of the percentage. A score of
80 or more with no blocker is **Ready to test**; 60–79 with no blocker is
**Nearly ready**; all other results are **Needs another pass**. The result
shows what works, the three most important fixes, and the remaining checklist.

### 4. Hook Strength Grader for App Ads

Canonical route: `/tools/app-ad-hook-grader`

Inputs are the hook, app name or category, target audience, desired outcome,
and optional first visual. The grader applies transparent deterministic rules
across six dimensions:

- Clarity: the opening is understandable without missing setup.
- Specificity: it includes a concrete audience, problem, action, or outcome.
- Audience fit: the audience context connects to the hook.
- Curiosity: the hook creates a reason to watch without becoming vague.
- Visual bridge: the words can lead naturally into the first visual.
- Claim safety: the wording avoids unsupported guarantees and extreme claims.

Each dimension returns 0–100 and a short reason. The overall score is the
rounded average. Scores of 80–100 are **Strong start**, 60–79 are **Worth
testing**, and below 60 is **Needs a sharper angle**. The output gives the top
three fixes in priority order. The tool grades the writing; it does not predict
performance or promise results.

### 5. UGC Ad Brief Builder for Apps

Canonical route: `/tools/app-ugc-brief-builder`

Inputs are the app, audience, problem, desired outcome, key feature, proof the
founder can honestly support, creator style, tone, call to action, and desired
deliverables. The local builder produces a copyable brief with one focused
objective, audience context, creator direction, three hook directions, a shot
list, product-demo handoff, proof boundaries, call to action, deliverables,
and a simple filming checklist.

Empty optional proof produces an explicit instruction not to invent proof.
The brief uses the visitor's language and curated structures; it does not
create legal usage-rights terms or claim that a creator has accepted the job.

### 6. App Ad Hook Rewrite Tool

Canonical route: `/tools/app-ad-hook-rewriter`

Inputs are the current hook, app or category, audience, problem, desired
outcome, and optional first visual. The browser returns six labeled rewrites:

1. Clearer
2. Shorter
3. Audience-first
4. Problem-first
5. Outcome-led
6. Pattern break

The tool may shorten and rearrange the visitor's stated ideas, but it must not
invent numbers, testimonials, rankings, savings, speed, or guarantees. Every
variant includes a one-line note about when to test that direction. Repeated
variants are removed and replaced with the next safe curated pattern.

### 7. 9:16 App Demo Video Checker

Canonical route: `/tools/9-16-app-demo-video-checker`

One local video is read with Media Bunny through the existing
`createMediaInput` and `getClipMetadata` behavior. A separate opt-in inspection
layer adds codec, estimated frame rate and bitrate, HDR, pixel aspect ratio,
audio details, track counts, filename, and file size. It does not expand the
normal upload metadata reader because paid normalization calls that reader
more than once and should not inherit packet-stat work.

Checks and weights are:

- Display aspect ratio within `0.005` of 9:16: 30% and critical.
- Resolution at least 1080×1920 passes, at least 720×1280 warns, lower fails:
  20%.
- The current browser can decode the video: 20% and critical.
- MP4 with AVC is preferred; other decodable formats warn: 10%.
- Estimated frame rate from 24–60 FPS passes; another or unavailable rate
  warns: 10%.
- No audio is valid. Decodable AAC passes; other decodable audio warns;
  undecodable audio fails: 5%.
- SDR and square pixels are preferred; HDR or non-square pixels warn: 5%.

Duration, file size, bitrates, rotation, and track counts are displayed as
facts, not mutable platform limits. Display dimensions already account for
rotation; non-zero rotation and multiple tracks add compatibility notes. A
weighted result of 85 or more with no critical failure is **Ready**, 60–84
with no critical failure is **Almost ready**, and all others are **Needs
changes**. The page states that this is ClipStitchr's production baseline, not
ad-network certification. It does not convert or download the video.

### 8. App Ad Creative Test Plan Generator

Canonical route: `/tools/app-ad-test-plan-generator`

Inputs are app, goal, audience, available UGC openings, demos, hooks, calls to
action, weekly production capacity, and optional weekly testing budget. Counts
are bounded non-negative whole numbers. The generator reuses the Ad Variant
Calculator's combination concepts, then creates a copyable three-wave plan:

- Wave 1 holds demo, hook, and call to action steady while testing UGC
  openings.
- Wave 2 keeps the strongest footage pair and tests hook directions.
- Wave 3 rotates demos and calls to action one variable at a time.

Each wave is capped by weekly capacity and carries overflow into later weeks.
When budget is present, the plan shows an even planning allocation per live
variant and labels it as arithmetic, not a recommended spend. Missing creative
inputs produce a preparation list instead of impossible variants. The result
includes the total combination opportunity, practical first batch, test
matrix, weekly order, and what to keep constant.

### 9. Hook-to-Visual Matchmaker for App Ads

Canonical route: `/tools/hook-to-visual-matchmaker`

Inputs are the hook, app or category, audience, desired action, available UGC
footage, available demo moment, and preferred opening source (`UGC`, `demo`,
or `choose for me`). The matcher detects transparent hook intents such as
problem, outcome, audience callout, demonstration, comparison, curiosity, and
objection. It maps that intent to a curated opening visual pattern.

The result is a 0–5 second storyboard with an opening shot, on-screen text,
product-demo handoff, and call-to-action bridge. It explains why the pairing
fits and gives one alternate pairing. If a requested asset is unavailable, it
adapts the plan instead of pretending it exists. The matcher does not inspect
or upload footage and does not claim the pairing will outperform another ad.

### 10. App UGC Production Cost Calculator

Canonical route: `/tools/app-ugc-cost-calculator`

Bounded non-negative inputs are creator count, fee per creator, clips per
creator, editing hours, editing hourly rate, revision count, cost per revision,
internal hours, internal hourly cost, unused footage percentage, finished
variants, and optional batches per month.

The calculator returns:

- Creator cost: `creator count × fee per creator`.
- Editing cost: `editing hours × editing hourly rate`.
- Revision cost: `revision count × cost per revision`.
- Internal cost: `internal hours × internal hourly cost`.
- Total batch cost: the sum of those four costs.
- Cost per raw clip and cost per finished variant when their denominators are
  greater than zero.
- Estimated unused footage cost: creator cost multiplied by the bounded unused
  footage percentage.
- Monthly and annual scenarios when batches per month is greater than zero.

Zero denominators show a plain-language missing-input message, never Infinity
or NaN. Results are estimates based only on the visitor's numbers. The tool
does not supply creator-rate benchmarks or imply guaranteed savings.

## Browser-Local Video Inspection

The shared inspector creates an `Input` with `ALL_FORMATS` and `BlobSource`,
verifies `canRead()`, and reuses base clip metadata. Optional details are read
from the primary tracks. Failure to compute optional packet statistics or HDR
metadata returns `null` for that fact instead of discarding a valid base
report.

The owning reader always disposes the Media Bunny input after success or error.
Replacing a file aborts and disposes stale work so an earlier result cannot
overwrite the latest choice. The local preview uses an object URL and revokes
it when the file changes or the component unmounts.

## Error Handling

- Required text fields show specific inline help and keep existing results
  until a new valid run succeeds.
- Number inputs normalize unsafe, negative, fractional, or over-limit values
  without displaying NaN or Infinity.
- Video tools distinguish an unsupported/unreadable file from optional
  metadata that could not be estimated.
- A replacement file cancels stale inspection and clears the previous report.
- Copy buttons announce success without requiring clipboard support for the
  rest of the result to remain usable.
- Mailing-list failures remain separate from tool results.

## Testing Strategy

Each pure calculator, grader, matcher, rewriter, and builder gets focused unit
tests for normal output, empty optional fields, bounds, deterministic output,
and claim safety. Each scoring engine gets table-driven threshold and blocker
tests. UI tests cover labels, keyboard submission, reset/replace behavior,
result announcements, copy controls, paid pricing links, mailing-list source,
and the absence of free plan or trial promises.

The video inspector tests readable video, no audio, rotation, HDR, multiple
tracks, optional-stat failure, unreadable media, no video track, and disposal
after success, error, and cancellation. Video UI tests cover select, drop,
replace, loading, stale-result cancellation, error recovery, accessible status,
and object-URL cleanup.

Integration verification covers all ten cards and routes, metadata,
structured data, related links, sitemap entries, `llms.txt`, TikTok fixed page
identity, dynamic lead-route allowlisting, Convex source validation, and the
existing lead limits. Completion requires typecheck, lint, the full Vitest
suite, and a production build.

## Decision Log

| Decision | Choice | Reason |
| --- | --- | --- |
| Batch size | Eight new tools, ten total | Matches approved priorities 3–10. |
| Audience | App founders and app marketers | Favors smaller, higher-intent traffic. |
| Product boundary | Planning and diagnosis only | Protects paid ClipStitchr production value. |
| Result gate | No email gate | The free result must create trust before capture. |
| Engines | Browser-local and deterministic | Faster, cheaper, more reliable, and easier to explain. |
| Registration | One typed catalog | Prevents ten manual SEO and analytics lists from drifting. |
| Lead API | One dynamic allowlisted route | Keeps fixed source attribution without route duplication. |
| Video handling | Local Media Bunny inspection | Reuses shipped media code without upload or storage. |
| Video limits | Durable production baseline | Avoids brittle claims about changing network rules. |
| Writing safety | Never invent proof | Keeps outputs useful without fabricating claims. |
| Cost currency | USD only initially | Makes totals understandable without exchange-rate state. |
| Analytics | Fixed tool identity only | Protects entered copy, media facts, and business numbers. |

## Planned Documentation

This design is the shared implementation contract. Each shipped capability
also receives its own feature document, and
`docs/features/public-app-marketing-tools.md`, analytics docs, and rate-limit
docs are updated to match the completed ten-tool library.
