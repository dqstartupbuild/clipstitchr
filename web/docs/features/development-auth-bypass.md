# Development authentication bypass

## Purpose

The development authentication bypass lets coding agents and local developers open every ClipStitchr dashboard page without a Clerk key or sign-in. It is a UI preview, not a test account and not backend authentication.

The preview uses the deterministic display identity `dev_user` and local fixture data. It never sends that identity or fixture content to Clerk, Convex, Cloudflare R2, Stripe, Zernio, Replicate, Apify, publishing services, or Cloud Run workers.

## Local setup

Create `web/.env.local` and add:

```dotenv
DEV_AUTH_BYPASS_ENABLED=true
```

Do not commit `.env.local`. The committed `.env.example` keeps this switch disabled by default.

Start the app from `web/`:

```bash
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard). The amber `Development preview` notice confirms that the local-only surface is active.

## Fail-closed safety boundaries

The bypass activates only when every condition is true:

1. `DEV_AUTH_BYPASS_ENABLED` is exactly `true`.
2. `NODE_ENV` is exactly `development`.
3. The request hostname is `localhost`, IPv4 loopback (`127.0.0.0/8`), or IPv6 loopback (`::1`).
4. The request is a `GET` or `HEAD` navigation under `/dashboard`.

Production and preview builds remain protected even if the switch is set accidentally because Next.js builds them with `NODE_ENV=production`. Remote hosts, LAN addresses, dashboard POSTs, API routes, and client-injected bypass headers fail closed.

While the safe local bypass is active, `/api/*` and dashboard POST requests return `401`. They are never treated as `dev_user`. This deliberate denial keeps Convex authorization, signed R2 URLs, billing, publishing, uploads, generation, worker dispatch, and every paid or destructive backend operation behind real authentication. When the bypass is disabled, the normal Clerk middleware and Clerk-backed Convex provider are unchanged.

## Preview states

Dashboard, Library, Hook Lab, Schedule, Analytics, Settings, and the creation workspaces support four deterministic fixture states:

- `Sample data`: populated representative content.
- `Loading`: stable loading placeholders for visual checks.
- `Empty`: first-use guidance with no saved records.
- `Error`: a simulated local error with no network request.

Use the `Preview state` controls on each page or set the query directly, for example:

```text
http://localhost:3000/dashboard/hooks?fixture=error
```

All upload, generation, analysis, publishing, billing, deletion, and save controls on the preview surface are intercepted. Selecting one shows a local explanation and does not call a production service.

## Disable the bypass

Set the value to `false`, remove it from `.env.local`, or delete `.env.local`, then restart the development server:

```dotenv
DEV_AUTH_BYPASS_ENABLED=false
```

Dashboard navigation immediately returns to normal Clerk protection.

## Implementation map

```text
web/
├── proxy.ts
├── app/
│   ├── RootProviders.tsx
│   ├── AuthenticatedRootProviders.tsx
│   └── dashboard/
│       ├── layout.tsx
│       └── development/
│           ├── DevelopmentDashboardRoute.tsx
│           ├── DevelopmentDashboardShell.tsx
│           ├── DevelopmentDashboardSidebar.tsx
│           ├── DevelopmentPreviewIndicator.tsx
│           ├── DevelopmentAccountSummary.tsx
│           ├── DevelopmentFixtureStateSelector.tsx
│           ├── DevelopmentFixtureContent.tsx
│           ├── DevelopmentBlockedActionButton.tsx
│           └── feature-specific preview pages
└── lib/clipstitchr/development/
    ├── auth/
    │   ├── isDevelopmentAuthBypassEnabled.ts
    │   ├── getDevelopmentAuthBypassRequestStatus.ts
    │   ├── developmentAuthBypassHeaderName.ts
    │   ├── developmentIdentity.ts
    │   └── runClerkProtectedProxy.ts
    ├── fixtures/
    │   └── one fixture file per dashboard feature
    ├── hooks/
    │   └── useDevelopmentFixtureState.ts
    └── types/
        └── DevelopmentFixtureState.ts
```

The proxy is the only place that marks an eligible navigation. Root providers omit Clerk, analytics identity reporters, and Convex only after the server re-checks the environment, loopback host, and proxy-only request header. Client instrumentation uses the same fail-closed helper and the loopback hostname to suppress PostHog in the preview. The development dashboard layout then renders isolated local pages instead of authenticated clients.

## Testing

Run the full verification suite from `web/`:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The focused tests cover development activation, production fail-closed behavior, loopback restrictions, dashboard proxy navigation, API and POST denial, rendering without authenticated providers, the deterministic account display, blocked actions, and the unchanged normal provider path.

For browser QA, start the bypass-enabled development server and visit every dashboard route. Check Hook Lab, Schedule, and Analytics at desktop and mobile widths, exercise all four fixture states, tab through controls to verify focus visibility, and confirm a protected API returns `401`. Stop the development server when verification is complete.
