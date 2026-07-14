# Five-Day App Content Sprint

## What It Does

`/tools/five-day-app-content-sprint` provides five complete working sessions:
asset inventory, audience/problem/payoff, five concept cards, capture and
handoff planning, and a publishing and learning board. The browser workspace
does not wait for inbox delivery, and the page never claims an email was sent
before provider delivery is known.

## Implementation

`fiveDayContentSprintDefinition.ts` owns twenty-five tasks across five days.
The shared guided-resource workspace stores checklist progress and notes in the
visitor's `localStorage` under a versioned key. Visitors can reset that local
draft, copy it, or download Markdown. No account or server storage is used for
the worksheet itself.

## Use Cases and Boundary

- Turn scattered clips into five source-aware concepts.
- Identify missing captures before editing begins.
- Define the control, changed variables, evidence, and review owner.

The sprint does not write finished scripts, record footage, assemble ads,
schedule posts, or publish. Production remains the paid ClipStitchr job.

## Staged Email Experience

The hybrid catalog now classifies this as an email-native experience, and the
shared resource boundary preserves the outcomes and one complete sample day
before the on-page step. In `control`, the whole browser workspace remains
visible. In a server-approved `hybrid-v1` rollout, submitting the required name
and email unlocks the remaining days and portability in that browser
immediately and requests the exact five-day marketing Workflow. A recognized
returning browser also gets a one-click request while the full form remains
available.

A new or opted-out address must complete ClipStitchr's forty-eight-hour,
single-use app confirmation before the Workflow begins. Loops dashboard double
opt-in is disabled and does not replace that app-owned confirmation. The
sequence honors unsubscribe and cannot use the transactional template. All
email-native entry gates still fail to `control` until the server verifies full
Loops readiness and an explicit rollout assignment. No Loops dashboard
configuration or live send was performed for this implementation. See
`docs/features/public-tool-lead-capture-strategy.md` and
`docs/backend/loops-email-integration.md`.

## File Tree

```text
web/app/(content)/tools/five-day-app-content-sprint/page.tsx
web/lib/clipstitchr/tools/fiveDayContentSprint/fiveDayContentSprintDefinition.ts
web/app/_components/tools/resources/GuidedResourcePage.tsx
web/app/_components/tools/resources/GuidedResourceWorkspace.tsx
web/lib/clipstitchr/tools/catalog/publicToolGateCatalog.ts
```

See `docs/features/public-tool-quality-register.md` for candid release status.
