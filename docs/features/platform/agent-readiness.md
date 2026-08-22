# Agent Readiness

## Purpose

ClipStitchr publishes a small, recoverable public surface for agents without exposing authenticated product, account, or saved-media operations. It provides human-readable developer context, an OpenAPI document, a bounded public API index, markdown negotiation for selected public pages, and recoverable 404 responses.

## Public entry points

- `/developers` explains when the public API fits and links to every machine-readable resource.
- `/openapi.json` is an OpenAPI 3.1.1 document for `GET /api/v1` and `POST /api/v1/hooks`.
- `/api/v1` is the discoverable JSON capability index.
- `/llms.txt` says when an agent should use ClipStitchr and distinguishes public endpoints from authenticated product APIs.
- `/about`, `/contact`, and `/privacy` provide trust and contact context.

## Markdown negotiation

For a page `GET` or `HEAD` request that prefers `Accept: text/markdown`, the Next proxy serves Markdown directly. It honors quality values, specificity, and `q=0`; all negotiated variants include `Vary: Accept, Accept-Encoding`. Markdown is available for `/`, `/about`, `/contact`, and `/developers`. A known HTML-only page uses HTML when the request permits it and returns `406` only when no available representation is acceptable. Unknown paths return a Markdown `404` with sitemap, llms.txt, docs, developer, and OpenAPI recovery links. Machine-readable resources such as `/llms.txt`, `/openapi.json`, and `/sitemap.xml` keep their native formats and bypass page negotiation.

## Public hook API

`POST /api/v1/hooks` reuses the deterministic App Hook Generator implementation and its Convex-backed shared client and global rate limits. Error responses are always JSON: `{ "error": { "code", "message", "resolution" } }`. A `429` also returns `Retry-After`.

## Files

`web/app/openapi.json/route.ts`, `web/app/api/v1/route.ts`, `web/app/api/v1/hooks/route.ts`, `web/proxy.ts`, `web/lib/agentReadiness/*`, and `web/lib/clipstitchr/publicApi/*` own the machine-facing behavior. The proxy lets these explicitly public, no-auth resources reach their handlers without invoking Clerk; authenticated API namespaces keep their existing protection. Public copy lives in the corresponding content pages.

## Sources and verification

The protocol follows [Accept Markdown](https://acceptmarkdown.com/) negotiation guidance and [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html). Verify with route and proxy tests, then request HTML and `Accept: text/markdown` variants, inspect `Vary`, validate `/openapi.json`, and confirm unknown pages return HTTP 404.
