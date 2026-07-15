# Build Your First Creative Testing System Workshop

## What It Does

`/tools/app-creative-testing-system-workshop` is a 45-minute guided workshop
that produces a recurring creative-testing operating charter. It covers
purpose, variable hierarchy, roles, naming, evidence, review cadence, asset
states, and charter ownership. The complete workshop opens after confirmation.

## Implementation

`testingSystemWorkshopDefinition.ts` owns seven sections and the charter
fields. The shared guided workspace stores per-item completion and bounded
notes in Convex so work can continue across devices, then creates a copyable or
downloadable Markdown charter. Notes never enter Loops or analytics.

Before confirmation, every section exposes only its title; no workshop task
body is sent to the browser. The explicit confirmation opens every section at
once. The workshop does not execute tests, ingest performance, manage assets,
or produce creative.

## Email and Access

In `hybrid-v1`, the name-and-email form unlocks the regular public-tool
portfolio in that browser and creates a pending entitlement only for this
workshop. The 48-hour, single-use app confirmation POST activates the full
workshop, creates a 180-day HttpOnly course session, and starts the exact
`creative_testing_workshop_enrolled` marketing Workflow. A normal tool signup
never opens this workshop, and this workshop never opens either timed course.

Unsubscribe, bounce, complaint, or provider deletion stops marketing without
erasing already released work. Privacy deletion removes the course session,
entitlement, progress, and notes. See
`docs/features/courses/email-course-access-and-progress.md` and
`docs/operations/email/integration.md`.

## File Tree

```text
web/app/(content)/tools/app-creative-testing-system-workshop/page.tsx
web/lib/clipstitchr/tools/testingSystemWorkshop/testingSystemWorkshopDefinition.ts
web/app/_components/tools/resources/GuidedResourcePage.tsx
web/app/_components/tools/resources/GuidedResourceWorkspace.tsx
web/convex/courseAccess/
web/lib/clipstitchr/tools/courses/
```

See `docs/features/public-tools/portfolio/public-tool-quality-register.md` for candid release status.
