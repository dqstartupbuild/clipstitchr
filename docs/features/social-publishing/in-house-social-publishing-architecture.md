# In-house Social Publishing Architecture

## What it does

ClipStitchr can schedule saved Stitches and Swipr carousels directly to TikTok
and Instagram. The system reuses Clerk ownership, Convex records and crons,
Cloudflare R2, billing entitlements, the Convex rate limiter, `providerJobs`,
`workerQueueEntries`, dispatch recovery, and the existing provider Cloud Run
Job. It does not add a second scheduler or database.

`SOCIAL_PUBLISHING_PROVIDER=post_bridge` is the safe default. Setting it to
`in_house` changes Settings, Schedule, Analytics, and saved-media compose
actions together. This prevents dual publishing. Legacy Post Bridge records
remain readable through `?legacy=1`.

## Durable flow

1. The browser renders the final MP4 or ordered images before scheduling.
2. Owner-scoped `social-post-asset` objects are uploaded to R2.
3. `createSocialPost` snapshots the product, schedule choice, accounts,
   platform controls, capability state, consent, entitlement, and assets.
4. The one-minute Convex due planner claims each due target independently.
5. One duplicate-safe provider job is enqueued per target.
6. The provider worker decrypts tokens only in memory, creates opaque media
   grants, rechecks billing and capabilities, and calls the official API.
7. Attempts persist retry safety and provider identifiers around every
   provider boundary. Ambiguous final calls become `outcome_unknown` and are
   never blindly repeated.
8. Status reconciliation runs automatically. Analytics does not.

One logical post consumes one product queue slot even when it has several
targets. A target failure cannot cause a successful target to publish again.

## Data and code

The tables live in `web/convex/schema.ts`: `socialAccounts`,
`productSocialAccounts`, `productSocialQueues`, `socialPosts`,
`socialPostAssets`, `socialPostTargets`, `socialPublishAttempts`,
`socialExternalPublications`, analytics tables, OAuth states, webhook events,
media grants, and deletion requests.

Key folders:

```text
web/app/api/social/                  authenticated OAuth and provider callbacks
web/convex/socialPublishing/        planners, claims, attempts, completion
web/convex/socialPosts/             compose, schedule, edit, cancel, resume
web/services/provider-worker/social official platform operations
web/app/_components/social/         focused social UI components
```

## Source references

- [TikTok Content Posting API](https://developers.tiktok.com/products/content-posting-api/)
- [TikTok content-sharing guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines/)
- [Meta Instagram API collection](https://www.postman.com/meta/instagram/overview)

