# Case Studies

## What This Adds

ClipStitchr now has a public Case Studies section for sales-focused proof pages.
The first case study is the Guppy 30-day growth story at
`/case-studies/guppy-30-day-growth`.

The same story also exists as a blog post at `/blog/guppy-30-day-growth`. The
blog post answers what happened. The case study answers whether a similar
workflow could work for another founder or team.

## How It Works

Case studies are authored as MDX files in `web/content/case-studies/`. The
content collection named `caseStudy` validates the frontmatter, compiles the MDX
body, calculates reading time, and derives the canonical URL.

Case-study pages use the same article metadata and JSON-LD helpers as blog
posts. The sitemap includes the index route and each published case study.

The reusable page pieces live under `web/app/_components/case-studies/`:

- `CaseStudyIndexCard.tsx` renders cards on `/case-studies`.
- `CaseStudyHeroMetric.tsx` renders metric tiles in the case-study hero.
- `CaseStudyFeatureImage.tsx` renders the feature image and caption.

Evidence screenshots can be placed directly inside the MDX body after the claim
they support. The Guppy case study uses this pattern for Instagram reach,
TikTok total reach, TikTok Promote, RevenueCat funnel results, Instagram top
hooks, the 75-reel publishing milestone, individual RevenueCat trial receipts,
and ClipStitchr production proof.

## File Tree

```text
web/app/(content)/case-studies/page.tsx
web/app/(content)/case-studies/[slug]/page.tsx
web/app/_components/case-studies/CaseStudyFeatureImage.tsx
web/app/_components/case-studies/CaseStudyHeroMetric.tsx
web/app/_components/case-studies/CaseStudyIndexCard.tsx
web/content/case-studies/guppy-30-day-growth.mdx
web/content/blog/guppy-30-day-growth.mdx
web/lib/content/caseStudyDocumentSchema.ts
web/lib/content/caseStudyQueries.ts
web/public/blog/guppy-30-day-growth/feature-image.jpg
web/public/blog/guppy-30-day-growth/tiktok-total-views-139k.png
web/public/blog/guppy-30-day-growth/tiktok-promote-overview-103k.png
web/public/blog/guppy-30-day-growth/tiktok-promote-button-clicks.png
web/public/blog/guppy-30-day-growth/revenuecat-funnel-results.png
web/public/blog/guppy-30-day-growth/revenuecat-new-trial-yearly.jpg
web/public/blog/guppy-30-day-growth/revenuecat-trial-conversion-weekly.jpg
web/public/blog/guppy-30-day-growth/instagram-overall-views-22318.png
web/public/blog/guppy-30-day-growth/instagram-top-post-views-grid.jpg
web/public/blog/guppy-30-day-growth/instagram-75-reels-milestone.jpg
web/public/blog/guppy-30-day-growth/clipstitchr-stitches-production.png
```

## Use Cases

- Publish customer or founder proof pages that are closer to buying intent than
  ordinary blog posts.
- Show the main business metrics before the reader scrolls.
- Reuse one case-study template for future SaaS, ecommerce, creator, and app
  campaigns.
- Add screenshots inside the MDX narrative without changing the route structure.

## Source References

- `web/content-collections.ts` defines and transforms the `caseStudy`
  collection.
- `web/lib/content/baseContentDocumentSchema.ts` keeps shared content rules.
- `web/lib/content/caseStudyDocumentSchema.ts` adds metrics, tools, and product
  metadata.
- `web/lib/getSitemapEntries.ts` publishes case-study URLs to the sitemap.
