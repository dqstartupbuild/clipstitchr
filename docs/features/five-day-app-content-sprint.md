# Five-Day App Content Sprint

## What It Does

`/tools/five-day-app-content-sprint` provides five complete working sessions:
asset inventory, audience/problem/payoff, five concept cards, capture and
handoff planning, and a publishing and learning board. Every day is available
immediately; the page does not pretend the mailing-list form sends a course.

## Implementation

`fiveDayContentSprintDefinition.ts` owns twenty-five tasks across five days.
The shared guided-resource workspace stores checklist progress and notes in the
visitor's `localStorage` under a versioned key. Visitors can reset that local
draft, copy it, or download Markdown. No account or server storage is used.

## Use Cases and Boundary

- Turn scattered clips into five source-aware concepts.
- Identify missing captures before editing begins.
- Define the control, changed variables, evidence, and review owner.

The sprint does not write finished scripts, record footage, assemble ads,
schedule posts, or publish. Production remains the paid ClipStitchr job.

## File Tree

```text
web/app/(content)/tools/five-day-app-content-sprint/page.tsx
web/lib/clipstitchr/tools/fiveDayContentSprint/fiveDayContentSprintDefinition.ts
web/app/_components/tools/resources/GuidedResourceWorkspace.tsx
```

See `docs/features/public-tool-quality-register.md` for candid release status.
