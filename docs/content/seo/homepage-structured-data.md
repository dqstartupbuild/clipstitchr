# Homepage Structured Data

## Purpose

The ClipStitchr homepage is a public acquisition page for founders and app
marketers who need to make short-form app ads from existing UGC clips and
product demos. Its metadata and structured data make that job explicit to search
engines and link previews without making performance claims.

## Implementation

- `web/app/page.tsx` owns homepage-specific title, description, canonical URL,
  and intent-aligned terms.
- `web/app/_components/landing/LandingSeoStructuredData.tsx` renders one JSON-LD
  graph for the page.
- `web/lib/clipstitchr/seo/createHomepageStructuredData.ts` defines the
  `WebPage` and `SoftwareApplication` entities, including the real paid plan
  starting price and supported workflows.
- `web/app/_components/landing/LandingDiscoverySection.tsx` exposes visible,
  contextual links to tools, examples, and guides. These links are the human
  and crawler-facing paths from the homepage to the public content clusters.

## Content Rules

- Keep the visible headline brand-led, but make the supporting copy identify
  UGC app ads, product-demo ads, and short-form app ads in plain language.
- Keep software schema aligned with shipped behavior and current pricing.
- Do not add FAQ schema unless the same answers are visibly rendered on the
  homepage.
- Do not promise ad performance, virality, or unsupported integrations.

## Verification

Run from `web/`:

```bash
npm test -- LandingPage
npm run typecheck
npm run lint
```

Before deployment, inspect the rendered page source and validate the JSON-LD
with a structured-data validator. Confirm that the canonical URL uses the
production `NEXT_PUBLIC_SITE_URL` value.
