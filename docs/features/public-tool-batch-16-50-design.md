# Public Tool and Resource Batch 16–50 Design

## Understanding Lock

The approved lead-magnet portfolio contains fifty numbered capabilities. The
current public catalog implements fifteen of them. “Implement the remaining 35
tools/resources” therefore means the portfolio entries that do not have an
existing equivalent:

- Planning: 1–4 and 6–10.
- Hook resources: 14 and 16–20.
- Video and asset preparation: 22 and 25–30.
- Campaign and business planning: 33 and 37–40.
- High-value experiences: 41–46, 49, and 50.

The existing UGC Ad Brief Builder maps portfolio item 47. Portfolio item 3 is
still missing because it is a deliberately blank, immediately reusable brief
template rather than the personalized builder. The other existing mappings are
recorded in the completion matrix below so the final audit can prove all fifty
portfolio numbers without manufacturing duplicate pages.

The audience remains app founders and app marketers. Every resource must
deliver its useful result before optional mailing-list capture. ClipStitchr has
no free product account, free production tier, or free finished-ad export.

## Assumptions and Non-Functional Requirements

- Browser-local, deterministic behavior is the default. Visitor inputs, media,
  quote details, campaign data, and generated results are not uploaded or sent
  to analytics.
- The existing lead form sends only name and email to the fixed-source,
  same-origin, size-limited, rate-limited endpoint. It does not email results,
  start a drip course, or create a product account.
- No new AI, provider, expansive Hook library, ad-platform connection, storage,
  or media-production workflow is added in this batch.
- Static resources must be substantial, searchable, filterable, checkable,
  copyable, or downloadable. A marketing page that merely describes a future
  resource does not satisfy the portfolio item.
- Worksheets are session-local and expose their formulas or synthesis rules.
  Downloaded CSV and Markdown files are generated in the browser.
- Media tools operate on local files, cancel stale work, close decoded samples,
  revoke object URLs, cap expensive analysis, and clearly separate automatic
  facts from user judgment.
- Platform specifications and obstruction overlays are versioned, source-linked,
  dated references rather than claims of permanent certification.
- Financial and capacity outputs are visitor-entered scenarios, not forecasts,
  legal advice, market benchmarks, staffing recommendations, or guaranteed
  savings.
- The library should support hundreds to low thousands of monthly visitors
  without new shared compute or storage cost.
- Every capability receives an atomic implementation, focused tests, a dedicated
  feature document, a quality-register row, and the established paid boundary.

## Considered Approaches

### Accepted: one catalog with reusable resource engines

Keep all fifty capabilities in the existing `/tools` catalog so the same typed
source drives discovery, lead sources, sitemap entries, `llms.txt`, analytics,
and related links. Add a resource format and portfolio number to each catalog
record. Use four focused presentation engines where behavior is genuinely
shared:

1. Guided workbooks for checklists, templates, sprints, courses, and workshops.
2. Filterable collections for hook libraries, prompt cards, specifications, and
   educational teardowns.
3. Editable tables for trackers, calendars, and inventories with real CSV
   exports.
4. Tool-specific engines for calculations, media analysis, decision trees, and
   multi-input planning.

Each resource still owns its content definition, pure domain logic when needed,
route, metadata, documentation, tests, and quality record. Shared engines remove
UI duplication without collapsing distinct product promises into one generic
SEO page.

### Rejected: clone the fifteen existing tool page trees 35 times

This would create hundreds of repeated hero, FAQ, result, lead, and CTA files,
make the catalog hard to maintain, and encourage thin variations. Atomic code
splitting requires one purpose per file, not duplication per usage location.

### Rejected: server delivery, AI generation, or provider-backed analysis

The current mailing-list system cannot deliver attachments or scheduled course
emails. AI and provider calls add privacy, abuse-cost, latency, evaluation, and
paid-boundary work before demand is known. The deterministic versions provide
the approved resources now while preserving future integration choices.

## Shared Architecture

`PublicToolDefinition` gains `portfolioNumber`, `format`, and `category`. A
catalog test proves that portfolio numbers 1–50 are represented exactly once,
either by an existing tool or one new resource. Catalog keys remain the source
of truth for route lead sources. The Convex validator remains an explicit fixed
union at the database boundary, generated through focused grouped validators if
the value library cannot safely accept a runtime tuple.

Reusable resource components own only presentation behavior: progress,
checkable items, notes, filter controls, copy controls, Markdown downloads, CSV
downloads, table rows, lesson navigation, and reset confirmation. Resource data
and domain engines remain in dedicated feature folders. Browser storage is used
only for the five-day sprint and self-paced learning progress, with a visible
reset action and no account synchronization.

Every route follows the established public shape: structured data, hero,
functional resource, optional mailing-list form, plain-language guide, visible
FAQ, paid `/pricing` CTA, related resources, and the hub. User-facing copy never
claims emailed delivery, performance, certification, legal approval, or savings
that the implementation does not provide.

## Missing Capability Contracts

| # | Capability and canonical route | Format | Complete deterministic result | Boundary that remains paid or out of scope |
| --- | --- | --- | --- | --- |
| 1 | 30-Day App Content Plan — `/tools/30-day-app-content-plan` | Interactive plan | Goal, cadence, launch stage, asset coverage, and on-camera comfort produce exactly 30 dated production, publishing, repurposing, and review actions. Non-posting days contain useful batch or learning work. | No scripts, scheduling, publishing, persistence, or media. |
| 2 | 100 App Demo Video Hooks — `/tools/100-app-demo-video-hooks` | Filterable collection | One hundred individually authored examples across ten angles, each with a visual handoff and claim-safety note. | Fixed educational examples; no personalization, saving, or full Hook Lab library. |
| 3 | App UGC Ad Brief Template — `/tools/app-ugc-ad-brief-template` | Guided template | A blank copyable brief and one complete example covering claims, deliverables, reusable takes, demo handoff, naming, usage questions, and reshoots. | No personalized generation, creator management, rights validation, or production. |
| 4 | App Demo Recording Checklist — `/tools/app-demo-recording-checklist` | Checklist | Capture-method-aware eighteen-item preparation list with progress, blockers, and copyable incomplete priorities. | No screen recording, file inspection, repair, or export. |
| 6 | TikTok and Reels Creative Testing Tracker — `/tools/tiktok-reels-creative-testing-tracker` | Editable table | Session rows for channel, hook, visual, CTA, spend, impressions, clicks, installs, and conversions calculate CTR, install rate, CPA, and CPI and export CSV/Markdown. | No platform sync, attribution claims, persistent database, or production. |
| 7 | UGC Creator Handoff Kit — `/tools/ugc-creator-handoff-kit` | Guided kit | Delivery checklist, folder layout, upload manifest, naming example, usage-information request, missing-file note, and reshoot template. | No upload portal, storage, payment, rights verification, or legal advice. |
| 8 | What Should I Post? Decision Tree — `/tools/what-should-i-post-decision-tree` | Interactive decision | Goal, funnel stage, assets, on-camera preference, and capacity return one recommended format, three prompts, required captures, and one relevant next tool. | No finished scripts, calendar, scheduling, or production. |
| 9 | App Marketing Content Calendar — `/tools/app-marketing-content-calendar` | Editable table | Month, cadence, campaign dates, pillars, channels, owners, and assets create dated publish slots with pillar, CTA role, owner, and status; export CSV. | No publishing, reminders, persistent collaboration, or media. |
| 10 | Short-Form Ad Preflight Checklist — `/tools/short-form-ad-preflight-checklist` | Checklist | Twenty checks across hook, demo, proof, claims, CTA, captions, audio, framing, rights, and destination; safety blockers override the percentage. | No media analysis, rights verification, approval prediction, editing, or export. |
| 14 | 50 App-Ad Hook Structures — `/tools/app-ad-hook-structures` | Filterable collection | Fifty distinct frameworks with formula, intent, example, opening visual, misuse warning, and claim guardrail. | No unsupported “proven” claim, personalization, saving, or production. |
| 16 | UGC Opening-Line Prompt Cards — `/tools/ugc-opening-line-prompt-cards` | Filterable collection | Twenty-four recording prompts across six categories, each with delivery direction, alternate take, and proof guardrail. | No complete scripts, personalized generation, recording, or assembly. |
| 17 | App Category Hook Packs — `/tools/app-category-hook-packs` | Filterable collection | Six category packs with ten tailored fill-in structures and category-specific risky-claim reminders. | No app-specific generation, unlimited library, saving, or production. |
| 18 | Competitor Hook Research Worksheet — `/tools/competitor-hook-research-worksheet` | Worksheet | Up to five manually entered ads produce recurring-pattern counts and an evidence-versus-inference research summary. | No scraping, downloading, transcription, monitoring, or copying recommendation. |
| 19 | App Hook Testing Matrix — `/tools/app-hook-testing-matrix` | Matrix builder | Up to five hooks, three visuals, and one stable CTA produce a capped control, hook-only challenger, and visual follow-up matrix with the changed variable named per row. | No assets, test execution, tracking, prediction, or persistence. |
| 20 | Why Did This Ad Work? Template — `/tools/why-did-this-ad-work-template` | Worksheet | Manual beat and evidence fields produce a Markdown analysis separating observations, inferences, transferable principles, and one controlled follow-up hypothesis. | No media import, transcription, attribution, teardown library, or saving. |
| 22 | App-Ad Dead-Space Finder — `/tools/app-ad-dead-space-finder` | Local media diagnostic | Bounded sparse audio RMS and frame-luma sampling identify timestamped spans worth human review with adjustable sensitivity and minimum duration. | Candidate detection only; no trimming, timeline, transformation, or export. |
| 25 | TikTok Safe-Zone Overlay — `/tools/tiktok-safe-zone-overlay` | Local image preview | A local screenshot/frame and versioned placement preset show conservative obstruction areas and whether a draggable text box intersects them. | No burned-in text, edited-image export, storage, or permanent platform certification. |
| 26 | App Video Compression Estimator — `/tools/app-video-compression-estimator` | Calculator | Local facts or manual duration plus selected video/audio bitrates and upload speed produce output-size range, reduction range, bytes/minute, and transfer estimate. | No transcoding, compression, repair, upload, or file output. |
| 27 | Short-Form Video Specs Cheat Sheet — `/tools/short-form-video-specs-cheat-sheet` | Versioned collection | Filterable placement records expose ratio, dimensions, duration, container, codec, frame-rate, audio, practical notes, authoritative source, and last-verified date. | Reference only; no certification, validation, or normalization. |
| 28 | Clip Naming System Generator — `/tools/clip-naming-system-generator` | Generator | App, campaign, role, creator, concept, market, date, version, separator, and token order produce a sanitized convention, legend, and examples. | No file renaming, metadata persistence, asset library, or search. |
| 29 | App Raw Footage Intake Checklist — `/tools/app-raw-footage-intake-checklist` | Checklist builder | Deliverable selections create a copyable intake request covering delivery, handles, demo, audio, naming, consent evidence, usage details, deadlines, and handoff notes. | No file intake, storage, contracts, or rights verification. |
| 30 | App Creative Asset Inventory Template — `/tools/app-creative-asset-inventory-template` | Editable inventory | Ready, needs-work, missing, and rights-unknown counts across six asset types produce coverage, gaps, prioritized captures, Markdown, and CSV. | No persistent library, upload, search, transformation, or ad creation. |
| 33 | App-Ad Creative Fatigue Calculator — `/tools/app-ad-creative-fatigue-calculator` | Scenario calculator | Visitor-defined audience, impressions, active creative count, and frequency ceiling produce even-delivery impressions per creative, modeled frequency, and time to the visitor’s ceiling. | No fatigue or performance prediction, refresh recommendation, scheduling, or generation. |
| 37 | App-Ad Testing Budget Planner — `/tools/app-ad-testing-budget-planner` | Allocation calculator | Visitor budget and allocations split production/media reserves and test cells, comparing active cells with the visitor’s own minimum-evidence spend. | No spend advice, bidding, campaign launch, prediction, or production. |
| 38 | UGC Creator Rate Comparison Worksheet — `/tools/ugc-creator-rate-comparison-worksheet` | Quote comparison | Visitor-entered quotes normalize cost per deliverable and usable clip, show included rights/add-ons, and compare with the entered-set median. | No outside market benchmark, hiring, negotiation, contracts, or legal advice. |
| 39 | Client Content Capacity Calculator — `/tools/client-content-capacity-calculator` | Capacity calculator | Stage hours, productive-time percentage, time per deliverable, deliverables/client, and current clients expose the limiting stage, weekly output, client capacity, and utilization. | No staffing guarantee, assignments, bookings, project management, or production. |
| 40 | Short-Form Campaign Retrospective — `/tools/short-form-campaign-retrospective-template` | Worksheet | Objective, changes, evidence, observations, asset disposition, and lessons produce evidence, keep/stop/start, reusable-footage, and next-hypothesis sections. | No analytics import, attribution, persistent history, or production. |
| 41 | Personalized Short-Form Content Audit — `/tools/personalized-short-form-content-audit` | Diagnostic | A transparent 100-point self-audit returns five dimension scores, lost-point priorities, asset gaps, and a dependency-ordered fourteen-day plan. | No account/media inspection, asset storage, ads, or performance prediction. |
| 42 | Five-Day App Content Sprint — `/tools/five-day-app-content-sprint` | Guided sprint | Five full daily workspaces cover inventory, audience/problem/payoff, concepts, captures/handoff, and publishing/learning with local progress and one Markdown plan. | No promised email delivery, finished media, or scheduled posts. |
| 43 | UGC-to-App-Ad Mini-Course — `/tools/ugc-to-app-ad-mini-course` | Self-paced course | Five lessons each include explanation, example, exercise, answer rationale, completion check, and an accumulating campaign worksheet. | No creator sourcing, footage analysis, assembly, or export. |
| 44 | App Creative Testing System Workshop — `/tools/app-creative-testing-system-workshop` | Interactive workshop | A 45-minute-equivalent workshop creates a recurring-system charter for goals, variable hierarchy, roles, naming, evidence, review cadence, and asset flow. | No tests, performance ingestion, asset management, or creatives. |
| 45 | Short-Form Content System Notion-Ready Kit — `/tools/short-form-content-system-notion-kit` | Downloadable kit | Five valid importable CSV templates—Idea Bank, Shoot Planner, Asset Inventory, Publishing Calendar, Results Tracker—plus examples, property notes, and setup guide. | No Notion sync, duplicate-template integration, storage, publishing, or campaign management. |
| 46 | App Ad Teardown Library — `/tools/app-ad-teardown-library` | Filterable collection | At least twelve original educational pattern teardowns with category, stage, hook, opening, handoff, proof, pacing, CTA, reusable pattern, limitations, and source context. | No copied media, unsupported performance claims, downloads, or production. |
| 49 | Raw Clips to Campaign Planner — `/tools/raw-clips-to-campaign-planner` | Flagship planner | Named text-only asset inventory produces up to six diverse compatibility-scored concept cards, coverage, reuse counts, missing captures, and a production handoff. | No uploads, persistent library, stitching, rendering, or export. |
| 50 | ClipStitchr Savings Report — `/tools/clipstitchr-savings-report` | Scenario calculator | Current and modeled monthly workflow inputs expose time and cost differences, cost/creative, utilization, assumptions, and formulas using the shared numeric plan source. | No guaranteed savings, production, or performance promise. |

## Existing Portfolio Mappings

| Portfolio # | Existing catalog capability |
| --- | --- |
| 5 | App Ad Shot List Generator |
| 11 | App Hook Generator |
| 12 | Hook Strength Grader for App Ads |
| 13 | App Ad Hook Rewrite Tool |
| 15 | Hook-to-Visual Matchmaker for App Ads |
| 21 | 9:16 App Demo Video Checker |
| 23 | Product Demo Readiness Checker |
| 24 | App UGC Clip Readiness Checker |
| 31 | App Ad Creative Test Plan Generator |
| 32 | Ad Variant Calculator |
| 34 | App UGC Production Cost Calculator |
| 35 | App Ad Cost per Creative Calculator |
| 36 | App Ad Break-Even Calculator |
| 47 | UGC Ad Brief Builder for Apps |
| 48 | App Ad Creative Testing Blueprint Builder |

## High-Risk Implementation Notes

- Dead-space analysis must read the local Media Bunny guide and API before
  implementation, dispose every decoded sample, cap duration/sample count, and
  remain Yellow until representative real-file browser smokes exist.
- TikTok safe-zone presets and the cross-platform specs sheet require official
  source links and a visible last-verified date. “Safe” means conservative
  preview guidance, not guaranteed placement across every device or UI state.
- The quote comparison worksheet benchmarks only the visitor’s entered quotes.
  It must not imply maintained market-rate data.
- Teardowns use original hypothetical or clearly sourced public examples and
  never infer performance. Copyrighted ad copy, frames, or media are not copied.
- The 100-hook and 50-structure libraries must contain the promised number of
  meaningful records. Superficial cross-product permutations do not count.
- The Notion-ready kit is complete only when all five CSV files download and
  import as valid tabular data.
- The sprint, course, and workshop expose all promised material immediately;
  the mailing-list form does not pretend to deliver them.
- The campaign planner stays text-only and session-only. Accepting or retaining
  media would leak toward the paid asset library and production workflow.

## Test and Completion Contract

- Pure tests prove formulas, deterministic rules, content counts, claim guards,
  CSV escaping, Markdown output, filename sanitization, and edge cases.
- Page tests prove the route promise, functional UI, immediate result access,
  exact lead source, `/pricing` conversion, structured data, and discovery.
- Catalog tests prove fifty unique paths, keys, analytics identities, and
  portfolio numbers 1–50 with two valid related entries per capability.
- The quality-register test proves a candid row exists for every catalog item.
- Media utilities require mocked failure/cancellation/disposal tests plus
  separate representative browser-smoke evidence.
- Full TypeScript, ESLint, repository test, production build, route-count, and
  no-running-dev-server checks are required before completion.

## Decision Log

| Decision | Alternatives | Reason |
| --- | --- | --- |
| Interpret “remaining 35” through portfolio equivalence. | Build items numbered 16–50 or invent 35 more names. | The approved fifty-item portfolio is authoritative, and fifteen capabilities already map across its number ranges. |
| Keep the blank UGC template separate from the personalized builder. | Treat it as duplicate and ship only 34. | The user explicitly requested 35 remaining resources, and the immediate blank template serves a distinct quick-use job. |
| Keep one `/tools` catalog. | Add a parallel `/resources` catalog. | One source prevents drift across SEO, analytics, leads, and discovery. |
| Reuse four resource engines. | Clone complete page trees or make one monolithic renderer. | Focused reusable behavior preserves atomicity while keeping each resource’s content and logic distinct. |
| Rename “proven” structures and external “benchmark” claims. | Publish unsupported authority claims. | The deterministic library has no performance study or maintained market dataset. |
| Keep results available before email capture. | Gate downloads or results. | Standalone usefulness is the approved acquisition rule, and the current form cannot deliver files. |
| Defer AI, providers, Hook-library expansion, and platform sync. | Add them to all resources now. | Demand, privacy, cost, evaluation, and paid-boundary evidence must precede those integrations. |
