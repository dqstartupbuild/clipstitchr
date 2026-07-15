# Public Tool Quality Register

## Purpose

This register is the candid internal record for ClipStitchr's public acquisition
tools. It separates three questions that must not be collapsed into one green
build check:

1. **Functional proof:** Does the implementation work, including its real
   runtime dependencies and failure paths?
2. **Standalone value:** Does the visitor receive a result that is genuinely
   useful for app marketing, rather than thin SEO filler?
3. **Paid boundary:** Does the tool create demand for ClipStitchr without doing
   the product's core production job for free?

Every new public tool must be added here in the same change as its route and
feature document. Ratings are internal release guidance, not claims shown to
visitors. A tool may ship with a known limitation while the portfolio is being
validated, but the limitation and the next refinement must remain explicit.

## Rating Definitions

### Functional proof

- **Green:** Pure logic, page behavior, error behavior, and relevant runtime
  integration are covered by authoritative tests or a representative smoke.
- **Yellow:** The implementation and automated tests pass, but a deployed,
  browser, media-fixture, or important edge-case smoke is still missing.
- **Red:** A normal visitor path is broken, misleading, or unimplemented.

### Standalone value

- **Strong:** Produces a concrete, actionable result that can save meaningful
  planning, review, or production-preparation work.
- **Useful:** Solves the named problem, but the result is intentionally light,
  heuristic, or dependent on accurate visitor inputs.
- **Needs correction:** The page works mechanically, but the result does not
  yet fulfill the promise made by the tool's name or copy.

### Paid boundary

- **Protected:** Diagnoses, checks, calculates, or prepares work without
  storing assets, transforming media, producing finished ads, or replacing the
  paid workspace.
- **Watch:** Approaches a paid capability closely enough that future expansion
  needs an explicit boundary review.
- **Leaking:** Completes a core paid production job and must not ship in its
  current form.

### Runtime proof

- **Automated:** Unit, component, route, and build evidence only.
- **Browser-smoked:** Representative user interactions and local browser APIs
  were exercised in a real browser.
- **Deployed-smoked:** The production-shaped route, environment, and external
  services were exercised successfully.

## Hybrid Gate And Email Runtime Status

The fixed fifty-tool catalog now has one typed gate contract per tool, one
strict rollout parser, a stable opaque visitor assignment, browser-local unlock
state, bounded recognized-interaction tracking, canonical Convex contact and
consent records, a durable email outbox, an app-owned confirmation route, and a
thin adapter over the official `loops` JavaScript SDK.

This foundation is automated-test evidence, not deployed-provider proof. The
safe default for all fifty tools is still `control`. A tool can receive
`hybrid-v1` only when its exact catalog key appears in a valid
`PUBLIC_TOOL_GATE_ROLLOUT` JSON object and its stable allocation bucket is below
the configured integer percentage. Invalid JSON, extra keys, duplicate or
unknown tools, unsupported variants, out-of-range percentages, missing visitor
keys, and a missing confirmation signing secret fail back to control.

The three email-native experiences have an additional provider-readiness
boundary. They cannot leave control until confirmation, contact properties,
signed webhooks, marketing Workflows, and the dedicated email-native flag are
all ready. Loops dashboard double opt-in is disabled, but ClipStitchr still
requires its own forty-eight-hour, single-use confirmation because API-created
contacts do not receive that form-only protection.

No development or production Loops properties, templates, Workflows, webhook,
sending-domain setup, deployment, or live email send was performed in this
implementation change. Until the separate development-team smoke in
`docs/backend/public-tool-email-rollout-runbook.md` succeeds, keep every row's
runtime proof rating based on its tool implementation only; do not infer email
or deployed gate proof from a passing build.

## Current Register

| # | Tool | Functional proof | Standalone value | Paid boundary | Runtime proof | Optional intelligence | Known limitation | Next refinement |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | App Hook Generator | Yellow | Useful | Protected | Automated | A larger reviewed Hook library or AI may improve variety after the deployed path is proven. | Eight claim-reviewed hooks work through the server route, but live success depends on deployed Convex rate limiting, `NEXT_PUBLIC_CONVEX_URL`, and `RATE_LIMIT_API_SECRET`. Curated fills can sound formulaic. | Run a deployed same-origin smoke and refine awkward template/filler combinations from real usage. |
| 2 | Ad Variant Calculator | Green | Useful | Protected | Automated | None needed; this tool is transparent arithmetic. | The combination math and phased plan are correct but intentionally simple; they do not model spend, delivery, or sample requirements. | Keep the simple promise and refine only when user behavior shows a missing planning input. |
| 3 | Product Demo Readiness Checker | Yellow | Strong | Protected | Automated | Computer vision could later inspect content, but only after real-file browser proof and a new privacy/cost review. | Media Bunny and checklist paths are covered with mocked media inputs, not representative MP4, MOV, and WebM browser fixtures. | Run real-file browser smokes and record browser/file coverage. |
| 4 | Hook Strength Grader for App Ads | Green | Useful | Protected | Automated | AI or the Hook library may improve semantic review after scores are calibrated against human ratings. | The transparent craft score uses token and keyword heuristics that can be gamed and must not be read as a performance prediction. | Calibrate dimensions against human-rated hooks before changing the score or adding AI. |
| 5 | UGC Ad Brief Builder for Apps | Yellow | Strong | Protected | Automated | AI could tailor directions, but the deterministic brief is already substantial; validate demand first. | The copyable brief is substantial, but clearing prefilled required text can produce incomplete sentences because the live result is not gated. | Add a clear incomplete-input state while preserving the last valid brief or guiding the missing field. |
| 6 | App Ad Hook Rewrite Tool | Green | Strong | Protected | Automated | A richer Hook pattern library or AI may deepen semantic rewriting after the deterministic source-preservation behavior is validated with marketers. | The engine preserves a bounded safe core and removes a small reviewed set of vague endings; it cannot understand every nuance, and intentionally replaces risky claim-bearing source language with the app name. | Compare the six directions with human rewrites across varied app categories and expand only the vague-ending rules that repeatedly miss. |
| 7 | 9:16 App Demo Video Checker | Yellow | Strong | Protected | Automated | None needed for technical metadata checks. | Technical inspection and fixes are substantive, but real-file, real-browser coverage has not been recorded. | Smoke representative MP4, MOV, and WebM files across supported browsers. |
| 8 | App Ad Creative Test Plan Generator | Green | Strong | Protected | Automated | AI may tailor sequencing later, but deterministic asset-aware planning should be validated first. | The three-wave schedule is actionable, but blank prefilled text can make its live hypothesis awkward. Budget allocation is arithmetic, not a spend recommendation. | Add incomplete-input handling and validate the testing sequence with app marketers. |
| 9 | Hook-to-Visual Matchmaker for App Ads | Green | Useful | Protected | Automated | A richer pattern library, media inspection, or AI could deepen matching after users validate the described-footage workflow. | It creates a practical five-second storyboard from descriptions but does not inspect footage, so some directions remain generic. | Refine its pattern library from user-selected winning plans before considering media or AI analysis. |
| 10 | App UGC Production Cost Calculator | Green | Strong | Protected | Automated | None needed; formula transparency is the value. | Results depend entirely on visitor-entered cost and unused-footage assumptions; it intentionally provides no market benchmark. | Preserve transparent formulas and learn which missing cost categories users request. |
| 11 | App Ad Cost per Creative Calculator | Green | Useful | Protected | Automated | None needed; the reuse scenario is transparent arithmetic. | The comparison depends entirely on visitor-entered allocated costs and assumes each counted output is genuinely publishable. | Validate whether founders understand “publishable creative” and the current-average comparison without assistance. |
| 12 | App Ad Break-Even Calculator | Green | Strong | Protected | Automated | None needed; outside intelligence would make the entered-assumption arithmetic less transparent. | Output quality depends on contribution-margin, conversion-rate, and revenue-window assumptions and is not a forecast. | Test whether founders can supply the inputs accurately and whether revenue-window labels prevent misuse. |
| 13 | App Ad Shot List Generator | Green | Strong | Protected | Automated | AI or the Hook library may later tailor capture directions after several deterministic lists are used on real shoots. | Pattern-based directions cannot judge location, creator skill, performance quality, or whether the chosen concept is strategically strong. | Validate generated lists on several real app shoots before adding richer intelligence. |
| 14 | App UGC Clip Readiness Checker | Yellow | Strong | Protected | Automated | Computer vision, transcription, or audio analysis could deepen checks only after browser proof and a new privacy/cost review. | Media Bunny verifies technical facts; framing, motion, sound quality, baked-in treatment, and usage approval remain honest self-review. | Smoke representative raw UGC MP4, MOV, and WebM files and validate whether buyers apply the checklist consistently. |
| 15 | App Ad Creative Testing Blueprint Builder | Green | Strong | Protected | Automated | AI or a richer Hook source may tailor hypotheses after experienced marketers validate the deterministic lanes and evidence contract. | Strategy is pattern-based, and budget/event evidence floors come from the visitor rather than a benchmark or performance feed. | Validate blueprints with experienced app marketers before adding AI, performance ingestion, or richer Hook material. |
| 16 | 30-Day Short-Form Content Plan for App Founders | Green | Strong | Protected | Automated | AI could tailor sequencing later, but the asset-aware deterministic plan should be tested with founders first. | The plan uses fixed content pillars and visitor-described asset availability; it cannot know the actual quality or readiness of those assets. | Run several real founder planning sessions and refine repetitive or unrealistic action sequences. |
| 17 | 100 Hooks for App Demo Videos | Green | Strong | Protected | Automated | The expansive Hook library may deepen future filtering after usage shows which angles earn saves and clicks. | The 100 entries are fixed educational examples and still require adaptation to the visitor's true audience, product action, and proof. | Review search, filter, and copy behavior to prioritize the most useful angles before expanding the library. |
| 18 | App UGC Ad Brief Template | Green | Useful | Protected | Automated | AI is unnecessary for the blank template; visitors who need tailoring already have the separate brief builder. | A static template cannot catch contradictory instructions or verify that claims, rights, deadlines, and deliverables are complete. | Validate the blank and completed examples with creators and buyers before adding more fields. |
| 19 | Product Demo Recording Checklist | Green | Strong | Protected | Automated | Device-aware capture guidance could expand later without requiring AI. | Completion is self-reported, and the checklist cannot inspect privacy, readability, gestures, or payoff before recording. | Test the checklist across iOS, Android, desktop, and simulator capture workflows. |
| 20 | TikTok and Reels Creative Testing Tracker | Green | Strong | Protected | Automated | Platform ingestion could reduce manual entry later, but only after a privacy, authorization, attribution, and abuse review. | Session-local rows depend on accurate manual metrics and do not resolve attribution or inconsistent reporting windows. | Validate denominator warnings and exported columns with marketers using real campaign reports. |
| 21 | UGC Creator Handoff Kit | Green | Strong | Protected | Automated | AI is unnecessary; future value should come from validated handoff language and optional reusable team defaults. | The kit requests usage and delivery facts but cannot verify rights, file completeness, creator agreement, or reshoot acceptance. | Run the kit through several creator handoffs and refine the messages that prevent the most rework. |
| 22 | What Should I Post? Decision Tree | Green | Useful | Protected | Automated | AI could create more prompts later, but the rule table must first prove that its primary recommendation is consistently relevant. | Five self-reported inputs simplify product maturity, audience context, channel differences, and source quality. | Compare recommendations with experienced app marketers and refine ambiguous branches. |
| 23 | App Marketing Content Calendar | Green | Strong | Protected | Automated | Calendar or publishing integrations may help later only after an authorization and paid-boundary review. | Generated slots do not know holidays, team availability, production delays, or whether the planned assets are actually ready. | Validate CSV imports and date/cadence behavior across month boundaries and real campaign dates. |
| 24 | Short-Form Ad Preflight Checklist | Green | Strong | Protected | Automated | Media inspection could automate a few technical checks later, but rights, proof, clarity, and destination fit remain human decisions. | Self-review can miss unreadable text, inaudible words, unsupported claims, rights problems, or destination mismatch. | Compare checklist results with independent human reviews before changing must-pass items. |
| 25 | 50 App-Ad Hook Structures | Green | Strong | Protected | Automated | The expansive Hook library could add category depth after visitors show which frameworks they use. | Structures are craft frameworks, not proven performance claims, and examples still need truthful product-specific adaptation. | Review copied frameworks and human-rated outputs before adding more structures. |
| 26 | UGC Opening-Line Prompt Cards | Green | Useful | Protected | Automated | A Hook library or AI may tailor delivery prompts later after creators validate the finite cards. | The cards cannot hear performance, judge authenticity, or know whether the creator can support the implied proof. | Test the cards in real recording sessions and refine directions that produce awkward takes. |
| 27 | App Category Hook Packs | Green | Strong | Protected | Automated | The expansive Hook library is the natural future source after the six launch categories are validated. | Six fixed categories cannot cover every app, regional claim rule, audience nuance, or product maturity stage. | Measure category demand and add packs only where visitors cannot adapt the general structures. |
| 28 | Competitor Hook Research Worksheet | Green | Strong | Protected | Automated | Optional transcription or import could reduce manual work later but would require copyright, privacy, provider-cost, and abuse review. | Manual research is slower and the synthesis can only identify patterns in the examples the visitor enters. | Validate whether the evidence-versus-inference split changes how founders use competitor research. |
| 29 | App Hook Testing Matrix | Green | Strong | Protected | Automated | Performance ingestion could connect plans to results later after authorization and attribution rules exist. | The matrix assumes the visitor can hold non-hook variables stable and does not choose spend, audience, or evidence floors. | Review matrices against actual launch setups for accidental multi-variable changes. |
| 30 | Why Did This Ad Work? Breakdown Template | Green | Strong | Protected | Automated | Media import or transcription may help later, but careful manual observation is the initial value. | The worksheet cannot prove causation; visitors can still write confident inferences without sufficient performance evidence. | Compare completed worksheets with expert reviews and refine prompts that fail to separate fact from explanation. |
| 31 | App-Ad Dead-Space Finder | Yellow | Strong | Protected | Automated | Speech recognition or scene understanding could reduce false positives later only after local browser proof, privacy, and cost review. | Sparse audio RMS and frame-luma sampling cannot understand speech, story, music, intentional pauses, or whether a listed span should be cut. | Smoke representative MP4, MOV, and WebM files in real browsers and calibrate thresholds against human-reviewed spans. |
| 32 | TikTok Safe-Zone Overlay | Yellow | Useful | Protected | Automated | Computer vision is unnecessary; source maintenance and real browser interaction proof matter more. | The overlay is a conservative dated approximation, while TikTok obstruction zones vary by device, caption, language direction, placement, and interactive add-ons. | Browser-smoke image loading and dragging, then compare the preset with TikTok's current downloadable overlays and in-platform preview. |
| 33 | App Video Compression Estimator | Yellow | Useful | Protected | Automated | None needed; accurate local facts and transparent bitrate arithmetic are the intended value. | Variable bitrate, codec efficiency, container overhead, encoder behavior, and network conditions make output size and transfer time ranges approximate. | Browser-smoke representative local files and compare estimates with several real encodes without adding free transcoding. |
| 34 | Short-Form Video Specs Cheat Sheet | Green | Useful | Protected | Automated | None needed; official-source maintenance is more valuable than generated guidance. | Platform formats, placement limits, UI, and recommendations change; a dated reference can become stale. | Re-verify all official sources on a scheduled cadence and whenever platform upload behavior changes. |
| 35 | Clip Naming System Generator | Green | Strong | Protected | Automated | AI is unnecessary; future improvements should be additional validated token presets and team examples. | A generated convention cannot rename files, repair inconsistent historical names, or enforce adoption across a team. | Validate filename safety on major operating systems and test whether teams understand every token without assistance. |
| 36 | App Raw Footage Intake Checklist | Green | Strong | Protected | Automated | AI is unnecessary; future tailoring should come from real delivery failures and reusable team defaults. | The checklist requests consent and usage documentation but cannot determine legal sufficiency, ownership, authenticity, or file completeness. | Review actual intake packages and refine the questions that catch missing sources before production. |
| 37 | App Creative Asset Inventory Template | Green | Strong | Protected | Automated | Media inspection or persistent inventory would approach the paid workspace and requires a new boundary review. | Counts are self-reported and do not prove technical readiness, creative quality, or documented rights for individual assets. | Validate gap severity and dependency ordering with several real app asset libraries. |
| 38 | App-Ad Creative Fatigue Calculator | Green | Useful | Protected | Automated | Performance ingestion could add real exposure evidence later, but the current scenario should remain transparent. | Even-delivery arithmetic cannot predict fatigue, auction delivery, declining performance, audience overlap, or when creative should refresh. | Test whether visitors understand that the frequency ceiling is their assumption rather than a benchmark. |
| 39 | App-Ad Creative Testing Budget Planner | Green | Strong | Protected | Automated | Platform integration is unnecessary until teams validate the allocation and evidence-floor model. | The planner allocates visitor-entered amounts but does not recommend spend, model auction delivery, or guarantee enough evidence for a decision. | Validate allocation states with marketers and refine how active cells and backlog are explained. |
| 40 | UGC Creator Rate Comparison Worksheet | Green | Strong | Protected | Automated | Maintained market data could be considered later only with reliable sources, update ownership, legal review, and explicit methodology. | It benchmarks only the visitor's entered quotes; quote scope, creator quality, rights, taxes, and negotiation terms may not be directly comparable. | Test the comparison with real multi-quote buying decisions and refine incomparable-term warnings. |
| 41 | Client Content Capacity Calculator | Green | Strong | Protected | Automated | None needed; transparent stage-capacity arithmetic is the value. | Results depend on time estimates and even work assumptions and do not account for context switching, absence, rework variance, or demand volatility. | Compare modeled bottlenecks with several weeks of actual stage time before adjusting the formulas. |
| 42 | Short-Form Campaign Retrospective Template | Green | Strong | Protected | Automated | Analytics import could reduce manual entry later after authorization, privacy, and attribution review. | Manual evidence can be incomplete or inconsistent, and the worksheet cannot determine causation or enforce decisions. | Run several campaign reviews and refine prompts that produce vague keep, stop, or start decisions. |
| 43 | Personalized Short-Form Content Audit | Green | Strong | Protected | Automated | Account or media analysis could deepen the audit later only after self-assessment proves useful and privacy/cost boundaries are reviewed. | The 100-point result is transparent but self-reported and is not an inspection of accounts, assets, publishing history, or performance. | Compare self-scores with expert audits and recalibrate questions that consistently overstate readiness. |
| 44 | Five-Day App Content Sprint | Green | Strong | Protected | Automated | AI may tailor concept prompts later, but the complete deterministic sprint should be validated first. | App-owned progress can continue across devices, but the sprint cannot judge source quality or guarantee five publishable ideas. | Observe founders completing all five days and refine the tasks where progress stalls. |
| 45 | UGC-to-App-Ad Mini-Course | Green | Strong | Protected | Automated | The expansive Hook library or media examples may enrich later lessons after completion behavior is known. | Five self-paced text lessons cannot review the visitor's footage, exercise quality, understanding, or implementation. | Test lesson comprehension and exercise completion with first-time app advertisers. |
| 46 | Build Your First Creative Testing System Workshop | Green | Strong | Protected | Automated | AI facilitation may help larger teams later, but the operating-charter contract must be validated first. | A self-guided charter cannot resolve team disagreement, enforce roles, connect tools, or confirm that evidence rules are statistically appropriate. | Facilitate the workshop with several small teams and refine ambiguous ownership and evidence prompts. |
| 47 | Short-Form Content System Notion-Ready Kit | Green | Strong | Protected | Automated | A live Notion integration is optional later and would require OAuth, storage, privacy, and abuse review. | The five CSV files require manual import, property conversion, and optional relation setup and do not synchronize afterward. | Smoke all five imports in current Notion and common spreadsheet tools and refine property instructions. |
| 48 | App Ad Teardown Library | Green | Strong | Protected | Automated | AI is unnecessary at launch; future value depends on careful original analysis and rights-reviewed sourcing. | Launch records are synthetic teaching examples with no real performance evidence, so they demonstrate structure rather than proven winners. | Add only rights-reviewed or original teardowns with explicit source context and no unsupported performance claims. |
| 49 | Raw Clips to Campaign Planner | Green | Strong | Protected | Automated | Media inspection or richer Hook material may improve matching later only after the text-only planner's value and paid boundary are validated. | Compatibility is based on visitor descriptions, not the actual footage, claim evidence, pacing, technical readiness, or rights. | Compare generated plans with expert handoffs built from the same asset descriptions and refine weak pairings. |
| 50 | Interactive ClipStitchr Savings Report | Green | Useful | Protected | Automated | None needed; visitor-entered formulas and the shared pricing source are the intended value. | Modeled hours, output, utilization, plan choice, and costs are scenarios—not guaranteed savings or a promise that every workflow transfers unchanged. | Validate whether visitors supply realistic current and modeled assumptions and understand negative savings honestly. |

## Evidence Baseline for Tools 1–10

- Full repository verification passed with 594 test files and 1,954 tests.
- TypeScript and ESLint passed.
- The production build prerendered all ten public tool routes.
- Feature-level pure and page tests live beside each implementation under
  `web/lib/clipstitchr/tools/` and `web/app/_components/tools/`.
- The build evidence proves code integration. It does not replace the missing
  deployed or representative browser smokes recorded above.

## Evidence Baseline for Tools 11–15

- A focused integration run passed 23 test files and 98 tests across the five
  new engines and pages, the shared catalog and quality-register contract,
  lead capture, discovery, analytics, sitemap, and related-tool links.
- The full repository test and coverage command passed.
- TypeScript and ESLint passed.
- The production build generated 150 static pages and emitted the `/tools` hub
  plus all fifteen public tool routes.
- The three Green tools in this batch have complete automated proof for their
  deterministic browser-local paths. The UGC Clip Readiness Checker remains
  Yellow because a passing build and mocked inspection coverage do not replace
  representative real-file browser smokes.

## Evidence Baseline for Tools 16–50

- The catalog, route, documentation, related-link, lead-source, analytics, and
  quality-register contract tests cover all fifty stable tool identities.
- Every catalog entry has its own public route and dedicated feature document.
- Full repository verification passed with 676 test files and 2,201 tests.
- TypeScript and ESLint passed after the complete fifty-tool integration.
- The production build generated 185 static pages and emitted the `/tools` hub
  plus all fifty public tool routes.
- All thirty-five tools in this batch have a Protected paid boundary: they
  diagnose, teach, estimate, plan, or prepare an artifact without rendering a
  finished ad, transforming source footage, or creating a free product tier.
- The Dead-Space Finder, TikTok Safe-Zone Overlay, and Video Compression
  Estimator remain Yellow because automated coverage is not a substitute for
  representative real-file and browser-interaction smokes. Their limitations
  are visible in their feature documents and rows above.
- The Short-Form Video Specs Cheat Sheet uses dated, official-source links and
  must be re-verified as platform requirements change.

## Required Record for Every New Tool

Before a new tool is considered complete, add one row containing:

- Stable tool name and catalog key.
- Functional rating and the strongest evidence supporting it.
- Standalone-value rating and the concrete result delivered.
- Paid-boundary rating and the paid job that remains unfulfilled.
- Runtime proof level.
- Whether AI, the expansive Hook library, or deeper media analysis would
  materially improve the tool later, including any prerequisite proof.
- Known limitation stated without marketing language.
- One next refinement that can be accepted, rejected, or expanded later.

The feature document must also explain the free-versus-paid boundary and link
back to this register. Adding AI, the expansive hook library, media analysis,
or provider calls later requires a fresh functional, abuse-cost, privacy, and
paid-boundary review; none is assumed by the initial deterministic version.
