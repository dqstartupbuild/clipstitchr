# Studio Beta Access Foundation

## What this capability does

Studio Beta is a private, opt-in workspace inside the existing ClipStitchr
dashboard. It does not replace the current Library, Stitchr, Clipr, Swipr,
Swapr, Hook Lab, scheduling, analytics, or publishing workflows.

Access requires all three conditions at the moment an operation starts:

1. `STUDIO_BETA_ENABLED` is exactly `true` in that server or worker runtime.
2. The signed-in Clerk user ID has an active allowlist grant.
3. The account has enabled Studio Beta in Settings.

Missing configuration, a revoked grant, an opted-out preference, an unavailable
Convex access check, or any value other than lowercase `true` fails closed.
Development authentication bypass never grants Studio access.

## User experience

An account without an active allowlist grant sees no Studio setting or
navigation. An allowlisted account sees one Settings checkbox named **Show
Studio Beta**. Enabling it reveals **Studio Beta** in dashboard navigation.
Disabling it hides navigation without deleting Studio records or objects.

The initial `/dashboard/studio` workspace is a real cutting-room view of the
active Product's recent source clips and finished Stitches. It uses existing
poster objects when available and links back to the real Library. It does not
show placeholder controls for later research, editor, clip, stitch, or
publishing phases.

Direct page guesses return a non-disclosing not-found response. Authenticated
but ineligible `/api/studio/*` calls return `403`; unauthenticated calls return
`401`.

## Access data

Convex owns three focused records:

- `studioBetaAccessGrants`: one active or revoked grant per immutable Clerk
  owner ID, with grant and revocation metadata.
- `studioBetaPreferences`: the owner's opt-in value. Opting out or revocation
  does not delete the row.
- `studioBetaAuditEvents`: grant, revoke, opt-in, and opt-out events without
  secrets.

`convex/studioBetaAccess/assertStudioBetaAccess.ts` is the authoritative Convex
guard. `getStudioBetaServerAccessState.ts` applies the independent Next.js
guard. Provider and media workers have separate assertion adapters and must run
them immediately before claiming or starting future Studio jobs.

## Management commands

Run from `web/` with a configured development or reviewed target environment:

```bash
npm run studio-beta:grant -- user_123
npm run studio-beta:list
npm run studio-beta:revoke -- user_123
```

The argument must be an immutable Clerk user ID beginning with `user_`, never
an email address. Each command requires the server-only
`STUDIO_BETA_OPERATOR_SECRET`. Convex compares it in constant time, applies
per-target and global administrative limits, and writes an audit event only
when state changes. Command output never prints the secret.

The same operator secret must be configured in the invoking environment and
the target Convex deployment. It must not be prefixed with `NEXT_PUBLIC_` or
sent to a browser.

## Storage boundary

Studio-owned R2 objects use this versioned owner prefix:

```text
users/{clerkOwnerId}/studio/v1/{kind}/{productId}/{recordId}/{randomFileName}
```

`POST /api/studio/r2/upload-url` and
`POST /api/studio/r2/download-url` independently require Studio access before
issuing a signed URL. Their Convex reservation also reloads the active Product
owned by the signed-in subject. Request JSON is stream-capped at 16 KiB before
parsing. Uploads have strict kind, MIME, record-ID, and byte caps, and each
grant signs the exact declared content length. Downloads accept only the
signed-in owner's `studio/v1` prefix and reject traversal, query fragments,
backslashes, control characters, and oversized keys. Existing
Library posters shown on the workspace remain classic Library objects and use
the existing owner-scoped poster download flow.

## Revocation and global shutdown

Revocation and the global switch stop new page, API, Convex, signed-R2, and
worker actions. They preserve metadata and stored media. A worker must recheck
access before a Studio job claim and again before each future paid or expensive
stage. Once later phases add jobs, a revoked or globally disabled job is held
without new provider spend; already durable outputs remain attached to the
owner. Cancellation and cleanup policies for each job type must be documented
with that phase.

## Source tree

```text
web/app/dashboard/studio/
web/app/api/studio/
web/app/_components/studio/
web/convex/studioBetaAccess/
web/convex/studioBetaRateLimits/
web/convex/studioBetaWorkspace/
web/lib/clipstitchr/server/studio/
web/scripts/studio-beta/
```

The implementation follows one file, one purpose. UI components, guards,
validators, data helpers, R2 helpers, worker adapters, and scripts are separate
files.

## Verification

Automated coverage includes exact-true switch parsing, unlisted, opted-out,
active, revoked, and globally disabled states; constant-time operator-secret
failure; immutable Clerk ID validation; grant/revoke audit behavior; preference
persistence; page not-found semantics; API `401`/`403`; R2 prefix and upload
validation; worker fail-closed behavior; hidden Settings/navigation; and the
development-bypass denial.

Before enabling a non-development environment:

1. Configure both server-only values in Next.js and Convex; configure the exact
   switch in each worker that may process Studio work.
2. Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` from
   `web/`.
3. Verify one unlisted account, one allowlisted opted-out account, one opted-in
   account, a revoked account, and the global-off state.
4. Use pointer and keyboard at desktop and mobile widths. Confirm the checkbox,
   mobile navigation, Studio page, Library link, focus rings, horizontal contact
   sheet, empty state, and reduced-motion behavior.
5. Do not enable the production switch until an explicit production rollout is
   approved.
