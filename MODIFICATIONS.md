# Modifications

This file records material changes made to the selected Postiz source imported
into ClipStitchr. File-level state and hashes live in
`web/vendor/postiz/provenance.json`.

## 2026-08-02 initial integration

Source baseline:

- Repository: `https://github.com/gitroomhq/postiz-app`
- Commit: `cf4c432c00c9db775ea1b1f12480a8e2b89aec32`

Material modification categories:

- bounded the imported source under `web/vendor/postiz/` and recorded every
  retained file in a provenance manifest;
- limited provider registration and reachable UI to Instagram, Instagram
  Standalone where required, and TikTok;
- removed or disabled Postiz application authentication, registration,
  impersonation, billing, subscriptions, AI, marketplace, extension, SDK,
  command, public API, administration, and unrelated provider surfaces;
- replaced browser-visible Postiz routes, product names, logos, links, support
  copy, and theme behavior with ClipStitchr routes, branding, and semantic
  design tokens;
- replaced Postiz user and organization selection with a server-resolved Clerk
  personal or organization tenant mapping;
- introduced short-lived service authentication between the ClipStitchr web
  gateway and the private publishing runtime;
- strengthened OAuth state generation, provider and tenant binding, expiry,
  atomic one-time consumption, replay protection, and PKCE where supported;
- introduced authenticated, versioned encryption for provider access and
  refresh tokens;
- adapted media handling to verify tenant-owned durable ClipStitchr and
  Cloudflare R2 objects and mint provider access only when work executes;
- added per-destination idempotency, provider receipts, explicit retry and
  action-required states, and durable outbox/workflow recovery;
- added per-tenant and global rate limits before state changes or provider
  cost; and
- added tests, operations documentation, deployment configuration, safe Post
  Bridge cutover rules, and GNU AGPL network-source release requirements.

The exact imported directory map and any temporarily retained upstream
dependencies are documented in `web/vendor/postiz/README.md`. A category above
describes intended integration scope; it must not be read as evidence that a
particular change is complete until the implementation and release checks pass.

Future imports must add a dated section naming the new upstream commit, changed
paths, provider/security impact, migration impact, and provenance validation
result.
