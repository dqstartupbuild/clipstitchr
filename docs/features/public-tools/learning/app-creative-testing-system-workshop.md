# App Creative Testing System Workshop

## Overview

The App Creative Testing System Workshop is a guided public workspace at
`/tools/app-creative-testing-system-workshop`. It helps a team write one
operating charter for creative-testing purpose, variable order, roles, naming,
evidence, review cadence, and asset flow.

The workshop defines how a team works across campaigns. It does not connect to
an ad platform, ingest performance data, manage tasks, or produce creative.

## How It Works

The workshop is organized into seven working sections:

1. Define the purpose and scope of creative testing.
2. Rank variables and protect the control.
3. Assign owners and stop authority.
4. Define source-asset and test-cell naming rules.
5. Agree on comparable evidence and uncertainty handling.
6. Set the review cadence and asset states.
7. Draft the operating charter and assign its owner and review date.

All seven sections are available immediately after confirmed access. Unlike the
two email-paced courses, this workshop has a zero release interval because it
is designed as one focused team session. Visitors can complete tasks, write
notes, see progress, reset the workspace, and download the resulting charter
as Markdown. Confirmed access keeps progress synchronized across devices.

## Implementation

`testingSystemWorkshopDefinition.ts` owns the workshop sections, instructions,
note labels, FAQs, completion label, and estimated time. The route loads the
course session and provider readiness before rendering the shared
`GuidedResourcePage`.

The shared course release helper returns zero for this course key, making every
section immediately available once access is active. `GuidedResourcePage`
still owns the access boundary and page composition, while
`GuidedResourceWorkspace` owns completion state, notes, synchronized saving,
reset, and Markdown generation.

The workshop uses the same secret session-cookie, hashed-token lookup,
same-origin request validation, item allowlist, authorization, and rate-limited
progress endpoints as the other email-native learning tools.

## Use Cases

- A small creative team needs one rule for what counts as a controlled test.
- A founder wants named owners for briefs, source assets, launch, evidence, and
  final decisions.
- An agency needs files and test cells that are understandable without a
  meeting note.
- A marketing team wants a recurring review with explicit evidence and
  uncertainty rules.

## Boundaries and Quality Record

The output is a portable operating charter. It does not replace legal review,
attribution policy, media buying, statistical analysis, or project management.
The tool keeps those responsibilities explicit so a workshop result cannot be
mistaken for automated campaign governance.

Portfolio status, paid-product boundaries, known limitations, and verification
evidence live in
`docs/features/public-tools/portfolio/public-tool-quality-register.md`.

## Source References

- `web/lib/clipstitchr/tools/testingSystemWorkshop/testingSystemWorkshopDefinition.ts`
- `web/app/(content)/tools/app-creative-testing-system-workshop/page.tsx`
- `web/app/_components/tools/resources/GuidedResourcePage.tsx`
- `web/app/_components/tools/resources/GuidedResourceWorkspace.tsx`
- `web/lib/clipstitchr/tools/courses/getCourseDefinition.ts`
- `web/lib/clipstitchr/tools/courses/getCourseReleaseIntervalMs.ts`
- `web/lib/clipstitchr/tools/courses/server/getCourseWorkspaceStateForRequest.ts`
- `web/app/api/tools/[tool]/course-progress/route.ts`
- `web/app/api/tools/[tool]/email-native-enrollment/route.ts`
- `docs/backend/rate-limits.md`

## File Tree

```text
web/
  app/(content)/tools/app-creative-testing-system-workshop/page.tsx
  app/api/tools/[tool]/
    course-progress/route.ts
    email-native-enrollment/route.ts
  app/_components/tools/resources/
    GuidedResourcePage.tsx
    GuidedResourceWorkspace.tsx
  lib/clipstitchr/tools/
    testingSystemWorkshop/testingSystemWorkshopDefinition.ts
    courses/
      getCourseDefinition.ts
      getCourseReleaseIntervalMs.ts
      server/getCourseWorkspaceStateForRequest.ts
```
