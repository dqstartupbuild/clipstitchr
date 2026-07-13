# App Ad Break-Even Calculator

## Overview

The public tool at `/tools/app-ad-break-even-calculator` calculates the paying
customers, installs, customer revenue, and allowable blended acquisition cost
an entered app-ad scenario needs to break even. It includes both media spend
and creative production cost so the result does not make the campaign look
cheaper by ignoring the ads required to run it.

The calculator uses only visitor-entered assumptions. It supplies no customer
value, contribution-margin, conversion-rate, or spending benchmark. The full
result is visible before email capture.

## Inputs and Bounds

The browser accepts:

- Planned media spend: USD from 0 through 10,000,000.
- Creative production cost: USD from 0 through 1,000,000.
- Revenue per paying customer: USD from 0 through 1,000,000.
- Contribution margin: 0 through 100 percent.
- Install-to-paying-customer rate: 0 through 100 percent.
- Revenue window: 30 days, 90 days, 12 months, or lifetime.

The revenue window labels the result so a short-term customer value is not
mistaken for lifetime revenue. Contribution margin means the share of revenue
remaining after the app-store fees, refunds, servicing costs, and other
variable costs the visitor chooses to include.

Amounts and percentages normalize to two decimal places. Negative, non-finite,
and over-limit values cannot enter the result. Unknown revenue-window values
fall back to 90 days.

## Calculation Rules

`calculateAppAdBreakEven` uses these formulas:

```text
margin rate = contribution margin / 100
paid rate = install-to-paid percentage / 100
contribution per customer = revenue per customer * margin rate
total investment = media spend + creative production cost
minimum revenue = total investment / margin rate
break-even customers = ceil(total investment / contribution per customer)
break-even installs = ceil(break-even customers / paid rate)
maximum blended CAC = contribution per customer
maximum blended CPI = contribution per customer * paid rate
break-even media ROAS = minimum revenue / media spend
creative cost share = creative cost / total investment * 100
revenue at whole-customer threshold = customers * revenue per customer
```

Whole customer and install targets round upward. `getSafeWholeTarget` rejects a
non-finite, negative, or greater-than-`Number.MAX_SAFE_INTEGER` target. The UI
then says the result is outside the useful range rather than displaying an
unsafe whole number.

Zero entered investment requires zero customers and zero installs. Positive
cost with no contribution value leaves the customer target unavailable. A
valid customer target with no install-to-paid rate remains visible while the
install target and CPI ask for the missing conversion assumption. Zero media
spend leaves media ROAS unavailable.

## Result Interpretation

The page shows:

- Total acquisition investment and entered cost split.
- Contribution value per paying customer.
- Break-even paying customers and installs.
- Maximum blended CAC and CPI.
- Minimum customer revenue required in the selected window.
- Break-even media ROAS.
- Revenue at the upward-rounded whole-customer threshold.

“Blended” means media plus entered creative production cost. Ad platforms
normally calculate ROAS as revenue divided by media spend. The tool keeps that
denominator for the media-ROAS card but raises the revenue target enough to
cover both media and entered creative cost.

This is planning arithmetic, not a spend recommendation or forecast. It does
not predict attribution, retention, conversion, cash flow, taxes, refunds,
app-store fees, servicing cost, or ad performance unless those effects are
already reflected in the visitor's assumptions.

## Conversion and Paid Boundary

The paid CTA says: “Know the target. Make the creatives you need to test it.”
It accurately positions ClipStitchr as the paid workflow for turning reusable
Hook/UGC clips and app demos into finished test creatives. It also says that
ClipStitchr does not manage media spend or guarantee acquisition results.

The shared mailing-list form records the fixed
`app-ad-break-even-calculator` source and does not gate the result or create a
product account.

The free tool does not:

- Connect to an ad platform or import performance.
- Store scenarios or track campaign results.
- Recommend a budget, bid, customer value, margin, or conversion rate.
- Decide whether an ad is a winner.
- Produce, edit, stitch, or export the creatives.

All calculator inputs remain in browser memory and stay out of analytics and
backend requests. The tool introduces no provider or storage cost and no new
rate-limit surface beyond the existing optional lead form.

## SEO Identity

The central catalog owns the final metadata keywords. The search identity is
app-ad break-even calculator, supported by mobile-app break-even ROAS,
allowable CPI, app-marketing CAC, and paid-user acquisition economics. The
route reads that fixed catalog entry rather than carrying a second keyword
list.

## File Tree

```text
web/app/(content)/tools/app-ad-break-even-calculator/page.tsx
web/app/_components/tools/
  ToolMetricCard.tsx
  ToolNumberField.tsx
  app-ad-break-even-calculator/
    AppAdBreakEvenCalculator.tsx
    AppAdBreakEvenCostSplit.tsx
    AppAdBreakEvenFaq.tsx
    AppAdBreakEvenForm.tsx
    AppAdBreakEvenGuide.tsx
    AppAdBreakEvenHero.tsx
    AppAdBreakEvenPage.tsx
    AppAdBreakEvenPage.test.tsx
    AppAdBreakEvenPricingCta.tsx
    AppAdBreakEvenResults.tsx
    AppAdBreakEvenRevenueWindowField.tsx
web/lib/clipstitchr/tools/
  appAdBreakEven/
    AppAdBreakEvenInput.ts
    AppAdBreakEvenResult.ts
    AppAdBreakEvenRevenueWindow.ts
    AppAdBreakEvenTargetStatus.ts
    appAdBreakEvenDescription.ts
    appAdBreakEvenFaqs.ts
    appAdBreakEvenInputLimits.ts
    appAdBreakEvenRevenueWindowOptions.ts
    calculateAppAdBreakEven.ts
    calculateAppAdBreakEven.test.ts
    defaultAppAdBreakEvenInput.ts
    getAppAdBreakEvenRevenueWindowLabel.ts
    normalizeAppAdBreakEvenInput.ts
    normalizeAppAdBreakEvenRevenueWindow.ts
  numbers/
    formatUsd.ts
    getSafeWholeTarget.ts
    normalizeBoundedCount.ts
    normalizeBoundedDecimal.ts
```

## Quality Record

The durable portfolio rating lives in
[`docs/features/public-tool-quality-register.md`](./public-tool-quality-register.md).
At launch this tool is expected to be **Green**, **Strong**, **Protected**, and
**Automated**. It provides actionable commercial planning math, but the result
still depends entirely on the visitor's contribution-margin, customer-value,
and conversion assumptions.

Its next refinement is to test whether app founders can supply those inputs
accurately and whether the revenue-window labels prevent misuse. AI, outside
benchmarks, ad-platform integrations, or performance ingestion would require a
new functional, abuse-cost, privacy, financial-boundary, and paid-boundary
review.

## Source References

- `docs/features/public-tool-batch-11-15-design.md` defines the accepted
  formulas, missing-assumption states, disclaimers, and paid boundary.
- `docs/features/app-ad-test-plan-generator.md` documents the adjacent creative
  testing plan that this calculator can help budget.
- `docs/features/public-app-marketing-tools.md` documents the shared tool page,
  lead capture, discovery, SEO, and analytics architecture.
- `docs/product/positioning.md` defines ClipStitchr as a production workflow,
  not an ad-buying or performance-prediction product.

## Verification

Focused tests cover exact default output, upward customer and install rounding,
zero investment, zero revenue, zero margin, zero conversion, media-only and
creative-only scenarios, unsafe whole-target handling, bounded input
normalization, revenue-window fallback, canonical metadata, structured data,
exact lead source, related links, paid CTA, and the absence of free-plan,
forecast, or performance promises.
