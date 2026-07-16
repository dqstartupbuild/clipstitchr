# ClipStitchr Offer

## Core Positioning

Grow on short-form without becoming a content person.

Pricing should sell relief from the parts of content work the user keeps
avoiding. Creation credits meter frequent, lower-cost output. Clipr and Swapr
videos have separate monthly generation allowances because they create
materially higher provider cost.

## Main Offer

The parts of content work builders keep putting off, bundled together:

- Stitchr ads from saved clips.
- Clip scores and video reads.
- Templates for structures users do not want to rebuild.
- Clipr, Swapr, Swipr, avatars, and draft helpers.
- One library for clips, demos, drafts, and finished ads.
- Daily draft automation on higher plans.
- Credit top-ups when the library is thin.

## Credit Rules

| Action | Credits |
| --- | ---: |
| Previewing and editing in Stitchr | Included |
| 1 stitch created on Starter or Pro | 10 |
| Stitches created on Agency | Unlimited; no creation-credit deduction |
| 1 Swipr generation | 20 |
| 1 standalone avatar photo/background/photo expansion | 25 |
| 1 Clipr or Swapr video | Separate plan allowance |
| Clipr's required scene photo | Included with the Clipr video |

All plans include access to Stitchr, Swipr, Hook Lab, scoring, and the media
library, plus a plan-specific Clipr and Swapr video allowance. Plans differ by
creation credits, AI video generations, product limits, automation, speed,
concurrency, and support. Storage is not a customer-facing pricing dimension.

## Plans

| Plan | Price | Best For | Products | Creation Credits | Clipr + Swapr Videos |
| --- | ---: | --- | ---: | ---: | ---: |
| Starter | $39/month | Getting one product's content moving | 1 | 2,000/month | 3/month |
| Pro | $99/month | Making fresh creative every week | 3 | 8,000/month | 10/month |
| Agency | $399/month | Producing campaigns across a client roster | 10 | 20,000/month | 50/month |

## Plan Details

Starter:

- Stitchr and Swipr.
- Hook Lab and clip scoring.
- 1 product.
- 2,000 monthly creation credits.
- 3 combined Clipr or Swapr videos per month.
- One media library.
- Buy more credits anytime.

Pro:

- Everything in Starter.
- 3 products.
- 8,000 monthly creation credits.
- 10 combined Clipr or Swapr videos per month.
- Daily drafts for 1 product.
- Faster generation defaults.

Agency:

- Everything in Pro.
- 10 products.
- 20,000 monthly creation credits.
- Unlimited stitches.
- 50 combined Clipr or Swapr videos per month.
- Daily drafts for all 10 products.
- More jobs can run at once.
- Priority support.

## Top-Ups

Available only to active subscribers. Monthly credits are used first. Top-up
credits roll over for 12 months while the subscription stays active.

| Pack | Price | Credits | Example Output |
| --- | ---: | ---: | ---: |
| Refill | $29 | 2,000 | 200 stitches or 100 Swipr generations |

Refills do not increase the plan's Clipr and Swapr video allowance.

Implementation details for grants, reservations, expiration, retries, and
partial batch success are defined in
`docs/architecture/creation-credit-system.md`.

## Workspace Decision

A future multi-brand workspace would be a separate client or brand environment
with its own products, media, settings, and member access. It is not the same as
a team seat. A seat is simply another person who can access an environment.
Because the current product is scoped by product rather than by separate
client-owned environments, workspaces and team seats are not promised in the
current plans.

## Clipr Photo Charging

Every non-demo Clipr run creates one scene-specific avatar still before it
creates the final video. That required still is bundled into the Clipr video
allowance and never deducts creation credits separately.

Standalone photo generation from the Avatar library costs 25 creation credits
per successful photo. The same rate applies to standalone AI backgrounds and
photo expansion. Failed provider jobs return the reserved credits. Clipr and
Swapr video allowances are finalized only after a successful video output; a
failed job returns the reserved generation.

## Storage

Do not charge for or lead with storage. Say "one media library."

Internal reasonable-use, upload, and retained-storage controls remain service
safeguards. They are not customer-facing subscription entitlements or upgrade
prompts.

## Promotional Challenge

10k Organic Views Challenge:

> Publish 30 ClipStitchr-made posts in 30 days. If they do not reach 10k total
> organic views, we will help you keep going.

Reward on every paid plan: one free month of the customer's then-current plan,
applied to the next renewal. This is an account credit, not a cash refund of a
previous charge.

Terms:

- Available on all paid plans.
- Must publish 30 ClipStitchr-made posts within 30 days.
- Posts must be public.
- Views counted across TikTok, Reels, and Shorts.
- No paid boosting.
- Must submit links or analytics screenshots.
- Claim submitted within 7 days after the 30-day window ends.
- One guarantee claim per customer.
- Account must remain in good standing.

The challenge is not promoted on the pricing page. Its complete terms live in
the Terms of Use. Any future onboarding, checkout, email, or campaign mention
must state the important conditions beside the claim and link directly to the
complete terms.

## Pricing Page Copy

Headline:

> Pay for the system that keeps content from eating your week.

Subhead:

> Stitchr, scoring, Hook Lab Ideas, and your clip library are included. Creation
> credits cover everyday output, while each plan has a separate allowance for
> Clipr and Swapr videos.

Plan note:

> Choose based on how often you create, how many products you manage, and how
> much of the work you want ClipStitchr to prepare for you.
