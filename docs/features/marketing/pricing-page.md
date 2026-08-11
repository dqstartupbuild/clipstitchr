# Pricing Page

## What It Does

The pricing page presents the paid offer around the pain ClipStitchr removes:
content work should not eat the user's week. It explains the plan limits,
creation-credit costs, AI video allowances, and refill without exposing
implementation details or promotional legal terms in the comparison flow.

The page now uses the public marketing shell from the Figma redesign: dark
backgrounds, condensed uppercase headings, compact purple CTAs, and plain
pricing copy. The hero line is:

> Simple pricing for content that stops eating your week.

## User-Facing Offer

The page shows three plan levels:

- Starter at $39/month for 1 product, 2,000 creation credits, and 3 combined
  Clipr or Swapr videos.
- Pro at $99/month for 3 products, 8,000 creation credits, and 10 combined
  Clipr or Swapr videos.
- Agency at $399/month for 10 products, 20,000 creation credits, unlimited
  stitches, and 50 combined Clipr or Swapr videos.

Each plan action includes its canonical key in the signup URL. Clerk preserves
that selection through account creation, and onboarding repeats it before
opening Stripe-hosted Checkout. The public query value never supplies a Stripe
Price ID.

The comparison states the recurring terms before signup: plans renew monthly
until canceled, customers cancel from Settings, and access continues through
the end of the paid month.

The pricing hero names TikTok, Instagram Reels, and YouTube Shorts as supported
publishing destinations through the user's Zernio connection. It keeps Hook Lab
post analysis separate because Hook Lab imports only TikTok and Instagram
posts.

Starter centers Stitchr and Swipr while retaining a small monthly taste of
Clipr and Swapr. Pro adds weekly generation room and daily drafts for one
product. Agency raises the product limit to 10 and enables daily drafts for all
10 products. Storage is deliberately not presented as a paid-plan
differentiator. Every plan includes a media library, while internal fair-use and
abuse controls protect the service.

Creation credits and AI video allowances are separate. Credit refills never
increase the plan's Clipr and Swapr video allowance.

## Credit Model

The public credit table includes only choices and billable actions:

- 1 stitch created on Starter or Pro: 10 credits.
- Stitches created on Agency: Unlimited and do not deduct creation credits.
- Batch, daily-draft, Normal, and Longr creation all follow the same rule. Ten
  new stitches cost 100 credits on Starter or Pro.
- Exporting or downloading an existing stitch does not deduct credits again.
- 1 Swipr generation: 20 credits.
- 1 standalone avatar photo, background, or photo expansion: 25 credits.
- 1 Clipr or Swapr video: Uses the plan's separate video allowance.

The page omits non-billable implementation details such as Stitchr previewing
and Clipr's required intermediate scene photo. Those rules remain documented in
the Terms of Use.

Top-up credits use one active-subscriber refill:

- Refill: $29 for 2,000 creation credits, or about 200 stitches or 100
  Swipr generations. It does not add Clipr or Swapr videos.

## Promotional Terms

The pricing page does not promote the 10k Organic Views Challenge. Its complete
eligibility, submission, and account-credit terms live in the Terms of Use so
the pricing comparison stays focused. If the challenge is promoted in
onboarding, checkout, email, or another campaign later, that claim must link
directly to the complete terms and state the important conditions beside it.

## Relevant Code

- `web/app/(content)/pricing/page.tsx` defines the route and metadata.
- `web/app/_components/pricing/PricingPage.tsx` assembles the page.
- `web/app/_components/pricing/*` contains one pricing section or card
  component per file.
- `web/lib/clipstitchr/pricing/*` contains pricing plan, credit, and top-up data.
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
