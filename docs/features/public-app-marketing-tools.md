# Public App Marketing Tools

## Overview

The public `/tools` library gives app founders and app marketers one place to
find all fifty approved ClipStitchr acquisition resources. The library spans:

- Planning systems, calendars, sprints, workshops, and decision tools.
- One hundred hook examples, fifty structures, category packs, prompt cards,
  rewriting, grading, visual matching, and testing worksheets.
- Creator briefs, handoff kits, recording and intake checklists, shot lists,
  naming, asset inventory, and raw-clips campaign planning.
- Browser-local demo, UGC, 9:16, dead-space, safe-zone, and compression tools,
  plus a dated short-form specification reference.
- Creative economics, quote comparison, capacity, exposure, budget,
  break-even, cost, savings, tracker, retrospective, and audit tools.
- A Notion-ready CSV kit, mini-course, and original educational teardown
  library.

The tools are free acquisition resources, not a free ClipStitchr product plan.
Every product call to action points to `/pricing`, and the mailing-list copy
states that joining does not create an account.

## Discovery and SEO Shape

`/tools` is an indexable hub with its own canonical metadata. Each tool page
also has canonical, Open Graph, and Twitter metadata; visible FAQ content that
matches its `FAQPage` structured data; and `WebApplication` structured data.

One typed catalog owns the fifty stable tool keys, portfolio numbers, formats,
categories, paths, index summaries, keywords, related tools, sitemap values,
icons, and fixed TikTok identities.
The hub renders every catalog entry. Each tool page links back to the hub and
to two related tools through `ToolDiscoveryLinks`. The public header and footer
also link to `/tools`, and all fifty-one routes are present in the sitemap and the
LLM-facing public-page list.

PostHog groups the routes under the fixed `Tools` page category. Public tool
page views also map to fixed TikTok `ViewContent` metadata when marketing
consent is on. User-entered calculator values, generator inputs, generated
hooks, names, and email addresses are not included in those page-view events.

## Shared Mailing-List Capture

All fifty tools reuse `ToolLeadCaptureForm` and post to
`/api/tools/[tool]/lead`. The browser sends only name and email. The dynamic
route accepts only a fixed catalog key and uses that route key as the source,
so a caller cannot choose an arbitrary source in the request body.

The shared server handler rejects cross-site, non-JSON, extra-field, and
oversized requests before quota. It streams at most 2 KB, creates a
secret-keyed IP-only client key, and calls the secret-gated
`toolLeads.submit` Convex mutation. Convex consumes client, normalized-email,
and shared global limits before checking the waitlist table. Existing entries
are not changed, and both existing and new emails receive only
`{ accepted: true }`.

The browser form, Next.js request reader, and Convex mutation reuse the same
atomic field limits, normalization helpers, and email validation rule. Both
server boundaries still run validation independently before trusting the data.

Accepted forms emit one fixed `tool_lead_accepted` PostHog event containing
only the catalog tool source. They do not emit failure or
created-versus-existing status events, and they do not fire a TikTok Lead
conversion. The legacy `/sign-up` waitlist flow remains separate and
unchanged.

## Tool Execution and Privacy

All tools except the App Hook Generator run locally in the browser. Writing,
planning values, costs, filenames, technical video facts, and results are not
posted to the server or included in analytics. The App Hook Generator remains
the one server-backed public tool;
its bounded request uses the existing dedicated generator limits and does not
call an outside AI provider.

The local video tools build on the existing Media Bunny metadata reader and
bounded media sinks. A selected file is opened and disposed locally, an object
URL supplies the local preview, and replacing a file cancels stale inspection.
The dead-space finder sparsely decodes frames and audio samples and closes every
sample. The compression estimator reads local facts when requested. The tools
do not upload, store, normalize, stitch, trim, transcode, or export selected
media. The safe-zone overlay uses only a local image object URL and does not
export an edited image.

Guided sprints, courses, and workshops may keep versioned progress in local
browser storage. Worksheets and kits create CSV or Markdown downloads locally.
That progress and those generated files are not synchronized to a ClipStitchr
account.

## Quality and Paid-Boundary Review

`docs/features/public-tool-quality-register.md` is the candid internal record
for functional proof, standalone value, paid-boundary safety, runtime smoke
status, known limitations, and the next refinement for every catalog tool.
Passing tests and a production build are necessary evidence, but they do not
automatically make a tool production-smoked or prove that users find its result
valuable.

Every added tool must receive a register row and a feature-document boundary
section in the same change. The public tools may diagnose, calculate, check,
plan, or prepare source work. They must not store a free asset workspace,
transform or stitch media, export finished ads, or automate the paid production
workflow. Any later AI, provider, expansive hook-library, or deeper media
integration requires a fresh privacy, abuse-cost, functional, value, and paid
boundary review.

## File Tree

```text
web/
  app/(content)/tools/
    page.tsx
    <fifty tool routes>/page.tsx
  app/_components/tools/
    PublicToolIcon.tsx
    ToolDiscoveryCard.tsx
    ToolDiscoveryLinks.tsx
    ToolIndexCard.tsx
    ToolLeadCaptureForm.tsx
    ToolLeadCaptureForm.test.tsx
    ToolStructuredData.tsx
    ToolsIndexPage.tsx
    ToolsIndexPage.test.tsx
    <tool-specific atomic component folders>/
  app/api/tools/[tool]/lead/
    route.ts
    route.test.ts
  convex/
    toolLeads/submit.ts
    toolLeads/submit.test.ts
    validators/toolLeadSource.ts
    validators/waitlistSource.ts
  lib/clipstitchr/tools/
    catalog/
      PublicToolDefinition.ts
      PublicToolIconKey.ts
      PublicToolKey.ts
      getPublicToolDefinition.ts
      isPublicToolKey.ts
      publicToolCatalog.ts
      publicToolCatalog.test.ts
      publicToolKeys.ts
    localVideoInspection/
    resources/
    csv/
    <tool-specific pure logic folders>/
    createToolFaqJsonLd.ts
    createToolWebApplicationJsonLd.ts
    server/getPublicToolClientIp.ts
    toolLeads/
      ToolLeadAcceptedResponse.ts
      ToolLeadInput.ts
      getToolLeadInputIsValid.ts
      normalizeToolLeadEmail.ts
      normalizeToolLeadName.ts
      submitToolLead.ts
      submitToolLead.test.ts
      toolLeadEmailPattern.ts
      toolLeadFieldLimits.ts
      useToolLeadCapture.ts
      useToolLeadCapture.test.ts
      server/
        ToolLeadRequestError.ts
        createToolLeadClientKey.ts
        createToolLeadClientKey.test.ts
        createToolLeadRateLimitResponse.ts
        getToolLeadRequestIsSameOrigin.ts
        handleToolLeadRequest.ts
        handleToolLeadRequest.test.ts
        readToolLeadBodyText.ts
        readToolLeadBodyText.test.ts
        readToolLeadRequest.ts
        readToolLeadRequest.test.ts
        toolLeadMaxBodyBytes.ts
  lib/clipstitchr/types/
    ToolFaq.ts
    ToolLeadSource.ts
```

The shared discovery surface also updates `web/app/site-header.tsx`,
`web/app/site-footer.tsx`, `web/lib/site.ts`, `web/lib/llms.ts`, the sitemap,
and the fixed PostHog and TikTok page classifiers.

## Use Cases

- A founder can write or grade a hook, match it to a visual, prepare a creator
  brief, and then compare paid ClipStitchr plans.
- An app marketer can inspect a product demo locally, build a focused creative
  test plan, and estimate the cost of the production cycle.
- A visitor can join the mailing list without creating a product account or
  revealing whether their email was already saved.

## Source References

- `docs/features/app-hook-generator.md` documents deterministic hook
  generation, request validation, and generation quota.
- `docs/features/ad-variant-calculator.md` documents the local formulas and
  practical phased test plan.
- `docs/features/public-tool-batch-3-10-design.md` records the accepted shared
  architecture, product boundary, tool contracts, and decision log.
- `docs/features/public-tool-batch-11-15-design.md` records the five remaining
  priority contracts and why they differ from the first ten.
- `docs/features/public-tool-batch-16-50-design.md` maps all fifty portfolio
  numbers, records the exact thirty-five missing contracts, and defines the
  shared resource engines, high-risk boundaries, and completion audit.
- `docs/features/public-tool-quality-register.md` records candid readiness and
  refinement status for every public tool.
- Each public tool has a dedicated feature document beside this one.
- `docs/backend/rate-limits.md` is the source of truth for both tool-lead and
  generator enforcement limits.
- Shared lead validators use relative imports so the same bounded validation
  runs under both Next.js and Convex's isolated TypeScript project, which does
  not inherit the app-level `@/*` path alias.
- `docs/analytics/posthog.md` and `docs/analytics/tiktok.md` document the fixed
  public-tool analytics contract.
- `web/lib/metadata.ts` supplies the existing metadata helper.
- `web/app/(content)/layout.tsx` supplies the existing public marketing shell.

## Verification

The completed library currently has fifty catalog entries, fifty dedicated
tool routes, and one searchable tools hub. The final repository-wide evidence
baseline is 676 passing test files with 2,201 passing tests, clean TypeScript
and ESLint runs, and a successful production build that generated 185 static
pages. The artifact-coverage test also requires every catalog key to have a
route, a dedicated feature document, and a quality-register record.

The build and automated suite do not overstate media proof. The Dead-Space
Finder, TikTok Safe-Zone Overlay, and Video Compression Estimator still need
representative real-file or browser-interaction smokes and remain Yellow in
the quality register until those checks are recorded.

From `web/`:

```bash
npx vitest run \
  app/_components/tools/ToolsIndexPage.test.tsx \
  app/_components/tools/ToolLeadCaptureForm.test.tsx \
  'app/api/tools/[tool]/lead/route.test.ts' \
  lib/clipstitchr/tools/catalog/publicToolCatalog.test.ts \
  lib/clipstitchr/tools/toolLeads/submitToolLead.test.ts \
  lib/clipstitchr/tools/toolLeads/useToolLeadCapture.test.ts \
  lib/clipstitchr/tools/toolLeads/server/handleToolLeadRequest.test.ts \
  convex/toolLeads/submit.test.ts \
  app/sitemap.test.ts

npx vitest run \
  lib/clipstitchr/tools/catalog/publicToolQualityRegister.test.ts \
  lib/clipstitchr/tools/appAdCostPerCreative/calculateAppAdCostPerCreative.test.ts \
  lib/clipstitchr/tools/appAdBreakEven/calculateAppAdBreakEven.test.ts \
  lib/clipstitchr/tools/appAdShotList/createAppAdShotList.test.ts \
  lib/clipstitchr/tools/appUgcClipReadiness/createAppUgcClipReadiness.test.ts \
  lib/clipstitchr/tools/appAdCreativeTestingBlueprint/createAppAdCreativeTestingBlueprint.test.ts

npm run typecheck
npm run lint
npm test
NEXT_PUBLIC_CONVEX_URL=https://whimsical-ptarmigan-764.convex.cloud npm run build
```
