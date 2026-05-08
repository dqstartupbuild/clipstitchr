# Convex + Cloudflare R2 Migration

ClipStitchr is moving from browser-local IndexedDB to a backend-backed model:

- Convex owns all searchable/queryable records, user scoping, metadata, trim ranges, tags, and stitch history.
- Cloudflare R2 owns every binary object: normalized videos, stitched videos, video posters, normalized photos, original photos, and thumbnails.
- IndexedDB is not read, migrated, or retained. Existing browser-local data is intentionally abandoned.

## Required Outcome

After the migration, the dashboard must never call `indexedDB`, never import `web/lib/clipstitchr/storage/*`, and never persist media in browser storage. The browser may keep in-memory `Blob` values and object URLs for the current session only.

Every user-facing library view must be assembled from:

1. Convex query results for records and object keys.
2. R2 downloads for media, poster, and thumbnail blobs.

Every create/update/delete workflow must write to:

1. R2 first for binary objects.
2. Convex second for metadata that references the uploaded R2 object keys.
3. R2 deletion endpoints when records are deleted or object keys are replaced.

## Data Ownership

### Convex Tables

`videoClips`

- User owner ID from Clerk/Convex auth.
- Stable app-level `id` string used by existing UI code.
- Name, tags, original filename, clip type, MIME types, sizes, dimensions, aspect ratio, duration, default trim range, audio flag, poster capture version, Swapr metadata, timestamps.
- R2 references for the normalized video and optional poster image.

`photoAssets`

- User owner ID.
- Stable app-level `id`.
- Name, tags, original filename, MIME types, sizes, normalized/original dimensions, preparation mode, consent timestamp, timestamps.
- R2 references for the normalized photo, optional original photo, and optional thumbnail.

`stitches`

- User owner ID.
- Stable app-level `id`.
- UGC and demo clip IDs/names, copied trim ranges, output MIME type, size, dimensions, duration, optional text overlay, created timestamp, poster capture version.
- R2 references for the stitched video and optional poster image.

### R2 Objects

All object keys must be user scoped:

```text
users/{clerkUserId}/video-clips/{clipId}/video.mp4
users/{clerkUserId}/video-clips/{clipId}/poster.jpg
users/{clerkUserId}/photos/{photoId}/photo.jpg
users/{clerkUserId}/photos/{photoId}/original.jpg
users/{clerkUserId}/photos/{photoId}/thumbnail.jpg
users/{clerkUserId}/stitches/{stitchId}/video.mp4
users/{clerkUserId}/stitches/{stitchId}/poster.jpg
```

The client must never receive R2 credentials. It asks authenticated Next.js API routes for short-lived signed URLs, then uploads/downloads directly with those URLs.

## IndexedDB Removal Map

Delete or stop importing every file under `web/lib/clipstitchr/storage/`.

Replace these operations:

- `getVideoClips()` -> Convex `videoClips.list` query, then R2 poster hydration.
- `getVideoClip(id)` -> Convex `videoClips.get` query or cached list record, then R2 video and poster hydration.
- `saveVideoClip(clip)` -> upload video/poster to R2, then Convex `videoClips.save` mutation.
- `saveVideoClipMetadata(clip)` -> Convex `videoClips.updateMetadata` mutation.
- `deleteVideoClip(id)` -> Convex lookup for object keys, R2 delete, then Convex `videoClips.remove` mutation.
- `getPhotoAssets()` -> Convex `photoAssets.list` query, then R2 thumbnail hydration.
- `getPhotoAsset(id)` -> Convex lookup, then R2 photo/original/thumbnail hydration.
- `savePhotoAsset(photo)` -> upload photo/original/thumbnail to R2, then Convex `photoAssets.save` mutation.
- `savePhotoAssetMetadata(photo)` -> Convex `photoAssets.updateMetadata` mutation.
- `deletePhotoAsset(id)` -> Convex lookup for object keys, R2 delete, then Convex `photoAssets.remove` mutation.
- `getStitches()` -> Convex `stitches.list` query, then R2 video/poster hydration for current card behavior.
- `getStitch(id)` -> Convex lookup, then R2 video/poster hydration.
- `saveStitch(stitch)` -> upload stitched video/poster to R2, then Convex `stitches.save` mutation.
- `deleteStitch(id)` -> Convex lookup for object keys, R2 delete, then Convex `stitches.remove` mutation.
- `clearClipStitchrDatabase()` and all IndexedDB migrations -> delete; there is no local database reset flow after this change.

## Runtime Changes

### App Providers

Add a client component that creates a `ConvexReactClient` from `NEXT_PUBLIC_CONVEX_URL` and wraps children with `ConvexProviderWithClerk`.

`ClerkProvider` must wrap the Convex provider so Convex can request Clerk auth tokens.

### Convex Backend

Add `web/convex/schema.ts` with tables and indexes:

- `videoClips.by_owner_created`
- `videoClips.by_owner_id`
- `photoAssets.by_owner_created`
- `photoAssets.by_owner_id`
- `stitches.by_owner_created`
- `stitches.by_owner_id`

Add Convex modules:

- `videoClips.ts`: list, get, save, update metadata, update poster reference, remove.
- `photoAssets.ts`: list, get, save, update metadata, remove.
- `stitches.ts`: list, get, save, update poster reference, remove.

Every Convex function must call `ctx.auth.getUserIdentity()` and scope reads/writes by owner ID. A record with the same app-level `id` but a different owner must be invisible.

### R2 API

Add authenticated Next.js route handlers:

- `POST /api/r2/upload-url`
  - Body: object kind, app record ID, content type.
  - Returns: R2 object key, signed PUT URL, expiration seconds.
- `POST /api/r2/download-url`
  - Body: R2 object key.
  - Validates that the key starts with `users/{clerkUserId}/`.
  - Returns: signed GET URL, expiration seconds.
- `POST /api/r2/delete-objects`
  - Body: R2 object keys.
  - Validates each key is user scoped.
  - Deletes those objects server-side.

### Client Storage Adapter

Add client helpers outside `storage/`:

- Upload a `Blob` by requesting an upload URL, then `PUT`ing the blob with the exact signed content type.
- Download a `Blob` by requesting a download URL, then fetching the signed URL.
- Delete a group of object keys through the delete route.
- Convert Convex records plus hydrated blobs into existing `VideoClip`, `VideoClipMetadata`, `PhotoAsset`, `PhotoAssetMetadata`, and `Stitch` shapes.

### Dashboard Hooks

Replace `useClipLibraryState` and `usePhotoLibraryState` internals:

- Use Convex `useQuery` for list data.
- Use Convex `useMutation` for metadata saves/removes.
- Hydrate poster/thumbnail blobs from R2 after query data arrives.
- Keep existing in-memory `Map` caches for full video/photo blobs.
- Use R2 upload helpers during upload, Swapr generation, and stitch generation before saving Convex records.

Remove `useClipLibraryPosterBackfill`. No IndexedDB backfill logic remains.

## Environment Variables

### Next.js `.env.local`

Set these in `web/.env.local` for local development and in the hosting provider for production.

`NEXT_PUBLIC_CONVEX_URL`

- Found in the Convex dashboard deployment settings or generated by `npx convex dev`.
- Exposed to the browser and used by `ConvexReactClient`.

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

- Found in Clerk Dashboard -> API Keys.
- Already required by Clerk.

`CLERK_SECRET_KEY`

- Found in Clerk Dashboard -> API Keys.
- Already required by authenticated Next.js route handlers.

`R2_ACCOUNT_ID`

- Found in Cloudflare Dashboard -> R2 -> account context, or the Cloudflare account URL.
- Used to build `https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com`.

`R2_BUCKET_NAME`

- Found in Cloudflare Dashboard -> R2 -> bucket name.
- Must be the bucket used for ClipStitchr media.

`R2_ACCESS_KEY_ID`

- Create in Cloudflare Dashboard -> R2 -> Manage R2 API Tokens.
- Use a token scoped to the ClipStitchr bucket with object read/write permissions.

`R2_SECRET_ACCESS_KEY`

- Shown only when the Cloudflare R2 API token is created.
- Store it immediately in `.env.local` and the deployment platform secret manager.

`R2_SIGNED_URL_EXPIRES_SECONDS`

- Optional.
- Defaults to `900` seconds when omitted.
- Must be short enough to limit leaked URL usefulness and long enough for large browser uploads.

### Convex Deployment Environment

Set this in Convex dashboard deployment settings for both development and production deployments:

`CLERK_JWT_ISSUER_DOMAIN`

- Found in Clerk Dashboard -> API Keys -> Frontend API URL.
- Development values look like `https://verb-noun-00.clerk.accounts.dev`.
- Production values usually look like `https://clerk.your-domain.com`.
- Used by `web/convex/auth.config.ts` so Convex can validate Clerk JWTs.

## Setup Commands

From `web/`:

```bash
npm install convex @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npx convex dev
npm run typecheck
npm run build
```

`npx convex dev` is interactive the first time. It logs in to Convex, creates or links a project, writes the local Convex deployment values, generates `convex/_generated/*`, and syncs schema/functions/auth config.

## Cloudflare R2 Setup

1. Create a private R2 bucket.
2. Create an R2 API token with object read/write permissions scoped to that bucket.
3. Add a CORS rule allowing the app origin to `PUT` and `GET` with `Content-Type`.
4. Copy account ID, bucket name, access key ID, and secret access key into `.env.local` and production secrets.
5. Do not enable public bucket access for private user media.

## Migration Cutover Checklist

- [x] Convex provider is mounted under Clerk provider.
- [ ] Convex schema and auth config are deployed.
- [x] R2 signed URL routes reject unauthenticated users.
- [x] R2 signed URL routes reject keys outside `users/{clerkUserId}/`.
- [x] Upload normalization saves normalized video and poster to R2 before Convex metadata.
- [x] Photo upload saves normalized photo, original photo, and thumbnail to R2 before Convex metadata.
- [x] Stitch generation saves stitched output and poster to R2 before Convex metadata.
- [x] Library list views query Convex and hydrate thumbnails/posters from R2.
- [x] Preview, trim, Swapr, Stitchr, and download flows hydrate full media blobs from R2 on demand.
- [x] Rename/tag/trim edits update Convex only.
- [x] Deletions remove R2 objects and Convex records.
- [x] No application code imports `web/lib/clipstitchr/storage/*`.
- [x] No application code references `indexedDB`.
- [x] User-facing docs and privacy copy no longer claim browser-local media persistence.
