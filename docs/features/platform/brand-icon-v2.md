# Brand icon v2

## What changed

ClipStitchr now uses the copper layered mark supplied in `clip.png` across the marketing site, authentication screens, dashboard, browser metadata, install surfaces, structured data, and default social preview.

The supplied artwork is stored unchanged at `web/public/brand/v2/source.png`. The production transparent master is created from that exact source by removing only the connected white background, so the original geometry, color, spacing, and highlights stay intact.

## Version history

- `web/public/brand/v1/` preserves the previous icon, logo lockups, wordmarks, application icons, and default social preview.
- `web/public/brand/v2/` contains the active icon family and lockups.
- `web/public/og/v1/default.png` preserves the previous default social preview.
- `web/public/og/v2/default.png` is the active default social preview.

The original unversioned brand files remain in place for old bookmarks and external references. Application code does not use them.

## Asset family

The v2 directory contains:

- The original source and transparent production master.
- Transparent PNG icons at 16, 32, 48, 64, 128, 180, 192, 256, 512, and 1024 pixels.
- A multi-resolution `favicon.ico` containing 16, 32, and 48 pixel layers.
- The 16, 32, and 48 pixel browser-tab icons use a warm graphite outer keyline around the mark. This keeps the pale leading panel readable on light browser chrome without placing the logo inside a tile or changing larger application icons.
- Opaque 192 and 512 pixel maskable icons with the mark inside the platform-safe area.
- A BIMI-compatible `bimi-logo.svg`, traced from the 512 pixel maskable icon so authenticated email uses the same graphite field, safe-area spacing, and copper mark as installed app icons. It is deliberately an SVG Tiny Portable/Secure file rather than a raster embed.
- A 180 pixel Apple touch icon.
- Light-surface and dark-surface horizontal logo lockups.

## Runtime wiring

`web/lib/brandAssets.ts` is the single source of truth for active brand URLs. The browser and app assets use both the `/v2/` path namespace and a revision query so browsers, image optimizers, CDNs, installed shortcuts, and social consumers do not reuse an earlier render of the mark. The BIMI logo intentionally uses its stable, query-free public URL because that exact address is published in DNS. The finalized favicon contrast update uses `?v=2.2`.

`web/next.config.ts` permits version query strings for local files under `/brand/`, allowing Next.js image optimization to retain the cache key.

The active assets are used by:

- `BrandMark` in public headers, auth screens, dashboard navigation, and the not-found page.
- `SiteFooter` on public landing pages.
- Root Next.js icon, shortcut icon, Apple icon, and manifest metadata.
- The web app manifest's regular and maskable install icons.
- Organization, article, video, and public-tool structured data.
- The default Open Graph resolver and social preview.
- The public BIMI logo URL at `/brand/v2/bimi-logo.svg`. Files in `web/public/` are deployed as public static assets by Next.js and Vercel; `brandAssets.bimiLogo` is the canonical in-repository reference to that path.

Next.js special files in `web/app/` and direct public favicon paths are also generated for crawlers and clients that do not honor the full metadata graph.

The footer lockup is responsively bounded between 12 and 21 rem so it remains a supporting signature instead of overpowering the footer navigation.

## Rebuilding the assets

Run this from `web/` after replacing `public/brand/v2/source.png`:

```bash
./scripts/build-brand-assets.sh
```

The script requires ImageMagick. It removes the connected white background, sizes each purpose-specific variant, assembles both logo lockups, creates the social preview, and refreshes the Next.js special icon files.

For a future replacement, preserve the current directory as the next historical version, generate a new versioned directory, and increment `cacheVersion` in `web/lib/brandAssets.ts`. Do not overwrite a historical version.

## Verification

After rebuilding:

1. Confirm alpha at the edge of the transparent source and all regular PNG icons.
2. Confirm the Apple and maskable icons are opaque and keep the full mark inside their safe area.
3. Check the public header, footer, sign-in screen, and dashboard sidebar at desktop and mobile widths.
4. Inspect the rendered icon, Apple icon, manifest, and structured-data URLs for the active cache version.
5. Run the brand, manifest, site metadata, lint, typecheck, test, and production build checks.

## Source reference

The v2 artwork was supplied by the project owner as `/Users/starship/Downloads/clip.png` and copied into the repository before processing.
