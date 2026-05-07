<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Blog And SEO Foundation

- Keep site-wide URLs, brand metadata, keywords, OG helpers, and canonical helpers in `lib/site.ts`.
- Keep non-content metadata generation in `lib/metadata.ts`.
- Keep content schema, query helpers, MDX component registration, and content SEO helpers under `lib/content/`.
- Keep authored MDX under `content/blog/` and compile it through `content-collections.ts`.
- Keep the build flow aligned with `npm run content:build` before `typecheck`, `test`, `lint`, or `build`.
- Keep CSP and shared security headers centralized in `next.config.ts`.
- Keep discovery outputs in `app/feed.xml/route.ts`, `app/llms.txt/route.ts`, `app/robots.ts`, and `app/sitemap.ts`.

# Editorial Rules

- `seoTitle` is required for blog posts and must stay between 50 and 70 characters.
- Metadata descriptions for content and non-content pages must stay between 110 and 170 characters.
- Visible page titles can be longer than `seoTitle` when editorial clarity benefits from it.
- Canonical URLs in content frontmatter must be absolute and must match the configured site URL plus the post slug.
- Keep MDX component registration centralized in `lib/content/mdx-components.tsx`; do not import components directly inside MDX files.
- Keep FAQ data in frontmatter when the same questions should power both page content and JSON-LD.
