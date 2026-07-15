# Email Course Access and Progress

## What It Does

ClipStitchr's three email-native learning resources use app-owned access instead
of the portfolio-wide browser unlock:

- The Five-Day App Content Sprint opens Day 1 after confirmation and one more
  day every 24 hours.
- The UGC-to-App-Ad Mini-Course opens Lesson 1 after confirmation and one more
  lesson every 24 hours.
- The Creative Testing System Workshop opens in full after confirmation.

The visitor does not need a ClipStitchr product account. A confirmed course
session keeps checklist progress and notes available across devices. On a new
device, submitting the course form sends the same app-owned confirmation step
and creates a new course session only after the explicit confirmation POST.
An existing entitlement remains readable if Loops delivery is temporarily
unavailable; delivery readiness never turns into course authorization.

## Directional Unlock Contract

A regular public-tool signup unlocks approved browser-local public-tool value.
It never creates a course entitlement. A signup for one course also sets the
regular public-tool marker, but creates an entitlement only for the course
named by the confirmation token. It does not unlock either of the other courses
or the workshop. A visitor with an existing verified course session may
explicitly add another course with the one-click enrollment control.

## Access and Release Flow

1. The public page renders only locked-section titles. No lesson body is sent to
   the browser before that specific course is confirmed.
2. The course form records the normal lead capture and a pending entitlement.
3. The confirmation email uses the existing 48-hour, single-use operational
   template. Opening the link is still a read-only GET.
4. The explicit same-origin, CSRF-protected POST confirms consent, activates
   only the token's course, creates its logical Workflow enrollment, and sets a
   random 180-day HttpOnly `SameSite=Strict` course-session cookie.
5. Convex computes released sections from the entitlement activation time.
   Locked lesson bodies are removed before the client component is serialized.
6. Progress writes validate the course, item, current release boundary,
   session, body size, and rate limits before one item is upserted.

Unsubscribe, hard bounce, complaint, and provider deletion stop future lesson
releases and marketing operations. Already released work and saved progress
remain readable. Privacy deletion removes course sessions, entitlements, and
all saved course notes in the same local deletion transaction.

## Data Model

- `courseEntitlements` owns one contact/course/version grant and its activation
  and release-stop time.
- `courseAccessSessions` stores only a SHA-256 token hash, contact association,
  issue/expiry time, and last-use time. The raw token stays in the HttpOnly
  cookie.
- `courseProgressItems` stores one bounded note and completion flag per
  entitlement/item. Per-item rows avoid replacing unrelated work when two
  devices save close together.
- `emailConfirmationTokens.courseKey` binds a single-use confirmation to at
  most one course.

Course answers and notes are not projected to Loops, PostHog, TikTok, URLs, or
general logs. Loops receives only the existing bounded contact projection and
the fixed Workflow event for the explicitly selected course.

## Abuse Protection

Workspace reads are limited per session and globally. Progress writes are
limited per session, client fingerprint, and globally. Reset is separately
limited per session and globally. HTTP `429` responses include retry timing.
Notes are capped at 600 characters and request bodies use the existing streamed
2 KiB cap. Same-origin checks, course/item allowlists, and entitlement checks
remain separate from rate limits.

## File Tree

```text
web/convex/courseAccess/
web/convex/schema.ts
web/app/api/tools/[tool]/course-progress/
web/app/_components/tools/resources/CourseLockedSectionCard.tsx
web/app/_components/tools/resources/GuidedResourcePage.tsx
web/app/_components/tools/resources/GuidedResourceWorkspace.tsx
web/lib/clipstitchr/tools/courses/
web/lib/clipstitchr/email/confirmation/handleEmailConfirmationPost.ts
```

## Verification

Run from `web/`:

```bash
npm run typecheck
npm run lint
npx vitest run convex/courseAccess app/email/confirm/route.test.ts
npm test
```
