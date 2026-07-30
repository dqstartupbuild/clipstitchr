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
- A Meta App Review draft exists but has not been submitted. It requests only
  `instagram_business_basic`, `instagram_business_content_publish`, and
  `instagram_business_manage_insights`. The automatically selected messaging,
  comments, and Human Agent permissions were removed from the draft.
- All Meta webhook subscriptions for comments, live comments, messages,
  message edits and reactions, handover, opt-ins, postbacks, referrals, seen
  receipts, and standby are disabled. ClipStitchr does not request or process
  those event types, so subscribing would collect data outside this feature's
  publishing-and-insights scope.
- Meta Basic settings use `clipstitchr.com`, the production website, the public
  privacy and terms pages, public deletion instructions, and the
  `Utility & productivity` category. The certified 1024-by-1024 ClipStitchr app
  icon is uploaded and saved.
- Vercel has production-scoped `TIKTOK_CLIENT_KEY`,
  `TIKTOK_CLIENT_SECRET`, `INSTAGRAM_CLIENT_ID`, and
  `INSTAGRAM_CLIENT_SECRET` values. The sensitive credentials are marked
  sensitive. The production-safe callback, public-base, Graph API version, and
  current-key-version variables are also staged. The versioned
  `SOCIAL_TOKEN_ENCRYPTION_KEYS` key ring and
  `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` are staged as sensitive production
  variables. Updating those variables did not directly trigger a deployment.
  The later production deployment is ready and the live callback challenge
  check below passed.
- Google Secret Manager has version 1 of
  `clipstitchr-tiktok-client-key` and
  `clipstitchr-tiktok-client-secret`. The provider-worker service account has
  `roles/secretmanager.secretAccessor` on both. Instagram credentials remain
  app-runtime-only because the provider worker does not read them.
- Google Secret Manager has enabled version 2 of
  `SOCIAL_TOKEN_ENCRYPTION_KEYS`, containing the versioned key-ring format.
  The provider-worker service account has least-privilege
  `roles/secretmanager.secretAccessor` access to that secret.
- The production Instagram webhook verification endpoint returned the exact
  challenge for the staged verification token. This proves the callback route
  and current Vercel secret are live without enabling signed webhook event
  processing.
- Meta still needs webhook verification, review testing instructions, and
  Advanced Access. The app remains unpublished. The production feature flag
  remains on Post-Bridge, the provider worker does not advertise the `social`
  tool, and no social-enabled provider-worker production deployment or review
  submission has occurred.
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

## Meta review draft handoff

The saved, unsubmitted draft has these remaining gates:

- Meta's Testing page reports
  `instagram_business_content_publish` at 0 of 1 required API calls and
  `instagram_business_manage_insights` at 0 of 1 required API calls. A
  successful authorized-account publish and insights request must be recorded
  before submission. Meta notes that successful test data can take up to
  24 hours to appear and remains valid for 30 days.
- Each requested permission needs its own end-to-end screencast. The
  `instagram_business_basic` recording must show a professional account
  connecting and its profile information appearing in ClipStitchr. The
  publishing recording must show the user reviewing and explicitly authorizing
  an Instagram post. The insights recording must show the user choosing a
  manual analytics refresh and reading the saved result.
- Reviewer instructions need a working ClipStitchr test account or access code
  that remains active for the review period. Instagram account credentials
  must not be placed in the submission.
- Data handling requires organization-specific answers about processors, the
  responsible data controller, its country, national-security requests, and
  related policies. These are legal and operational attestations and must be
  completed by the responsible person rather than inferred from the codebase.
- Each permission includes an allowed-usage certification. Do not accept those
  certifications or submit the draft until the responsible person has reviewed
  them.

Use the following factual reviewer path after the test account is prepared:

1. Sign in at `https://clipstitchr.com/sign-in`, then open
   `https://clipstitchr.com/dashboard/settings`.
2. In Account settings, choose **Connect Instagram** under **Connect where you
   post**. Authorize a professional Business or Creator account. The connected
   account row displays its Instagram identity and connection state.
3. Open a finished Stitchr or Swipr result and choose **Schedule post**. Select
   the connected Instagram account, review the caption and media, confirm the
   Instagram sharing consent, and choose the intended delivery time.
4. Open `https://clipstitchr.com/dashboard/schedule` to inspect the per-account
   delivery state and the resulting Instagram post link.
5. Open `https://clipstitchr.com/dashboard/analytics`, filter to the connected
   account, and choose **Refresh analytics**. ClipStitchr performs analytics
   refreshes only when the user asks and keeps the official platform counts as
   the primary result.

ClipStitchr uses Instagram Login, not Facebook Login, for this workflow.
`instagram_business_basic` identifies and displays the connected professional
account. `instagram_business_content_publish` publishes only user-reviewed
Reels, single images, or carousels. `instagram_business_manage_insights`
supports the user-triggered analytics refresh for published posts.

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
- The production-shape `linux/amd64` provider-worker image built locally from
  the current source. Its social-only `--check` passed with the real versioned
  local key ring and non-production placeholders for presence-only Cloud Run
  values. The image was not pushed or deployed.

These checks validate the code and safe feature gate. They do not replace the
unverified Meta webhook, current-source worker deployment, platform review,
Advanced Access, or authorized-account provider smoke tests.

Do not turn these staged settings into a production-readiness claim. The
approval, authorized-account smoke, secret provisioning, worker deployment, and
cutover gates above still apply.

References:
[TikTok Content Posting](https://developers.tiktok.com/products/content-posting-api/),
[TikTok guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines/),
and [Meta Instagram API](https://www.postman.com/meta/instagram/overview).
