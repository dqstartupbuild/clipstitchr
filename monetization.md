# Monetization and Usage Budget

This document defines the working economics for a paid ClipStitchr plan. It is a
planning model, not a billing implementation. The current app enforces usage
through rate limits; a real paid plan still needs a durable credit ledger,
subscription entitlement checks, invoices, overage handling, and admin tools.

## Revenue Target

Target plan:

- Price: $99/month.
- Variable-cost target: keep provider, storage, bandwidth, and retry cost below
  1/8 of revenue.
- Maximum variable-cost budget at 8x revenue-to-cost: $12.38/user/month.
- Operating target before production cost data: $8-$10/user/month.

Recommended budget split:

| Cost Bucket | Monthly Target |
| --- | ---: |
| AI/provider calls | $8.50 |
| R2 storage, operations, and bandwidth | $1.00 |
| Convex usage and backend overhead | $0.75 |
| Failed jobs, retries, and abuse slack | $1.00 |
| Total target | $11.25 |

Keep the total under $12.38 for the 8x target. If actual provider pricing makes
Swapr or image generation more expensive than the placeholder assumptions below,
reduce credits, increase per-operation credit cost, or add paid overages.

## Credit Model

Default paid allowance: 100 AI credits/month.

At an $8.50 AI budget, one credit should represent roughly $0.085 of provider
cost. Any operation whose real cost is higher than $0.085 should consume more
than one credit.

| Operation | Suggested Credit Cost | Notes |
| --- | ---: | --- |
| Upload metadata analysis | 0.05 credits | Cheap enrichment. Cap separately to prevent bulk abuse. |
| Avatar generated photo | 1 credit/image | Backed by GPT Image 2 through Replicate. |
| AI photo outpaint/expand | 1 credit/image | Backed by FLUX.1 Fill pro through Replicate. |
| Swapr standard video | 1 credit/output second | Monthly cap currently maps to 100 estimated seconds. |
| Swapr pro video, if exposed | 1.5-2 credits/output second | Use only if a higher-cost mode is added to the UI. |
| R2 upload/download/delete | 0 credits | Rate-limit for abuse and storage budget instead. |
| Convex metadata writes | 0 credits | Rate-limit for backend churn instead. |

Credit examples:

- 100 avatar generated photos consumes 100 credits.
- 75 AI-expanded photos consumes 75 credits.
- 100 seconds of Swapr output consumes 100 credits.
- 50 seconds of Swapr output plus 25 avatar photos and 500 metadata analyses
  consumes 100 credits.

## Current Rate-Limit Mapping

The implemented rate limits approximate the 100-credit plan until a real credit
ledger exists:

| Surface | Monthly Budget |
| --- | ---: |
| Upload metadata analysis | 2,000 analyses/30 days |
| Avatar generated photos | 100 images/30 days |
| AI photo outpaint/expand | 75 images/30 days |
| Swapr video generation | 100 estimated output seconds/30 days |
| R2 uploads | 100 GB/30 days |

Hourly and daily limits are still required. Monthly limits protect spend, while
short-window limits protect queues, provider concurrency, and accidental bursts.

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

## Provider Pricing Sources

Provider pricing changes frequently. Before launching paid plans, verify actual
unit costs from:

- OpenAI API pricing: https://openai.com/api/pricing/
- Replicate pricing: https://replicate.com/pricing
- Replicate model pricing on the specific model pages:
  - https://replicate.com/openai/gpt-image-2
  - https://replicate.com/black-forest-labs/flux-fill-pro
  - https://replicate.com/kwaivgi/kling-v3-motion-control

The current cost-control model assumes provider costs are monitored from real
invoices after launch. Replace the placeholder credit costs with measured
p50/p95 cost per successful output, and include failed predictions that still
bill.

## Review Cadence

Review these numbers weekly during private beta and monthly after pricing is
stable:

- Provider spend per active paid user.
- Average and p95 Swapr generated seconds per user.
- Failed paid prediction rate.
- R2 storage growth per user.
- R2 egress and signed URL volume.
- Gross margin by user cohort.

Tighten limits immediately if any cohort trends above $12.38 variable
cost/month. Raise limits only after invoice data confirms the operation stays
inside the credit value.
