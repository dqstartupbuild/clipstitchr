# App Ad Teardown Library

## What It Does

`/tools/app-ad-teardown-library` launches with twelve original educational app-ad
pattern teardowns. Visitors can search and filter them by category, hook style,
funnel role, proof approach, and creative pattern. Every record includes hook,
opening visual, demo handoff, proof, pacing, CTA, reusable principle,
limitation, and source context.

## Source and Copyright Approach

The launch records are synthetic ClipStitchr teaching examples, not copied ads.
They contain no advertiser footage, frames, complete copy, brand assets, or
performance claims. This gives visitors substantial analysis without implying
an example “won” or creating a copyrighted ad mirror.

## Implementation

`adTeardownItems.ts` owns the twelve records. The shared collection browser owns
search, category filtering, card copy, full-library copy, and local Markdown
download. No outside source, provider, account, or media request runs on the
page.

## Boundary

The library teaches abstract creative structure. It does not download ads,
attribute performance, recommend copying another brand, produce media, or
replace ClipStitchr's paid asset and production workspace.

## File Tree

```text
web/app/(content)/tools/app-ad-teardown-library/page.tsx
web/lib/clipstitchr/tools/adTeardownLibrary/adTeardownItems.ts
web/lib/clipstitchr/tools/adTeardownLibrary/adTeardownLibraryDefinition.ts
web/app/_components/tools/resources/CollectionResourceBrowser.tsx
```

See `docs/features/public-tool-quality-register.md` for candid release status.
