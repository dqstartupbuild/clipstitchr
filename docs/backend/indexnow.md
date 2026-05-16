# IndexNow Setup

ClipStitchr uses IndexNow to notify participating search engines when public
site URLs should be indexed. The implementation submits the same public URLs as
the app sitemap and intentionally excludes dashboard, API, auth-only, and other
private routes.

## Files

- Public key file:
  `web/public/1112f07c108a4eebb9f78ed8c9f7a362.txt`
- Submission route:
  `web/app/api/indexnow/route.ts`
- Sitemap source:
  `web/lib/getSitemapEntries.ts`
- Rate limits:
  `web/convex/rateLimiter.ts` and `web/convex/rateLimits.ts`

The public IndexNow key is:

```text
1112f07c108a4eebb9f78ed8c9f7a362
```

This key is not the API route secret. The route secret must stay private.

## Required Environment Variables

Set these in Vercel for the production environment:

```bash
NEXT_PUBLIC_SITE_URL=https://clipstitchr.com
NEXT_PUBLIC_CONVEX_URL=<production-convex-url>
INDEXNOW_SUBMIT_SECRET=<high-entropy-private-secret>
RATE_LIMIT_API_SECRET=<high-entropy-private-secret>
```

Set this in the matching Convex deployment:

```bash
RATE_LIMIT_API_SECRET=<same-value-as-vercel>
```

`RATE_LIMIT_API_SECRET` must match exactly between Vercel and Convex because the
Next.js route calls a Convex mutation before submitting to IndexNow.

## Deploy

After adding or changing the route, Convex rate limits, or environment
variables:

```bash
cd web
npx convex deploy
```

Then redeploy the Vercel app so the latest environment variables and route code
are active.

## Submit URLs

Use a literal secret:

```bash
curl -X POST https://clipstitchr.com/api/indexnow \
  -H "Authorization: Bearer <INDEXNOW_SUBMIT_SECRET>"
```

Or use a local shell variable:

```bash
export INDEXNOW_SUBMIT_SECRET="<secret-from-vercel>"

curl -X POST https://clipstitchr.com/api/indexnow \
  -H "Authorization: Bearer $INDEXNOW_SUBMIT_SECRET"
```

The `$` form only works when `INDEXNOW_SUBMIT_SECRET` is set in the shell where
the command is running. If pasting the secret directly, do not include `$`.

The route also accepts:

```bash
curl -X POST https://clipstitchr.com/api/indexnow \
  -H "x-indexnow-submit-secret: <INDEXNOW_SUBMIT_SECRET>"
```

## Expected Success

A successful submission returns `202 Accepted` from IndexNow:

```json
{
  "ok": true,
  "providerStatus": 202,
  "providerStatusText": "Accepted",
  "submittedUrlCount": 14
}
```

## What Gets Indexed

The route submits URLs from `getSitemapEntries()`, including:

- Static public pages from `site.staticPages`
- Customer docs pages
- Published blog posts

To add a new public static page to IndexNow submissions, add it to
`site.staticPages` in `web/lib/site.ts`. Blog posts and docs are picked up from
their existing content/doc registries when they are part of the sitemap.

## Troubleshooting

`401 Unauthorized`

- The request secret does not exactly match `INDEXNOW_SUBMIT_SECRET` in Vercel.
- Confirm the secret is set for the same Vercel environment as the URL being
  called.
- Redeploy Vercel after changing the env var.

`500 Server Error`

- Usually means the Convex rate-limit call failed.
- Confirm `RATE_LIMIT_API_SECRET` exists in both Vercel and Convex with the same
  value.
- Confirm `NEXT_PUBLIC_CONVEX_URL` points to the intended Convex deployment.
- Run `npx convex deploy` after adding the IndexNow rate-limit mutation.

`429 Rate Limit Exceeded`

- The route is rate-limited before contacting IndexNow.
- Wait for the returned `Retry-After` time before retrying.

`502 IndexNow Rejected`

- The request reached IndexNow, but IndexNow rejected the payload.
- Check `providerStatus`, `providerStatusText`, and `providerBody` in the
  response.
- Confirm `NEXT_PUBLIC_SITE_URL` is the production host and the key file is
  reachable at:

```text
https://clipstitchr.com/1112f07c108a4eebb9f78ed8c9f7a362.txt
```
