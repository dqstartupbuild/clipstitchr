# Dev Auth-Aware Dashboard CTA

## What changed

The local web dev launcher now always starts from the `web/` app directory and
uses the app's local Next.js binary. This keeps Turbopack module resolution
anchored to the project that actually owns `next`.

The landing page dashboard CTAs are now auth-aware. Signed-in visitors see a
Dashboard link. Signed-out visitors see the same friendly start button, but the
button sends them through Clerk instead of rendering a `/dashboard` link.

## Why it exists

The landing page should still feel ready for signed-in users, but signed-out
visitors should not warm a protected dashboard route in development. That keeps
Clerk sign-in work smoother when Turbopack is sensitive to route compilation.

## Relevant files

- `web/scripts/run-dev-server.mjs` starts content watching and Next.js from the
  stable app directory.
- `web/package.json` adds `npm run dev:webpack` as a fallback when Turbopack
  blocks local work.
- `web/app/_components/landing/LandingDashboardCta.tsx` owns the auth-aware
  landing CTA behavior.
- `web/app/_components/landing/LandingHero.tsx` uses the auth-aware CTA in the
  first viewport.
- `web/app/_components/landing/LandingBottomBand.tsx` uses the same CTA near the
  bottom of the page.

## Behavior

Signed-out visitors get a normal button labeled `Start for free`. Clicking it
tracks the CTA click and opens Clerk sign-up. The component can also be set to
open sign-in for future landing CTA variants.

Signed-in visitors get a `/dashboard` link labeled `Dashboard`. After Clerk has
loaded and confirms the visitor is signed in, the component prefetches
`/dashboard`.

## Dev commands

Run the normal Turbopack dev server from `web/`:

```bash
npm run dev
```

Use the Webpack fallback when Turbopack is blocking local auth work:

```bash
npm run dev:webpack
```
