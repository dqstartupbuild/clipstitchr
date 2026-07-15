# Localization Plan

## Recommended Approach

The easiest practical path for ClipStitchr is to use `next-intl` with locale-prefixed App Router routes.

Recommended URL shape:

```txt
/en
/es
/en/blog
/es/blog
/en/dashboard
/es/dashboard
```

Next.js can route by locale with a dynamic segment such as `app/[locale]/...`, but it does not translate application copy or MDX content by itself. `next-intl` adds the useful app-level pieces: locale detection, localized links, message dictionaries, typed translation access, and metadata support.

Primary references:

- Next.js internationalization guide: https://nextjs.org/docs/app/guides/internationalization
- `next-intl` routing docs: https://next-intl.dev/docs/routing
- `next-intl` translations docs: https://next-intl.dev/docs/usage/translations

## Implementation Phases

1. Install `next-intl`.
2. Define supported locales, starting with `en` and any first target locale such as `es`.
3. Add message dictionaries such as `messages/en.json` and `messages/es.json`.
4. Move public-facing routes under a locale segment, for example `app/[locale]/(content)/blog/page.tsx`.
5. Replace hardcoded UI copy with translation keys.
6. Localize page metadata, canonical URLs, sitemap entries, and alternate locale links.
7. Decide whether dashboard routes should be localized immediately or after the public marketing/content pages.

## Application Copy

Application UI copy should live in locale message files, not inline inside components.

Example:

```json
{
  "BlogIndex": {
    "eyebrow": "Resources",
    "title": "The ClipStitchr Blog",
    "description": "Practical notes on browser video processing and UGC-to-demo production workflows.",
    "featuredArticle": "Featured article",
    "minutesRead": "{minutes} min read"
  }
}
```

Components should then read copy from the active locale instead of hardcoding English strings.

## Blog Localization

Blog posts will not localize automatically.

The current blog system compiles authored MDX from `web/content/blog/**/*.mdx` through `web/content-collections.ts`. Blog URLs are currently generated as `/blog/${slug}`, and the content schema does not include locale or translation grouping fields.

For localized blogs, use explicit localized MDX files. A clean structure would be:

```txt
web/content/blog/en/how-to-make-ugc-ads.mdx
web/content/blog/es/como-hacer-anuncios-ugc.mdx
```

Each localized post should have its own translated title, SEO title, description, slug, tags, FAQ entries, body copy, and canonical URL.

Suggested frontmatter additions:

```yaml
locale: "es"
translationKey: "how-to-make-ugc-ads"
slug: "como-hacer-anuncios-ugc"
canonical: "https://clipstitchr.com/es/blog/como-hacer-anuncios-ugc"
```

`translationKey` should be stable across translations of the same article. Slugs should be localized when that is better for search intent.

## Automatic Translation

Browser auto-translation can help individual visitors, but it does not create real localized pages for SEO, metadata, RSS, sitemap entries, Open Graph previews, or internal links.

Do not translate blog posts dynamically at request time as the main localization strategy. It creates quality, caching, indexing, and canonical URL problems.

Machine translation can still be useful as an editorial workflow. The safer model is:

1. Generate a draft localized MDX file.
2. Review and edit the translation.
3. Publish it as a first-class localized article.

## SEO Requirements

When localized pages are added, update:

- Canonical URLs for each locale.
- `alternates.languages` metadata for locale variants.
- `app/sitemap.ts` to include localized public pages and posts.
- `app/feed.xml/route.ts` if localized RSS feeds are desired.
- `app/llms.txt/route.ts` if localized public content should be exposed there.
- Blog schema and JSON-LD output so article metadata matches the active locale.

Localized content should be treated as authored content with its own SEO metadata, not as a display-only translation layer.
