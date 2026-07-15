# Five-Day App Content Sprint

## What It Does

`/tools/five-day-app-content-sprint` provides five working sessions covering
asset inventory, audience/problem/payoff, concept cards, capture planning, and
a publishing and learning board. Day 1 opens after course confirmation, then
one more day opens every 24 hours.

## Implementation

`fiveDayContentSprintDefinition.ts` owns twenty-five tasks across five days.
The shared guided workspace uses an app-owned course entitlement for release
timing and stores per-item completion and bounded notes in Convex so work can
continue across devices. Visitors can reset, copy, or download currently
released work without a ClipStitchr product account.

Before confirmation, every day exposes only its title; no task body is sent to
the browser. After confirmation, Day 1 opens immediately and locked days show
their release time. The course does not write scripts, record footage,
assemble ads, schedule posts, or publish. Production remains the paid
ClipStitchr job.

## Email and Access

In `hybrid-v1`, the name-and-email form unlocks the regular public-tool
portfolio in that browser and creates a pending entitlement only for this
sprint. The 48-hour, single-use app confirmation POST activates the sprint,
creates a 180-day HttpOnly course session, and starts the exact
`five_day_content_sprint_enrolled` marketing Workflow. A normal tool signup
never opens this course, and this sprint never opens either other course.

Unsubscribe, bounce, complaint, or provider deletion stops later releases and
marketing without erasing already released work. Privacy deletion removes the
course session, entitlement, progress, and notes. See
`docs/features/courses/email-course-access-and-progress.md` and
`docs/operations/email/integration.md`.

## File Tree

```text
web/app/(content)/tools/five-day-app-content-sprint/page.tsx
web/lib/clipstitchr/tools/fiveDayContentSprint/fiveDayContentSprintDefinition.ts
web/app/_components/tools/resources/GuidedResourcePage.tsx
web/app/_components/tools/resources/GuidedResourceWorkspace.tsx
web/convex/courseAccess/
web/lib/clipstitchr/tools/courses/
```

See `docs/features/public-tools/portfolio/public-tool-quality-register.md` for candid release status.
