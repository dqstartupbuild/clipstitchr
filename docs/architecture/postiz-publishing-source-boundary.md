# Postiz Publishing Source Boundary

## Purpose

This document defines how ClipStitchr may import, modify, ship, and update the
small Postiz source subset used for Instagram and TikTok publishing. It is the
maintenance contract for provenance and GNU AGPL version 3 compliance.

This is an engineering policy, not legal advice. Counsel should review the
combined-work analysis, contributor rights, trademark use, and production
source-offer implementation before a public launch.

## Source Baseline

| Field | Value |
| --- | --- |
| Upstream project | [gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app) |
| Audited commit | `cf4c432c00c9db775ea1b1f12480a8e2b89aec32` |
| Audit date | 2026-08-02 |
| Upstream declaration | GNU Affero General Public License version 3 (`AGPL-3.0`) |
| Local import boundary | `web/vendor/postiz/` |
| Supported providers | Instagram, Instagram Standalone where required, and TikTok |

The upstream root `package.json` and README declare AGPL-3.0 and the upstream
root `LICENSE` contains the full GNU AGPL version 3 text. Some nested package
manifests at the audited commit say ISC. That conflict is not treated as
permission to use the imported source under ISC. All selected Postiz-derived
source is handled as AGPL-3.0-covered source unless a file carries a clear,
compatible, file-specific license from its copyright holder.

## Repository License Decision

The repository uses the GNU Affero General Public License version 3 only for
the combined ClipStitchr source distribution. The exact license text is in the
root `LICENSE` file. Third-party components keep their own compatible notices
and licenses.

This is a conservative decision. The planned integration combines modified
Postiz frontend and backend behavior with ClipStitchr routes, identity, media,
and deployment code. The project does not currently rely on the narrower legal
argument that the Postiz service and the rest of ClipStitchr are separate and
independent works in a mere aggregate. A different license split must not be
claimed without a documented architecture review and legal approval.

The earlier MIT statement in `web/README.md` predates this integration and is
not an adequate license grant for the combined distribution. Package metadata
and subsidiary READMEs must be aligned with the root posture before release.

## Boundary Rules

Only imported or traceably modified Postiz files may live under
`web/vendor/postiz/`. That directory must contain:

- a copy of the full upstream GNU AGPL version 3 license;
- a boundary README with the source revision and update procedure;
- `provenance.json`, the machine-readable file map;
- `MODIFICATIONS.md`, the human-readable change log; and
- only the source files required by the approved Instagram and TikTok runtime.

The directory must not contain:

- `.env` files or credentials;
- Postiz Git metadata;
- `node_modules`, package-manager stores, or fetched dependencies;
- build output, caches, coverage, test reports, or generated runtime data;
- uploads, screenshots, database contents, or user data;
- unrelated social providers; or
- Postiz billing, AI, marketplace, extension, SDK, commands, public API,
  administration, or standalone authentication products.

All ClipStitchr-owned behavior stays outside this boundary. That includes Clerk
tenant resolution, service assertions, API gateways, media adapters,
encryption, rate limits, route mounting, navigation, user-facing copy, tests,
and deployment controls. Those files follow the normal one-file-one-purpose
rules.

## Required Provenance Record

`web/vendor/postiz/provenance.json` is the source of truth for the import. It
must record repository-level metadata and one entry for every imported file.
Each file entry must include:

| Field | Meaning |
| --- | --- |
| `upstreamPath` | Path at the audited Postiz commit |
| `localPath` | Path inside `web/vendor/postiz/` |
| `upstreamCommit` | Exact 40-character source commit |
| `upstreamSha256` | Hash before local modification |
| `localSha256` | Hash of the tracked local file |
| `state` | `verbatim` or `modified` |
| `purpose` | Why the runtime needs the file |
| `modificationSummary` | Material local changes, empty only for verbatim files |
| `modifiedOn` | ISO date for the current local modification set |

Repository-level metadata must include the upstream URL, audited commit,
import date, license identifier, supported provider list, import tooling
version if applicable, and the person or automation that performed the import.

Do not mark a file `verbatim` after formatting, import-path changes, generated
header changes, or any other content change. Hash equality should enforce the
distinction.

## Import and Update Procedure

Use this process for the first import and every upstream refresh.

1. Start from a clean Postiz checkout and record the full source commit.
2. Verify the upstream root license, root package license value, and README
   license declaration at that commit.
3. Review the approved import map in `postiz-source-integration.md`. Expand it
   only when the new file is necessary for the Instagram or TikTok runtime.
4. Build the import in a temporary staging directory. Never copy directly from
   a mutable branch without first resolving it to a commit.
5. Exclude secrets, local configuration, Git metadata, dependencies, build
   products, caches, reports, uploads, fixtures that contain personal data, and
   generated runtime content.
6. Copy the upstream license and preserve all file-level copyright, license,
   attribution, and warranty notices.
7. Create or update every provenance entry before editing imported files.
8. Keep local changes small. Prefer ClipStitchr adapters outside the boundary
   over invasive changes to the imported source.
9. Mark each changed file as modified, recalculate its local hash, and describe
   the material changes and date in `MODIFICATIONS.md`.
10. Review the full diff against the previous local import and the new upstream
    commit. Pay special attention to new dependencies, provider registrations,
    authentication, token handling, media ownership, background jobs, and
    network calls.
11. Run the publishing unit, integration, migration, workflow, and browser
    checks. Confirm that no provider other than Instagram, Instagram
    Standalone where required, and TikTok is registered or reachable.
12. Update `THIRD_PARTY_NOTICES.md`, `MODIFICATIONS.md`, this document, package
    metadata, deployment documentation, and the production source archive for
    the release.

Never perform an unreviewed subtree merge, blanket directory copy, or package
upgrade from the Postiz branch. An upstream update is a new auditable import,
not a routine dependency bump.

## Modification Notices

GNU AGPL version 3 requires modified source versions to carry prominent notices
that they were modified and to give a relevant date. ClipStitchr satisfies the
repository-level part of that record through `THIRD_PARTY_NOTICES.md`, the
provenance manifest, and `MODIFICATIONS.md`. Preserve any upstream file-level
notices.

When a source file already has a header, add a concise modification line without
removing the upstream notice. When adding a header would disrupt generated or
machine-checked content, the provenance entry and `MODIFICATIONS.md` must name
the file precisely. Do not imply that upstream Postiz authors wrote, endorsed,
or support ClipStitchr modifications.

## Network Source Offer

GNU AGPL version 3 section 13 applies when users interact remotely with a
modified covered program over a computer network. Every production deployment
of the modified publishing application must prominently offer those users a
standard way to copy the exact Corresponding Source for the running version.

The production release process must:

1. build from an immutable ClipStitchr commit;
2. produce a source archive or public repository tag for that exact commit;
3. include all covered source and the scripts needed to generate, install, and
   run the deployed object code, subject to the license's System Library
   exclusions;
4. include schema migrations, build configuration, workflow definitions,
   package manifests and lockfiles, the bounded Postiz import, the provenance
   manifest, `THIRD_PARTY_NOTICES.md`, `MODIFICATIONS.md`, `TRADEMARKS.md`, and
   `LICENSE`;
5. omit secrets, private keys, production credentials, access tokens, user
   data, uploaded media, database contents, and internal incident material;
6. publish the source at the same time as the network deployment;
7. expose a clearly named `Source` or `Legal and source` link in an interface
   that remote publishing users can reach; and
8. verify that the link works without an extra fee and resolves to source that
   matches the deployed revision.

If object code is distributed for download, the release must also provide the
Corresponding Source in a way permitted by GNU AGPL version 3 section 6. A link
to a moving default branch is not enough because it may not match the deployed
or distributed build.

## Release Gate

A publishing deployment is not ready until all of these checks pass:

- the provenance manifest covers every file under `web/vendor/postiz/`;
- hashes and modification states validate;
- upstream and local license notices remain present;
- root and package license metadata do not advertise MIT or ISC for the
  combined application;
- the exact release source is available from a stable URL;
- the running UI exposes the source offer to remote users;
- the source URL and archive are tested from a logged-out browser where the
  chosen source-delivery design permits it;
- the archive contains required build and installation material but no secret
  or user data; and
- the release record stores the deployed commit, image digest, source URL, and
  archive checksum.

## Legal Questions That Remain

The root AGPL-3.0-only posture is deliberately conservative, but it does not
answer every ownership question. Before public deployment or distribution,
counsel should confirm:

- that the ClipStitchr copyright holders have authority to license all
  ClipStitchr-owned contributions under GNU AGPL version 3;
- whether any contributor agreement, employer claim, asset license, or
  third-party dependency creates an incompatibility;
- whether the final process boundary changes the combined-work analysis;
- whether the exact upstream Postiz revision contains any enforceable
  additional terms not found during the source audit;
- the required form and placement of Appropriate Legal Notices in the final
  interactive interfaces; and
- the source-retention period for every distribution and deployment channel.

Until those questions are resolved, do not describe the combined application
as proprietary, MIT-licensed, ISC-licensed, or exempt from GNU AGPL version 3
network-source duties.
