# ClipStitchr

ClipStitchr lets users upload UGC reaction clips and product demo videos, then automatically stitches them together to produce polished marketing videos.

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

## Local Media Workflow

The MVP is browser-local:

- Uploaded UGC and Demo videos are normalized to TikTok 9:16 before they are saved.
- Normalized clip/photo metadata is stored separately from full media blobs in IndexedDB.
- Library views read metadata and poster/thumbnail blobs first; full media blobs are loaded on demand for preview, export, generation, and download.
- Stitches are stored as `Blob` values in IndexedDB with their export metadata.
- Each saved video also stores a generated JPEG `posterBlob` plus `posterVersion`.
- Posters are generated in the browser by seeking through candidate frames and choosing a visibly non-black frame for the video element's `poster` attribute.
- Older records without posters, or with stale poster versions, are backfilled when the library loads.
- User-authored thumbnail generation and thumbnail editing are not part of the MVP.

## Project Structure

```
├── app/
│   ├── page.tsx                 # Landing page
│   ├── dashboard/               # Authenticated Dashboard, Stitchr, Uploads, Swapr, and Stitches routes
│   ├── uploads/                 # Upload library route
│   ├── stitches/                # Stitches library route
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
│       ├── privacy/page.tsx
│       └── terms/page.tsx
├── lib/
│   ├── site.ts                  # Site config (single source of truth)
│   ├── metadata.ts              # Page metadata helper
│   ├── llms.ts                  # LLMs.txt generator
│   ├── clipstitchr/
│   │   ├── media/               # Media Bunny processing + poster capture helpers
│   │   ├── storage/             # IndexedDB helpers
│   │   ├── hooks/               # Browser-local app state hooks
│   │   ├── types/               # ClipStitchr data model types
│   │   └── constants/           # ClipStitchr media/storage constants
│   ├── content/
│   │   ├── schema.ts            # Blog frontmatter schema (Zod)
│   │   ├── queries.ts           # Content query helpers
│   │   ├── mdx-components.tsx   # MDX component registry
│   │   └── seo.ts               # Article JSON-LD, OG, RSS
│   └── og/
│       └── server-resolver.ts   # OG image fallback resolver
├── content/
│   └── blog/                    # MDX blog posts go here
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
canonical: "http://localhost:3000/blog/your-post-slug"
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
| `canonical` | Must be absolute URL matching site URL + slug |
| `intent` | `informational`, `commercial`, `comparison`, or `transactional` |
| `ctaVariant` | `survey`, `primary`, or `validation` |
| `schemaTypeHints` | `article`, `faq`, and/or `comparison` |

### Available MDX Components

- `<CallToAction />` — Inline CTA block using `site.ctaUrl`

Do not import components inside MDX files. All components are registered globally in `lib/content/mdx-components.tsx`.

## SEO

Everything is pre-configured:

- **Sitemap** — Auto-generated at `/sitemap.xml` from static pages + blog posts
- **Private dashboard routes** — Excluded from sitemap and LLM discovery files
- **Robots.txt** — At `/robots.txt`
- **RSS** — At `/feed.xml`
- **LLMs.txt** — At `/llms.txt`
- **JSON-LD** — WebSite + Organization on every page, Article + FAQ on blog posts
- **Open Graph + Twitter Cards** — Generated from page metadata
- **Canonical URLs** — From `lib/site.ts` config

## Testing

```bash
npm test
```

Includes tests for:
- Blog frontmatter schema validation
- SEO metadata generation
- Article JSON-LD and RSS output
- Sitemap coverage
- Page metadata helpers

## Security

Content Security Policy and security headers are configured in `next.config.ts`. The CSP allows HTTPS scripts and Cloudflare challenge frames so Clerk components can load correctly.

## Deployment

This is a standard Next.js app. Deploy to:

- [Vercel](https://vercel.com) — `npm run build`
- [Netlify](https://netlify.com) — `npm run build`
- Any Node.js host — `npm run build && npm start`

Set `NEXT_PUBLIC_SITE_URL` to your production domain before deploying. Update all `canonical` fields in blog posts to match.

## License

MIT
