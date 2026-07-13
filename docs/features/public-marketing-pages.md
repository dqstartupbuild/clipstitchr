# Public Marketing Pages

## What Changed

The public pages now follow the Figma direction from
`/Users/starship/Downloads/clipstitchr-figma-main`: dark marketing shell,
condensed uppercase headings, compact purple CTAs, phone-style vertical output
previews, and short human copy.

The homepage promise is:

> Turn raw footage into finished ads. Fast.

The supporting copy focuses on practical relief: upload clips once, build a
library, make finished ads, review them, and get back to building.

## How It Works

Public pages use the scoped `marketing-shell` class so the darker marketing
theme does not automatically take over dashboard surfaces. The shell defines the
Figma-inspired color tokens, DM Sans body type, Barlow Condensed display type,
dark cards, grid backgrounds, and compact pill labels.

The shared public layout applies the shell to `/pricing`, `/examples`, `/docs`,
`/blog`, `/case-studies`, `/privacy`, and `/terms`. The homepage applies the
same shell directly through `LandingPage`.

The July 12, 2026 Privacy Policy and Terms also cover Hook Lab social sources.
They explain temporary Apify/AI video processing, the source link/attribution,
text, private thumbnail, and Idea data that may be retained, the user's lawful-
use responsibility, and the prohibition on identity or shot-for-shot cloning.
Keep both pages aligned whenever Hook Lab providers, retention, or source
handling changes.

## Relevant Code

- `web/app/globals.css` defines `marketing-shell`, `marketing-heading`,
  `marketing-subheading`, `marketing-eyebrow`, `marketing-card`, and
  `marketing-grid-bg`.
- `web/app/layout.tsx` loads Barlow Condensed and DM Sans for the marketing
  shell.
- `web/app/site-header.tsx` and `web/app/site-footer.tsx` provide the shared
  public navigation and footer.
- `web/app/_components/landing/*` contains the homepage sections.
- `web/app/_components/pricing/*` contains the pricing page sections.
- `web/app/(content)/*` contains the public content routes.
- `web/app/_components/content/ArticleHeader.tsx` renders blog article heroes.
- `docs/product/copywriting-guide.md` and `docs/product/positioning.md` define
  the updated public voice.

## File Tree

```text
web/app/globals.css
web/app/layout.tsx
web/app/site-header.tsx
web/app/site-footer.tsx
web/app/_components/landing/
web/app/_components/pricing/
web/app/_components/examples/
web/app/_components/case-studies/
web/app/_components/content/ArticleHeader.tsx
web/app/(content)/
docs/product/copywriting-guide.md
docs/product/positioning.md
```

## Copy Rules

- Lead with the job: raw footage becomes finished ads.
- Keep the founder frustration, but do not make every section about hating
  content.
- Prefer short lines that sound spoken: "Every tool feeds one library" and
  "Three steps. Zero timelines."
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
