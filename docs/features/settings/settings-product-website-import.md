# Settings Product Website Import

Product create and edit can use a public website URL to fill missing product
context and improve generated marketing ideas.

## What It Does

- When a user saves a product with a website URL, the server imports website
  context before product enrichment runs.
- Firecrawl crawls the site with a hard cap of 15 pages and only follows
  internal URLs.
- The imported context includes page titles, descriptions, keywords, summaries,
  links, and capped markdown content.
- The enrichment model uses that website context to build a grounded
  `productDetails` truth summary with the product type, platform, intended
  user, current features or workflow, meaningful limits, and supported outcome.
- A website-backed summary can expand vague user-entered product details while
  preserving the user's positioning and excluding unsupported website
  inferences. Without a new website import, user-entered product details still
  win.
- User-entered audience details and emotional narrative always win. AI-filled
  audience details are saved only when the submitted field is blank.
- Raw website context is not saved to Convex product records.

## Implementation

- `web/lib/clipstitchr/server/scrapeProductWebsiteDetails.ts` starts the import
  flow and returns a bounded text block for enrichment.
- `web/lib/clipstitchr/server/startFirecrawlProductWebsiteCrawl.ts` calls
  Firecrawl's v2 crawl endpoint with the 15-page cap.
- `web/lib/clipstitchr/server/waitForFirecrawlProductWebsiteCrawl.ts` polls the
  crawl status until page data is ready or the import times out.
- `web/lib/clipstitchr/server/createProductWebsiteDetailsText.ts` combines the
  returned pages into one capped website-context string.
- `web/lib/clipstitchr/server/createProductEnrichmentPrompt.ts` asks the model
  for a website-grounded product truth summary and blank-field audience
  prefill.
- `web/lib/clipstitchr/server/createResolvedProductEnrichmentFields.ts` prefers
  the grounded product summary only when website import explicitly ran. Other
  user-entered fields remain authoritative.
- `web/app/api/settings/products/route.ts` and
  `web/app/api/settings/products/[id]/route.ts` consume the existing product
  enrichment rate limit before Firecrawl and Replicate work.
- Product creation is surfaced from the dashboard sidebar product switcher.

## Abuse Protection

The same product enrichment limit protects website import and AI enrichment:
100/hour/user with burst 20, 2,000/30 days/user, and 5,000/hour globally.
Firecrawl cost is also bounded by the 15-page crawl limit.

## Source References

- `docs/operations/security/rate-limits.md`
- `web/lib/clipstitchr/constants/productWebsiteCrawlPageLimit.ts`
- `web/lib/clipstitchr/server/scrapeProductWebsiteDetails.ts`
- `web/lib/clipstitchr/server/createProductEnrichmentPrompt.ts`
- `web/lib/clipstitchr/server/createResolvedProductEnrichmentFields.ts`
