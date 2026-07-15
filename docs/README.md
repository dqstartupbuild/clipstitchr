# ClipStitchr Documentation

Use this index to find a document and decide where new documentation belongs.
The repository root keeps only the main project entry points: `README.md`,
`AGENTS.md`, `coding-guidelines.md`, and `project-scope.md`.

## Documentation map

| Directory | Contents |
| --- | --- |
| `architecture/` | Durable system and data-model decisions |
| `content/` | SEO, lead magnets, and publishing guidance |
| `features/` | Shipped and planned product capabilities, grouped by product area |
| `guides/` | Reusable walkthroughs for people completing a task |
| `integrations/` | Analytics, search, and other external-service setup |
| `operations/` | Deployment, automation, data, email, media, reliability, security, and evaluation runbooks |
| `planning/` | Implementation plans, investigations, maintenance work, and roadmaps |
| `product/` | Positioning, offer, monetization, and writing guidance |
| `references/` | Mirrored technical references used as implementation sources |

## Feature documentation

Feature documentation is grouped by the part of ClipStitchr it supports:

| Directory | Product area |
| --- | --- |
| `features/avatar/` | Avatar workflows |
| `features/cli/` | ClipStitchr CLI and native helper behavior |
| `features/clipr/` | Clipr generation |
| `features/courses/` | Email courses, workshops, access, and progress |
| `features/demo/` | Product demos and demo agents |
| `features/editor/` | Browser media inspection and non-destructive editing |
| `features/hook-lab/` | Hook Lab and Stitchr integration |
| `features/library/` | The shared media Library |
| `features/marketing/` | Public marketing surfaces and case studies |
| `features/platform/` | Shared account, onboarding, navigation, and workspace behavior |
| `features/post-bridge/` | Scheduling and post-performance workflows |
| `features/public-tools/` | Public tools organized into audits, calculators, generators, portfolio records, and resources |
| `features/settings/` | Product and automation settings |
| `features/stitchr/` | Stitchr creation, templates, scoring, and saved renders |
| `features/swapr/` | Swapr generation |
| `features/swipr/` | Swipr and Pexels workflows |

Public tool documentation uses these focused subdirectories:

| Directory | Public tool area |
| --- | --- |
| `features/public-tools/audits/` | Checkers, readiness reviews, and preflight tools |
| `features/public-tools/calculators/` | Calculators, estimators, and savings reports |
| `features/public-tools/generators/` | Builders, graders, generators, planners, and rewriters |
| `features/public-tools/portfolio/` | Portfolio design contracts, lead capture, and readiness evidence |
| `features/public-tools/resources/` | Hook libraries, templates, worksheets, trackers, and kits |

## Operational documentation

| Directory | Operational area |
| --- | --- |
| `operations/automation/` | Provider and background automation |
| `operations/content/` | Publishing webhooks and content operations |
| `operations/data/` | Storage migrations, counts, reads, and data efficiency |
| `operations/deployment/` | Production deployment procedures |
| `operations/email/` | Loops integration, campaigns, consent, and rollout runbooks |
| `operations/evaluations/` | Technology evaluations and adoption decisions |
| `operations/media/` | Server-side media processing |
| `operations/reliability/` | Durable workflows and recovery procedures |
| `operations/security/` | Abuse protection and rate limits |

## Filing rules

1. Put each document in the narrowest directory that matches its purpose.
2. Keep one document focused on one capability, decision, or runbook.
3. Add a new subdirectory when several documents share a clear product or
   operational domain.
4. Do not place loose documentation files at the repository root.
5. Update links and this index whenever the taxonomy changes.
6. Keep mirrored vendor documentation under `references/`, separate from
   ClipStitchr-authored guidance.

## Primary entry points

- [`README.md`](../README.md): repository setup and product overview
- [`AGENTS.md`](../AGENTS.md): repository working rules
- [`coding-guidelines.md`](../coding-guidelines.md): atomic code organization
- [`project-scope.md`](../project-scope.md): product and architecture scope
- [`operations/email/campaigns.md`](operations/email/campaigns.md): creating and sharing Loops campaigns
- [`operations/security/rate-limits.md`](operations/security/rate-limits.md): backend abuse protection
- [`references/media-bunny/guides.md`](references/media-bunny/guides.md): Media Bunny implementation guidance
- [`references/media-bunny/api.md`](references/media-bunny/api.md): exact Media Bunny API declarations
