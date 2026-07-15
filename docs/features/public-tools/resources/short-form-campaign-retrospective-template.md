# Short-Form Campaign Retrospective Template

## What It Does

`/tools/short-form-campaign-retrospective-template` turns visitor-entered
campaign context, tested changes, evidence, observations, and asset decisions
into a copyable keep/stop/start retrospective and next-cycle hypothesis.

## Implementation

`campaignRetrospectiveDefinition.ts` owns five focused sections covering scope,
evidence, learning, decisions, and the next cycle. The shared guided-resource
workspace tracks completion, accepts private notes, and creates Markdown for
copy or local download. Campaign data never leaves the browser.

## Use Cases and Boundary

- Close a creative test without losing reusable footage or open questions.
- Record evidence limitations before declaring a winner.
- Give the next testing cycle one smaller hypothesis.

The worksheet does not connect to ad platforms, import analytics, attribute
results, preserve campaign history, or produce creative. It is distinct from
the blueprint builder because it reviews completed work rather than planning
future test cells.

## File Tree

```text
web/app/(content)/tools/short-form-campaign-retrospective-template/page.tsx
web/lib/clipstitchr/tools/campaignRetrospective/campaignRetrospectiveDefinition.ts
```

See `docs/features/public-tools/portfolio/public-tool-quality-register.md` for candid release status.
