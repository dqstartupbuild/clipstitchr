# Monetization and Usage Budget

This document defines the working economics for hypothetical paid ClipStitchr
plans. It is a planning model, not a billing implementation. The current app
enforces rate limits, but paid plans still need a durable credit ledger,
subscription entitlement checks, reasonable-use storage controls, invoices,
overage handling, and admin tools.

The implementation contract for those systems is
`docs/architecture/plan-entitlements-stripe-and-worker-queues.md`. Use that
document for the authoritative Stripe boundary, entitlement schema, usage
reservations, plan enforcement, queue priority, concurrency, rollout, and test
requirements.

## Pricing Strategy

Target gross margin: 60%.

Usage cost budget: 40% of subscription revenue. This budget should cover AI
providers, R2 storage and operations, Convex, Vercel, payment fees, failed jobs,
retries, and operational slack.

The current highest monthly rate limits should be treated as the Agency hard
ceiling. Lower plans should use the same enforcement machinery with smaller
monthly credit and feature caps. Storage controls protect the service but are
not sold as plan entitlements.

## Product Positioning Context

ClipStitchr should be priced as a short-form system for builders who hate
making content, not as an AI-credit vending machine. The primary customer pain
is that app builders and mobile marketers collect UGC clips, b-roll, reaction
clips, and product demos but do not turn them into finished ads because editing,
organizing, exporting, and file management become the work they avoid.

The core paid value is:

- a reusable content library for UGC and product demos
- finished 9:16 ads from saved clips and demos
- less dependence on a traditional video editor for repetitive ad assembly
- better organization of raw clips, generated clips, and finished stitches

Creation credits make frequent, lower-cost output tangible. Clipr and Swapr
videos use a separate combined monthly allowance because they create materially
higher provider spend. Plans should lead with finished output, daily drafts, and
fewer editing days rather than presenting one universal AI balance.

| Plan | Price | Products | Creation Credits | Clipr + Swapr Videos |
| --- | ---: | ---: | ---: | ---: |
| Starter | $39/month | 1 | 2,000 | 3/month |
| Pro | $99/month | 3 | 8,000 | 10/month |
| Agency | $399/month | 10 | 20,000 | 50/month |

Positioning:

- Starter: for getting one product's content moving with Stitchr and Swipr.
- Pro: the highlighted default plan for builders who need regular ads without
  regular editing days.
- Agency: for agencies and teams producing campaigns across up to 10 products.

Marketing copy should avoid leading with AI limits. AI credits can appear in
plan details, but the plan story should be about how much content work the user
no longer has to do by hand.

## Margin Targets

| Plan | Revenue | 40% Cost Budget | Stripe Domestic Card Fee | Remaining Usage/Infra Budget |
| --- | ---: | ---: | ---: | ---: |
| Starter | $39.00 | $15.60 | about $1.43 | about $14.17 |
| Pro | $99.00 | $39.60 | about $3.17 | about $36.43 |
| Agency | $399.00 | $159.60 | about $11.87 | about $147.73 |

Stripe estimates use 2.9% + $0.30 per successful domestic card transaction.

## Required Guardrail

Plans must enforce two separate monthly ledgers:

1. A creation-credit ledger for newly created stitches, Swipr generations, and
   standalone photo operations.
2. A combined successful-video counter for Clipr and Swapr.

Credit refills never increase the video counter. Agency bypasses creation-credit
deduction for newly created stitches only; its Swipr and standalone photo work still
uses creation credits. Per-surface limits remain necessary for abuse,
concurrency, and single-provider safety.

## Credit Model

Creation credits are presentation units, not a direct translation of provider
dollars. Replace planning assumptions with measured p50 and p95 cost per
successful output after real provider invoices are available.

| Operation | Suggested Credit Cost | Notes |
| --- | ---: | --- |
| Stitchr preview/edit | 0 credits | Charge only when a new stitch is successfully created. |
| New stitch created | 10 credits | Applies equally to batch, daily-draft, Normal, and Longr creation. Agency stitches do not deduct credits. Exporting or downloading an existing stitch does not charge again. |
| Swipr generation | 20 credits | One generated Swipr result. |
| Standalone avatar photo | 25 credits/image | Applies to explicit generation from the Avatar library. |
| Standalone background or photo expansion | 25 credits/image | Applies only to successful output. |
| Clipr required scene still | 0 credits | Bundled into the Clipr video allowance. |
| Clipr or Swapr video | 0 creation credits | Finalize one plan video only after successful output. |
| Upload analysis and clip scoring | 0 credits | Keep included; cap separately to prevent bulk abuse. |
| R2 upload/download/delete | 0 credits | Rate-limit for abuse and storage budget instead. |
| Convex metadata writes | 0 credits | Rate-limit for backend churn instead. |

Example usage:

| Plan | Example Monthly Usage |
| --- | --- |
| Starter | Up to 200 stitches, 100 Swipr generations, 80 standalone photos, or a mixture, plus 3 Clipr/Swapr videos. |
| Pro | Up to 800 stitches, 400 Swipr generations, 320 standalone photos, or a mixture, plus 10 Clipr/Swapr videos. |
| Agency | Unlimited stitches plus up to 1,000 Swipr generations, 800 standalone photos, or a mixture, plus 50 Clipr/Swapr videos. |

Clipr photo rule: one scene-specific still is required for each non-demo Clipr
video. It is bundled into the video generation and must not deduct creation
credits separately. Standalone Avatar-library generations cost 25 credits per
successful photo. Failed photo jobs return reserved credits. Failed Clipr or
Swapr jobs return the reserved video generation.

## Plan Limits

These plan limits use the current Agency hard ceilings as the upper bound. They
are product limits, not just marketing claims.

| Limit | Starter | Pro | Agency |
| --- | ---: | ---: | ---: |
| Products | 1 | 3 | 10 |
| Creation credits | 2,000/month | 8,000/month | 20,000/month |
| Combined Clipr + Swapr videos | 3/month | 10/month | 50/month |
| Products with daily drafts | 0 | 1 | 10 |
| Upload metadata analyses | 1,000/month | 5,000/month | 10,000/month |
| Avatar generated photos | 50/month | 250/month | 500/month |
| AI photo outpaint/expand | 35/month | 185/month | 375/month |
| Clipr + Swapr generation | 3 successful videos/month | 10 successful videos/month | 50 successful videos/month |
| R2 uploads | 25 GB/month | 250 GB/month | 500 GB/month |
| Retained storage | 25 GB | 250 GB | 500 GB |

The per-feature caps protect single surfaces. The creation-credit ledger and
combined AI-video counter are the actual plan controls.

## Generation Speed Positioning

Paid plans should be positioned by speed, monthly capacity, and concurrency, not
by telling users that lower tiers create visibly worse outputs. All plans should
produce the same deliverable format: normalized 9:16 media, the same review
flow, and commercially usable UGC-style output.

Public positioning:

| Plan | Public Speed Label | Product Promise |
| --- | --- | --- |
| Starter | Slow | Same review flow with fewer monthly generations and slower generation. |
| Pro | Fast | Faster generation defaults and enough output for regular solo use. |
| Agency | Faster | Fastest defaults, highest limits, and future priority/concurrency room. |

Current implementation hooks:

| Plan Tier | Avatar Image Generation | Swapr Default | Notes |
| --- | --- | --- | --- |
| Starter | 1 image job at a time, `quality: "auto"` | `Quality 1080p`, Match Photo | Slowest path. Good for occasional use. |
| Pro | 2 image jobs at a time, `quality: "medium"` | `Fast 720p`, Match Photo | Faster wall-clock time without changing the user-facing workflow. |
| Agency | 4 image jobs at a time, `quality: "medium"` | `Fast 720p`, Match Photo | Fastest current avatar batch behavior; future queue priority belongs here. |

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

Until paid plans are implemented, the app can use the Agency/faster defaults as
the global capability ceiling. When entitlements are added, each plan should map
to the same speed-profile layer instead of duplicating settings across routes.

## Unit Economics

The new creation-credit scale is not compatible with the old assumption that
one credit equals $0.085 of provider cost. Validate the 3, 10, and 50 AI-video
allowances plus realistic creation-credit mixes against invoices before billing
launch. The maximum variable-cost budgets remain $15.60 for Starter, $39.60 for
Pro, and $159.60 for Agency if the 60% gross-margin target is retained.

## Overage Pricing

If overages are offered, price them above expected marginal cost:

| Overage | Suggested Price |
| --- | ---: |
| 2,000 creation credits | $29 |

Creation-credit refills do not add Clipr or Swapr videos. Any future video pack
must be sold and costed separately.

## 100-User Scenarios

Example balanced cohort:

| Plan Mix | Users | Revenue |
| --- | ---: | ---: |
| Starter | 40 | $1,560 |
| Pro | 45 | $4,455 |
| Agency | 15 | $5,985 |
| Total | 100 | $12,000 |

At the modeled 40% cost budget, this cohort can support about $4,800/month in
variable costs while preserving 60% gross margin.

If all 100 users are on Pro:

| Metric | Estimate |
| --- | ---: |
| Gross revenue | $9,900/month |
| 40% cost budget | $3,960/month |
| Stripe domestic card fees | about $317/month |
| Remaining usage/infra budget after Stripe | about $3,643/month |

If all 100 users are on Agency:

| Metric | Estimate |
| --- | ---: |
| Gross revenue | $39,900/month |
| 40% cost budget | $15,960/month |
| Stripe domestic card fees | about $1,187/month |
| Remaining usage/infra budget after Stripe | about $14,773/month |

These scenarios are plausible only with the creation-credit ledger, combined
AI-video counter, and retained-storage safeguards. They are not safe if users
can max every provider surface independently.

## R2 Storage Risk

R2 is cheap, but storage accumulates. The current Agency safety ceiling
allows up to 500 GB uploaded per user per 30 days. If 100 Agency users each
upload and retain 500 GB, that is 50 TB stored.

Using R2 Standard storage at $0.015/GB-month:

| Stored Data | Estimated Monthly Storage Cost |
| --- | ---: |
| Starter 25 GB/user | $0.38/user |
| Pro 250 GB/user | $3.75/user |
| Agency 500 GB/user | $7.50/user |
| 50 TB across 100 Agency users | about $750/month |

R2 operations are usually less material at this usage level, but they still matter:
Standard Class A operations are $4.50/million, Class B operations are
$0.36/million, and R2 has no egress fees for Standard storage. Add stored-data
quotas, lifecycle cleanup, and orphan cleanup before launch.

Recommended storage controls:

- Enforce a retained-storage quota, not only an upload-byte quota.
- Track object count and total bytes by user.
- Delete orphaned objects that were uploaded but never saved to Convex.
- Consider warning at 80% of storage quota and blocking uploads at 100%.
- Keep R2 Standard unless Infrequent Access retrieval economics are proven.

## Current Agency Rate-Limit Mapping

These limits are abuse and concurrency controls. Agency should map to the
current hard ceilings, while Starter and Pro should enforce lower monthly
entitlements through the creation-credit ledger, AI-video counter, and quota
controls.

| Surface | Agency Monthly Budget |
| --- | ---: |
| Upload metadata analysis | 10,000 analyses/30 days |
| Avatar generated photos | 500 images/30 days |
| AI photo outpaint/expand | 375 images/30 days |
| Combined Clipr + Swapr generation | 50 successful videos/30 days |
| Generated video duration | 500 estimated output seconds/30 days |
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

- OpenAI API pricing: <https://openai.com/api/pricing/>
  - GPT Image 2 is priced by image/text input and output tokens.
  - GPT-4.1 mini is priced by input and output tokens.
- Replicate pricing: <https://replicate.com/pricing>
  - Replicate states that some models bill by hardware/runtime and others by
    input/output; model pages contain cost estimates.
- Replicate model pages:
  - <https://replicate.com/openai/gpt-image-2>
  - <https://replicate.com/prunaai/z-image-turbo-img2img>
  - <https://replicate.com/prunaai/p-image>
  - <https://replicate.com/prunaai/wan-2.2-image>
  - <https://replicate.com/black-forest-labs/flux-fill-pro>
  - <https://replicate.com/kwaivgi/kling-v3-motion-control>
- Cloudflare R2 pricing: <https://developers.cloudflare.com/r2/pricing/>
  - Standard storage: $0.015/GB-month.
  - Standard Class A operations: $4.50/million.
  - Standard Class B operations: $0.36/million.
  - Standard egress to Internet: free.
- Vercel Pro plan: <https://vercel.com/docs/plans/pro>
  - Pro platform fee includes $20/month usage credit, 1 TB Fast Data Transfer,
    and 10,000,000 Edge Requests.
- Vercel pricing model: <https://vercel.com/docs/pricing>
  - Managed infrastructure is usage-based across transfer, requests, and compute.
- Convex pricing: <https://www.convex.dev/pricing>
  - Professional includes 25M function calls/month, 50 GB database storage,
    50 GB database I/O, 50 GB data egress, and metered overages.
- Stripe pricing: <https://stripe.com/us/pricing>
  - Domestic card processing is 2.9% + $0.30 per successful transaction.

## Review Cadence

Review these numbers weekly during private beta and monthly after pricing is
stable:

- Provider spend per active paid user.
- Average and p95 Swapr generated seconds per user.
- Failed paid prediction rate.
- R2 storage growth per user.
- R2 object count per user.
- R2 egress, signed URL, Class A, and Class B operation counts.
- Convex function calls, database storage, database I/O, and egress.
- Vercel bandwidth, function duration, and request counts.
- Gross margin by plan and user cohort.

Tighten limits immediately if any cohort trends above the 40% usage-cost budget.
Raise limits only after invoice data confirms the operation stays inside the
credit value.
