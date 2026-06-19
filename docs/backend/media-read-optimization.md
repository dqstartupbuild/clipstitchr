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

- `useClipLibraryState` subscribes only on dashboard routes that render clip or
  stitch media. Settings, Clipr, Avatars, and Swipr do not open hidden clip-list
  subscriptions.
- `usePhotoLibraryState` subscribes to photo/avatar documents only on Dashboard,
  Avatars, Clipr, and Swapr. Uploads keeps only avatar/voice preferences loaded
  for the UGC-to-avatar action.
- `useSwiprLibraryState` subscribes only on Dashboard, Swipr, and Uploads.
- Clip category queries use `videoClips.libraryKind` with owner/status indexes
  instead of filtering through all clips owned by the user.
- Legacy Clipr category rows are loaded only as a compatibility source and
  folded into visible UGC lists. Posted Stitch and posted Swipe subscriptions
  are loaded only on the Library route where posted filters are
  available.

## Backfill Runbook

After deploying Convex functions that include `videoClips.libraryKind`, backfill
existing clip rows before relying on category pages:

```bash
cd web
npx convex run aggregateBackfills:backfillVideoClipLibraryKinds \
  '{"secret":"<RATE_LIMIT_API_SECRET>","paginationOpts":{"numItems":100,"cursor":null}}'
```

Repeat with the returned `continueCursor` until `isDone` is `true`. For
production, append `--prod` after deploying the Convex functions to production.

The mutation is operator-only and guarded by `RATE_LIMIT_API_SECRET`. It is not
a user-triggered app workflow and should not be exposed through an HTTP route.
