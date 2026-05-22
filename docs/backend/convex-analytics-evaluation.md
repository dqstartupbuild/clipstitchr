# Convex Analytics Evaluation

Reviewed: 2026-05-22

## Initial Request And Instructions

The request was to evaluate whether ClipStitchr can benefit from the Convex
Analytics component, without implementing it yet. The requested output was a
new Markdown evaluation file.

No package has been installed and no application code has been changed.

## Component Evaluated

- Package: `@abdssamie/convex-analytics`
- Current npm latest verified on 2026-05-22: `0.2.1`
- Version in the prompt: `0.1.6`
- Peer dependencies shown by npm: `convex ^1.35.1` and
  `react ^18.3.1 || ^19.0.0`
- ClipStitchr currently uses `convex ^1.38.0` and `react 19.2.4`, so the
  current app satisfies the peer ranges.

Convex Analytics is a first-party analytics component for Convex apps. It adds
HTTP event ingestion, browser SDK batching, site/write-key management, raw
event storage, visitors, sessions, rollups, and a React dashboard component.

## Decision

Yes, ClipStitchr can benefit from Convex Analytics, but it should not be added
as a blind duplicate of the existing analytics stack.

The best use is an internal first-party product analytics layer for app usage,
feature adoption, funnel debugging, and admin dashboard visibility. It is less
useful as a marketing attribution replacement right now because ClipStitchr
already has consent-aware PostHog tracking and TikTok Pixel/Events API
conversion tracking documented in `docs/analytics/posthog.md` and
`docs/analytics/tiktok.md`.

Recommended posture:

- Keep TikTok for advertising measurement and purchase conversion forwarding.
- Keep PostHog unless the product decision is to replace third-party product
  analytics with first-party Convex-owned analytics.
- Consider Convex Analytics for app-owned operational/product analytics where
  having the events in Convex is valuable.

## Existing Repo Context

ClipStitchr already has:

- `@vercel/analytics` mounted in `web/app/layout.tsx`.
- PostHog browser and server capture helpers.
- A cookie consent manager with separate `analytics` and `marketing`
  categories.
- TikTok Pixel and Events API forwarding gated by marketing consent.
- First-party attribution cookies for visitor/session and first/last touch.
- Documented PostHog event rules that avoid free-form user content and PII.
- Rate-limited TikTok Events API forwarding in `docs/backend/rate-limits.md`.

That means Convex Analytics should not start sending every pageview or product
event in parallel by default. Double-instrumenting the same events would create
conflicting dashboards, extra Convex write volume, and privacy review work
without a clear product decision.

## Where It Helps

### First-party product analytics

Convex Analytics is useful if ClipStitchr wants product analytics data inside
its own Convex deployment instead of relying entirely on PostHog.

Good candidate events:

- onboarding step completion;
- upload flow milestones;
- Stitchr build started, completed, failed;
- Clipr, Swapr, Swipr, Longr feature adoption;
- rate-limit hit categories;
- paid-plan feature gate encounters after billing exists;
- export/download success counts by feature and plan.

These events should use the same data rules as PostHog: no user-entered media
names, prompts, product descriptions, avatar descriptions, free-form errors, or
raw identifiers in event properties.

### Admin dashboard visibility

The provided dashboard APIs and React component could support an internal admin
analytics page without building every rollup from scratch.

This is most useful for answering operational product questions:

- Which dashboard tools are used after signup?
- Where do users drop out during upload or generation?
- Which generation features consume the most interaction volume?
- Which routes or events spike before support complaints?

### Data ownership

The component stores analytics data in the app's Convex deployment. That can be
useful if the goal is to reduce dependency on third-party analytics vendors or
keep product usage data close to application records.

This also creates responsibility: retention, privacy policy coverage, access
control, storage cost, and cleanup all become ClipStitchr's job.

## What It Does Not Replace

Convex Analytics does not replace TikTok Pixel or TikTok Events API. TikTok
needs its own event format, consent handling, and deduplication IDs for ad
optimization and conversion reporting.

Convex Analytics does not automatically inherit the app's current cookie
consent model. Its browser SDK uses `localStorage` and `sessionStorage`, so it
must only initialize after the `analytics` category is enabled.

Convex Analytics does not remove the need for a tracking plan. Event names,
properties, retention, and PII rules still need to be explicit.

Convex Analytics does not avoid backend abuse concerns. Its HTTP ingest route
creates Convex writes. `allowedOrigins`, write-key rotation, event size limits,
batch size limits, and rate-limit or abuse protection need to be considered
before production rollout.

Convex Analytics does not appear to be proven at large scale. Its README notes
that teams with many users should consider another service because the package
has not been tested for large-scale usage.

## Privacy And Consent Requirements

If implemented, Convex Analytics must follow the existing consent model:

- Do not initialize the browser SDK before analytics consent is granted.
- Delete or avoid setting Convex Analytics visitor/session state when analytics
  consent is rejected.
- Do not send plain email, names, Clerk user IDs, Convex document IDs, media
  names, prompts, product descriptions, avatar descriptions, or free-form error
  strings as event properties.
- Use stable anonymous visitor/session IDs only after analytics consent.
- Use `identify` only after a privacy review confirms the allowed user ID shape
  and traits.
- Update the privacy page and `docs/analytics/*` before shipping.

## Abuse And Cost Requirements

The ingestion endpoint is a public write surface. Before implementation is
complete:

- Configure `allowedOrigins` for local and production domains.
- Use a long random write key and treat it as a publishable ingest credential,
  not an admin secret.
- Rotate the write key if it leaks.
- Enforce event and property size limits.
- Keep SDK batching enabled.
- Add or document rate-limit behavior for analytics ingest in
  `docs/backend/rate-limits.md`.
- Add cleanup/retention cron behavior if raw event retention stays enabled.

The default retention model from the component is cost-conscious, but it still
adds Convex writes and storage for every tracked event.

## Recommended Adoption Shape

Use Convex Analytics only if there is a clear decision to own product analytics
inside Convex.

Start with a narrow pilot:

1. Add one Convex Analytics site for the web app.
2. Initialize the SDK only after analytics consent.
3. Track a small set of app-owned product events that PostHog already tracks or
   that PostHog intentionally does not own.
4. Build an internal-only analytics dashboard page behind authenticated admin
   checks.
5. Compare Convex write/storage cost and dashboard usefulness against PostHog.
6. Decide whether to keep both, replace PostHog product analytics, or remove the
   pilot.

Do not send TikTok marketing conversions through Convex Analytics as the only
path. TikTok conversion tracking should continue to use the dedicated TikTok
helpers.

## Implementation Notes For Later

If adopted later, expected implementation touchpoints include:

- `web/convex/convex.config.ts`: install the component.
- `web/convex/http.ts`: register the ingest route.
- `web/convex/analytics.ts`: expose authenticated dashboard queries and a
  one-time site provisioning mutation.
- `web/app/_components/analytics/CookieConsentManager.tsx`: initialize or stop
  the SDK based on analytics consent.
- `docs/analytics/posthog.md` or a new analytics tracking plan: document whether
  Convex Analytics replaces or supplements PostHog.
- `docs/backend/rate-limits.md`: document ingest limits, cleanup, and retention.
- Privacy page: disclose first-party analytics storage in Convex.

## Recommendation

Adopt later, not immediately.

Convex Analytics is useful if the product wants first-party, Convex-native
analytics and an internal dashboard. It should not be added just because it
exists, because the app already has a working consent-aware PostHog and TikTok
analytics setup.

Priority relative to the other evaluated components:

1. Stripe, when paid plans/credits are ready.
2. Workpool, when moving provider work out of request-owned flows.
3. RAG, for semantic content search.
4. Convex Analytics, if first-party product analytics becomes a priority.
5. LLM Cache, for narrow repeated LLM calls.
6. Agent, only when an assistant-style product surface exists.

## Sources

- npm package: https://www.npmjs.com/package/@abdssamie/convex-analytics
- GitHub repository: https://github.com/abdssamie/convex-analytics
- Convex component page:
  https://www.convex.dev/components/abdssamie/convex-analytics
- Convex components docs: https://docs.convex.dev/components/using
- Convex HTTP actions docs: https://docs.convex.dev/functions/http-actions
- Convex cron jobs docs: https://docs.convex.dev/scheduling/cron-jobs
