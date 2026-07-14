# Build Your First Creative Testing System Workshop

## What It Does

`/tools/app-creative-testing-system-workshop` is a 45-minute-equivalent guided
workshop that produces a recurring creative-testing operating charter. It
covers purpose, variable hierarchy, roles, naming, evidence, review cadence,
asset states, and charter ownership.

## Implementation

`testingSystemWorkshopDefinition.ts` owns seven exercises and the charter
fields. The shared guided workspace keeps progress in versioned local storage
and creates a copyable or downloadable Markdown charter. The browser workshop
itself does not call a provider, ad platform, project-management system, or
backend storage. Only an explicit email-enrollment request uses the documented
Convex and Loops confirmation path; workshop answers and charter content stay
on the device.

## Use Cases and Boundary

- Give a small team repeatable rules across campaigns.
- Prevent accidental multi-variable isolation tests.
- Assign stop authority and define inconclusive evidence handling.

The workshop defines the operating system, while the existing blueprint and
test-plan tools design individual campaigns. It does not execute tests, ingest
performance, manage assets, or produce creative.

## Staged Email Experience

The hybrid catalog now classifies this as an email-native experience, and the
shared resource boundary preserves the agenda, outcomes, and first complete
section before the on-page step. In `control`, the entire browser workshop
stays visible. In a server-approved `hybrid-v1` rollout, submitting the required
name and email unlocks the full local workshop immediately and requests the
exact workshop marketing Workflow. A recognized returning browser also gets a
one-click request while the full form remains available.

A new or opted-out address must complete ClipStitchr's forty-eight-hour,
single-use app confirmation before delivery begins. Loops dashboard double
opt-in is disabled and does not replace that app-owned confirmation. The
workshop honors unsubscribe and cannot use a transactional template.
Email-native entry fails to `control` until the server verifies full Loops
readiness and an explicit rollout assignment. No Loops dashboard configuration
or live send was performed for this implementation. See
`docs/features/public-tool-lead-capture-strategy.md` and
`docs/backend/loops-email-integration.md`.

## File Tree

```text
web/app/(content)/tools/app-creative-testing-system-workshop/page.tsx
web/lib/clipstitchr/tools/testingSystemWorkshop/testingSystemWorkshopDefinition.ts
web/app/_components/tools/resources/GuidedResourcePage.tsx
web/app/_components/tools/resources/GuidedResourceWorkspace.tsx
web/lib/clipstitchr/tools/catalog/publicToolGateCatalog.ts
```

See `docs/features/public-tool-quality-register.md` for candid release status.
