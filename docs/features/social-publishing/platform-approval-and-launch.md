# Social Platform Approval and Production Launch

Implementation and mock acceptance do not equal platform approval.

Do not set production `SOCIAL_PUBLISHING_PROVIDER=in_house` until every item is
confirmed:

- TikTok Login and Content Posting products are configured.
- OAuth callback and webhook URLs exactly match production.
- TikTok's media-fetch domain or URL prefix is verified.
- TikTok's Content Posting API audit permits the intended visibility and user
  experience.
- Instagram Login is configured for customer-owned professional accounts.
- Meta grants Advanced Access for every required permission.
- Instagram webhook, deauthorization, and data-deletion URLs pass review.
- `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `INSTAGRAM_CLIENT_ID`,
  `INSTAGRAM_CLIENT_SECRET`, and `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` exist only in
  the required secret stores.
- the versioned token key ring exists in both app and provider worker.
- signed-media URLs use the production-owned public base and TikTok ownership
  verification is complete.
- an authorized development account passes direct video, inbox video, photo
  auto-music on/off, Reel, single image, carousel, status, disconnect, and
  analytics smoke tests.
- provider-worker deployment and `--check` pass.

The Instagram webhook `GET` verification challenge is intentionally available
while `SOCIAL_PUBLISHING_PROVIDER=post_bridge` so Meta can register the callback
before cutover. Signed webhook `POST` processing remains gated by
`SOCIAL_PUBLISHING_PROVIDER=in_house`.

TikTok production publishing must not be described as audited while review is
pending. Instagram customer publishing must not be described as production
ready while Advanced Access is pending.

## Staged portal state on July 29, 2026

The following development configuration is saved without enabling production:

- TikTok Sandbox uses the Web platform, the exact production OAuth callback,
  Login Kit, Direct Post, `user.info.basic`, `video.publish`, `video.upload`,
  and `video.list`. The `clipstitchr.com` URL property is verified. The
  `fit.withguppy` target account completed sandbox OAuth and is listed as the
  authorized target user.
- Meta Instagram Login has the exact OAuth, deauthorization, and signed
  data-deletion callback URLs. `instagram_business_basic`,
  `instagram_business_content_publish`, and
  `instagram_business_manage_insights` are ready for development testing.
- The professional Instagram account `guppycalisthenics` accepted the
  `ClipStitchr-IG` tester invitation and is listed in Meta's access-token setup.
  Meta identifies the Instagram Login app separately from the parent Meta app,
  and Vercel uses that Instagram Login client ID.
- Meta Basic settings use `clipstitchr.com`, the production website, the public
  privacy and terms pages, public deletion instructions, and the
  `Utility & productivity` category. The certified 1024-by-1024 ClipStitchr app
  icon is uploaded and saved.
- Vercel has production-scoped `TIKTOK_CLIENT_KEY`,
  `TIKTOK_CLIENT_SECRET`, `INSTAGRAM_CLIENT_ID`, and
  `INSTAGRAM_CLIENT_SECRET` values. The sensitive credentials are marked
  sensitive. The production-safe callback, public-base, Graph API version, and
  current-key-version variables are also staged. No deployment was triggered.
- Google Secret Manager has version 1 of
  `clipstitchr-tiktok-client-key` and
  `clipstitchr-tiktok-client-secret`. The provider-worker service account has
  `roles/secretmanager.secretAccessor` on both. Instagram credentials remain
  app-runtime-only because the provider worker does not read them.
- The versioned social token-encryption key ring and Instagram webhook
  verification token are not generated or installed yet. Creating those new
  persistent secrets requires an explicit action-time confirmation.
- Meta still needs review testing instructions, webhook-field access, and
  Advanced Access. The app remains unpublished. The production feature flag
  remains on Post-Bridge, the provider worker does not advertise the `social`
  tool, and no production deployment or review submission has occurred.
- The development-only
  [browser acceptance suite](browser-acceptance-testing.md) passes desktop and
  mobile pointer and keyboard checks. It uses fixture accounts and does not
  replace the authorized-account provider smoke gate.
- Safe-gated provider-worker execution
  `clipstitchr-provider-worker-88qgt` passed `--check` on July 29, 2026 at
  15:10 UTC. The deployed job still omits the `social` tool. Final source
  hardening happened after that execution, so a future authorized social-worker
  deployment must rebuild the current source and pass a new `--check`; the
  earlier execution is not evidence that the current source is deployed.

## Current source validation

The staged source passed the following local checks on July 29, 2026:

- ESLint completed with zero errors and eight unrelated pre-existing warnings.
- TypeScript completed with no errors.
- Vitest passed 989 files and 3,190 tests with coverage.
- Playwright passed all eight desktop and mobile pointer/keyboard tests.
- The isolated Next.js production build compiled, typechecked, and generated
  all 175 static pages.
- A production-server smoke returned `404` for the development-only social
  acceptance fixture, `200` for Privacy, and `401` for an unauthenticated OAuth
  start.

These checks validate the code and safe feature gate. They do not replace the
missing encryption/webhook secrets, current-source worker deployment, platform
review, Advanced Access, or authorized-account provider smoke tests.

Do not turn these staged settings into a production-readiness claim. The
approval, authorized-account smoke, secret provisioning, worker deployment, and
cutover gates above still apply.

References:
[TikTok Content Posting](https://developers.tiktok.com/products/content-posting-api/),
[TikTok guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines/),
and [Meta Instagram API](https://www.postman.com/meta/instagram/overview).
