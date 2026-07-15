# Five-Day App Content Sprint

## Overview

The Five-Day App Content Sprint is a guided public course at
`/tools/five-day-app-content-sprint`. It helps an app team turn its existing
UGC, product demos, and approved proof into five shoot-ready concepts and a
clear publishing and learning plan.

The sprint deliberately stops before production. It does not record, edit,
stitch, schedule, or publish ads. Its output is a planning workbook that makes
the next production handoff easier.

## How It Works

The course is divided into five ordered days:

1. Inventory the UGC, demo footage, proof, and missing assets.
2. Choose one audience, frustrating moment, visible action, and honest payoff.
3. Build five concepts with meaningfully different angles.
4. Turn the concepts into a capture list, reusable takes, file names, owners,
   and deadlines.
5. Set the publishing order, controlled-test rules, evidence window, review,
   and next capture.

After a visitor confirms their email, Day 1 is available immediately. Each
later day releases after another 24 hours. The page shows unreleased days as
locked and includes their release time when a confirmed course session exists.

Each task can be checked off and most planning tasks include a note field.
Confirmed course access saves progress through the course-progress API so the
work can continue on another device. The completed workbook can be downloaded
as Markdown after access is confirmed.

## Implementation

`fiveDayContentSprintDefinition.ts` owns all course copy, sections, tasks,
notes, FAQs, and the completion label. The route reads the current server-side
course workspace and renders the shared `GuidedResourcePage`.

The shared page calculates which sections are available, renders locked
sections separately, and composes the hero, workspace, access capture, guide,
FAQ, pricing handoff, and related-tool links. `GuidedResourceWorkspace` owns the
interactive task state, progress percentage, notes, reset action, synchronized
saves, and Markdown export.

Course access is represented by a secret session cookie. The server hashes the
session token before querying Convex. Progress changes use bounded PATCH and
DELETE requests to `/api/tools/[tool]/course-progress`; access enrollment uses
`/api/tools/[tool]/email-native-enrollment`. These routes retain the existing
same-origin, validation, authorization, and rate-limit boundaries documented in
the backend rate-limit guide.

## Use Cases

- A founder has scattered creator clips and product recordings but no weekly
  production plan.
- A marketer needs five concepts grounded in footage and proof the team
  actually owns.
- A small team needs a capture handoff with file rules, owners, and deadlines.
- A campaign owner wants a publishing order and a controlled learning loop
  before spending on production.

## Boundaries and Quality Record

The sprint creates source-aware concepts and a production handoff, not five
finished ads. It never promises that a particular concept will perform and it
does not hide missing footage behind generated copy.

Portfolio status, paid-product boundaries, known limitations, and verification
evidence live in
`docs/features/public-tools/portfolio/public-tool-quality-register.md`.

## Source References

- `web/lib/clipstitchr/tools/fiveDayContentSprint/fiveDayContentSprintDefinition.ts`
- `web/app/(content)/tools/five-day-app-content-sprint/page.tsx`
- `web/app/_components/tools/resources/GuidedResourcePage.tsx`
- `web/app/_components/tools/resources/GuidedResourceWorkspace.tsx`
- `web/lib/clipstitchr/tools/courses/getCourseReleaseIntervalMs.ts`
- `web/lib/clipstitchr/tools/courses/server/getCourseWorkspaceStateForRequest.ts`
- `web/app/api/tools/[tool]/course-progress/route.ts`
- `web/app/api/tools/[tool]/email-native-enrollment/route.ts`
- `docs/backend/rate-limits.md`

## File Tree

```text
web/
  app/(content)/tools/five-day-app-content-sprint/page.tsx
  app/api/tools/[tool]/
    course-progress/route.ts
    email-native-enrollment/route.ts
  app/_components/tools/resources/
    GuidedResourcePage.tsx
    GuidedResourceWorkspace.tsx
  lib/clipstitchr/tools/
    fiveDayContentSprint/fiveDayContentSprintDefinition.ts
    courses/
      getCourseDefinition.ts
      getCourseReleaseIntervalMs.ts
      server/getCourseWorkspaceStateForRequest.ts
```
