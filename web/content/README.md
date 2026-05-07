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
- `canonical`: absolute URL that matches the configured site URL and the article slug
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

## MDX Rules

- Do not import components directly inside MDX files.
- Use only the globally registered components from `lib/content/mdx-components.tsx`.
- `CallToAction` is available for inline calls to action.
- Keep FAQ data in frontmatter when the same questions should power the page and JSON-LD.

## Canonical Rules

- Update `NEXT_PUBLIC_SITE_URL` or `SITE_URL` before production builds.
- Update each article `canonical` field whenever the site domain changes.
- The content build fails if a canonical URL does not match the configured site URL plus the slug.
