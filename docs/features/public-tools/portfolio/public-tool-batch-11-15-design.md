# Public Tool Batch 11–15 Design

## Understanding Lock

The approved Priority SEO Tool Candidates list contains fifteen tools. The
first ten are implemented, so “the rest of the tools” means priorities 11–15:

1. App Ad Cost per Creative Calculator
2. App Ad Break-Even Calculator
3. App Ad Shot List Generator
4. App UGC Clip Readiness Checker
5. App Ad Creative Testing Blueprint Builder

These tools remain focused on app founders and app marketers with smaller,
higher-intent searches. They must provide complete useful results before email
capture, lead naturally to a paid ClipStitchr account, and stop before asset
storage, media transformation, variant production, persistent campaign
tracking, or finished export.

The initial versions are deterministic. They do not silently add AI, provider
calls, the expansive Hook library, automated content analysis, or outside
benchmarks. Those are later refinement choices and require a new privacy,
abuse-cost, functional, value, and paid-boundary review.

## Assumptions and Non-Functional Requirements

- The tools should serve hundreds to low thousands of monthly visitors without
  provider or storage cost.
- Calculator and generator results are browser-local and deterministic.
- Video inspection is browser-local through the existing Media Bunny layer;
  files, filenames, and reports are never uploaded or placed in analytics.
- Financial tools use only visitor-entered USD assumptions and transparent
  arithmetic. They are planning aids, not forecasts or spend advice.
- Optional email capture remains separate from results and uses the shared,
  fixed-source, same-origin, rate-limited lead endpoint.
- Each tool receives its own route, atomic implementation, focused tests,
  feature document, and quality-register row.
- Real browser or deployed smokes are recorded separately from automated proof.
- All paid calls to action point to `/pricing`; no free product tier, trial, or
  finished export is promised.

## Considered Approaches

### Recommended: five focused deterministic tools

Build each priority as a narrow, transparent utility on the existing catalog
and page architecture. Reuse the local video inspector, shared form fields,
copy control, lead form, structured data, discovery links, and pricing CTA.
Create neutral number primitives for the two new calculators rather than
adding more feature-named formatting and normalization clones.

This is the fastest path to real searchable value while preserving the option
to refine formulas, add richer Hook material, or introduce AI after observing
which tools attract and convert qualified users.

### Rejected for this batch: AI-first generation

AI could make shot directions or blueprint hypotheses more varied, but it
would add cost, latency, privacy questions, abuse protection, and evaluation
work before the deterministic product promises have been validated. The user
will decide later which tools merit AI or the expansive Hook library.

### Rejected for this batch: downloadable template versions

Static downloads would be quicker, but these five candidates were prioritized
as searchable interactive tools. Immediate local results create stronger
intent signals and a clearer paid-production bridge without requiring email
gating or file-delivery infrastructure.

## Shared Architecture

The existing `publicToolCatalog` grows from ten to fifteen keys. The catalog
continues to drive the hub, sitemap, `llms.txt`, fixed TikTok identities,
related-tool links, and typed lead sources. The dynamic lead route accepts all
fifteen fixed keys and rejects unknown values before Convex.

New neutral numeric utilities own bounded whole-number normalization, bounded
decimal normalization, safe whole-target rounding, and USD formatting. A
shared number field and metric card may be introduced for the new calculators
when their behavior is genuinely identical; existing feature-specific fields
do not need a risky batch refactor merely to satisfy naming consistency.

The App UGC Clip Readiness Checker reuses the existing local Media Bunny
inspection and checker UI. A neutral video-review answer field may replace the
duplicated Yes/Not sure/No presentation in both readiness checkers, while each
domain keeps its own questions and scoring.

## 11. App Ad Cost per Creative Calculator

Canonical route: `/tools/app-ad-cost-per-creative-calculator`

### Promise and differentiation

The existing UGC Production Cost Calculator explains one detailed production
cycle. This calculator answers a narrower unit-economics question: how does
finishing more creatives from source footage already paid for change the
visitor's blended cost per publishable creative?

### Inputs

- Source-footage cost, editing/finishing cost, internal cost, and other
  allocated cost: USD `0–1,000,000` each.
- Current publishable creatives: whole number `0–10,000`.
- Additional creatives planned from the same assets: whole number `0–10,000`.
- Extra finishing cost for those additional creatives: USD `0–1,000,000`.

A publishable creative is one genuinely usable ad version, not duplicate
exports.

### Formulas

```text
currentTotal = source + editing + internal + other
currentUnit = currentCount > 0 ? currentTotal / currentCount : null
addedCost = additionalCount > 0 ? additionalFinishingCost : 0
projectedCount = currentCount + additionalCount
projectedTotal = currentTotal + addedCost
incrementalUnit = additionalCount > 0 ? addedCost / additionalCount : null
blendedUnit = projectedCount > 0 ? projectedTotal / projectedCount : null
dollarChange = currentUnit != null && blendedUnit != null
  ? currentUnit - blendedUnit
  : null
percentageChange = currentUnit > 0 ? dollarChange / currentUnit * 100 : null
referenceAtCurrentAverage = currentUnit != null
  ? currentUnit * projectedCount
  : null
differenceVersusCurrentAverage = referenceAtCurrentAverage != null
  ? referenceAtCurrentAverage - projectedTotal
  : null
```

Positive comparison values mean the entered scenario is lower than repeating
the visitor's own current average. Negative values are shown honestly as an
increase. The page never calls the result guaranteed ClipStitchr savings.

### Result and boundary

Show current total and unit cost, added unit cost, projected count and total,
blended unit cost, dollar/percentage change, and the difference from repeating
the current average. With no additional creatives, show a clear scenario
prompt instead of fake comparison values.

The tool exposes why reuse matters. It does not store footage, create the added
variants, or claim that ClipStitchr will achieve the entered cost.

### Expected quality record

- Functional proof: Green after automated formula/page verification.
- Standalone value: Useful.
- Paid boundary: Protected.
- Runtime proof: Automated.
- Known limitation: depends entirely on visitor-entered costs and scenario.
- Next refinement: validate whether founders understand “publishable creative”
  and the current-average comparison without assistance.

## 12. App Ad Break-Even Calculator

Canonical route: `/tools/app-ad-break-even-calculator`

### Inputs

- Planned media spend: USD `0–10,000,000`.
- Creative production cost: USD `0–1,000,000`.
- Revenue per paying customer: USD `0–1,000,000`.
- Contribution margin: `0–100%`.
- Install-to-paying-customer rate: `0–100%`.
- Revenue window: 30 days, 90 days, 12 months, or lifetime.

The selected window labels the assumptions and prevents a visitor from
mistaking a 90-day customer value for a lifetime value.

### Formulas

```text
marginRate = marginPercent / 100
paidRate = installToPaidPercent / 100
contributionPerCustomer = revenuePerCustomer * marginRate
totalInvestment = mediaSpend + creativeCost
minimumRevenue = totalInvestment === 0
  ? 0
  : marginRate > 0 ? totalInvestment / marginRate : null
breakEvenCustomers = totalInvestment === 0
  ? 0
  : contributionPerCustomer > 0
    ? safeCeil(totalInvestment / contributionPerCustomer)
    : null
breakEvenInstalls = breakEvenCustomers === 0
  ? 0
  : breakEvenCustomers != null && paidRate > 0
    ? safeCeil(breakEvenCustomers / paidRate)
    : null
maximumBlendedCac = contributionPerCustomer
maximumBlendedCpi = paidRate > 0
  ? contributionPerCustomer * paidRate
  : null
breakEvenMediaRoas = mediaSpend > 0 && minimumRevenue != null
  ? minimumRevenue / mediaSpend
  : null
creativeCostShare = totalInvestment > 0
  ? creativeCost / totalInvestment * 100
  : null
```

Whole-customer and install thresholds round upward. Non-finite or unsafe whole
targets return an explicit outside-range state, never Infinity.

### Result and boundary

Show total investment, contribution/customer, customer and install thresholds,
maximum blended CAC/CPI, minimum revenue, media ROAS needed to cover both
media and entered creative cost, cost split, and the selected revenue window.

The page states that this is arithmetic, not a forecast or spend
recommendation. It models only what the visitor enters and does not predict
conversion, attribution, retention, cash flow, taxes, refunds, or performance.
ClipStitchr produces test creatives; it does not manage media spend or
guarantee acquisition results.

### Expected quality record

- Functional proof: Green after automated formula/page verification.
- Standalone value: Strong.
- Paid boundary: Protected.
- Runtime proof: Automated.
- Known limitation: output quality depends on contribution-margin and
  conversion assumptions.
- Next refinement: test whether founders can supply the inputs accurately and
  whether the chosen revenue-window labels prevent misuse.

## 13. App Ad Shot List Generator

Canonical route: `/tools/app-ad-shot-list-generator`

### Promise and differentiation

The UGC Brief Builder defines an objective and aggregate deliverables. The Shot
List Generator operates closer to shoot day: it produces an individually
numbered, copyable capture list with framing, action, audio, duration, purpose,
and clean-handoff instructions for every source file.

### Inputs

- App name, audience, frustrating moment, product-demo moment, desired outcome,
  call to action, and optional approved proof.
- Creator style: direct-to-camera, reaction-and-b-roll, or mixed.
- Opening angle: audience-callout, problem-first, outcome-first, or demo-first.
- Opening count: 1, 3, or 5.

Blank required inputs show an incomplete state, never malformed live prose.

### Output rules

Each shot has a stable ID, group, source, title, duration range, framing,
action, audio direction, purpose, and handoff instruction. Create the requested
number of distinct opening captures, then one context, demo, outcome, and CTA
capture. Add one proof capture only when approved proof is supplied.

The product-demo shot starts from a clean before-state, shows one complete
action, and holds the visible result. UGC and demo remain separate files. Every
capture requests one beat per file, vertical framing, clean handles, and no
baked-in music, captions, watermark, transitions, or app interface inside the
UGC clip. The plan distinguishes requested files from the recommendation to
record two takes per file.

The tool provides capture direction, not a finished script, recorded media,
rendered storyboard, or final ad.

### Expected quality record

- Functional proof: Green after automated generation/page verification.
- Standalone value: Strong.
- Paid boundary: Protected.
- Runtime proof: Automated.
- Known limitation: deterministic directions cannot judge location, creator
  skill, or whether the selected concept is strategically strong.
- Next refinement: validate several generated lists on real app shoots before
  adding AI or Hook Lab material.

## 14. App UGC Clip Readiness Checker

Canonical route: `/tools/app-ugc-clip-readiness-checker`

### Promise and differentiation

This checker reviews one raw creator clip as reusable source material. The
Product Demo Checker reviews product-story clarity, while the 9:16 checker
reviews finished vertical compatibility. This tool focuses on performance
opening, crop-safe framing, intelligibility, clean handles, modularity,
baked-in treatment, and documented usage approval.

### Inputs

- One local video.
- Role: spoken hook, silent reaction, lifestyle b-roll, or spoken CTA.
- Seven Yes/Not sure/No self-review answers covering center-safe framing,
  first-second motion/expression, spoken clarity, clean handles, one reusable
  beat, no baked-in treatment, and documented usage approval. Spoken clarity
  is not applicable for silent roles.

### Automatic checks

- Browser playback: weight 15, critical.
- Role-aware audio: weight 10; spoken missing/undecodable audio is critical,
  while silent roles accept no audio and warn on removable existing audio.
- Resolution: weight 10; shorter edge 1080 passes, 720 warns, lower fails.
- 9:16 display shape: weight 5; other shapes warn but do not block because
  ClipStitchr can normalize and framing still needs human review.
- Role-aware duration: weight 5; spoken hook 2–10s, silent reaction 1–6s,
  lifestyle b-roll 2–8s, spoken CTA 2–8s.

Self-review weights are 10 critical for framing; 8 each for motion, spoken
clarity when applicable, clean handles, one reusable beat, and clean source;
and 5 critical for documented usage approval.

Critical failure or less than 60 is **Not ready to hand off**. A score of
60–79 without a critical failure is **Needs a quick fix**. A score of 80 or
more without a critical failure is **Ready to reuse**.

Show a local preview, role guidance, three prioritized fixes, passes, the full
checklist, technical facts, and a copyable report. The page must state which
facts are automatic and which require honest self-review. It does not claim
computer vision, transcription, rights verification, repair, normalization,
storage, stitching, or export.

### Expected quality record

- Functional proof: Yellow until representative real-file browser smokes.
- Standalone value: Strong.
- Paid boundary: Protected.
- Runtime proof: Automated initially.
- Known limitation: framing, motion, sound quality, baked-in treatment, and
  usage rights remain self-review rather than automatic detection.
- Next refinement: smoke representative raw UGC MP4, MOV, and WebM files and
  validate whether buyers apply the checklist consistently.

## 15. App Ad Creative Testing Blueprint Builder

Canonical route: `/tools/app-ad-creative-testing-blueprint-builder`

### Promise and differentiation

The existing Test Plan Generator answers which available variants to produce
first and how to schedule them. The Blueprint Builder defines what the team is
trying to learn, which hypothesis lanes to test, what remains constant, what
evidence controls the next decision, and which source assets are missing. It
must not repeat the existing three-wave schedule or Cartesian total.

### Inputs

- App name, audience, product outcome, main objection, optional approved proof.
- Testing objective: winning message, opening, product proof, conversion intent,
  or creative refresh.
- Campaign stage: new, learning, scaling, or refreshing.
- Primary metric, improvement direction, optional baseline and target.
- Available UGC openings, demos, proof assets, hooks, and CTAs.
- Weekly production capacity.
- Optional weekly budget, visitor-defined minimum spend per variant, and
  minimum conversion events before review.

### Output rules

Select and order three distinct hypothesis lanes from audience-message fit,
hook, visual opening, demo clarity, proof/objection, CTA, and refresh. Each lane
contains an if/then/because hypothesis, one variable to change, fixed controls,
one control direction, two challengers, signals, source requirements, and the
next learning action.

Each lane creates one control and two challenger cells, at most nine cells.
Active capacity is the lower of production capacity and, when both are
positive, `floor(weeklyBudget / visitorMinimumSpendPerVariant)`. Remaining
cells become visible backlog. Cell IDs are stable and prove that only one
variable changes inside a lane.

The measurement contract records the visitor's metric direction, optional
baseline/target, spend/event evidence floors, fair-comparison reminders, and
an explicit insufficient-evidence state. The decision rubric distinguishes
Hold, Promote, Iterate downstream, Retire, and Continue/isolate outcomes.

Aggregate source requirements across active lanes and calculate each asset gap
as `max(required - available, 0)`. Missing proof requests capture or
verification and never invents evidence. The copyable Markdown handoff includes
hypotheses, cells, constants, evidence rules, gaps, and decisions.

The tool does not persist a tracker, integrate with ad platforms, ingest
performance, automatically choose winners, produce media, or export ads.

### Expected quality record

- Functional proof: Green after deterministic engine/page verification.
- Standalone value: Strong if inputs materially change lanes and cells.
- Paid boundary: Protected.
- Runtime proof: Automated.
- Known limitation: strategy quality is pattern-based and evidence floors come
  from the visitor, not platform benchmarks.
- Next refinement: validate the blueprint with experienced app marketers before
  adding AI, performance ingestion, or a richer Hook source.

## Error Handling and Privacy

- Unsafe, negative, fractional, non-finite, and over-limit numbers normalize
  without NaN or Infinity.
- Zero denominators show missing-assumption guidance, not fabricated values.
- Required text inputs show an incomplete state instead of broken prose.
- Optional proof is never invented or strengthened.
- Copy failure does not hide the visible result.
- Video replacement cancels stale inspection, disposes Media Bunny input once,
  revokes the old preview URL, and resets self-review answers.
- Tool inputs and outputs remain out of URLs, persistence, backend requests,
  and analytics. Only a separate lead form submits name and email.

## Verification Strategy

Each pure engine receives boundary, invalid-input, determinism, and formatting
tests. Each page test covers canonical metadata, matching FAQ and
`WebApplication` structured data, exact lead source, related links, paid CTA,
useful visible output, and absence of free-tier, forecast, guarantee, repair,
or export promises.

Integration tests prove fifteen catalog entries, sitemap paths, `llms.txt`
paths, fixed analytics identities, lead-source validation, and dynamic route
allowlisting. Existing tool outputs must remain unchanged. Completion requires
full typecheck, ESLint, Vitest coverage, and production build. The readiness
checker remains Yellow in the quality register until real-file browser smokes
are recorded.

## Decision Log

| Decision | Alternatives considered | Reason |
| --- | --- | --- |
| Scope | Priorities 11–15 versus every remaining portfolio resource | The approved SEO candidate table has fifteen entries; the first ten are already implemented. |
| Quality record | Chat summary versus durable register | Future tools need the same candid proof and boundary fields. |
| Intelligence | Deterministic first versus AI/Hook-library integration now | The user wants to refine tools and choose richer intelligence later. |
| Cost-per-creative shape | Duplicate production-cost breakdown versus reuse scenario | The reuse scenario answers a different, product-proximate unit-cost question. |
| Break-even data | Outside benchmarks versus visitor assumptions | Transparent entered assumptions avoid stale or misleading financial claims. |
| Shot-list depth | Aggregate deliverables versus one card per source file | Individual capture instructions make the tool useful rather than a renamed brief. |
| Clip checker | Automatic content claims versus technical facts plus self-review | The current browser inspector cannot honestly verify motion, composition, speech, or rights. |
| Blueprint depth | Another three-wave schedule versus hypotheses and measurement contract | The new tool must complement rather than duplicate the Test Plan Generator. |
| Paid boundary | Free planning/diagnosis versus production/export | Making the workload visible creates demand; completing it would replace paid value. |
