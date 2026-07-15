# UGC-to-App-Ad Mini-Course

## Overview

The UGC-to-App-Ad Mini-Course is a guided public course at
`/tools/ugc-to-app-ad-mini-course`. It teaches how clean UGC source clips,
honest hooks, readable product demos, controlled variants, and campaign
evidence fit together before an ad enters production.

The course is educational. It does not generate, stitch, edit, launch, or
measure a finished ad. ClipStitchr's paid workspace remains the production
path.

## How It Works

The course contains five ordered lessons:

1. Capture reusable UGC beats as separate clean source files.
2. Connect a real viewer situation to proof the ad can support.
3. Show one complete product action and a visible payoff.
4. Compare challengers against a stable control.
5. Turn evidence into the next production decision.

Every lesson includes an example, an exercise, an answer rationale, and a
critical lesson check. After email confirmation, Lesson 1 opens immediately
and one additional lesson releases every 24 hours. The interface makes locked
lessons visible without exposing their exercises early.

Visitors can check off tasks, write their own answers, watch overall progress,
reset the workbook, and download the finished course workbook as Markdown.
Confirmed access saves progress through the course-progress API for use across
devices.

## Implementation

`ugcMiniCourseDefinition.ts` is the single source for lesson structure, copy,
exercise prompts, rationales, critical checks, FAQs, and timing estimate. The
route loads the current course workspace and passes it to the shared
`GuidedResourcePage`.

`GuidedResourcePage` applies the email-native access rules, slices the course
to the currently available lessons, calculates later release times, and
composes the public learning page. `GuidedResourceWorkspace` manages task and
note state, progress, synchronization, reset, and the portable Markdown
artifact.

Access uses a secret course-session cookie whose token is hashed before Convex
lookup. Progress writes are bounded to known course item IDs and flow through
the shared PATCH and DELETE course-progress handlers. Enrollment uses the
email-native enrollment handler and the existing provider-readiness and rollout
checks.

## Use Cases

- A founder wants to understand what makes raw creator footage reusable.
- A marketer needs a repeatable hook-to-proof and UGC-to-demo handoff.
- A creative team wants to stop changing several important test variables at
  once.
- A campaign owner wants a simple evidence rule that informs the next asset
  request.

## Boundaries and Quality Record

Examples explain a decision pattern rather than promise results for another
app. The course rejects invented proof, rankings, guaranteed outcomes, private
screen data, and unsupported certainty. It provides a campaign worksheet, not
automated strategy or a finished creative.

Portfolio status, paid-product boundaries, known limitations, and verification
evidence live in
`docs/features/public-tools/portfolio/public-tool-quality-register.md`.

## Source References

- `web/lib/clipstitchr/tools/ugcMiniCourse/ugcMiniCourseDefinition.ts`
- `web/app/(content)/tools/ugc-to-app-ad-mini-course/page.tsx`
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
  app/(content)/tools/ugc-to-app-ad-mini-course/page.tsx
  app/api/tools/[tool]/
    course-progress/route.ts
    email-native-enrollment/route.ts
  app/_components/tools/resources/
    GuidedResourcePage.tsx
    GuidedResourceWorkspace.tsx
  lib/clipstitchr/tools/
    ugcMiniCourse/ugcMiniCourseDefinition.ts
    courses/
      getCourseDefinition.ts
      getCourseReleaseIntervalMs.ts
      server/getCourseWorkspaceStateForRequest.ts
```
