# Schedule Page

`/dashboard/schedule` shows the selected product's in-house social queue when
`SOCIAL_PUBLISHING_PROVIDER=in_house`.

The in-house provider keeps the established Post Bridge schedule presentation:
four status totals followed by one `Scheduled content` results surface. The
next open product time sits in that surface's header. Provider-specific detail
does not create a second visual system.

Each result row keeps the familiar status, title, caption, time, and account
layout. Its independent TikTok and Instagram delivery states and recovery
actions stay inside the same row. A successful target is never reset when
another target fails.

Available actions stay beside the affected post:

- edit title, caption, or a future exact time before work starts;
- refresh TikTok posting choices when a saved capability is stale;
- review and resume held work;
- move a missed queue post to its next open product slot;
- choose a new time for a missed exact-time post;
- reconcile `outcome_unknown` without repeating the final provider call; and
- cancel remaining not-started deliveries.

`Waiting for you in TikTok` means TikTok accepted an inbox upload but the user
must open TikTok and finish. It is not counted as published.

Queue configuration belongs in Product settings. Exact-time posts never move
when the queue changes. Future, not-started queue posts move only after the
user explicitly confirms reflow.

## Legacy history

With the in-house provider active, `/dashboard/schedule?legacy=1` opens the old
Post Bridge view in read-only mode. It can refresh visible provider history but
cannot create or edit Post Bridge posts. The Post Bridge key must remain
available until its retained history is no longer needed.

## Source files

- `web/app/dashboard/schedule/page.tsx`
- `web/app/dashboard/schedule/SocialSchedulePageClient.tsx`
- `web/app/_components/social/SocialScheduledPostsPanel.tsx`
- `web/app/_components/social/SocialScheduledPostCard.tsx`
- `web/app/_components/social/SocialPostActions.tsx`
- `web/app/_components/social/SocialPostTargetControlsEditor.tsx`
- `web/convex/socialPosts/listSocialPostsForProduct.ts`
- `web/convex/socialPosts/reviewAndResumeSocialPost.ts`
- `web/convex/productSocialQueues/reflowFutureProductQueuePosts.ts`

Related behavior is documented in
`docs/features/social-publishing/product-social-queues.md`,
`docs/features/social-publishing/subscription-holds-and-resume.md`, and
`docs/features/social-publishing/post-bridge-migration.md`.
