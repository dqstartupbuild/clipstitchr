# Migration from Post Bridge

Post Bridge and in-house publishing coexist temporarily behind
`SOCIAL_PUBLISHING_PROVIDER`, but only one compose path is active at a time.
The default remains `post_bridge` until platform approval and live acceptance
are complete.

Users must connect TikTok and Instagram directly in Settings. ClipStitchr does
not request, copy, decrypt, or reuse credentials owned by Post Bridge. Product
defaults are saved again using the new social-account IDs.

When `in_house` is active:

- Settings shows direct accounts and product queue settings.
- saved Stitch and Swipe actions use only the in-house compose dialog;
- batch Post Bridge queue actions are hidden;
- Schedule and Analytics show in-house records;
- `?legacy=1` shows Post Bridge schedule and analytics as read-only history.
- legacy media upload, schedule, analytics sync, and settings writes return
  `409`, so stale clients cannot dual-publish or change retained history.

Before removing legacy publishing:

1. confirm no connected customer still depends on a queued Post Bridge post;
2. export or retain all legacy schedule and analytics visibility;
3. remove the flag's Post Bridge write branch, routes, settings, and encrypted
   key only in a dedicated migration;
4. keep read-only records for the documented retention window;
5. verify no Post Bridge key or product account ID remains in browser output.

The migration notice is
`web/app/_components/social/SocialMigrationNotice.tsx`.
