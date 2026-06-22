# Pricing Page

## What It Does

The pricing page presents the ClipStitchr paid offer around the main outcome:
creating more ad variants from clips a user already has. It explains that
Stitchr batches, scoring, templates, and the clip library are included, while
credits are used only for generated media and draft content.

## User-Facing Offer

The page shows four plan levels:

- Starter at $39/month for 3 products and 50 monthly credits.
- Pro at $99/month for 10 products and 250 monthly credits.
- Studio at $249/month for unlimited products and 750 monthly credits.
- Agency at $499+/month for custom volume, onboarding, and support.

All plans include every ClipStitchr tool. Plans differ by credits, product
limits, automation, storage, speed, and support.

## Credit Model

The public credit table is:

- Stitchr batches from saved clips: Included.
- Clip scoring and video analysis: Included.
- 1 generated video: 25 credits.
- 1 generated photo/avatar/background: 1 credit.
- 10 Swipr text/caption/hashtag drafts: 1 credit.

Top-up credits are listed as active-subscriber packs:

- Boost: $29 for 150 credits.
- Growth: $69 for 375 credits.
- Scale: $129 for 750 credits.

## Guarantee

The page includes the 10k Organic Views Challenge. Users must publish 30
ClipStitchr-made posts in 30 days. If those posts do not reach 10k total
organic views, the page promises plan-based help to keep testing.

The guarantee section now calls out Hook Lab setup so users understand they
should add hooks from viral niche content and their own winners before running
the challenge.

## Relevant Code

- `web/app/(content)/pricing/page.tsx` defines the route and metadata.
- `web/app/_components/pricing/PricingPage.tsx` assembles the page.
- `web/app/_components/pricing/*` contains one pricing section or card
  component per file.
- `web/lib/clipstitchr/pricing/*` contains pricing plan, credit, top-up, and
  guarantee data.
- `web/app/site-header.tsx` points the Pricing header link to `/pricing`.
- `web/app/site-footer.tsx` links the public footer to `/pricing`.
- `web/lib/site.ts` adds `/pricing` to public sitemap static pages.

## Verification

Pricing route coverage lives in `web/app/(content)/contentPages.test.tsx`.
Landing header coverage lives in
`web/app/_components/landing/LandingPage.test.tsx`. Sitemap coverage lives in
`web/app/sitemap.test.ts`.
