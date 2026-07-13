# App Ad Creative Testing Blueprint Builder

## Overview

The public tool at
`/tools/app-ad-creative-testing-blueprint-builder` turns an app marketer's
testing objective, campaign stage, evidence rules, source inventory, and
production capacity into a copyable creative-learning blueprint.

The Blueprint Builder is intentionally different from the existing App Ad
Creative Test Plan Generator. The Test Plan Generator schedules available
variants through three production waves. This tool works one step earlier: it
defines what the team needs to learn, which single variable each cell changes,
what stays fixed, what counts as enough evidence, and which source assets are
missing. It does not repeat the three-wave schedule or calculate a Cartesian
variant total.

## Inputs

The visitor provides:

- App name, audience, product outcome, and main objection.
- Optional approved proof. Empty proof is treated as unavailable rather than
  invented or strengthened.
- A testing objective: winning message, opening, product proof, conversion
  intent, or creative refresh.
- A campaign stage: new, learning, scaling, or refreshing.
- A primary metric, improvement direction, and optional baseline and target.
- Available UGC openings, product demos, approved proof assets, hook
  directions, and calls to action.
- Weekly production capacity.
- Optional weekly budget, visitor-defined minimum spend per cell, and
  visitor-defined minimum conversion events before review.

Required text is validated before prose is assembled. Clearing the app,
audience, outcome, objection, or metric shows a clear incomplete state rather
than broken live sentences.

## Hypothesis Lanes

The testing objective selects three distinct lanes from:

- Audience-message fit
- Hook direction
- Visual opening
- Product-demo clarity
- Proof and objection
- Call to action
- Creative refresh

Campaign stage changes their order without changing the chosen objective's
learning set. Each lane contains a learning question, an if/then/because
hypothesis, one variable to change, three fixed controls, one control
direction, two challenger directions, a leading signal, the visitor's primary
signal, and the next learning action.

All writing is deterministic and browser-local. It uses the visitor's context
with claim-safe curated directions. No AI model, Hook provider, server API, or
outside benchmark is involved.

## Active and Backlog Cells

Each lane produces one control and two challengers, for nine stable cells. The
active capacity is the lower of:

1. The visitor's weekly production capacity, capped at nine blueprint cells.
2. When weekly budget and minimum spend are both positive,
   `floor(weekly budget / visitor minimum spend per cell)`.

The capacity allocator activates useful control/challenger pairs before adding
third cells. Cells that do not fit remain visible as backlog. A capacity below
two displays a clear warning that it cannot support a useful comparison.

Budget math uses the visitor's own evidence floor. It is not a media-spend
recommendation, benchmark, forecast, or statistical-significance claim.

## Measurement and Decisions

The measurement contract records:

- The visitor's primary metric and whether higher or lower is better.
- Optional baseline and target.
- Optional visitor-defined spend and event floors.
- An explicit insufficient-evidence message.
- Fair-comparison reminders covering window, delivery opportunity, fixed
  controls, and learning capture.

The five-outcome decision rubric distinguishes:

- **Hold:** the evidence floor has not been reached.
- **Promote:** the visitor's target or improvement direction is met after fair
  opportunity.
- **Iterate downstream:** the leading signal improves but the primary metric
  does not.
- **Retire:** both leading and primary signals worsen after comparable
  opportunity.
- **Continue or isolate:** evidence is mixed, flat, or more than one variable
  changed.

The tool never ingests performance, chooses a winner, or runs an ad campaign.

## Asset Gaps

The blueprint derives source requirements from active cells. Fixed source
assets may be reused across lanes, so global requirements use the highest
lane-level need instead of counting the same control asset repeatedly. Each
gap is:

```text
max(required - available, 0)
```

When a proof lane is active but approved proof text is blank, proof availability
is treated as zero even if the visitor entered a proof-asset count. The result
asks the team to capture or verify proof and never invents evidence.

## Copyable Handoff and Paid Boundary

The visitor can copy a Markdown handoff containing the context, hypotheses,
all active and backlog cells, fixed controls, evidence rules, asset gaps, and
decision rubric. This is a planning document, not a persistent tracker.

The useful result appears before mailing-list capture. The fixed lead source is
`app-ad-creative-testing-blueprint-builder`. The paid call to action points to
`/pricing` and explains that ClipStitchr keeps Hook/UGC clips and product demos
reusable while producing focused finished ads.

The free tool does not:

- Upload, store, transform, stitch, or export media.
- Produce any of the planned creative cells.
- Persist testing state or campaign results.
- Integrate with an ad platform.
- Supply outside benchmarks or predict performance.
- Offer a free ClipStitchr account or trial.

## Privacy and Abuse Surface

Blueprint generation happens entirely in React and pure TypeScript. Product
context, metrics, costs, inventory, and output do not enter URLs, analytics,
Convex, R2, or a provider. The tool adds no production backend operation or
provider cost. Only the existing optional mailing-list form reaches the shared,
same-origin, rate-limited lead endpoint.

## File Tree

```text
web/app/(content)/tools/app-ad-creative-testing-blueprint-builder/page.tsx
web/app/_components/tools/app-ad-creative-testing-blueprint-builder/
web/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/
docs/features/app-ad-creative-testing-blueprint-builder.md
```

Every component, type, function, option set, and constant lives in its own
focused file under those feature directories.

## Verification

Pure tests cover objective-specific lanes, stage ordering, one-variable cells,
determinism, production and funded capacity, active/backlog allocation,
visitor-defined evidence floors, proof safety, asset gaps, incomplete required
text, unsafe numeric input, and complete Markdown output.

The page test covers canonical metadata, focused keywords, matching
`WebApplication` and `FAQPage` structured data, visible hypotheses, cells,
measurement contract, asset gaps, decision rubric, copy control, exact lead
source, related tools, paid pricing link, and the absence of free-tier or
guaranteed-performance language.

## Quality Record and Source References

- **Functional proof:** Green after deterministic engine, page, TypeScript,
  and focused lint verification.
- **Standalone value:** Strong when the visitor supplies a real objective,
  evidence rule, and source inventory.
- **Paid boundary:** Protected. Strategy and preparation are free; media
  storage, variant production, persistent workflow, and finished exports stay
  paid.
- **Runtime proof:** Automated. No browser-only media or provider dependency is
  part of this tool.
- **Known limitation:** The strategy is pattern-based, and evidence floors come
  from the visitor rather than a platform benchmark.
- **Next refinement:** Validate lane language and decision rules with
  experienced app marketers before considering AI or performance ingestion.
- The [Public Tool Quality Register](./public-tool-quality-register.md) records
  this same candid assessment alongside every public tool.
- `docs/features/public-tool-batch-11-15-design.md` defines the accepted tool
  contract and differentiation from the Test Plan Generator.
- `docs/features/app-ad-test-plan-generator.md` documents the downstream weekly
  scheduling tool.
- `project-scope.md` defines ClipStitchr's reusable Hook/UGC, demo, batch, and
  paid production workflow.
