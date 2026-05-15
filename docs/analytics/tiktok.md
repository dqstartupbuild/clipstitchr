# TikTok Analytics

## Purpose

ClipStitchr uses the TikTok Pixel to measure website visits, waitlist sign-up
conversions, and future subscription purchases after the visitor allows
marketing cookies. The implementation is front-end only and does not create a
new backend operation, provider call, Convex write, or storage cost.

## Consent Model

Cookie consent is managed in
`web/app/_components/analytics/CookieConsentManager.tsx`.

The first-run banner is intentionally compact and offers two choices:

- Accept: enables analytics and marketing cookies.
- Essentials only: keeps only required cookies.

Granular category changes are available from the Privacy page's cookie
preferences dialog. The dialog allows three categories:

- Required: always on for authentication, security, basic app operation, and
  saving the visitor's cookie preferences.
- Analytics: optional first-party cookies for anonymous visitor/session IDs and
  first/last-touch attribution.
- Marketing: optional TikTok Pixel and TikTok advertising/conversion cookies.

The visitor's choice is saved in the first-party
`clipstitchr_cookie_consent` cookie. Consent is not saved to Convex.

Optional tracking does not start until the visitor accepts all cookies or saves
preferences with the relevant category enabled. Rejecting optional cookies
deletes the app-owned attribution cookies and asks TikTok to disable/revoke
tracking if it had previously been loaded.

## First-Party Cookies

When analytics or marketing cookies are allowed, ClipStitchr sets these
first-party cookies:

| Cookie | Category | Purpose | Expiration |
| --- | --- | --- | --- |
| `clipstitchr_cookie_consent` | Required | Saves cookie category choices and consent version | 365 days |
| `clipstitchr_visitor_id` | Analytics or marketing | Anonymous returning-visitor measurement | 395 days |
| `clipstitchr_session_id` | Analytics or marketing | Anonymous session grouping | 30 minutes |
| `clipstitchr_first_touch` | Analytics or marketing | First landing page, referrer, UTM parameters, and click ID | 90 days |
| `clipstitchr_last_touch` | Analytics or marketing | Latest landing page, referrer, UTM parameters, and click ID | 90 days |

TikTok may set first-party advertising cookies such as `_ttp`, `ttclid`,
`ttcsid`, or `ttcsid_<pixel id>` when marketing consent is allowed. TikTok may
also set or read third-party advertising cookies through its own domains.

## Events

TikTok events are routed through
`web/lib/clipstitchr/analytics/trackTikTokEvent.ts`, which checks marketing
cookie consent before sending anything to `window.ttq`.

All event payloads use TikTok's `contents`, `value`, and `currency` shape from
`web/lib/clipstitchr/analytics/createTikTokEventPayload.ts`.

Current events:

| Event | Trigger | Notes |
| --- | --- | --- |
| `ViewContent` | Initial page load and client route changes | Uses broad page names such as Homepage, Waitlist, Blog article, Docs article, or Dashboard. |
| `ClickButton` | Marketing CTAs, auth header buttons, and waitlist submit clicks | Tracks button context, not user-entered form data. |
| `Lead` | New waitlist row created in Convex | Fires only when `waitlist.submit` returns `{ status: "created" }`. |
| `Purchase` | Future paid subscription confirmation | Helper exists, but should only be called after payment is confirmed. |

`Search` support exists in
`web/lib/clipstitchr/analytics/trackTikTokSearch.ts`, but it is not wired to
dashboard asset searches. Dashboard searches can contain private project terms,
so only wire that helper to public or intentionally marketing-safe search
experiences.

## Advanced Matching

TikTok `identify` is implemented in
`web/lib/clipstitchr/analytics/identifyTikTokUser.ts`.

The helper hashes available identifiers with SHA-256 in the browser before
calling `ttq.identify`. It may send:

- Hashed email for successful waitlist sign-ups.
- Hashed signed-in account email when marketing cookies are allowed.
- Hashed signed-in Clerk user ID as `external_id` when marketing cookies are
  allowed.

Plain email addresses, names, phone numbers, Clerk user IDs, and Convex IDs are
not sent to TikTok.

## Pixel Configuration

The pixel ID is configured with:

```bash
NEXT_PUBLIC_TIKTOK_PIXEL_ID=PLACEHOLDER
```

The default value is also defined in
`web/lib/clipstitchr/analytics/tiktokPixelId.ts` so the current production
pixel still loads if the environment variable is not set.

The consent manager is mounted globally from `web/app/layout.tsx`. When
marketing consent is allowed, it renders
`web/app/_components/analytics/TikTokPixelScript.tsx`,
`web/app/_components/analytics/TikTokViewContentTracker.tsx`, and
`web/app/_components/analytics/TikTokIdentityReporter.tsx`.

The pixel script uses Next.js `Script` with `strategy="afterInteractive"` and
calls:

```ts
ttq.grantConsent();
ttq.enableCookie();
ttq.load(pixelId);
ttq.page();
ttq.track("ViewContent", viewContentPayload);
```

This means TikTok page tracking is available across the app after the browser
becomes interactive and after marketing consent is present.

## Waitlist Conversion

The waitlist form tracks a TikTok conversion after Convex successfully creates a
new waitlist row and marketing consent is present:

```ts
trackWaitlistSignupConversion({ email });
```

The helper lives in
`web/lib/clipstitchr/analytics/trackWaitlistSignupConversion.ts` and sends:

```ts
ttq.identify({
  email: hashedEmail,
});

ttq.track("Lead", {
  contents: [
    {
      brand: "ClipStitchr",
      content_category: "Waitlist",
      content_id: "waitlist_signup",
      content_name: "ClipStitchr waitlist",
      content_type: "product_group",
    },
  ],
  currency: "USD",
  value: 0,
});
```

The event fires only when `waitlist.submit` returns `{ status: "created" }`.
Existing-email updates return `{ status: "updated" }` and do not fire another
conversion, which avoids inflating sign-up counts from repeat submissions.

## Future Subscription Purchase Tracking

Subscription purchase tracking should use
`web/lib/clipstitchr/analytics/trackSubscriptionPurchase.ts` after the checkout
or billing provider confirms a completed paid subscription.

Example:

```ts
trackSubscriptionPurchase({
  currency: "USD",
  value: 29,
  planName: "Creator",
});
```

The helper sends:

```ts
ttq.track("Purchase", {
  contents: [
    {
      brand: "ClipStitchr",
      content_category: "Subscription",
      content_id: "subscription_purchase",
      content_name: planName,
      content_type: "product",
    },
  ],
  currency,
  value,
});
```

Do not fire purchase events before payment is confirmed.

## Privacy Notes

- Do not send waitlist names, plain email addresses, plain Clerk user IDs,
  Convex document IDs, or other direct identifiers to TikTok.
- Only hashed identifiers may be sent through TikTok `identify`, and only after
  marketing consent is present.
- First-party attribution cookies are stored in the browser only; they are not
  written to Convex.
- Purchase payloads should include only plan metadata, currency, and purchase
  value unless a later privacy review explicitly approves additional fields.
- Keep `web/app/(content)/privacy/page.tsx` aligned with the cookie categories
  and vendor behavior.

## Verification

For code changes touching TikTok analytics, run from `web/`:

```bash
npm run typecheck
npm run lint
npm run build
npm test
```

In a browser, confirm that the TikTok script request is loaded from
`https://analytics.tiktok.com/i18n/pixel/events.js` only after marketing
cookies are accepted, and that a new waitlist submission fires one
`Lead` event.
