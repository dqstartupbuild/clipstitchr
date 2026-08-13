# Studio Beta Workspace

## Purpose

Studio Beta is an opt-in production workspace inside the existing ClipStitchr
dashboard. It connects the active Product to a deliberate workflow:

```text
Research -> Clips -> Stitch -> Edit -> Publish
```

It is isolated from the classic Hook Lab, Clipr, Stitchr, Library, Schedule,
Analytics, and Zernio publishing records. Classic routes remain available and
are not redirected, migrated, or dual-written.

## Routes and jobs

Each route owns one primary job:

| Route | Primary job |
| --- | --- |
| `/dashboard/studio` | See the active Product and recent usable media |
| `/dashboard/studio/research` | Run and save corpus-backed creative research |
| `/dashboard/studio/clips` | Turn one long source into reviewed short clips |
| `/dashboard/studio/stitch` | Build and review classic or talking reel batches |
| `/dashboard/studio/edit` | Assemble, preview, autosave, and export a timeline |
| `/dashboard/studio/publishing` | Enter the isolated Postiz Beta workspace |
| `/dashboard/studio/publishing/compose` | Create a draft, immediate post, or schedule |
| `/dashboard/studio/publishing/calendar` | Review Product-scoped scheduled work |
| `/dashboard/studio/publishing/posts` | Inspect destination status and retry safety |
| `/dashboard/studio/publishing/analytics` | Review and refresh supported analytics |
| `/dashboard/studio/publishing/connections` | Connect and maintain supported accounts |

The Studio navigation is shared rather than copied from any upstream product.
It keeps the active Product visible, uses the same labels on desktop and mobile,
and preserves route state through durable records and Product-keyed client
drafts.

## Cross-workspace handoffs

Handoffs carry durable identifiers in the destination URL. They do not pass
signed object URLs, provider credentials, or browser-trusted Product claims.
The destination reloads the record under the current Clerk owner and active
Product before using it.

- An approved LazyReel brief can open Studio Stitch or seed Studio Edit.
- An accepted Studio Clips output can be saved to the Product Library, opened
  in Studio Edit, or selected in Studio Stitch.
- A generated Studio Stitch output can be saved to the Product Library, opened
  in Studio Edit, or selected in Postiz Beta compose.
- Studio Edit exports can be saved to the Product Library and then selected by
  other Studio or classic workflows.
- Postiz Beta accepts durable Library, Stitch, Studio Clips, Studio Stitch, and
  supported Swipe media identities after server-side resolution.

An existing result uses an **Open** or **View** action. Provider calls and
rerenders require a separate explicit action. Route changes never regenerate
work automatically.

## Access and Product scope

Every Studio page is guarded on the server. Access requires all three facts:

1. `STUDIO_BETA_ENABLED` is exactly `true` in the current runtime.
2. The authenticated Clerk subject has an active grant.
3. That owner enabled Studio Beta in Settings.

Development authentication bypass cannot authorize Studio. Convex, Next.js
APIs, R2 routes, workers, and the publishing service recheck their own boundary.
Every feature record also binds `ownerId` and `productId`; a rate-limit result is
never treated as authorization.

The active Product is loaded from ClipStitchr rather than duplicated in a
vendor-specific account model. Product changes select a different set of
drafts, projects, jobs, outputs, and publishing history without mutating the
previous Product's records.

## Interface system

The shared visual language is a working cutting room: a populated media contact
sheet, timeline rhythm, warm graphite surfaces, copper-toned controls, direct
status copy, and visible media lineage. It is not a decorative vendor shell or
a fake desktop window.

The interface uses progressive disclosure:

- one primary job per route;
- readable results before editing controls;
- detail panels opened only when needed;
- expensive actions next to their cost or availability state;
- loading, error, and success messages beside the triggering control;
- the same content hierarchy on narrow screens;
- native or tested accessible controls with visible focus;
- no content hidden behind an entrance animation.

Unavailable credentials produce a plain disabled state. A saved intent is not
described as rendered, published, or materialized until the corresponding
worker or provider boundary supplies durable proof.

## Storage and service boundaries

Convex owns Studio access, bounded feature metadata, Product-scoped task state,
projects, recipes, results, checkpoints, and idempotency receipts. Large media
uses owner-scoped R2 objects under:

```text
users/{ownerId}/studio/v1/{kind}/{productId}/...
```

The Studio Clips and Studio Stitch Cloud Run jobs own long-running media and
provider execution. The isolated Postiz Beta service uses PostgreSQL for its
publishing ledger and Redis for transient OAuth state, replay protection,
coordination, and service rate limits. Browser editor composition stays in the
browser when it fits the tested Media Bunny limit.

## Rate limits and abuse controls

Feature writes, signed R2 URLs, provider work, worker lifecycle writes, and
expensive static reads consume their dedicated owner and global buckets before
cost. The exact capacities and enforcement order are maintained in
`docs/operations/security/rate-limits.md`.

The Studio home summary is intentionally not given an additional token bucket.
It is an authenticated, access-checked, Product-owned, indexed Convex query that
returns at most eight bounded classic media cards and performs no storage write,
signed URL creation, provider call, or shared compute job. Poster URL signing
keeps its independent download limits.

## Environment

The shared access boundary uses:

- `STUDIO_BETA_ENABLED`
- `STUDIO_BETA_OPERATOR_SECRET`

Each execution service has its own secret, enable flag, R2 settings, provider
credentials, timeouts, and command paths. Publishing uses only
`STUDIO_PUBLISHING_*` credentials and never reads Zernio credentials. The full
set, with local-safe disabled defaults, is documented in `web/.env.example` and
the feature-specific documents.

## Upstream source references

The supplied source trees are preserved literally inside immutable vendor
boundaries:

- LazyReel: `web/vendor/lazyreel/v0_1_0/upstream`
- OpenCut Classic commit `cf5e79e919144200294fb9fed22a222592a0aeea`:
  `web/vendor/opencut/classic_cf5e79e/upstream`
- Supplied OpenCut rewrite scaffold:
  `web/vendor/opencut/rewrite_supplied_8eefd45a/upstream`
- SupoClip: `web/vendor/supoclip/v0_1_0/upstream`
- ReelClaw: `web/vendor/reelclaw/snapshot_bdeb17ca/upstream`
- Postiz commit `013db1dac7936054e77d40dd027ede0222771945`:
  `web/vendor/postiz/official_013db1da/upstream`

ClipStitchr-owned adapters live outside those boundaries and replace duplicate
auth, storage, billing, account, navigation, and deployment assumptions.

## Classic workspace compatibility

Studio publishing records R2 version and ETag metadata after uploads so later
provider reads can bind to the exact object. The classic workspace continues to
send only `key`, `contentType`, and `size` through its existing Convex object
validators. Shared browser upload adapters must convert the richer upload result
back to that exact classic shape before saving clips, photos, Stitch renders,
posters, Swipr backgrounds, or Swipe posters. This boundary keeps Studio's
durability metadata from changing classic record contracts at runtime.

## Relevant file tree

```text
web/app/dashboard/studio/                 guarded route workspaces
web/app/_components/studio/               shared and feature UI
web/app/api/studio/                       authenticated Studio APIs
web/convex/studioBetaAccess/              canonical access checks
web/convex/studioBetaWorkspace/           bounded home summary
web/lib/clipstitchr/server/studio/         server access and integrations
web/lib/clipstitchr/studio/                pure Studio engines
web/lib/clipstitchr/client/r2/              shared upload compatibility adapters
web/services/studio-clips-worker/          Clips execution runtime
web/services/studio-stitch-worker/         Stitch execution runtime
web/services/publishing-service/           isolated Postiz Beta service
web/vendor/                                immutable upstream snapshots
```

## Verification

Focused tests cover route guards, shared navigation, active Product continuity,
handoff identifier parsing, owner/Product isolation, loading and empty states,
pointer activation, and keyboard focus. Each feature document lists its deeper
engine, persistence, worker, provider, and UI suites.

The final local pass exercised the fail-closed Studio route and representative
real workspace components at 1440x900 and 390x844. Pointer, keyboard, visible
focus, Escape focus return, control sizing, navigation, and overflow were
checked directly. Direct API denial returned `401` with `private, no-store`.
The pass fixed hidden mobile drawer focus, sub-44-pixel navigation controls, and
the clipped mobile Studio Stitch navigation. Focused route, component,
persistence, and worker tests cover refresh/state, empty, loading, success,
error, cancelled, and provider-unavailable behavior.

The repository's Clerk values are placeholders, so the pass did not claim an
authenticated live Product write or external provider result. Those checks are
required in configured staging before rollout. `npm test`, typecheck, lint, and
the production build passed, and the local server was stopped.

## Known boundaries

- Studio is disabled until an operator grants an immutable Clerk owner ID and
  that owner opts in.
- No production deployment or traffic switch is part of the implementation.
- Live publishing is not claimed without an observed provider result in the
  configured environment.
- Disabling or revoking Studio preserves existing records and objects while
  stopping new work at the next safe boundary.
