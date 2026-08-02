# Focused Postiz publishing source boundary

This directory contains a deliberately limited, auditable source import from
[Postiz](https://github.com/gitroomhq/postiz-app). It is retained as reference
and migration source for ClipStitchr publishing. It is not a second application,
is not mounted as a standalone service, and is not included in the normal
ClipStitchr build until adapters outside this boundary wire a specific slice.

## Source and license

- Upstream repository: `https://github.com/gitroomhq/postiz-app`
- Audited source commit: `cf4c432c00c9db775ea1b1f12480a8e2b89aec32`
- Imported on: `2026-08-02`
- Upstream license: GNU Affero General Public License v3.0
- Allowed providers: `instagram`, `instagram-standalone`, and `tiktok`

The complete upstream license is preserved in `LICENSE`. `provenance.json`
records the upstream path, pinned commit, upstream and local SHA-256 hashes,
modification state, purpose, and modification summary for every imported or
derived file. `MODIFICATIONS.md` explains the local pruning and adaptation.
`scripts/validate-import.mjs` verifies the complete boundary against a pinned
Postiz checkout.

## What is retained

- Instagram Business, Instagram Standalone, and TikTok provider logic.
- Provider settings DTOs, media validation helpers, refresh behavior, and the
  relevant integration registry.
- Focused integration, post, analytics, PostgreSQL/Prisma, Redis, upload, and
  Temporal reference slices needed to understand connection, scheduling,
  publishing, retries, and analytics.
- Calendar, composer, provider settings, connection, media selection, and
  analytics UI source, plus the small reusable form/helper closure it imports.
- A focused navigation shell with Calendar, Posts, Analytics, and Integrations.
- The provider icons used by the retained UI.
- Upstream `colors.scss` and `tailwind.config.cjs` as style provenance only.
- `schema.publishing.prisma`, a clearly marked derived schema fragment for the
  retained publishing entities. It is not ClipStitchr's production schema.

Instagram Business legitimately calls Meta's Facebook Login and Graph APIs.
Those references are part of Instagram's supported connection path; no Facebook
publishing provider is registered or retained.

## What is excluded

The import omits Postiz authentication, JWT cookies, impersonation,
organization selection, billing and subscriptions, AI and Copilot features,
agent/generator routes and metadata, marketplace and product branding, browser
extension behavior, public connection invites, short-linking, plug automation,
public/API code-output mode and creation-method badges, Web3 behavior,
administration, unrelated provider implementations, and every provider other
than the three identifiers above.

It also contains no `.env` files, Git metadata, dependencies, build output,
uploads, screenshots, reports, caches, generated runtime data, or credentials.

## ClipStitchr mounting contract

ClipStitchr owns routing, authentication, tenant resolution, authorization,
storage, configuration, rate limits, and design. Adapted routes should use:

| Imported source concept | ClipStitchr route |
| --- | --- |
| Launches calendar | `/dashboard/publishing/calendar` |
| Post list and composer entry | `/dashboard/publishing/posts` |
| Provider analytics | `/dashboard/publishing/analytics` |
| Connections and account status | `/dashboard/publishing/integrations` |
| OAuth callback | a Clerk-protected publishing callback route outside this directory |

`TopMenu` and `ContinueIntegration` accept or default to the
`/dashboard/publishing` route family. The retained Next.js callback page no
longer reads Postiz's `auth` cookie; it assumes its eventual ClipStitchr wrapper
has already enforced Clerk authentication. Do not expose that source page
without the wrapper.

The focused shell closure (`layout.component.tsx`, `top.menu.tsx`, and
`menu-item.tsx`) imports only React and Next.js at runtime. `menu-item.tsx` uses
an array join rather than upstream `clsx`, so the shell does not require a new
package merely to render navigation. Its internal imports are relative and its
classes use ClipStitchr's existing CSS variables. No `@gitroom/*` TypeScript
alias is required for this three-file closure; import `LayoutComponent` through
ClipStitchr's existing `@/*` alias (for example,
`@/vendor/postiz/apps/frontend/src/components/new-layout/layout.component`).
The full calendar/composer source still
preserves many upstream third-party imports. No packages were installed for
this source archive; the exact package inventory and which packages are not
declared by ClipStitchr are recorded in `provenance.json`.

## Intentional adapter seams

The following four upstream aliases are intentionally unresolved. Importing
Postiz implementations would violate the Clerk and tenant boundary:

- `@gitroom/nestjs-libraries/user/org.from.request`
- `@gitroom/nestjs-libraries/user/user.from.request`
- `@gitroom/backend/services/auth/permissions/permissions.ability`
- `@gitroom/backend/services/auth/permissions/permission.exception.class`

ClipStitchr adapters outside `web/vendor/postiz/` must replace these with
server-verified Clerk identity, tenant lookup, ownership checks, and explicit
publishing permissions. Rate limits remain separate from authorization.

## Style provenance and unresolved style adapters

`apps/frontend/src/app/colors.scss` and
`apps/frontend/tailwind.config.cjs` are preserved verbatim so upstream utility
names can be traced. They are not approved ClipStitchr theme files and must not
be imported globally. They include unused upstream provider and AI tokens by
design because they are provenance artifacts, not active provider code.

Upstream `global.scss` is intentionally not copied because it changes `body`,
imports unrelated Polonto and Copilot styles, and applies broad product-level
overrides. If the retained UI is adapted, implement only the selectors actually
needed by that mounted slice outside this directory. The unresolved selector
families are:

- `.box`, `.showbox`, `.table1`, and the SweetAlert modal classes;
- `.react-tags*` and `.tags-top` for tag editing;
- `.uppy-*` and `.bigWrap` plus the upstream Uppy core/dashboard CSS imports;
- `.ProseMirror`, `.preview`, and `.fill-text-textColor` for the composer;
- `.col-calendar`, `.repeated-strip`, `.loading-shimmer`, and `.trz`;
- Mantine paper/modal/overlay classes and `.dropdown-menu`.

The retained JSX also uses upstream Tailwind color, shadow, animation, and
breakpoint names from the preserved config. The upstream config references
`tailwind-scrollbar` and `tailwindcss-rtl`, neither of which is added here.
Map only the mounted component's semantic tokens to ClipStitchr's existing
palette and interaction system. Do not mount the Postiz colors or global body
rules as a shortcut.

## Production safety gaps

This source is migration input, not production-ready infrastructure. Before any
provider call is enabled, adapters outside this boundary must provide all of the
following:

- cryptographically random, short-lived, single-use OAuth state bound to the
  Clerk actor, tenant, provider, exact return path, and PKCE verifier;
- authenticated encryption for provider access and refresh tokens, with
  versioned keys and redacted logging;
- per-user or per-tenant and global limits before signed URLs, connection
  mutations, publish calls, retries, polling, or analytics cost begins;
- tenant-scoped media lookup and just-in-time provider-readable R2 URLs with
  object, type, size, duration, `HEAD`, and range-read validation;
- durable destinations, attempts, immutable provider receipts, and an outbox so
  provider success cannot be duplicated after an internal write failure;
- versioned Temporal workflows and explicit recovery for uncertain provider
  outcomes;
- fail-closed production configuration for PostgreSQL, Redis, Temporal,
  encryption, service authentication, and provider credentials.

In particular, the retained Postiz workflow `v1.0.5` is useful reference code,
but it does not satisfy ClipStitchr's final idempotency/receipt contract. The
derived Prisma fragment also lacks ClipStitchr's final encryption, attempt,
receipt, outbox, and Clerk tenancy models.

## Updating the import

1. Check out the desired Postiz commit in a separate repository.
2. Confirm the upstream license and retained notices have not changed.
3. Compare every `upstreamSha256` in `provenance.json` with that commit.
4. Update only files required by the three-provider publishing scope.
5. Reapply the documented pruning and ClipStitchr route/shell adaptations.
6. Regenerate local and upstream hashes and update `MODIFICATIONS.md`.
7. Run the syntax, local-import, provider-registry, excluded-path, secret-name,
   and manifest-consistency checks described in the parent integration docs.
8. Review the full diff. Never bulk-copy `.env`, `.git`, dependencies, build
   output, uploads, caches, test reports, screenshots, or unrelated providers.

Run the boundary validator from `web/`:

```bash
node vendor/postiz/scripts/validate-import.mjs /absolute/path/to/postiz
```

The checkout must be at the manifest's exact source commit. The validator
checks manifest coverage and hashes, syntax, local import closure, the four
intentional adapter seams, excluded paths, obvious secret formats, the exact
provider registry, the focused shell closure, and the external package inventory.

New ClipStitchr behavior belongs outside this directory. A file inside the
boundary may change only when its provenance entry and modification note change
in the same commit.
