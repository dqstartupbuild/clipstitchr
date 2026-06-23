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
        "image_url": "https://example.com/image.jpg",
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
- `image_url` is stored as the feature image when it is a valid absolute
  `http(s)` URL.
- `tags` are trimmed, de-duplicated, and capped.
- When `slug` is missing, a slug is derived from `title`.
- After a successful publish the route revalidates `/blog` and each affected
  `/blog/{slug}` path so new and updated posts appear immediately.
- A successful publish returns `200`:

  ```json
  { "message": "Published." }
  ```

## Rendering

- Webhook posts are stored in the Convex `blogPosts` table and rendered at
  request time. `markdown` and `mdx` bodies are converted to sanitized HTML with
  the dependency-free renderer in `web/lib/content/markdown`. `html` bodies are
  rendered as provided (trusted publisher).
- Existing MDX posts in `web/content/blog` continue to render through
  content-collections. If a webhook slug collides with an MDX slug, the MDX post
  wins on the index and detail pages.

## File Tree

```
web/
  app/
    api/
      webhooks/
        blog-publisher/
          route.ts                     # POST handler: auth -> parse -> rate limit -> upsert
          route.test.ts
    (content)/
      blog/
        page.tsx                       # index: merges MDX + Convex posts
        [slug]/page.tsx                # detail: MDX first, then Convex post
    _components/
      content/
        RuntimeBlogArticle.tsx         # renders sanitized HTML body
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
      createBlogPublishRateLimitKey.ts
    content/
      markdown/
        escapeHtml.ts
        renderInlineMarkdown.ts
        stripFrontmatter.ts
        renderMarkdownToHtml.ts
      runtimeBlog/
        runtimeBlogPost.ts
        blogPostCard.ts
        estimateReadingTimeMinutes.ts
        renderRuntimeBlogContent.ts
        toRuntimeBlogPostFromConvex.ts
        fetchConvexBlogPosts.ts
        getBlogPostCards.ts
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
          "content_mdx": "# Article body\n\nWelcome to the post.",
          "content_markdown": "# Article body",
          "content_html": "",
          "image_url": "https://example.com/image.jpg",
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
updated (upsert by slug).

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
- `lib/clipstitchr/server/blog/getIsAuthorizedBlogPublishRequest.test.ts`
- `lib/clipstitchr/server/blog/parseBlogPublishPayload.test.ts`
- `lib/clipstitchr/server/blog/normalizeBlogArticle.test.ts`
- `lib/content/markdown/renderMarkdownToHtml.test.ts`
- `lib/content/runtimeBlog/renderRuntimeBlogContent.test.ts`
- `lib/content/runtimeBlog/toRuntimeBlogPostFromConvex.test.ts`
```
