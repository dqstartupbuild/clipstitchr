# TikTok Analytics

## Purpose

ClipStitchr uses the TikTok Pixel to measure website visits, waitlist sign-up
conversions, and future subscription purchases. The implementation is
front-end only and does not create a new backend operation, provider call, or
storage cost.

## Pixel Configuration

The pixel ID is configured with:

```bash
NEXT_PUBLIC_TIKTOK_PIXEL_ID=PLACEHOLDER
```

The default value is also defined in
`web/lib/clipstitchr/analytics/tiktokPixelId.ts` so the current production
pixel still loads if the environment variable is not set.

The script is mounted globally from `web/app/layout.tsx` through
`web/app/_components/analytics/TikTokPixelScript.tsx`. It uses Next.js
`Script` with `strategy="afterInteractive"` and calls:

```ts
ttq.load(pixelId);
ttq.page();
```

This means page tracking is available across the app after the browser becomes
interactive.

## Waitlist Conversion

The waitlist form tracks a TikTok conversion after Convex successfully creates a
new waitlist row:

```ts
trackWaitlistSignupConversion();
```

The helper lives in
`web/lib/clipstitchr/analytics/trackWaitlistSignupConversion.ts` and sends:

```ts
ttq.track("CompleteRegistration", {
  content_name: "ClipStitchr waitlist",
  content_type: "waitlist",
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
  content_name: planName,
  content_type: "subscription",
  currency,
  value,
});
```

Do not fire purchase events before payment is confirmed.

## Privacy Notes

- Do not send waitlist names, email addresses, Clerk user IDs, Convex document
  IDs, or other direct identifiers to TikTok.
- Current waitlist conversion payloads include only event category metadata.
- Purchase payloads should include only plan metadata, currency, and purchase
  value unless a later privacy review explicitly approves additional fields.

## Verification

For code changes touching TikTok analytics, run from `web/`:

```bash
npm run typecheck
npm run lint
npm run build
npm test
```

In a browser, confirm that the TikTok script request is loaded from
`https://analytics.tiktok.com/i18n/pixel/events.js` and that a new waitlist
submission fires one `CompleteRegistration` event.
