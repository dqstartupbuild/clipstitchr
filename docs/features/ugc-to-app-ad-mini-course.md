# UGC-to-App-Ad Mini-Course

## What It Does

`/tools/ugc-to-app-ad-mini-course` is a five-lesson, self-paced course on
reusable UGC sources, hook and proof alignment, demo handoff, controlled
variants, and campaign learning. Each lesson contains an example, exercise,
answer rationale, and completion check.

## Implementation

`ugcMiniCourseDefinition.ts` owns twenty substantive lesson steps. Exercises
accumulate in the shared guided workspace, with versioned browser-local
progress, copy, reset, and Markdown download. The worksheet remains local to
the browser.

## Use Cases and Boundary

- Learn why UGC and demos should remain separate reusable files.
- Draft a safe hook-to-proof and demo-handoff plan.
- Create one controlled test and learning loop.

The course does not source creators, inspect footage, unlock the paid Hook
library, produce assets, or export ads. It is educational preparation for the
paid workflow.

## Staged Email Experience

The hybrid catalog now classifies this as an email-native experience, and the
shared resource boundary preserves the curriculum and one complete sample
lesson before the on-page step. In `control`, the complete browser course stays
visible. In a server-approved `hybrid-v1` rollout, the required name-and-email
submission unlocks all browser worksheets immediately and requests the exact
mini-course marketing Workflow. A recognized returning browser also gets a
one-click request while the full form remains available.

A new or opted-out address must complete ClipStitchr's forty-eight-hour,
single-use app confirmation before the Workflow begins. Loops dashboard double
opt-in is disabled and does not replace that app-owned confirmation. The course
honors unsubscribe and cannot use a transactional template. Email-native entry
fails to `control` until the server verifies full Loops readiness and an
explicit rollout assignment. No Loops dashboard configuration or live send was
performed for this implementation. See
`docs/features/public-tool-lead-capture-strategy.md` and
`docs/backend/loops-email-integration.md`.

## File Tree

```text
web/app/(content)/tools/ugc-to-app-ad-mini-course/page.tsx
web/lib/clipstitchr/tools/ugcMiniCourse/ugcMiniCourseDefinition.ts
web/app/_components/tools/resources/GuidedResourcePage.tsx
web/app/_components/tools/resources/GuidedResourceWorkspace.tsx
web/lib/clipstitchr/tools/catalog/publicToolGateCatalog.ts
```

See `docs/features/public-tool-quality-register.md` for candid release status.
