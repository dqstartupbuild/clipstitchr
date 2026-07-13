# Clip Naming System Generator

## Purpose

This browser-local generator turns app, campaign, role, creator, concept,
market, date, and version details into a repeatable filename convention. The
visitor chooses a separator and reorders every token.

## Sanitization and result

Each token is normalized to lowercase, invalid filename characters and control
characters are removed, spaces become the selected separator, repeated
separators collapse, and empty results become `untitled`. The result contains a
copyable filename, convention, token legend, and three examples.

## Files

- Types, token definitions, sanitizer, generator, FAQs, and tests:
  `web/lib/clipstitchr/tools/clipNamingSystem/`.
- Atomic UI and page tests:
  `web/app/_components/tools/clip-naming-system-generator/`.
- Route: `web/app/(content)/tools/clip-naming-system-generator/page.tsx`.

## Privacy and boundary

The tool handles text only. It does not read or rename files, persist metadata,
search assets, or provide an asset library.

## Sources

- `docs/content/lead-magnet-portfolio.md`, portfolio item 28.
- `docs/features/public-tool-batch-16-50-design.md`.
- `docs/features/public-tool-quality-register.md`.
