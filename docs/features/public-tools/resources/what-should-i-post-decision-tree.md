# What Should I Post? Decision Tree

## What it does

The public `/tools/what-should-i-post-decision-tree` route asks about the post
goal, viewer awareness, available assets, camera preference, and production
capacity. It immediately returns one recommended format, three starting
prompts, the captures required, and one relevant next ClipStitchr resource.

## How it works

`recommendWhatShouldIPost` uses transparent deterministic branches. Existing
customers receive a useful walkthrough direction, on-camera UGC receives a
creator story, available demo footage receives a demo format, and missing
product footage receives an honest problem-and-payoff fallback plus a capture
list. No outside data or AI call is involved.

## Use cases and boundary

- Pick a realistic next post without browsing a generic idea list.
- Avoid recommendations that depend on footage the visitor does not have.
- Move directly into a recording checklist, shot list, or creator brief.
- Does not create a finished script, calendar, scheduled post, or media.

## Relevant files

- `web/lib/clipstitchr/tools/whatShouldIPost/`
- `web/app/_components/tools/what-should-i-post/`
- `web/app/(content)/tools/what-should-i-post-decision-tree/page.tsx`

## Source references

- Capability contract: `docs/features/public-tools/portfolio/public-tool-batch-16-50-design.md`
- Catalog identity: `web/lib/clipstitchr/tools/catalog/publicToolCatalog.ts`
- Ongoing evidence: `docs/features/public-tools/portfolio/public-tool-quality-register.md`

## Verification

Pure tests cover a demo recommendation and a no-demo fallback. The page test
proves the prompts, capture list, mailing-list source, paid CTA, and canonical
metadata render.
