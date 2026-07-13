# UGC-to-App-Ad Mini-Course

## What It Does

`/tools/ugc-to-app-ad-mini-course` is a five-lesson, self-paced course on
reusable UGC sources, hook and proof alignment, demo handoff, controlled
variants, and campaign learning. Each lesson contains an example, exercise,
answer rationale, and completion check.

## Implementation

`ugcMiniCourseDefinition.ts` owns twenty substantive lesson steps. Exercises
accumulate in the shared guided workspace, with versioned browser-local
progress, copy, reset, and Markdown download. The route uses the normal public
lead form only as an optional mailing-list invitation.

## Use Cases and Boundary

- Learn why UGC and demos should remain separate reusable files.
- Draft a safe hook-to-proof and demo-handoff plan.
- Create one controlled test and learning loop.

The course does not source creators, inspect footage, unlock the paid Hook
library, produce assets, or export ads. It is educational preparation for the
paid workflow.

## File Tree

```text
web/app/(content)/tools/ugc-to-app-ad-mini-course/page.tsx
web/lib/clipstitchr/tools/ugcMiniCourse/ugcMiniCourseDefinition.ts
```

See `docs/features/public-tool-quality-register.md` for candid release status.
