# Public Marketing Pages

## What Changed

Every public page now belongs to the same campaign-production world as the
homepage. The shared system uses warm graphite, copper, bone, restrained grain,
tightly set display type, clipped-corner actions, and real product or campaign
evidence. Purple gradients, graph-paper backgrounds, glowing buttons, pill
labels, floating cards, and generic three-card marketing sections are not part
of the public design.

The homepage promise remains:

> Your clips. Your campaign.

The supporting copy focuses on one concrete job: pair up to 20 Hook/UGC clips
with one product demo, review the separate outputs, and keep building.

## How It Works

Public pages use the scoped `marketing-shell` and `public-site-shell` classes so
the campaign palette never changes dashboard surfaces. The public shell defines
the warm color tokens, a neutral system body face, heavy display typography,
subtle surface grain, tonal edges, deliberate focus states, and square or
custom-cut geometry. The homepage keeps its more elaborate `landing-shell`
composition while sharing the same visual language.

The shared layout covers `/pricing`, `/examples`, `/docs`, `/blog`,
`/case-studies`, all `/tools` routes, `/privacy`, and `/terms`. Sign-in and
sign-up use a related auth shell with a real ClipStitchr product capture.

The page families do not reuse one landing-page skeleton:

- Pricing is a rate ledger with aligned plan rows, an inclusion register,
  credit table, top-up inventory, and a flat-color challenge close.
- Docs is a field manual with numbered start cards, an indexed guide register,
  and a sticky article contents panel on wide screens.
- Tools is a searchable workbench with fifty numbered rows. Resource and
  calculator pages inherit the same warm surfaces and direct back-to-library
  navigation.
- Examples uses a staggered film strip built from real output videos.
- Case studies leads with a copper evidence field and image-led campaign
  records instead of testimonial cards.
- Blog is an editorial note index with one lead story and a numbered archive.
- Privacy and Terms are calm reading pages without a marketing card wrapper.

The desktop header uses a compact navigation index. On small screens,
`PublicMobileNavigation` exposes the same routes through a native,
keyboard-accessible disclosure. The footer is a numbered route index rather
than the usual multi-column SaaS footer.

The homepage has five product chapters: the real-output hero, the output reel,
the batch workflow and populated workspace, three consolidated campaign jobs,
and campaign proof followed by one direct close. CLI, Hook Lab, Clipr, Swapr,
Swipr, scoring, and automation remain represented without repeating the same
standalone heading-and-card section.

The July 12, 2026 Privacy Policy and Terms also cover Hook Lab social sources.
They explain temporary Apify and AI video processing, the source link and
attribution, text, private thumbnail, and Idea data that may be retained, the
user's lawful-use responsibility, and the prohibition on identity or
shot-for-shot cloning. Keep both pages aligned whenever Hook Lab providers,
retention, or source handling changes.

## Relevant Code

- `web/app/globals.css` defines the public palette, page-family compositions,
  component overrides, responsive behavior, and landing-only work.
- `web/app/(content)/layout.tsx` applies the public content shell.
- `web/app/site-header.tsx` and
  `web/app/_components/navigation/PublicMobileNavigation.tsx` provide shared
  public navigation. The homepage uses `LandingFooter`; other public routes use
  `web/app/site-footer.tsx`.
- `web/app/_components/landing/*` contains the homepage sections.
- `web/app/_components/pricing/*` contains the pricing page sections.
- `web/app/_components/tools/*` and its resource components contain the public
  tool discovery system.
- `web/app/(content)/*` contains the public route compositions.
- `web/app/_components/content/ArticleHeader.tsx` renders blog article heroes.
- `web/lib/content/baseContentDocumentSchema.ts` exposes an optional short
  `displayTitle` so descriptive SEO titles do not become four-line mobile
  headlines. The full `title` remains available to metadata and article copy.
- `web/lib/clipstitchr/types/PublicVideoExample.ts` keeps the same distinction
  for the public output reel.
- `docs/product/guidance/copywriting.md` and
  `docs/product/strategy/positioning.md` define the public voice.

## File Tree

```text
web/app/globals.css
web/app/(content)/layout.tsx
web/app/site-header.tsx
web/app/site-footer.tsx
web/app/_components/navigation/PublicMobileNavigation.tsx
web/app/_components/landing/
web/app/_components/landing/LandingFooter.tsx
web/app/_components/pricing/
web/app/_components/examples/
web/app/_components/case-studies/
web/app/_components/tools/
web/app/_components/content/ArticleHeader.tsx
web/app/(content)/
web/lib/content/baseContentDocumentSchema.ts
web/lib/clipstitchr/types/PublicVideoExample.ts
docs/product/guidance/copywriting.md
docs/product/strategy/positioning.md
```

## Copy and Design Rules

- Lead with the job: raw footage becomes finished ads.
- Keep the founder frustration, but do not make every section about hating
  content.
- Prefer short lines that sound spoken and remain specific to the workflow.
- Use real outputs and verified campaign evidence. Do not invent customer
  marks, testimonials, metrics, or product UI.
- Keep headings to one or two composed lines. Cut copy before shrinking it into
  a tall stack.
- Use one clear action, tonal hover changes, and visible-by-default content.
  Never gate content on an entrance animation.
- ClipStitchr has paid plans only. Never imply there is a free plan or trial.
- Use "See pricing" in shared navigation, "Get ClipStitchr" for direct account
  CTAs, and plan-specific labels such as "Choose Pro" on the pricing page.
- Keep AI secondary. It fills a thin library; it is not the main promise.

## Verification

Route and copy coverage lives in:

- `web/app/_components/landing/LandingPage.test.tsx`
- `web/app/(content)/contentPages.test.tsx`
- `web/app/_components/tools/ToolsIndexPage.test.tsx`
- `web/app/appRoutes.test.tsx`

Run from `web/`:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Browser verification covers the public page families at desktop and mobile
widths, horizontal overflow, mobile navigation, tool search and filters, live
links, clipped edges, readable contrast, and aligned pricing rows.
