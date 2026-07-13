# Build Your First Creative Testing System Workshop

## What It Does

`/tools/app-creative-testing-system-workshop` is a 45-minute-equivalent guided
workshop that produces a recurring creative-testing operating charter. It
covers purpose, variable hierarchy, roles, naming, evidence, review cadence,
asset states, and charter ownership.

## Implementation

`testingSystemWorkshopDefinition.ts` owns seven exercises and the charter
fields. The shared guided workspace keeps progress in versioned local storage
and creates a copyable or downloadable Markdown charter. No provider, ad
platform, project-management system, or backend storage is involved.

## Use Cases and Boundary

- Give a small team repeatable rules across campaigns.
- Prevent accidental multi-variable isolation tests.
- Assign stop authority and define inconclusive evidence handling.

The workshop defines the operating system, while the existing blueprint and
test-plan tools design individual campaigns. It does not execute tests, ingest
performance, manage assets, or produce creative.

## File Tree

```text
web/app/(content)/tools/app-creative-testing-system-workshop/page.tsx
web/lib/clipstitchr/tools/testingSystemWorkshop/testingSystemWorkshopDefinition.ts
```

See `docs/features/public-tool-quality-register.md` for candid release status.
