# UGC-to-App-Ad Mini-Course

## What It Does

`/tools/ugc-to-app-ad-mini-course` teaches reusable UGC sources, hook and proof
alignment, demo handoff, controlled variants, and campaign learning. Lesson 1
opens after course confirmation, then one more lesson opens every 24 hours.

## Implementation

`ugcMiniCourseDefinition.ts` owns twenty substantive steps across five lessons.
The shared guided workspace uses an app-owned course entitlement for release
timing and stores per-item completion and bounded notes in Convex so work can
continue across devices. Copy, reset, and Markdown download apply to currently
released work.

Before confirmation, every lesson exposes only its title; no exercise body is
sent to the browser. After confirmation, Lesson 1 opens immediately and locked
lessons show their release time. The course does not source creators, inspect
footage, produce assets, or export ads.

## Email and Access

In `hybrid-v1`, the name-and-email form unlocks the regular public-tool
portfolio in that browser and creates a pending entitlement only for this
course. The 48-hour, single-use app confirmation POST activates the course,
creates a 180-day HttpOnly course session, and starts the exact
`ugc_app_ad_course_enrolled` marketing Workflow. A normal tool signup never
opens this course, and this course never opens the sprint or workshop.

Unsubscribe, bounce, complaint, or provider deletion stops later releases and
marketing without erasing already released work. Privacy deletion removes the
course session, entitlement, progress, and notes. See
`docs/features/email-course-access-and-progress.md` and
`docs/backend/loops-email-integration.md`.

## File Tree

```text
web/app/(content)/tools/ugc-to-app-ad-mini-course/page.tsx
web/lib/clipstitchr/tools/ugcMiniCourse/ugcMiniCourseDefinition.ts
web/app/_components/tools/resources/GuidedResourcePage.tsx
web/app/_components/tools/resources/GuidedResourceWorkspace.tsx
web/convex/courseAccess/
web/lib/clipstitchr/tools/courses/
```

See `docs/features/public-tool-quality-register.md` for candid release status.
