# ClipStitchr

ClipStitchr helps marketers turn UGC clips and product demo videos into
finished 9:16 ad variants without opening a traditional video editor.

The primary workflow is Stitchr: upload clips once, keep them organized in a
content library, then pair up to 20 UGC clips with one product demo to create
finished ads. AI features such as avatar photo generation, photo expansion, and
Swapr are secondary helpers for creating or extending source material.

Built with [Next.js](https://nextjs.org), [Clerk](https://clerk.com), [Tailwind CSS](https://tailwindcss.com), [Content Collections](https://www.content-collections.dev), and [Media Bunny](https://mediabunny.dev).

## Quick Start

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Clerk is required for the dashboard and private API routes:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
RATE_LIMIT_API_SECRET=your_shared_rate_limit_secret
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_BUCKET_NAME=your_bucket_name
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
REPLICATE_API_TOKEN=your_replicate_token
AVATAR_PHOTO_MODEL_ID=openai/gpt-image-2
SWIPR_BACKGROUND_MODEL_ID=openai/gpt-image-2
REPLICATE_UPLOAD_ANALYSIS_MODEL_ID=openai/gpt-4.1-mini
REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID=google/gemini-3-flash
TEXT_WRITING_MODEL_ID=anthropic/claude-sonnet-4.6
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with content watching |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run tests with coverage |
| `npm run content:build` | Build content collections |
| `npm run content:watch` | Watch content for changes |

## Media Workflow

The app processes media in the browser and stores durable data in Convex and Cloudflare R2:

- Uploaded UGC and Demo videos are normalized to TikTok 9:16 before they are saved.
- Stitchr can select up to 20 UGC videos with one selected Demo video, preview
  each UGC-then-Demo sequence, and export one finished stitch per selected UGC.
- Saved stitches can be reused as Stitchr templates, preselecting their source
  clips, trims, text overlays, audio flags, and playback rates for a new stitch.
- Saved stitches can be marked posted or active; the Stitches library filters
  them into Active, Posted, and All views without changing the saved output.
- Convex stores clip, photo, stitch, tag, trim, and R2 object metadata.
- Cloudflare R2 stores normalized videos, stitched videos, photos, posters, and thumbnails.
- Library views read Convex metadata first; preview media is hydrated from R2 as needed.
- The Library route at `/dashboard/library` includes UGC, Demo, Swaps, Swipes,
  Stitches, Avatars, and Templates tabs.
- Avatar photo upload, avatar descriptions, and generated avatar scenario photos
  live in the Library Avatars tab.
- Each saved video also stores a generated JPEG poster object plus `posterVersion`.
- Posters are generated in the browser by seeking through candidate frames and choosing a visibly non-black frame for the video element's `poster` attribute.
- User-authored thumbnail generation and thumbnail editing are not part of the MVP.

## Product Docs

- `../docs/product/positioning.md` defines the customer pain, product promise,
  audience, feature hierarchy, and AI positioning.
- `../docs/product/copywriting-guide.md` defines reusable marketing and UI copy
  guidance.
- `../docs/features/stitchr.md` defines the primary Stitchr workflow and
  product principles.
- `../docs/architecture/models.md` lists supported Replicate model IDs and their model-specific
  request workflows.
- `../monetization.md` defines hypothetical pricing, margin, rate-limit, and
  plan-positioning assumptions.

## Project Structure

```
├── app/
│   ├── page.tsx                 # Landing page
│   ├── dashboard/               # Authenticated workspace routes
│   │   ├── library/             # Library route with UGC, Demo, Swaps, Swipes, Stitches, Avatars, and Templates tabs
│   │   ├── uploads/             # Compatibility redirect to library
│   │   ├── avatars/             # Compatibility redirect to library?tab=avatars
│   │   ├── stitchr/             # Stitchr video stitching route
│   │   ├── swapr/               # Swapr AI motion-transfer route
│   │   └── stitches/            # Compatibility redirect to library?tab=stitches
│   ├── _components/             # Atomic UI, dashboard, Stitchr, and landing components
│   ├── layout.tsx               # Root layout (fonts, JSON-LD)
│   ├── globals.css              # Design system tokens + utilities
│   ├── site-header.tsx          # Shared header
│   ├── site-footer.tsx          # Shared footer
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── feed.xml/route.ts        # RSS feed
│   ├── llms.txt/route.ts        # LLMs.txt
│   └── (content)/
│       ├── layout.tsx           # Content page layout
│       ├── blog/
│       │   ├── page.tsx         # Blog index
│       │   └── [slug]/page.tsx  # Blog post
│       ├── case-studies/
│       │   ├── page.tsx         # Case studies index
│       │   └── [slug]/page.tsx  # Case study detail
│       ├── privacy/page.tsx
│       └── terms/page.tsx
├── lib/
│   ├── site.ts                  # Site config (single source of truth)
│   ├── metadata.ts              # Page metadata helper
│   ├── llms.ts                  # LLMs.txt generator
│   ├── clipstitchr/
│   │   ├── backend/             # Convex/R2 document hydration helpers
│   │   ├── client/r2/           # Browser helpers for signed R2 object access
│   │   ├── media/               # Media Bunny processing + poster capture helpers
│   │   ├── hooks/               # Browser-local app state hooks
│   │   ├── types/               # ClipStitchr data model types
│   │   └── constants/           # ClipStitchr media constants
│   ├── content/
│   │   ├── baseContentDocumentSchema.ts
│   │   ├── blogDocumentSchema.ts
│   │   ├── caseStudyDocumentSchema.ts
│   │   ├── queries.ts           # Blog query helpers
│   │   ├── caseStudyQueries.ts  # Case study query helpers
│   │   ├── mdx-components.tsx   # MDX component registry
│   │   └── seo.ts               # Article JSON-LD, OG, RSS
│   └── og/
│       └── server-resolver.ts   # OG image fallback resolver
├── content/
│   ├── blog/                    # MDX blog posts
│   └── case-studies/            # MDX case studies
├── scripts/
│   ├── build-content-collections.mjs
│   └── watch-content-collections.mjs
├── proxy.ts                     # Clerk middleware and dashboard route protection
└── public/
    └── og/                      # OG images (add default.png)
```

## Configuration

All site-wide values live in **`lib/site.ts`**:

- Site name, URL, and description
- Publisher name (for JSON-LD)
- CTA URL and label
- Static public pages for the sitemap
- Keywords

Update `NEXT_PUBLIC_SITE_URL` in `.env.local` before deploying to production. Dashboard routes are authenticated and intentionally excluded from `/sitemap.xml` and `/llms.txt`.

## Authentication

Clerk is mounted in `app/layout.tsx`, initialized by `proxy.ts`, and used by the shared site header for sign-in, sign-up, and the profile menu. `/dashboard` and nested dashboard pages are protected by Clerk middleware. App API routes under `/api` call `auth()` server-side and return `401` JSON responses when no signed-in user is present.

## Writing Blog Posts

Create a new `.mdx` file in `content/blog/`:

```yaml
---
title: "Your Post Title"
seoTitle: "Your SEO Title — Must Be Between 50 and 70 Characters Long"
slug: "your-post-slug"
description: "A description between 110 and 170 characters. This appears in search results and social shares, so make it compelling and accurate."
date: "2026-01-15"
author: "Your Name"
category: "guides"
tags:
  - "your-tag"
image: "/og/default.png"
targetKeyword: "your keyword"
intent: "informational"
ctaVariant: "primary"
schemaTypeHints:
  - "article"
---

Your MDX content here.
```

### Frontmatter Rules

| Field | Constraint |
|---|---|
| `seoTitle` | 50–70 characters |
| `description` | 110–170 characters |
| `slug` | Lowercase, hyphenated only |
| `canonical` | Optional legacy override. Prefer generated canonicals. |
| `intent` | `informational`, `commercial`, `comparison`, or `transactional` |
| `ctaVariant` | `survey`, `primary`, or `validation` |
| `schemaTypeHints` | `article`, `faq`, and/or `comparison` |

## Writing Case Studies

Create a new `.mdx` file in `content/case-studies/`. Case studies use the same
core frontmatter as blog posts and also require:

```yaml
companyName: "Customer or product name"
productName: "Product name"
metrics:
  - label: "Total views"
    value: "161K+"
tools:
  - "ClipStitchr"
```

### Available MDX Components

- `<CallToAction />` — Inline CTA block using `site.ctaUrl`

Do not import components inside MDX files. All components are registered globally in `lib/content/mdx-components.tsx`.

## SEO

Everything is pre-configured:

- **Sitemap** — Auto-generated at `/sitemap.xml` from static pages, blog posts, case studies, docs, and examples
- **Private dashboard routes** — Excluded from sitemap and LLM discovery files
- **Robots.txt** — At `/robots.txt`
- **RSS** — At `/feed.xml`
- **LLMs.txt** — At `/llms.txt`
- **JSON-LD** — WebSite + Organization on every page, Article + FAQ on blog posts and case studies
- **Open Graph + Twitter Cards** — Generated from page metadata
- **Canonical URLs** — From `lib/site.ts` config

## Testing

```bash
npm test
```

Includes tests for:
- Blog and case study frontmatter schema validation
- SEO metadata generation
- Article JSON-LD and RSS output
- Sitemap coverage
- Page metadata helpers

## Security

Content Security Policy and security headers are configured in `next.config.ts`. The CSP allows HTTPS scripts, Cloudflare challenge frames, and Vercel Live feedback frames so Clerk components and preview feedback can load correctly.

## Deployment

This is a standard Next.js app. Deploy to:

- [Vercel](https://vercel.com) — `npm run build`
- [Netlify](https://netlify.com) — `npm run build`
- Any Node.js host — `npm run build && npm start`

Set `NEXT_PUBLIC_SITE_URL` to your production domain before deploying so generated canonical URLs match the live site.

## License

MIT
