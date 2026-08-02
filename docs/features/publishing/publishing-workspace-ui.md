# Publishing Workspace UI

## Purpose

The publishing workspace gives a signed-in ClipStitchr user one focused place
to inspect schedules, follow provider results, read observed analytics, manage
connections, and create an Instagram or TikTok post from durable saved media.
It does not invent provider results or treat an accepted request as a published
post.

The workspace is implemented at `/dashboard/publishing`. Its screens require
the tenant-scoped publishing API to be deployed and configured before the
product entry points are enabled.

## User Workspaces

| Workspace | Route | Primary job |
| --- | --- | --- |
| Calendar | `/dashboard/publishing/calendar` | Read one local-time week of saved schedules |
| Posts | `/dashboard/publishing/posts` | Inspect each destination status, attempt history, and safe next action |
| Analytics | `/dashboard/publishing/analytics` | Read provider metrics that ClipStitchr actually observed |
| Integrations | `/dashboard/publishing/integrations` | Connect, refresh, or disconnect Instagram and TikTok accounts |
| Composer | `/dashboard/publishing/compose` | Save, publish now, or schedule one durable media result |

`/dashboard/publishing` redirects to Calendar. The retained Postiz publishing
rail keeps the first four inspection and management tasks separate. The
composer is entered from a saved ClipStitchr result or a Create post action.

## Durable Media Entry

The composer accepts only these bounded query values:

```text
kind=library-media|stitch|swipe
recordId=<1-160 letters, numbers, underscores, or hyphens>
```

Only the durable descriptor is stored in browser session storage. Browser
files, object keys, nested query values, arbitrary URLs, and temporary signed
URLs are rejected. A new media descriptor also creates a new idempotency key.
The caption, selected destinations, per-destination settings, exact schedule,
and idempotency key survive navigation within the browser session. TikTok
creator information and direct-post consent never survive restoration.

## Composer Flow

The composer progressively exposes one decision at a time:

1. Confirm the saved ClipStitchr media reference.
2. Write one shared caption.
3. Choose connected Instagram or TikTok accounts.
4. Review settings and the server-returned media compatibility result for each
   destination.
5. Choose exactly one final intent: save draft, publish now, or schedule.
6. Submit once and read the real per-destination states returned by the API.

Instagram supports feed or Story placement. Instagram Standalone connections
are presented as Instagram in this UI.

TikTok defaults to inbox delivery. The composer clearly states that inbox
delivery does not publish and must be completed in TikTok within 24 hours. A
direct post requires a fresh creator-info response, a provider-supported
privacy choice, capability-constrained interaction settings, and explicit
current consent. Refreshing creator information immediately invalidates the
old consent.

Compatibility errors block submission. A warning must be visibly acknowledged
before submission, and that acknowledgement is bound to the exact media
revision, destination, and warning set. A changed revision or warning requires
a new acknowledgement. The API revalidates the media revision at create time.

## Exact Scheduling

Schedules store all three pieces needed to reproduce the user's choice:

- local date and time;
- IANA time zone;
- exact UTC offset in minutes.

The client searches every real-world quarter-hour offset to detect daylight
saving gaps and folds. A nonexistent local time is rejected. A repeated local
time exposes both offsets and requires the user to choose one. The backend
remains responsible for recomputing and validating the instant before saving
work.

## API Contract

The browser clients use same-origin credentials, disable response caching, and
strictly parse bounded JSON. Unknown fields, invalid timestamps, unsafe result
URLs, wrong destination IDs, oversized bodies, and malformed responses fail
closed.

The workspace consumes these endpoints:

```text
GET    /api/publishing/integrations
POST   /api/publishing/integrations/{instagram|tiktok}/connect
POST   /api/publishing/integrations/{id}/refresh
DELETE /api/publishing/integrations/{id}
GET    /api/publishing/integrations/tiktok/creator-info

POST   /api/publishing/media/compatibility
POST   /api/publishing/posts
GET    /api/publishing/posts
GET    /api/publishing/posts/{id}
POST   /api/publishing/posts/{id}/retry
POST   /api/publishing/posts/{id}/cancel

GET    /api/publishing/calendar
GET    /api/publishing/analytics
```

HTTP errors use a bounded `code` and human-readable `message`. A `429`
response may also provide `retryAfterSeconds` or a `Retry-After` header. The UI
shows errors beside the action that caused them and never substitutes mock
success data.

OAuth navigation is allowed only when the returned URL has the exact reviewed
Instagram, Facebook, or TikTok authorization host and path, a non-empty state,
the expected provider client identifier, and a callback on the current
ClipStitchr origin.

## Result Semantics

Each destination has its own saved status:

- Draft
- Queued
- Processing
- Published
- Failed
- Needs action
- Checking result
- Canceled

TikTok inbox delivery uses Needs action. It is never shown as Published. Retry
and cancel are exposed only when the server says the saved destination can
safely perform that action, and each requires an inline confirmation.
Analytics renders only supplied metrics and separately lists unavailable
provider metrics. It does not synthesize percentages or trends.

## Accessibility and Responsive Behavior

All controls are native links, buttons, fields, fieldsets, details, and form
labels with visible keyboard focus. Loading and errors use nearby live regions.
Destructive actions require confirmation. Provider marks use the authentic
retained vendor assets without icon tiles.

Content is visible by default and does not depend on an entrance animation.
The layout uses tonal surfaces instead of glow, floating cards, pill chips, or
hover movement. At small widths, the publishing rail becomes a horizontal task
bar, all form grids become one column, the calendar becomes a day list, and the
primary submit action spans the available width. Text fields and controls keep
their gutters and no fixed height clips live content.

## File Tree

```text
web/app/dashboard/publishing/
  page.tsx
  layout.tsx
  calendar/page.tsx
  posts/page.tsx
  analytics/page.tsx
  integrations/page.tsx
  compose/page.tsx

web/app/_components/publishing/
  analytics/
  calendar/
  common/
  compose/
  integrations/
  posts/

web/lib/clipstitchr/publishing/client/
  contracts/
  readers/
  requests/
  schedule/
```

Each component, reader, request, formatter, parser, schedule helper, and type
keeps one focused purpose in its own file.

## Verification

Focused tests cover:

- safe route search-parameter boundaries;
- authentic Instagram and TikTok marks;
- retained workspace navigation;
- strict API responses, response-size limits, and `429` timing;
- same-origin request behavior and compatibility destination matching;
- session draft parsing and fresh TikTok consent;
- inbox versus direct-post validation;
- media warning acknowledgement;
- exact schedule validation and DST gaps and folds;
- the single final-intent control and TikTok inbox copy.

Before enabling production entry points, complete the cutover browser gate with
real pointer and keyboard input at desktop and mobile sizes, exercise every
live API state, and verify provider OAuth and job execution in the configured
environment.

## Source References

- `docs/architecture/postiz-publishing-source-boundary.md`
- `docs/features/publishing/post-bridge-cutover.md`
- `docs/features/publishing/postiz-provider-adapter-audit.md`
- `docs/features/publishing/publishing-persistence-model.md`
- `docs/features/publishing/publishing-workspace-shell.md`
- `docs/features/publishing/swipe-publishing-media-bundles.md`
- `docs/operations/security/rate-limits.md`
- `project-scope.md`
