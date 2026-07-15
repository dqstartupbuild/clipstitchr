# Public Marketing Pages

## What Changed

The public content pages retain the shared dark marketing shell. The homepage
uses its own campaign-editing direction: warm production surfaces, tightly set
display type, real exported videos, a populated product workspace, and one
continuous story instead of a stack of generic feature cards.

The homepage promise is:

> Your clips. Your campaign.

The supporting copy focuses on one concrete job: pair up to 20 Hook/UGC clips
with one product demo, review the separate outputs, and keep building.

## How It Works

Public pages use the scoped `marketing-shell` class so the darker marketing
theme does not automatically take over dashboard surfaces. The shell defines the
Figma-inspired color tokens, DM Sans body type, Barlow Condensed display type,
dark cards, grid backgrounds, and compact pill labels.

The shared public layout applies the shell to `/pricing`, `/examples`, `/docs`,
`/blog`, `/case-studies`, `/privacy`, and `/terms`. The homepage applies
`landing-shell` inside the shared shell so its warm palette and authored
composition do not reskin the other public routes.

The homepage has five product chapters: the real-output hero, the output reel,
the batch workflow and populated workspace, three consolidated campaign jobs,
and campaign proof followed by one direct close. CLI, Hook Lab, Clipr, Swapr,
Swipr, scoring, and automation remain represented, but no longer repeat the
same standalone heading-and-card section.

The July 12, 2026 Privacy Policy and Terms also cover Hook Lab social sources.
They explain temporary Apify/AI video processing, the source link/attribution,
text, private thumbnail, and Idea data that may be retained, the user's lawful-
use responsibility, and the prohibition on identity or shot-for-shot cloning.
Keep both pages aligned whenever Hook Lab providers, retention, or source
handling changes.

## Relevant Code

- `web/app/globals.css` defines the shared marketing utilities plus the
  landing-only composition, palette, reel, product artifact, proof, and
  responsive styles.
- `web/app/layout.tsx` loads Barlow Condensed and DM Sans for the marketing
  shell.
- `web/app/site-header.tsx` provides shared public navigation. The homepage uses
  `LandingFooter`; other public routes use `web/app/site-footer.tsx`.
- `web/app/_components/landing/*` contains the homepage sections.
- `web/app/_components/pricing/*` contains the pricing page sections.
- `web/app/(content)/*` contains the public content routes.
- `web/app/_components/content/ArticleHeader.tsx` renders blog article heroes.
- `docs/product/guidance/copywriting.md` and `docs/product/strategy/positioning.md` define
  the updated public voice.

## File Tree

```text
web/app/globals.css
web/app/layout.tsx
web/app/site-header.tsx
web/app/site-footer.tsx
web/app/_components/landing/
web/app/_components/landing/LandingFooter.tsx
web/app/_components/pricing/
web/app/_components/examples/
web/app/_components/case-studies/
web/app/_components/content/ArticleHeader.tsx
web/app/(content)/
docs/product/guidance/copywriting.md
docs/product/strategy/positioning.md
```

## Copy Rules

- Lead with the job: raw footage becomes finished ads.
- Keep the founder frustration, but do not make every section about hating
  content.
- Prefer short lines that sound spoken, but keep the homepage specific to the
  footage-to-campaign workflow.
- Use real outputs and verified campaign evidence. Do not invent customer
  marks, testimonials, metrics, or product UI.
- ClipStitchr has paid plans only. Never imply there is a free plan or trial.
- Use "See pricing" in shared navigation, "Get ClipStitchr" for direct account
  CTAs, and plan-specific labels such as "Choose Pro" on the pricing page.
- Keep AI secondary. It fills a thin library; it is not the main promise.

## Verification

Route and copy coverage lives in:

- `web/app/_components/landing/LandingPage.test.tsx`
- `web/app/(content)/contentPages.test.tsx`

Run from `web/`:

```bash
npm run lint
npm run typecheck
npm test
```
