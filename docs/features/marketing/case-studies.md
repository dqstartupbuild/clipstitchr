# Case Studies

## What This Adds

ClipStitchr has a public Case Studies section for proof pages aimed at builders
who want evidence without generic marketing claims. The first case study is the
Guppy 30-day story at
`/case-studies/fitness-app-growth-case-study-guppy`.

The case-study index and detail pages now use the shared public marketing shell:
dark background, condensed headings, dark proof cards, and the same direct voice
as the redesigned homepage.

## How It Works

Case studies are authored as MDX files in `web/content/case-studies/`. The
content collection named `caseStudy` validates the frontmatter, compiles the MDX
body, calculates reading time, and derives the canonical URL.

Case-study pages use the same article metadata and JSON-LD helpers as blog
posts. The sitemap includes the index route and each published case study. The
hero feature image renders through Next Image without head preloading, and body
evidence screenshots use native lazy loading so long screenshot-heavy stories do
not emit unused image preload warnings.

The detail sidebar reads each authored tool's label and optional URL. Tools
without URLs render as plain text, while linked tools open their own sites. The
Guppy case study uses those sidebar links for DansUGC and Post Bridge, matching
the links in the body sections where those tools are discussed.

The reusable page pieces live under `web/app/_components/case-studies/`:

- `CaseStudyIndexCard.tsx` renders cards on `/case-studies`.
- `CaseStudyHeroMetric.tsx` renders metric tiles in the case-study hero.
- `CaseStudyFeatureImage.tsx` renders the feature image and caption.
- `CaseStudyQuickResults.tsx` renders the quick results box under the feature
  image.
- `CaseStudyToolListItem.tsx` renders one linked or plain-text sidebar tool.

On detail pages, the hero order is the case study title, the feature image, the
quick results box, and then the MDX narrative. This keeps the strongest visual
and proof points visible before the reader reaches the first body section.

Evidence screenshots can be placed directly inside the MDX body after the claim
they support. Raw JSX screenshots should include `loading="lazy"` and
`decoding="async"`. Markdown-authored images are handled by the shared MDX image
component. The Guppy case study uses this pattern for Instagram reach, TikTok
total reach, TikTok Promote, RevenueCat funnel results, Instagram top hooks, the
75-reel publishing milestone, individual RevenueCat trial receipts, and
ClipStitchr production proof.

The Guppy case study explains why public post research matters: the strongest
posts sold identity and transformation rather than the workout itself.

## File Tree

```text
web/app/(content)/case-studies/page.tsx
web/app/(content)/case-studies/[slug]/page.tsx
web/app/globals.css
web/app/_components/case-studies/CaseStudyFeatureImage.tsx
web/app/_components/case-studies/CaseStudyHeroMetric.tsx
web/app/_components/case-studies/CaseStudyIndexCard.tsx
web/app/_components/case-studies/CaseStudyQuickResults.tsx
web/app/_components/case-studies/CaseStudyToolListItem.tsx
web/content/case-studies/fitness-app-growth-case-study-guppy.mdx
web/lib/content/caseStudyDocumentSchema.ts
web/lib/content/caseStudyToolSchema.ts
web/lib/content/caseStudyQueries.ts
web/public/case-studies/guppy-30-day-growth/feature-image.jpg
web/public/case-studies/guppy-30-day-growth/tiktok-total-views-139k.png
web/public/case-studies/guppy-30-day-growth/tiktok-promote-overview-103k.png
web/public/case-studies/guppy-30-day-growth/tiktok-promote-button-clicks.png
web/public/case-studies/guppy-30-day-growth/revenuecat-funnel-results.png
web/public/case-studies/guppy-30-day-growth/revenuecat-new-trial-yearly.jpg
web/public/case-studies/guppy-30-day-growth/revenuecat-trial-conversion-weekly.jpg
web/public/case-studies/guppy-30-day-growth/instagram-overall-views-22318.png
web/public/case-studies/guppy-30-day-growth/instagram-top-post-views-grid.jpg
web/public/case-studies/guppy-30-day-growth/instagram-75-reels-milestone.jpg
web/public/case-studies/guppy-30-day-growth/clipstitchr-stitches-production.png
```

## Use Cases

- Publish customer or founder proof pages that are closer to buying intent than
  ordinary blog posts.
- Show the main business metrics before the reader scrolls.
- Link source tools from the detail sidebar when a case study calls out a
  partner or workflow site.
- Reuse one case-study template for future SaaS, ecommerce, and app campaigns.
- Add screenshots inside the MDX narrative without changing the route structure.

## Source References

- `web/content-collections.ts` defines and transforms the `caseStudy`
  collection.
- `web/lib/content/baseContentDocumentSchema.ts` keeps shared content rules.
- `web/lib/content/caseStudyDocumentSchema.ts` adds metrics, tools, and product
  metadata.
- `web/lib/getSitemapEntries.ts` publishes case-study URLs to the sitemap.
