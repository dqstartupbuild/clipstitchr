# Blog Publish Webhook

ClipStitchr accepts finished blog posts from an external publisher (Blogger)
through a public, token-protected webhook. Published posts are stored durably in
Convex and rendered at runtime on `/blog` and `/blog/[slug]`, alongside the
build-time MDX posts in `web/content/blog`.

## Endpoint

```
POST /api/webhooks/blog-publisher
```

- Runs on the Node.js runtime.
- Public route (no Clerk session). Access is gated by a server-only bearer
  token, then by a server-side rate limit.

## Authentication

The route reads the `Authorization` header and requires
`Authorization: Bearer <token>`. The provided token is compared in constant
time against the `BLOG_PUBLISH_WEBHOOK_TOKEN` environment variable.

- A missing or wrong token returns `401`:

  ```json
  { "error": "Invalid access token." }
  ```

- The token is never read in browser code and is not prefixed with
  `NEXT_PUBLIC_`.

## Environment Variable

```bash
BLOG_PUBLISH_WEBHOOK_TOKEN=replace-with-a-long-secret
```

- Required in the Next.js runtime environment.
- Generate a high-entropy value, for example `openssl rand -base64 32`.
- Set it in `.env.local` for local development and in the hosting provider's
  environment for production.
- `RATE_LIMIT_API_SECRET` and `NEXT_PUBLIC_CONVEX_URL` must also be configured,
  because the route consumes a Convex rate limit and writes posts through the
  Convex HTTP client.
- `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, and
  `R2_SECRET_ACCESS_KEY` must be configured so temporary publisher images can
  be copied into ClipStitchr-owned durable storage.

## Supported Events

### `publish_articles`

Saves every item in `data.articles`.

```json
{
  "event_type": "publish_articles",
  "timestamp": "2026-06-23T16:00:00.000Z",
  "data": {
    "articles": [
      {
        "id": "blog-id",
        "title": "A Helpful Blog Title",
        "slug": "a-helpful-blog-title",
        "meta_description": "A short plain-language summary.",
        "content_format": "mdx",
        "content_markdown": "# Article body",
        "content_mdx": "# Article body",
        "content_html": "",
        "image_url": "https://clipstitchr.com/og/default.png",
        "tags": ["keyword"],
        "source": "Blogger",
        "created_at": "2026-06-23T15:30:00.000Z",
        "updated_at": "2026-06-23T15:45:00.000Z"
      }
    ]
  }
}
```

### `update_article`

Saves the single item in `data.article`. Same article shape as above. Provided
for future updates from the publisher.

## Behavior

- Posts are upserted by `slug`. Publishing the same blog again updates the
  existing page instead of creating a duplicate.
- `content_mdx` is the source of truth for the body. When `content_mdx` is
  empty, `content_markdown` is used. When both are empty, `content_html` is used.
- `content_html` is not saved for MDX or Markdown posts. This prevents stale
  publisher HTML from bypassing rewritten image URLs.
- `image_url`, Markdown image URLs, and frontmatter `featureImage` or `image`
  URLs are treated as temporary source URLs. The webhook downloads each unique
  image, verifies it is an allowed image type, caps it at 10 MB, stores it under
  the `blog-images/` R2 prefix, and rewrites the saved body and feature image to
  ClipStitchr public image URLs.
- The public image URLs are served by `GET /blog-images/[...path]`, which maps
  back to the private R2 `blog-images/` object prefix and sends long-lived cache
  headers.
- Invalid, unavailable, non-image, unsupported, timed out, or oversized required
  images fail the publish with `400` before the Convex post upsert.
- `tags` are trimmed, de-duplicated, and capped.
- When `slug` is missing, a slug is derived from `title`.
- After a successful publish the route revalidates `/blog`, `/feed.xml`,
  `/sitemap.xml`, and each affected `/blog/{slug}` path so new and updated
  posts appear immediately.
- A successful publish returns `200`:

  ```json
  { "message": "Published." }
  ```

## Rendering

- Webhook posts are stored in the Convex `blogPosts` table and rendered at
  request time. `markdown` and `mdx` bodies are converted to sanitized HTML with
  the dependency-free renderer in `web/lib/content/markdown`. The renderer
  supports headings, heading anchors such as `{#section-id}`, paragraphs, lists,
  links, lazy images, blockquotes, fenced code, horizontal rules, Markdown
  tables, and YouTube embeds from either plain YouTube URLs or iframe blocks.
- Runtime Markdown images are rendered with `loading="lazy"` and
  `decoding="async"`. Generated image and link HTML is protected before inline
  emphasis is applied so signed R2 URLs containing underscores are not rewritten
  into invalid URLs.
- YouTube embeds are rewritten to `youtube-nocookie.com` iframe URLs and are
  allowed by the shared content security policy.
- When a webhook body starts with an H1 that exactly matches the page title, the
  duplicate body H1 is removed so the public page keeps one visible article
  title.
- `html` bodies are rendered as provided only when neither `content_mdx` nor
  `content_markdown` is present.
- Existing MDX posts in `web/content/blog` continue to render through
  content-collections. If a webhook slug collides with an MDX slug, the MDX post
  wins on the index and detail pages.
- Runtime Convex posts are included in `/feed.xml` and `/sitemap.xml` unless an
  authored MDX post already owns the same slug. Runtime sitemap entries include
  the copied feature image when one exists.

## File Tree

```
web/
  app/
    blog-images/
      [...path]/
        route.ts                      # public cached reader for copied blog images
        route.test.ts
    api/
      webhooks/
        blog-publisher/
          route.ts                     # auth -> parse -> rate limit -> copy images -> upsert
          route.test.ts
    (content)/
      blog/
        page.tsx                       # index: merges MDX + Convex posts
        [slug]/page.tsx                # detail: MDX first, then Convex post
    _components/
      content/
        RuntimeBlogArticle.tsx         # renders sanitized HTML body
        MdxImage.tsx                   # lazy image component for authored MDX
        MdxIframe.tsx                  # responsive embed component for authored MDX
        MdxTable.tsx                   # table wrapper for authored MDX
        MdxTableCell.tsx
        MdxTableHeaderCell.tsx
        MdxFigure.tsx
        MdxFigcaption.tsx
  convex/
    schema.ts                          # adds blogPosts table (by_slug, by_published)
    blogPosts.ts                       # upsertPublishedArticle + public queries
    rateLimiter.ts                     # blogPublishWebhook buckets
    rateLimits.ts                      # consumeBlogPublishWebhook mutation
    validators/
      blogPostContentFormat.ts
  lib/
    clipstitchr/server/blog/
      getBlogPublishWebhookToken.ts
      readBearerToken.ts
      getIsAuthorizedBlogPublishRequest.ts
      blogPublishPayloadSchema.ts
      parseBlogPublishPayload.ts
      slugifyBlogTitle.ts
      normalizeBlogArticle.ts
      copyBlogArticleImages.ts
      collectBlogImageSourceUrls.ts
      copyBlogImageSource.ts
      fetchBlogImageSource.ts
      rewriteBlogArticleImageUrls.ts
      createBlogImageObjectKey.ts
      createBlogImagePublicUrl.ts
      getBlogImageR2KeyFromRoutePath.ts
      readBlogImageObject.ts
      createBlogPublishRateLimitKey.ts
    content/
      RssPost.ts
      getRssBlogPosts.ts
      markdown/
        escapeHtml.ts
        getYouTubeEmbedUrl.ts
        renderYouTubeEmbedHtml.ts
        renderInlineMarkdown.ts
        stripFrontmatter.ts
        renderMarkdownToHtml.ts
        renderMarkdownTable.ts
      runtimeBlog/
        runtimeBlogPost.ts
        blogPostCard.ts
        createRuntimeBlogPostMetadata.ts
        decodeBasicHtmlEntities.ts
        estimateReadingTimeMinutes.ts
        renderRuntimeBlogContent.ts
        stripRuntimeBlogTitleHeading.ts
        toRuntimeBlogPostFromConvex.ts
        fetchConvexBlogPosts.ts
        getBlogPostCards.ts
        getRuntimeBlogSitemapEntries.ts
docs/
  backend/
    blog-publish-webhook.md            # this file
    rate-limits.md                     # env var + enforcement row
```

## How to Test

### Local request

Start the app from `web/`:

```bash
npm run dev
```

Send a valid publish request (replace the token with your local value):

```bash
curl -i -X POST http://localhost:3000/api/webhooks/blog-publisher \
  -H "Authorization: Bearer $BLOG_PUBLISH_WEBHOOK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "publish_articles",
    "timestamp": "2026-06-23T16:00:00.000Z",
    "data": {
      "articles": [
        {
          "id": "blog-id",
          "title": "A Helpful Blog Title",
          "slug": "a-helpful-blog-title",
          "meta_description": "A short plain-language summary.",
          "content_format": "mdx",
          "content_mdx": "# Article body\n\n![Feature proof](https://clipstitchr.com/og/default.png)\n\nWelcome to the post.",
          "content_markdown": "# Article body",
          "content_html": "",
          "image_url": "https://clipstitchr.com/og/default.png",
          "tags": ["keyword"],
          "source": "Blogger",
          "created_at": "2026-06-23T15:30:00.000Z",
          "updated_at": "2026-06-23T15:45:00.000Z"
        }
      ]
    }
  }'
```

Expected response:

```
HTTP/1.1 200 OK
{ "message": "Published." }
```

Then open `http://localhost:3000/blog` and
`http://localhost:3000/blog/a-helpful-blog-title` to confirm the post renders.
Send the same request again with edited fields to confirm the existing page is
updated (upsert by slug). Check the saved article source or page HTML to confirm
the public image URLs point at `/blog-images/...`, not the original publisher
URLs.

### Auth failures

```bash
curl -i -X POST http://localhost:3000/api/webhooks/blog-publisher \
  -H "Content-Type: application/json" \
  -d '{ "event_type": "publish_articles", "data": { "articles": [] } }'
```

Expected response:

```
HTTP/1.1 401 Unauthorized
{ "error": "Invalid access token." }
```

### Automated tests

```bash
npm test
```

Focused suites:

- `app/api/webhooks/blog-publisher/route.test.ts`
- `app/blog-images/[...path]/route.test.ts`
- `lib/clipstitchr/server/blog/getIsAuthorizedBlogPublishRequest.test.ts`
- `lib/clipstitchr/server/blog/parseBlogPublishPayload.test.ts`
- `lib/clipstitchr/server/blog/normalizeBlogArticle.test.ts`
- `lib/clipstitchr/server/blog/copyBlogArticleImages.test.ts`
- `lib/clipstitchr/server/blog/copyBlogImageSource.test.ts`
- `lib/clipstitchr/server/blog/fetchBlogImageSource.test.ts`
- `lib/content/markdown/renderMarkdownToHtml.test.ts`
- `lib/content/runtimeBlog/renderRuntimeBlogContent.test.ts`
- `lib/content/runtimeBlog/toRuntimeBlogPostFromConvex.test.ts`
- `app/sitemap.test.ts`
- `app/staticRoutes.test.ts`
```
