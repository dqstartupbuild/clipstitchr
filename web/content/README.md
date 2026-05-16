# Content Authoring

All authored MDX lives in `content/blog/`.

## Required Frontmatter

- `title`: visible article title
- `seoTitle`: required SEO title, 50-70 characters
- `slug`: lowercase hyphenated slug only
- `description`: metadata description, 110-170 characters
- `date`: `YYYY-MM-DD`
- `author`
- `category`
- `tags`
- `image`: relative asset path such as `/og/default.png`
- `targetKeyword`
- `intent`
- `ctaVariant`
- `schemaTypeHints`
- `content`: handled automatically by the parser and validated by the collection build

## Optional Frontmatter

- `updated`
- `draft`
- `faq`
- `relatedSlugs`
- `excerpt`
- `featured`
- `canonical`: legacy/local authoring override. Published canonicals are derived
  from the deployment site URL and post slug during the content build.

## MDX Rules

- Do not import components directly inside MDX files.
- Use only the globally registered components from `lib/content/mdx-components.tsx`.
- `CallToAction` is available for inline calls to action.
- Keep FAQ data in frontmatter when the same questions should power the page and JSON-LD.

## Canonical Rules

- Production builds use `NEXT_PUBLIC_SITE_URL` or `SITE_URL` when configured.
- Vercel preview builds use `NEXT_PUBLIC_PREVIEW_SITE_URL` or
  `PREVIEW_SITE_URL` first, then Vercel's branch/deployment URL system
  variables.
- Do not hard-code published blog canonicals in MDX. The content build derives
  them from the active deployment URL plus the slug.
