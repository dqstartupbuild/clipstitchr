# Blogr Publishing Receiver

ClipStitchr receives finished posts when an editor clicks **Publish** in Blogr.
The public webhook stores full article records in Convex, stores compact
discovery records in a separate Convex table, copies publisher images into the
private ClipStitchr Cloudflare R2 bucket, and refreshes the public blog.

Production article bodies and images never use checked-in files, local JSON,
memory, or serverless temporary storage.

## Endpoint

```text
POST /api/webhooks/blog-publisher
```

The route runs in the Next.js Node.js runtime. It does not require a Clerk
session. It requires:

```http
Authorization: Bearer <BLOG_PUBLISH_WEBHOOK_TOKEN>
Content-Type: application/json
```

A missing or incorrect bearer token returns:

```json
{
  "error": "Invalid access token."
}
```

The comparison is constant-time. The token is server-only and must never use a
`NEXT_PUBLIC_` prefix.

## Required Setup

### Hosting environment

Set every value below in the Next.js production runtime:

```bash
BLOG_PUBLISH_WEBHOOK_TOKEN=replace-with-a-long-secret
CONVEX_URL=https://your-deployment.convex.cloud
RATE_LIMIT_API_SECRET=replace-with-a-second-long-secret
R2_ACCESS_KEY_ID=replace-with-r2-access-key-id
R2_SECRET_ACCESS_KEY=replace-with-r2-secret-access-key
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET=clipstitchr
NEXT_PUBLIC_SITE_URL=https://clipstitchr.com
```

Environment details:

- `BLOG_PUBLISH_WEBHOOK_TOKEN` is the access token copied into Blogr Settings.
  Generate it with `openssl rand -base64 32`.
- `CONVEX_URL` is preferred for this server route. `NEXT_PUBLIC_CONVEX_URL` may
  be used instead when the app already has it. The value must be the direct
  `https://*.convex.cloud` deployment URL.
- `RATE_LIMIT_API_SECRET` authorizes the rate-limit and article-upsert
  mutations. Set the same value in the Next.js runtime and Convex.
- `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` are an R2 S3-compatible access
  key pair with object read and write permission for the selected bucket.
- `R2_ENDPOINT` is the account-level R2 S3 endpoint shown by Cloudflare.
- `R2_BUCKET` is the existing private bucket name.
- `NEXT_PUBLIC_SITE_URL` supplies the production origin used for canonical
  article URLs and target-owned `/blog-images/...` URLs. Server-only `SITE_URL`
  can be used instead.

The shared R2 client still recognizes `R2_ACCOUNT_ID` and `R2_BUCKET_NAME` for
older ClipStitchr deployments, but the Blogr setup uses `R2_ENDPOINT` and
`R2_BUCKET`.

This integration does not use `CONVEX_SITE_URL`,
`NEXT_PUBLIC_CONVEX_SITE_URL`, `.convex.site`, Convex HTTP actions,
`R2_TOKEN`, `R2_PUBLIC_URL`, a public bucket, whole-bucket public access, or an
R2 custom domain.

### Convex

The Convex deployment needs the same rate-limit secret:

```bash
cd web
npx convex env set --prod RATE_LIMIT_API_SECRET
npx convex deploy
```

The environment command prompts for the value so the secret does not enter
shell history.

The deployment adds or updates:

- `blogPosts`, which stores the complete canonical article.
- `blogPostCards`, which stores only list, search/filter, sitemap, feed, and
  static-parameter fields.
- `blogPosts.upsertPublishedArticle`, the direct mutation called through
  `ConvexHttpClient`.
- `rateLimits.consumeBlogPublishWebhook`, which rejects abuse before image
  downloads, R2 writes, or article writes.

The route connects directly to `CONVEX_URL` or `NEXT_PUBLIC_CONVEX_URL` with
`ConvexHttpClient`. It does not forward the payload through `convex/http.ts`,
another HTTP action, or a proxy route.

If compact card rows need to be rebuilt for old webhook posts:

```bash
npx convex run blogPosts:rebuildPublishedBlogPostCards \
  '{"secret":"<RATE_LIMIT_API_SECRET>"}' \
  --prod
```

### Cloudflare R2

1. In Cloudflare, open **R2 Object Storage** and create or select the private
   ClipStitchr bucket.
2. Keep public development URLs and whole-bucket public access disabled.
3. Open **Manage R2 API Tokens** and create an S3-compatible access key scoped
   to this bucket with object read and write permission.
4. Copy the access key ID to `R2_ACCESS_KEY_ID`.
5. Copy the secret access key to `R2_SECRET_ACCESS_KEY`. Cloudflare shows it
   once.
6. Copy the S3 endpoint to `R2_ENDPOINT`. It has the form
   `https://<account-id>.r2.cloudflarestorage.com`.
7. Set the bucket name as `R2_BUCKET`.

The app serves copied images through
`GET /blog-images/[...path]`. That route reads only the private
`blog-images/` object prefix and returns a cacheable image response. The bucket
itself stays private.

### Blogr Settings

Use these values in the Blogr publisher settings:

```text
Webhook URL: https://clipstitchr.com/api/webhooks/blog-publisher
Access token: the exact BLOG_PUBLISH_WEBHOOK_TOKEN value
Publisher label: Blogr
```

The publisher label becomes the payload `source` value. ClipStitchr uses it as
article source/category context. It does not become the article author.
Webhook posts use `ClipStitchr` as the public author because the Blogr payload
does not contain an author field.

## Payload

### Publish one or more articles

```json
{
  "event_type": "publish_articles",
  "timestamp": "2026-06-23T16:00:00.000Z",
  "data": {
    "articles": [
      {
        "id": "blog-id",
        "title": "A Helpful Blog Title",
        "seo_title": "A Helpful Blog Title for Search Results With Clear Next Steps and Examples",
        "slug": "a-helpful-blog-title",
        "meta_description": "A helpful plain-English summary that tells readers what they will learn, why it matters, and what next step they can take.",
        "content_format": "mdx",
        "content_markdown": "# Article body",
        "content_mdx": "# Article body",
        "content_html": "",
        "image_url": "https://example.com/image.jpg",
        "tags": [
          "content planning",
          "team priorities",
          "weekly planning"
        ],
        "source": "Blogr",
        "created_at": "2026-06-23T16:00:00.000Z",
        "updated_at": "2026-06-23T16:00:00.000Z"
      }
    ]
  }
}
```

`publish_articles` saves every item in `data.articles`.

### Update one article

```json
{
  "event_type": "update_article",
  "timestamp": "2026-07-29T18:00:00.000Z",
  "data": {
    "article": {
      "id": "blog-id",
      "title": "An Updated Helpful Blog Title",
      "seo_title": "Updated Helpful Blog Guidance With Clear Search Steps and Examples",
      "slug": "an-updated-helpful-blog-title",
      "meta_description": "The latest plain-English summary.",
      "content_format": "mdx",
      "content_markdown": "# Updated article body",
      "content_mdx": "# Updated article body",
      "content_html": "",
      "image_url": "https://example.com/updated-image.jpg",
      "tags": ["content planning"],
      "source": "Blogr",
      "created_at": "2026-06-23T16:00:00.000Z",
      "updated_at": "2026-07-29T18:00:00.000Z"
    }
  }
}
```

`update_article` saves `data.article`.

## Upsert and Update Behavior

- The stable Blogr `id` is matched first.
- The slug is used only as the legacy fallback for rows that were saved before
  stable ID matching.
- Republishing updates the canonical `blogPosts` row and its `blogPostCards`
  row in one Convex transaction.
- If an earlier slug-based publish created duplicate rows, the ID-first upsert
  removes the stale article and compact card rows.
- A slug change removes the old compact card, saves the new one, and
  revalidates both the old and new article paths.
- The first saved `created_at` is preserved on updates.
- `updated_at` is replaced with the latest Blogr payload value.
- `title` stays the visible article title.
- `seo_title` is stored separately and used for page metadata and the RSS item
  title.
- `content_mdx` is the body source of truth. `content_markdown` is the fallback.
- Tags are trimmed, deduplicated, and capped before storage.

## Image Copying

Before any article record is saved, the route copies:

- `image_url`
- every Markdown image URL
- a frontmatter `featureImage` or `image` URL

Each unique source URL must:

- use HTTP or HTTPS
- respond before the 10-second timeout
- return a supported `image/*` content type
- stay at or below 10 MB

The object key is deterministic for the article slug and source image path.
The saved article body, frontmatter, and feature image field are rewritten to
ClipStitchr-owned `/blog-images/...` URLs. Blogr image URLs are never hotlinked.

## Rendering and Discovery

Webhook MDX and Markdown are rendered with the runtime safe Markdown renderer.
It:

- strips frontmatter
- escapes unapproved raw HTML
- supports H1 through H6 article headings
- builds the table of contents from H2 through H6
- generates stable heading IDs
- supports links, ordered and unordered lists, blockquotes, tables, fenced
  code, and Markdown images
- allows only recognized YouTube URLs or iframe blocks
- rewrites YouTube embeds to `youtube-nocookie.com`

Full bodies are loaded only for `/blog/[slug]`. `/blog`, feed, sitemap,
search/filter data, and generated static parameters read compact
`blogPostCards` rows.

After every create or update, the receiver revalidates:

```text
/blog
/blog/<new-slug>
/blog/<replaced-slug> when a slug changed
/sitemap.xml
/feed.xml
```

A successful request returns:

```json
{
  "message": "Published."
}
```

## File Tree

```text
web/
  app/
    (content)/blog/
      page.tsx
      [slug]/page.tsx
    api/webhooks/blog-publisher/
      route.ts
      route.test.ts
    blog-images/[...path]/
      route.ts
      route.test.ts
    feed.xml/route.ts
    sitemap.ts
  convex/
    blogPosts.ts
    blogPosts/
      BlogPostUpsertArgs.ts
      findBlogPostUpsertMatches.ts
      deleteDuplicateBlogPosts.ts
      getReplacedBlogPostSlugs.ts
      upsertBlogPost.ts
    blogPostCards/
      deleteBlogPostCardsBySlug.ts
      getBlogPostCardFields.ts
      upsertBlogPostCardBySlug.ts
    schema.ts
  lib/
    clipstitchr/server/blog/
      blogPublishPayloadSchema.ts
      normalizeBlogArticle.ts
      copyBlogArticleImages.ts
      fetchBlogImageSource.ts
    clipstitchr/server/convex/
      createConvexHttpClient.ts
      resolveConvexCloudUrl.ts
    clipstitchr/server/r2/
      getR2Environment.ts
      getRequiredR2EnvironmentValue.ts
      resolveR2Endpoint.ts
      resolveR2BucketName.ts
    content/runtimeBlog/
      fetchConvexBlogPostCards.ts
      fetchConvexBlogPostBySlug.ts
      renderRuntimeBlogContent.ts
      toRuntimeBlogPostFromConvex.ts
```

## Verification

Run from `web/`:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Local authenticated smoke request:

```bash
curl -i -X POST http://localhost:3000/api/webhooks/blog-publisher \
  -H "Authorization: Bearer $BLOG_PUBLISH_WEBHOOK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "update_article",
    "data": {
      "article": {
        "id": "blog-id",
        "title": "A Helpful Blog Title",
        "seo_title": "A Helpful Blog Title for Search Results With Clear Next Steps",
        "slug": "a-helpful-blog-title",
        "meta_description": "A helpful plain-English summary for readers.",
        "content_format": "mdx",
        "content_mdx": "# A Helpful Blog Title\n\n## First step\n\nUpdated body.",
        "content_markdown": "# A Helpful Blog Title\n\nUpdated body.",
        "content_html": "",
        "image_url": "https://clipstitchr.com/og/v2/default.png",
        "tags": ["content planning"],
        "source": "Blogr",
        "created_at": "2026-06-23T16:00:00.000Z",
        "updated_at": "2026-07-29T18:00:00.000Z"
      }
    }
  }'
```

Verify:

1. The response is `200` with `{ "message": "Published." }`.
2. `/blog` shows the post once.
3. `/blog/a-helpful-blog-title` shows the updated body.
4. Page metadata uses `seo_title`, while the article heading uses `title`.
5. Saved image URLs begin with the ClipStitchr origin and `/blog-images/`.
6. `/sitemap.xml` and `/feed.xml` include the post.
7. Publishing the same `id` with a new slug leaves one `blogPosts` row and one
   `blogPostCards` row.

The webhook buckets allow 120 published articles per hour for one client
fingerprint with a burst of 30, plus 600 per hour globally with a burst of 120.
The rate-limit mutation runs before source-image fetching, R2 writes, and the
article upsert.
