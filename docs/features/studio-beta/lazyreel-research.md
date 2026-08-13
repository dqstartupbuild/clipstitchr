# Studio Beta LazyReel Research

## What this capability does

`/dashboard/studio/research` brings LazyReel's research corpus and current MCP
capabilities into the private ClipStitchr Studio. It is separate from Hook Lab.
It does not redirect, migrate, or write Hook Lab records.

The workspace supports all seven LazyReel research tools:

- `niche_report`, including overview, format, trends, combinations, and app-ad
  views
- `study_videos`
- `teardown`
- `make_brief`
- `breakout_laws`
- `kill_the_slop`
- `get_status`

It also exposes all six companion workflows:

- Format deconstructor
- Format prompt builder
- Higgsfield director
- UGC ad director
- UGC ad generator
- Video editor

The companion workflows produce inspectable plans and manifests. Their status
is always `plan_only`. They do not call a provider, render media, run a shell
command, or imply that an output video exists.

## Source snapshot and fidelity

The complete supplied LazyReel tree is retained byte-for-byte under:

```text
web/vendor/lazyreel/v0_1_0/upstream/
```

The snapshot contains all 120 supplied files, including the committed corpus,
methodology, Wiki, skills, pipeline source, public examples, feed media, and
original notices. Its reproducible per-file manifest digest is:

```text
071ec70d9de377347767a6215df9ac849db46cf287203966800cf8abe85de356
```

Run this from `web/` to verify every retained file without executing upstream
code:

```bash
npm run lazyreel:verify-vendor
```

`web/vendor/lazyreel/v0_1_0/PROVENANCE.json` records the source path, copy
method, timestamps, supplied historical fingerprint, and authoritative
manifest. The supplied `39ca03...` fingerprint remains provenance metadata,
not an independently reproduced digest, because its original aggregation
algorithm was unavailable.

The ClipStitchr engine parses the retained JSON, CSV, Markdown, and workflow
instructions directly. It never imports the upstream MCP entrypoint because
that file starts a stdio server as an import side effect. It also never runs an
upstream pipeline script during a user request.

## Evidence model

Every result is structured JSON with:

- a short title and summary
- result sections
- public source links when the corpus contains them
- evidence labeled `observed`, `derived`, or `heuristic`
- the exact snapshot version on every evidence item
- methodology and limitations
- tool-specific data

Observed evidence comes directly from committed snapshot rows. Derived evidence
is calculated from those rows or repeats an upstream aggregate with that status
made explicit. Heuristic evidence includes deterministic creative guidance and
workflow planning.

The upstream methodology reports a 5,560-video aggregate and other extrapolated
validation claims. The vendored files contain 237 directly countable visual
analyses rather than the complete raw decoded corpus. ClipStitchr preserves the
aggregate claim but labels it separately and does not present it as independently
reproducible evidence.

The original `teardown` behavior is also represented honestly. A description,
transcript, or supported public post URL is matched against committed patterns.
The tool does not download or visually inspect the linked media. A public
TikTok or Instagram URL is canonicalized and treated as untrusted text; other
URL hosts are rejected. No arbitrary network fetch occurs.

## Product grounding

Every run belongs to one active ClipStitchr Product. Server code loads that
Product through an authenticated owner-scoped Convex query before execution.
For `make_brief`, product facts supplied by the browser are discarded and
replaced with the saved Product name, details, audience, emotional narrative,
and bounded inferred pain points. Product-mode teardown and companion workflow
plans use the same server-grounded description.

This prevents a browser request or reference example from inventing unsupported
product features. Video-mode teardown does not add Product claims unless the
user chose the Product-based mode.

## Durable records

Convex stores three separate Product-scoped record types:

- `studioLazyReelResearchRuns` keeps pending, completed, and failed executions,
  immutable input/result snapshots, evidence version, and an idempotency key.
- `studioLazyReelSavedReports` keeps explicitly saved completed reports and
  supports non-destructive archive state.
- `studioLazyReelCreativeBriefs` keeps saved brief output, draft/approved/
  rejected state, archive state, and an optional approved handoff destination.

An approved brief can be marked for `studio_edit` or `studio_stitch`. That is a
durable Product-scoped handoff, not a fake navigation control. Research opens
the selected destination with the saved brief identifier. The editor reloads
the owned approved brief before creating a project, while Studio Stitch loads
it into the recipe builder without trusting browser-supplied Product facts.
Changing approval or archiving a brief clears its handoff.

All snapshots are canonical JSON with byte counts. Limits are 32 KiB for input
and failure detail, 512 KiB for run results, 64 KiB for artifact summaries,
256 KiB for saved reports, and 128 KiB for creative briefs. Persistence rejects
credential-shaped keys, bearer values, signed URLs, non-finite numbers,
oversized structures, excessive depth, and non-JSON values.

## Request and authorization path

The browser never needs an MCP client. It uses these isolated Studio endpoints:

```text
GET  /api/studio/research/catalog
POST /api/studio/research/runs
POST /api/studio/research/workflows
```

Every endpoint first applies the Next.js Studio gate. Every Convex query and
mutation independently requires Clerk authentication, current Studio access,
and ownership of an active Product. Catalog reads reserve both owner and global
static-read quota before the corpus is parsed. Run creation and lifecycle
writes reserve separate owner and global budgets before state changes.

POST bodies are streamed through a 32 KiB cap before JSON parsing. Text fields,
result counts, workflow duration, model names, report modes, tool keys, and
workflow keys have strict allowlists or bounds. An idempotency key may be retried
only with byte-equivalent normalized input and the same tool or workflow.

The corpus is read-only. This phase does not expose LazyReel ingestion,
scraping, pipeline administration, live-provider tokens, or environment-token
status to beta users.

## User workflow

The Research desk keeps one job active at a time:

1. Choose the active Product in the normal dashboard Product switcher.
2. Choose one research tool or companion workflow.
3. Add only the inputs required by that job.
4. Review the short result first, then open detailed sections, evidence,
   methodology, limitations, Wiki material, or original public examples.
5. Save a completed result as a report, or save a `make_brief` result as a
   creative brief.
6. Review saved runs without rerunning them. Approve or reject a brief
   explicitly before choosing a later Studio handoff.

Existing results use **Open** or **View** actions. Rerunning is always an
explicit new action and never happens during page navigation.

## Source tree

```text
web/vendor/lazyreel/v0_1_0/
web/lib/clipstitchr/server/studio/lazyreel/
web/lib/clipstitchr/server/studio/research/
web/lib/clipstitchr/types/lazyreel/
web/app/api/studio/research/
web/app/dashboard/studio/research/
web/app/_components/studio/research/
web/convex/studioLazyReel/
web/convex/studioLazyReelResearchRuns/
web/convex/studioLazyReelSavedReports/
web/convex/studioLazyReelCreativeBriefs/
web/convex/studioLazyReelRateLimits/
```

## Verification

Focused coverage verifies the 120-file vendor manifest, deterministic corpus
loading, all seven tools, every niche-report focus, all six workflow planners,
all 24 Wiki documents, strict request parsing, URL host rejection, Product
grounding, evidence labels, absent secret leakage, idempotent run lifecycle,
ownership checks, safe snapshot limits, rate-limit exhaustion, save/archive/
approval/handoff transitions, API access ordering, and the Research UI.

Before a non-development rollout:

1. Run `npm run lazyreel:verify-vendor`, `npm run typecheck`, `npm run lint`,
   `npm test`, and `npm run build` from `web/`.
2. Verify an ineligible account cannot reach the page, APIs, or Convex records.
3. Verify two eligible owners cannot read or mutate each other's Product runs.
4. Use pointer and keyboard at desktop and mobile widths. Check every job,
   progressive detail control, safe external link, save action, approval action,
   and handoff choice.
5. Confirm no provider request, media fetch, ingestion script, token value,
   signed URL, or Hook Lab record is produced by a research run.
6. Leave production disabled until a separate rollout is explicitly approved.
