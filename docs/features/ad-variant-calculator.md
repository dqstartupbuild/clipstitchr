# Ad Variant Calculator

## What This Adds

ClipStitchr has a public Ad Variant Calculator at
`/tools/ad-variant-calculator`. It helps app founders and app marketers see how
many ads they could test with the UGC clips, product demos, hooks, and calls to
action they already have.

The calculator separates a large theoretical opportunity from a useful first
production batch. This keeps the result honest: the biggest possible number is
helpful for planning, but it is not presented as the number of ads someone
should make at once.

## How It Works

The calculator accepts four non-negative whole-number inputs:

- UGC clips
- Product demos
- Hooks
- Calls to action

It updates immediately in the browser and returns three numbers:

1. **UGC + demo pairings** are `UGC clips x product demos`.
2. **Possible test combinations** are
   `pairings x hooks x calls to action`.
3. **Practical first batch** uses one selected demo and up to 20 UGC clips.

The first-batch result matches the shipped Stitchr batch shape. A user can
select up to 20 UGC clips and one demo, use one shared text direction, and
produce one finished Stitch for each selected UGC clip.

The result also gives a three-phase test suggestion:

1. Compare UGC openings while the demo, hook, and call to action stay fixed.
2. Try the available hooks on the strongest footage pairing.
3. Rotate demos and calls to action one at a time after a winner appears.

This sequence helps someone learn why a version worked instead of publishing
every possible combination and guessing afterward.

## User Experience

The page uses the public marketing shell inherited from the `(content)` route
group. The calculator itself reuses the shared `Panel`, `PanelHeader`, `Button`,
and tracked link components.

The page includes:

- A plain-language hero for app marketers.
- Four labeled number fields with short examples.
- Immediate results with no submit step.
- An explanation of each formula.
- A practical phased test plan.
- A mailing-list form attributed to the Ad Variant Calculator.
- Frequently asked questions.
- Matching `WebApplication` and `FAQPage` structured data for search engines.
- A paid conversion link to `/pricing` with no free-tier or trial promise.
- Contextual links to the App Hook Generator and the `/tools` hub.

The Reset example button restores eight UGC clips, two demos, four hooks, and
two calls to action. That example produces 16 footage pairings, 128 possible
test combinations, and a practical first batch of eight Stitches.

## Privacy and Cost

All calculations happen locally in React. The tool does not upload footage,
save the entered counts, call a provider, or create storage or compute cost.
Because it does not trigger a backend operation, it does not add a rate-limit
surface. The optional mailing-list form posts bounded same-origin JSON to
`/api/tools/ad-variant-calculator/lead`. That route fixes the calculator source
server-side and calls the secret-gated `toolLeads.submit` mutation.

Tool lead submissions use dedicated per-client, per-normalized-email, and
global limits before the email lookup. A new email is inserted, while an
existing row is left unchanged. Both cases return only `{ accepted: true }`, so
the browser cannot use the form to discover whether an email is already saved.

## File Tree

```text
web/app/(content)/tools/ad-variant-calculator/page.tsx
web/app/api/tools/ad-variant-calculator/lead/route.ts
web/app/api/tools/ad-variant-calculator/lead/route.test.ts
web/app/_components/tools/ToolLeadCaptureForm.tsx
web/app/_components/tools/ToolLeadCaptureForm.test.tsx
web/app/_components/tools/ToolDiscoveryLinks.tsx
web/app/_components/tools/ToolStructuredData.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantCalculator.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantCalculatorFaq.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantCalculatorForm.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantCalculatorGuide.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantCalculatorHero.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantCalculatorPage.test.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantCalculatorPage.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantCalculatorResults.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantResultsAnnouncement.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantMetricCard.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantNumberField.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantNumberField.test.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantPricingCta.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantTestPhaseCard.tsx
web/app/_components/tools/ad-variant-calculator/AdVariantTestPlan.tsx
web/lib/clipstitchr/tools/adVariantCalculator/AdVariantCalculatorInput.ts
web/lib/clipstitchr/tools/adVariantCalculator/AdVariantCalculatorResult.ts
web/lib/clipstitchr/tools/adVariantCalculator/AdVariantTestPhase.ts
web/lib/clipstitchr/tools/adVariantCalculator/adVariantCalculatorDescription.ts
web/lib/clipstitchr/tools/adVariantCalculator/adVariantCalculatorFaqs.ts
web/lib/clipstitchr/tools/adVariantCalculator/adVariantInputMax.ts
web/lib/clipstitchr/tools/adVariantCalculator/calculateAdVariantPlan.test.ts
web/lib/clipstitchr/tools/adVariantCalculator/calculateAdVariantPlan.ts
web/lib/clipstitchr/tools/adVariantCalculator/createAdVariantTestPhases.ts
web/lib/clipstitchr/tools/adVariantCalculator/defaultAdVariantCalculatorInput.ts
web/lib/clipstitchr/tools/adVariantCalculator/normalizeAdVariantCount.ts
web/lib/clipstitchr/tools/toolLeads/submitToolLead.ts
web/lib/clipstitchr/tools/toolLeads/submitToolLead.test.ts
web/lib/clipstitchr/tools/toolLeads/ToolLeadAcceptedResponse.ts
web/lib/clipstitchr/tools/toolLeads/ToolLeadInput.ts
web/lib/clipstitchr/tools/toolLeads/getToolLeadInputIsValid.ts
web/lib/clipstitchr/tools/toolLeads/normalizeToolLeadEmail.ts
web/lib/clipstitchr/tools/toolLeads/normalizeToolLeadName.ts
web/lib/clipstitchr/tools/toolLeads/toolLeadEmailPattern.ts
web/lib/clipstitchr/tools/toolLeads/toolLeadFieldLimits.ts
web/lib/clipstitchr/tools/toolLeads/useToolLeadCapture.ts
web/lib/clipstitchr/tools/toolLeads/useToolLeadCapture.test.ts
web/lib/clipstitchr/tools/toolLeads/server/ToolLeadRequestError.ts
web/lib/clipstitchr/tools/toolLeads/server/createToolLeadClientKey.ts
web/lib/clipstitchr/tools/toolLeads/server/createToolLeadClientKey.test.ts
web/lib/clipstitchr/tools/toolLeads/server/createToolLeadRateLimitResponse.ts
web/lib/clipstitchr/tools/toolLeads/server/getToolLeadRequestIsSameOrigin.ts
web/lib/clipstitchr/tools/toolLeads/server/handleToolLeadRequest.ts
web/lib/clipstitchr/tools/toolLeads/server/handleToolLeadRequest.test.ts
web/lib/clipstitchr/tools/toolLeads/server/readToolLeadBodyText.ts
web/lib/clipstitchr/tools/toolLeads/server/readToolLeadBodyText.test.ts
web/lib/clipstitchr/tools/toolLeads/server/readToolLeadRequest.ts
web/lib/clipstitchr/tools/toolLeads/server/readToolLeadRequest.test.ts
web/lib/clipstitchr/tools/toolLeads/server/toolLeadMaxBodyBytes.ts
web/convex/toolLeads/submit.ts
web/convex/toolLeads/submit.test.ts
web/convex/validators/toolLeadSource.ts
web/convex/validators/waitlistSource.ts
web/lib/clipstitchr/tools/createToolFaqJsonLd.ts
web/lib/clipstitchr/tools/createToolWebApplicationJsonLd.ts
web/lib/clipstitchr/tools/server/getPublicToolClientIp.ts
web/lib/clipstitchr/types/ToolFaq.ts
web/lib/clipstitchr/types/ToolLeadSource.ts
```

## Verification

The calculation tests cover normal totals, the 20-UGC first-batch cap, missing
demo behavior, and unsafe numeric input. The page test covers the visible
calculator, planning guidance, canonical metadata, `/pricing` link, and the
absence of free-tier or trial language. Shared tool-lead tests cover fixed
source routing, same-origin and JSON enforcement, streamed body limits, opaque
acceptance, duplicate handling, and all three pre-lookup limits.

## Source References

- `project-scope.md` defines the UGC-then-demo Stitchr workflow.
- `AGENTS.md` defines the batch limit of 20 UGC clips with one selected demo.
- `web/app/(content)/layout.tsx` supplies the shared public page shell.
- `web/app/_components/stitchr/StitchrBatchPanel.tsx` shows the in-product batch
  controls this calculator prepares users to understand.
- `web/lib/metadata.ts` creates the canonical, Open Graph, and Twitter metadata.

The candid release status and next refinement are recorded in
`docs/features/public-tool-quality-register.md`.
