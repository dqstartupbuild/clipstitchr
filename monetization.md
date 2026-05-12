# Monetization and Usage Budget

This document defines the working economics for hypothetical paid ClipStitchr
plans. It is a planning model, not a billing implementation. The current app
enforces rate limits, but paid plans still need a durable credit ledger,
subscription entitlement checks, stored-data quotas, invoices, overage handling,
and admin tools.

## Pricing Strategy

Target gross margin: 60%.

Usage cost budget: 40% of subscription revenue. This budget should cover AI
providers, R2 storage and operations, Convex, Vercel, payment fees, failed jobs,
retries, and operational slack.

The current highest monthly rate limits should be treated as the Studio hard
ceiling. Lower plans should use the same enforcement machinery with smaller
monthly credit, storage, and feature caps.

## Product Positioning Context

ClipStitchr should be priced as an ad-production workflow tool, not as an
AI-credit vending machine. The primary customer pain is that marketers collect
UGC clips, b-roll, reaction clips, and product demos but do not turn them into
finished ads because editing, organizing, exporting, and file management are
too much friction.

The core paid value is:

- a reusable content library for UGC and product demos
- faster creation of finished 9:16 ad variants
- less dependence on a traditional video editor for repetitive ad assembly
- better organization of raw clips, generated clips, and finished stitches

AI credits are part of the cost model because they create provider spend, but
they should not be the headline value metric. Plans should lead with content
library scale, ad-output workflow speed, and production volume. AI features
should be positioned as additonal tools when the user needs
more clips or avatar photos.

| Plan | Price | Positioning | Shared AI Credits | Retained Storage Cap |
| --- | ---: | --- | ---: | ---: |
| Creator | $20/month | Entry plan for a small content library and occasional ad variants. | 50 | 25 GB |
| Pro | $99/month | Main plan for solo operators turning UGC and demos into regular ad tests. | 250 | 250 GB |
| Studio | $249/month | High-volume plan for larger libraries, teams, agencies, and frequent variants. | 500 | 500 GB |

Positioning:

- Creator: for validating the workflow, organizing a small clip library, and
  creating occasional ad variants.
- Pro: the highlighted default plan for serious solo content production from
  real UGC and product demos.
- Studio: for agencies, teams, and higher-volume accounts that need more
  monthly production room, larger libraries, and faster workflows.

Marketing copy should avoid leading with AI limits. AI credits can appear in
plan details, but the plan story should be about how much content chaos the
user can turn into finished ads.

## Margin Targets

| Plan | Revenue | 40% Cost Budget | Stripe Domestic Card Fee | Remaining Usage/Infra Budget |
| --- | ---: | ---: | ---: | ---: |
| Creator | $20.00 | $8.00 | about $0.88 | about $7.12 |
| Pro | $99.00 | $39.60 | about $3.17 | about $36.43 |
| Studio | $249.00 | $99.60 | about $7.52 | about $92.08 |

Stripe estimates use 2.9% + $0.30 per successful domestic card transaction.

## Required Guardrail

Plans must enforce a shared monthly AI credit ledger. Per-surface monthly rate
limits are not enough by themselves. If a user maxes every AI surface
independently, they can exceed the intended allowance:

| Surface | Studio Monthly Cap | Credit Equivalent |
| --- | ---: | ---: |
| Upload metadata analysis | 10,000 analyses | 500 credits |
| Avatar generated photos | 500 images | 500 credits |
| AI photo outpaint/expand | 375 images | 375 credits |
| Swapr video generation | 500 estimated seconds | 500 credits |
| Total possible without a shared ledger |  | 1,875 credits |

At the working value of $0.085/provider-cost per credit, 1,875 credits is
$159.38/user/month in possible AI spend before R2, Convex, Vercel, payment fees,
retries, and support. That is not covered by any of the three plans.

Conclusion: paid usage must deduct from one shared monthly AI credit balance.
The per-surface rate limits should remain as abuse, concurrency, and
single-surface safety controls.

## Credit Model

Working credit value: $0.085/provider-cost per credit.

This value is a planning assumption. Replace it with measured p50 and p95 cost
per successful output after real Replicate and OpenAI invoices are available.

| Operation | Suggested Credit Cost | Notes |
| --- | ---: | --- |
| Upload metadata analysis | 0.05 credits | Cheap enrichment. Cap separately to prevent bulk abuse. |
| Avatar generated photo | 1 credit/image | Backed by GPT Image 2 through Replicate. |
| AI photo outpaint/expand | 1 credit/image | Backed by FLUX.1 Fill pro through Replicate. |
| Swapr standard video | 1 credit/output second | Studio monthly cap currently maps to 500 estimated seconds. |
| Swapr pro video, if exposed | 1.5-2 credits/output second | Use only if a higher-cost mode is added to the UI. |
| R2 upload/download/delete | 0 credits | Rate-limit for abuse and storage budget instead. |
| Convex metadata writes | 0 credits | Rate-limit for backend churn instead. |

Example usage:

| Plan | Example Monthly Usage |
| --- | --- |
| Creator | 50 generated photos, or 50 Swapr seconds, or 25 generated photos plus 25 Swapr seconds. |
| Pro | 250 generated photos, or 250 Swapr seconds, or 125 generated photos plus 125 Swapr seconds. |
| Studio | 500 generated photos, or 500 Swapr seconds, or 250 generated photos plus 250 Swapr seconds. |

Metadata analysis is intentionally low-cost. For example, 1,000 upload analyses
consume 50 credits.

## Plan Limits

These plan limits use the current Studio hard ceilings as the upper bound. They
are product limits, not just marketing claims.

| Limit | Creator | Pro | Studio |
| --- | ---: | ---: | ---: |
| Shared AI credits | 50/month | 250/month | 500/month |
| Upload metadata analyses | 1,000/month | 5,000/month | 10,000/month |
| Avatar generated photos | 50/month | 250/month | 500/month |
| AI photo outpaint/expand | 35/month | 185/month | 375/month |
| Swapr video generation | 50 estimated sec/month | 250 estimated sec/month | 500 estimated sec/month |
| R2 uploads | 25 GB/month | 250 GB/month | 500 GB/month |
| Retained storage | 25 GB | 250 GB | 500 GB |

The per-feature caps protect single surfaces, but the shared credit cap is the
real cost control. A Pro user should not be able to spend 250 credits on avatar
photos and another 250 credits on Swapr in the same billing period.

## Generation Speed Positioning

Paid plans should be positioned by speed, monthly capacity, and concurrency, not
by telling users that lower tiers create visibly worse outputs. All plans should
produce the same deliverable format: normalized 9:16 media, the same creator
workflow, and commercially usable UGC-style output.

Public positioning:

| Plan | Public Speed Label | Product Promise |
| --- | --- | --- |
| Creator | Slow | Same creation workflow with lower monthly volume and slower generation. |
| Pro | Fast | Faster generation defaults and enough credits for regular solo production. |
| Studio | Faster | Fastest defaults, highest limits, and future priority/concurrency room. |

Current implementation hooks:

| Plan Tier | Avatar Image Generation | Swapr Default | Notes |
| --- | --- | --- | --- |
| Creator | 1 image job at a time, `quality: "auto"` | `Quality 1080p`, Match Photo | Slowest path. Good for occasional use. |
| Pro | 2 image jobs at a time, `quality: "medium"` | `Fast 720p`, Match Photo | Faster wall-clock time without changing the user-facing workflow. |
| Studio | 4 image jobs at a time, `quality: "medium"` | `Fast 720p`, Match Photo | Fastest current avatar batch behavior; future queue priority belongs here. |

The UI should avoid labels like "Final" for model modes. Use labels such as
`Quality`, `Fast`, and `Faster` where a mode needs a name. This keeps plan
copy focused on speed and capacity instead of implying that lower plans are
throwaway drafts.

`number_of_images` remains `1` for avatar photo generation. A future experiment
can test packing multiple labeled variant prompts into one model prompt, but
that should be measured for quality drift before replacing the current
one-output-per-variant approach.

Swapr speed tiers use Match Photo orientation because ClipStitchr normalizes
both image and video outputs to 9:16. Important caveat: the provider's
`character_orientation` parameter is not just an aspect-ratio setting; it also
changes the reference behavior and currently maps to different accepted source
durations in the app. Match Photo keeps the faster 3-10 second path. A slower
long-motion setting can be exposed later if users need 30-second reference
motion.

Until paid plans are implemented, the app can use the Studio/faster defaults as
the global capability ceiling. When entitlements are added, each plan should map
to the same speed-profile layer instead of duplicating settings across routes.

## Unit Economics

The plan economics below assume every user spends their full shared credit
allowance and uses typical storage/infra. They do not assume users can max every
independent per-surface cap.

| Plan | AI Credit Cost | Other Infra/Slack Budget | Stripe Fee | Estimated Total Cost | Gross Margin |
| --- | ---: | ---: | ---: | ---: | ---: |
| Creator | $4.25 | $2.75 | $0.88 | $7.88 | 60.6% |
| Pro | $21.25 | $15.00 | $3.17 | $39.42 | 60.2% |
| Studio | $42.50 | $49.00 | $7.52 | $99.02 | 60.2% |

The Studio plan intentionally has more non-AI budget because high-volume users
are more likely to stress storage, backend usage, retries, support, and provider
variance.

## Overage Pricing

If overages are offered, price them above expected marginal cost:

| Overage | Suggested Price |
| --- | ---: |
| 100 AI credits | $25 |
| 100 GB retained storage | $10-$15/month |
| 100 GB extra monthly uploads | $10 |

At $0.085/provider-cost per credit, 100 AI credits cost about $8.50 before
infra, payment fees, and failure slack. A $25 overage keeps margin healthy.

## 100-User Scenarios

Example balanced cohort:

| Plan Mix | Users | Revenue |
| --- | ---: | ---: |
| Creator | 40 | $800 |
| Pro | 45 | $4,455 |
| Studio | 15 | $3,735 |
| Total | 100 | $8,990 |

At the modeled 40% cost budget, this cohort can support about $3,596/month in
variable costs while preserving 60% gross margin.

If all 100 users are on Pro:

| Metric | Estimate |
| --- | ---: |
| Gross revenue | $9,900/month |
| 40% cost budget | $3,960/month |
| Stripe domestic card fees | about $317/month |
| Remaining usage/infra budget after Stripe | about $3,643/month |

If all 100 users are on Studio:

| Metric | Estimate |
| --- | ---: |
| Gross revenue | $24,900/month |
| 40% cost budget | $9,960/month |
| Stripe domestic card fees | about $752/month |
| Remaining usage/infra budget after Stripe | about $9,208/month |

These scenarios are plausible only with the shared credit ledger and retained
storage quotas. They are not safe if users can max every AI rate-limit surface
independently.

## R2 Storage Risk

R2 is cheap, but storage accumulates. The current Studio upload-byte limiter
allows up to 500 GB uploaded per user per 30 days. If 100 Studio users each
upload and retain 500 GB, that is 50 TB stored.

Using R2 Standard storage at $0.015/GB-month:

| Stored Data | Estimated Monthly Storage Cost |
| --- | ---: |
| Creator 25 GB/user | $0.38/user |
| Pro 250 GB/user | $3.75/user |
| Studio 500 GB/user | $7.50/user |
| 50 TB across 100 Studio users | about $750/month |

R2 operations are usually less material at this scale, but they still matter:
Standard Class A operations are $4.50/million, Class B operations are
$0.36/million, and R2 has no egress fees for Standard storage. Add stored-data
quotas, lifecycle cleanup, and orphan cleanup before launch.

Recommended storage controls:

- Enforce a retained-storage quota, not only an upload-byte quota.
- Track object count and total bytes by user.
- Delete orphaned objects that were uploaded but never saved to Convex.
- Consider warning at 80% of storage quota and blocking uploads at 100%.
- Keep R2 Standard unless Infrequent Access retrieval economics are proven.

## Current Studio Rate-Limit Mapping

These limits are abuse and concurrency controls. Studio should map to the
current hard ceilings, while Creator and Pro should enforce lower monthly
entitlements through the shared credit and quota ledger.

| Surface | Studio Monthly Budget |
| --- | ---: |
| Upload metadata analysis | 10,000 analyses/30 days |
| Avatar generated photos | 500 images/30 days |
| AI photo outpaint/expand | 375 images/30 days |
| Swapr video generation | 500 estimated output seconds/30 days |
| R2 uploads | 500 GB/30 days |

Hourly and daily limits are still required. Monthly limits protect worst-case
single-surface usage, while short-window limits protect queues, provider
concurrency, and accidental bursts.

## Batch Caps

Upload batch caps are intentionally lower than burst limits so a normal batch
can complete without creating partial R2 objects:

| Upload Flow | UI Cap |
| --- | ---: |
| Photo upload without AI expansion | 100 files |
| Photo upload with AI expansion | 1 file |
| Video upload | 100 files |

Photo uploads create three R2 objects per photo: normalized photo, original
photo, and thumbnail. Video uploads usually create two R2 objects per video:
normalized video and poster. The batch caps fit under the 500-token R2 upload
burst and the 100-token metadata-analysis burst.

## Pricing Sources

Prices change frequently. Verify these before launch and during billing reviews:

- OpenAI API pricing: https://openai.com/api/pricing/
  - GPT Image 2 is priced by image/text input and output tokens.
  - GPT-4.1 mini is priced by input and output tokens.
- Replicate pricing: https://replicate.com/pricing
  - Replicate states that some models bill by hardware/runtime and others by
    input/output; model pages contain cost estimates.
- Replicate model pages:
  - https://replicate.com/openai/gpt-image-2
  - https://replicate.com/black-forest-labs/flux-fill-pro
  - https://replicate.com/kwaivgi/kling-v3-motion-control
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
  - Standard storage: $0.015/GB-month.
  - Standard Class A operations: $4.50/million.
  - Standard Class B operations: $0.36/million.
  - Standard egress to Internet: free.
- Vercel Pro plan: https://vercel.com/docs/plans/pro
  - Pro platform fee includes $20/month usage credit, 1 TB Fast Data Transfer,
    and 10,000,000 Edge Requests.
- Vercel pricing model: https://vercel.com/docs/pricing
  - Managed infrastructure is usage-based across transfer, requests, and compute.
- Convex pricing: https://www.convex.dev/pricing
  - Professional includes 25M function calls/month, 50 GB database storage,
    50 GB database I/O, 50 GB data egress, and metered overages.
- Stripe pricing: https://stripe.com/us/pricing
  - Domestic card processing is 2.9% + $0.30 per successful transaction.

## Review Cadence

Review these numbers weekly during private beta and monthly after pricing is
stable:

- Provider spend per active paid user.
- Average and p95 Swapr generated seconds per user.
- Failed paid prediction rate.
- R2 storage growth per user.
- R2 object count per user.
- R2 egress, signed URL, Class A, and Class B volumes.
- Convex function calls, database storage, database I/O, and egress.
- Vercel bandwidth, function duration, and request volume.
- Gross margin by plan and user cohort.

Tighten limits immediately if any cohort trends above the 40% usage-cost budget.
Raise limits only after invoice data confirms the operation stays inside the
credit value.
