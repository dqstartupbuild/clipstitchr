# Pricing Page

## What It Does

The pricing page presents the paid offer around the pain ClipStitchr removes:
content work should not eat the user's week. It explains that Stitchr, scores,
templates, and the clip library are included, while credits are used only for
generated media and draft content.

The page now uses the public marketing shell from the Figma redesign: dark
backgrounds, condensed uppercase headings, compact purple CTAs, and plain
pricing copy. The hero line is:

> Simple pricing for content that stops eating your week.

## User-Facing Offer

The page shows four plan levels:

- Starter at $39/month for 3 products and 50 monthly credits.
- Pro at $99/month for 10 products and 250 monthly credits.
- Studio at $249/month for unlimited products and 750 monthly credits.
- Agency at $499+/month for multiple brands, onboarding, and custom support.

All plans include every ClipStitchr tool. Plans differ by credits, product
limits, daily drafts, saved media, speed, and support.

## Credit Model

The public credit table is:

- Stitchr ads from saved clips: Included.
- Clip scores and video reads: Included.
- 1 generated video: 25 credits.
- 1 generated photo/avatar/background: 1 credit.
- 10 Swipr text/caption/hashtag drafts: 1 credit.

Top-up credits are listed as active-subscriber packs:

- Refill: $29 for 150 credits.
- Busy Week: $69 for 375 credits.
- Long Month: $129 for 750 credits.

## Guarantee

The page includes the 10k Organic Views Challenge. Users must publish 30
ClipStitchr-made posts in 30 days. If those posts do not reach 10k total
organic views, the page promises plan-based help to keep testing.

The guarantee section now calls out Hook Lab setup so users understand they
should add lines from posts that made them stop scrolling and their own winners
before running the challenge.

## Relevant Code

- `web/app/(content)/pricing/page.tsx` defines the route and metadata.
- `web/app/_components/pricing/PricingPage.tsx` assembles the page.
- `web/app/_components/pricing/*` contains one pricing section or card
  component per file.
- `web/lib/clipstitchr/pricing/*` contains pricing plan, credit, top-up, and
  guarantee data.
- `web/app/globals.css` provides the shared marketing shell classes used by the
  pricing page.
- `web/app/site-header.tsx` points the Pricing header link to `/pricing`.
- `web/app/site-footer.tsx` links the public footer to `/pricing`.
- `web/lib/site.ts` adds `/pricing` to public sitemap static pages.

## Verification

Pricing route coverage lives in `web/app/(content)/contentPages.test.tsx`.
Landing header coverage lives in
`web/app/_components/landing/LandingPage.test.tsx`. Sitemap coverage lives in
`web/app/sitemap.test.ts`.
