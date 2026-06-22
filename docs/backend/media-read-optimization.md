# Media Read Optimization

ClipStitchr keeps durable media bytes in R2 and keeps Convex responsible for
small metadata documents only. The standard read path is:

1. Subscribe to the smallest route-specific Convex metadata set.
2. Render cards from metadata.
3. Hydrate visible poster and thumbnail images through batched R2 signed URLs.
4. Reuse poster and thumbnail blobs from browser Cache Storage.
5. Download full video, photo, and audio blobs only after preview, edit, export,
   or generation actions require them.

Do not add manual nonce-style query arguments to force metadata refreshes after
mutations. Convex queries are reactive and cached by query name plus arguments,
so changing a throwaway argument makes the cache less useful and fans out extra
reads across every mounted subscription.

## Current Read Guards

- `/dashboard` uses `dashboardSummary.get` for recent uploads, recent
  stitches, Stitchr source clips, recent Swipes, and the specific Swipe
  backgrounds needed by those cards. The Swipe background set includes the
  top-level Swipe background plus any per-slide background IDs used by those
  recent cards, so the dashboard does not need the full Swipr background
  library subscription. It no longer mounts full clip, photo, avatar, Swipr
  background, or Swipe library subscriptions just to render the home widgets.
- `useClipLibraryState` subscribes only on dashboard routes that render clip or
  stitch media directly. The dashboard home keeps only aggregate counts loaded.
  Settings, Clipr, Avatars, and Swipr do not open hidden clip-list
  subscriptions.
- `usePhotoLibraryState` subscribes to photo/avatar documents only on Avatars,
  Library, Clipr, Swapr, and Swipr. Uploads keeps only avatar/voice preferences
  loaded for the UGC-to-avatar action.
- `useSwiprLibraryState` subscribes only on Library, Settings, Swipr, and
  Uploads. Dashboard home Swipr cards use `dashboardSummary.get`; draft
  generation uses `swiprBackgrounds.listByLibraryQueryKeys` instead of loading
  every saved/global background.
- `DashboardNotificationBell` always reads only `notifications.unreadCount`.
  It loads `notifications.listRecent` only while the popover is open.
- `ActiveWorkerJobsBanner` reads `activeWorkerJobs.summary`, a single bounded
  summary query, instead of subscribing to provider and media job lists
  separately.
- `MusicSelectorButton` loads `sharedMusicTracks.list` only while the picker is
  open.
- Clip category queries use `videoClips.libraryKind` with owner/status indexes
  instead of filtering through all clips owned by the user.
- Product-filtered clip, stitch, Swipe, avatar, photo, media job, provider job,
  automation task, Swipr pack, and Pexels-photo lookups use compound indexes and
  capped reads instead of owner-wide collection scans.
- Legacy Clipr category rows are loaded only as a compatibility source and
  folded into visible UGC lists. Posted Stitch and posted Swipe subscriptions
  are loaded only on the Library route where posted filters are
  available.
- Full media downloads cache signed R2 URLs in memory until shortly before
  expiry. Poster and thumbnail downloads continue to use batched signed URLs and
  browser Cache Storage.

## Backfill Runbook

After deploying Convex functions that include the read-optimization indexes and
read models, run the backfills below in production. Repeat each command with the
returned `continueCursor` until `isDone` is `true`.

```bash
cd web
npx convex run aggregateBackfills:backfillVideoClipLibraryKinds \
  '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run aggregateBackfills:backfillVideoClipProductCounts \
  '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run aggregateBackfills:backfillStitchProductCounts \
  '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run aggregateBackfills:backfillSwiprBackgroundLibraryQueryKeys \
  '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
npx convex run aggregateBackfills:backfillNotificationSummaries \
  '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
```

For production, append `--prod` after deploying the Convex functions to
production.

These mutations are operator-only and guarded by `RATE_LIMIT_API_SECRET`. They
are not user-triggered app workflows and should not be exposed through HTTP
routes.
