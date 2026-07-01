# Database Read Reduction

This pass reduces Convex Database I/O by keeping public list reads and dashboard
hydration away from large documents wherever possible.

## What Changed

- Blog list-style routes now read `blogPostCards`, a compact Convex read model
  maintained by `blogPosts.upsertPublishedArticle`.
- The old full-body `blogPosts.listPublishedBlogPosts` list query was removed
  so public list consumers cannot accidentally read every article body.
- `/blog`, `/blog/[slug]`, and `/sitemap.xml` use hourly revalidation instead
  of forced dynamic rendering.
- Dashboard home saves Stitch templates through `useCreateStitchTemplate`
  without subscribing to the full template list.
- Library template rows load only when the Library Stitches or Templates tabs
  need them.
- Dashboard library providers now track the active Library tab and skip hidden
  clip, photo, avatar, Swipr, Swipe, Stitch, and Pexels subscriptions.
- Library Hook Plan reads are active-product scoped and load only for the
  Stitches tab where hook review controls are rendered.
- Clip and Stitch paginated queries apply server-side row and byte ceilings via
  `getReadLimitedPaginationOpts`.
- Initial media library pages load 24 rows.
- Swipr UI background queries use smaller visible-list caps, while provider
  worker pack lookups keep the larger automation cap.
- Dashboard summary source clip fan-out is capped to a smaller picker-sized
  set.

## Backfill

Existing webhook-published posts need compact card rows once after deployment:

```bash
cd web
npx convex run blogPosts:rebuildPublishedBlogPostCards \
  '{"secret":"<RATE_LIMIT_API_SECRET>"}'
```

Append `--prod` when running against production.

## Maintenance Notes

Do not add public list, sitemap, feed, dashboard, or library views that read
large body/detail documents by default. Add a compact read model when a screen
needs cards, counts, or summaries, and fetch full documents only after the user
opens an editor, preview, export, or detail page.
