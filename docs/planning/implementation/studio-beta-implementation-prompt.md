# Studio Beta Implementation Prompt

You are working in:

`/Users/starship/GitHub/clipstitchr`

I want you to build a large, opt-in Studio Beta workspace inside ClipStitchr by incorporating substantial working portions of LazyReel, SupoClip, OpenCut, ReelClaw, and Postiz.

This is a multi-phase implementation, not an architecture discussion. Create an explicit long-running goal and a detailed plan, then begin implementing it. Continue through the phases in working vertical slices. Do not stop after producing a plan or placeholder UI.

Use subagents for bounded independent audits, implementation slices, and validation where useful. Do not allow subagents to edit overlapping files concurrently. The primary agent must personally read all required repository and skill instructions.

Only ask me a question if a missing decision makes safe implementation impossible. Otherwise, make a reasonable decision, document it, and continue. Missing production credentials or unapproved social-provider applications must not block local implementation.

Do not deploy production, switch production traffic, commit, push, or remove Zernio unless I explicitly ask later.

## Read before editing

Read the complete repository instructions before doing anything:

- `/Users/starship/GitHub/clipstitchr/AGENTS.md`
- `/Users/starship/GitHub/clipstitchr/coding-guidelines.md`
- `/Users/starship/GitHub/clipstitchr/project-scope.md`
- Applicable feature and operations documentation under `docs/`
- Media Bunny references whenever changing browser media processing:
  - `docs/references/media-bunny/guides.md`
  - `docs/references/media-bunny/api.md`

Follow the repository’s strict Atomic Code Splitting requirement:

- One component per file.
- One function, hook, helper, action, validator, or type per file.
- Use the closest relevant directory.
- Do not introduce large catch-all files.
- Imported upstream code may have a clearly documented vendor boundary, but all new ClipStitchr-owned integration code must follow the atomic rules.
- Every new capability needs dedicated documentation.
- Update `docs/operations/security/rate-limits.md` for every new backend operation or explicitly document why an operation does not require a limit.

Read and obey the full anti-slop design law before UI work. Re-read it and perform a detailed point-by-point UI audit before calling any interface complete.

## Existing upstream source

The downloaded source snapshots are available here:

- LazyReel:
  `/Users/starship/GitHub/lazyreel-master`
- SupoClip:
  `/Users/starship/GitHub/supoclip-main`
- OpenCut:
  `/Users/starship/GitHub/OpenCut-main`
- ReelClaw:
  `/Users/starship/GitHub/reelclaw-main`

Postiz may need to be cloned from the official repository if no current local checkout exists:

- `https://github.com/gitroomhq/postiz-app`

ClipStitchr also contains a previous Postiz integration in Git history:

- Initial integration commit: `9af6be85`
- Revert commit: `4968c167`
- Later Zernio replacement: `bd0a2ce4`

Inspect the previous Postiz implementation and its documentation before rebuilding it. It already contains valuable work around Clerk tenancy, provider credentials, R2 media access, durable scheduling, retries, and the publishing workspace.

Use the current official Postiz source and documentation when the previous imported provider code is outdated. Record the exact upstream commit used.

Do not spend implementation time debating or blocking on licensing. I intend to open source ClipStitchr and will handle final licensing decisions separately. Keep imported source provenance clear so upstream updates can be traced, but licensing analysis is not part of this task.

Treat all upstream code as untrusted until inspected. Do not blindly execute install scripts, postinstall hooks, or shell commands from imported projects. Do not copy known security problems into ClipStitchr.

## Product decision

Build a new, cohesive Studio Beta workspace inside ClipStitchr.

The current ClipStitchr experience must remain fully usable and unchanged:

- Existing Hook Lab stays available.
- Existing Stitchr stays available.
- Existing Clipr, Swipr, Swapr, Library, Schedule, and Analytics stay available.
- Existing Zernio publishing stays operational.
- Existing records and workflows must not be migrated automatically.
- Do not change current production routes to point to Studio Beta.
- Do not dual-publish or silently move posts between Zernio and Postiz.

Studio Beta will let us test the imported capabilities before deciding whether they replace or merge with current tools.

## Studio Beta access model

Studio Beta must initially be restricted to my Clerk account and an explicit tester allowlist.

Do not use email addresses as authorization identifiers. Use the immutable Clerk identity subject already used as ClipStitchr’s `ownerId`.

Implement all three access conditions:

1. A server-side global kill switch is enabled.
2. The authenticated owner has an active allowlist grant.
3. The eligible owner has personally enabled Studio Beta in Settings.

Use server-only environment variables:

- `STUDIO_BETA_ENABLED`
- `STUDIO_BETA_OPERATOR_SECRET`

Do not use a `NEXT_PUBLIC_` variable for authorization.

Add durable Convex records along these lines, adjusting names only when a better atomic model is justified:

### `studioBetaAccessGrants`

- `ownerId`
- `status`: active or revoked
- `grantedBy`
- `createdAt`
- `updatedAt`
- Optional revocation metadata

Index by owner.

### `studioBetaPreferences`

- `ownerId`
- `enabled`
- `createdAt`
- `updatedAt`

Index by owner.

### `studioBetaAuditEvents`

Record grants, revocations, user opt-in changes, and other sensitive administrative changes without storing secrets.

Implement:

- `assertStudioBetaAccess` for Convex operations.
- A corresponding Next.js server-side access helper.
- Worker-side access checks before claiming or starting beta work.
- A route-level guard for every `/dashboard/studio/*` page.
- API-level enforcement for every `/api/studio/*` route.
- R2 upload and signed-download enforcement.
- Publishing-service enforcement.
- Provider and media-worker enforcement.
- A global fail-closed behavior when the kill switch is missing or false.
- No Studio access through the development auth bypass.
- `403` for authenticated API callers without access.
- A non-disclosing `404` or safe redirect for unauthorized page navigation.
- No hidden-route-only security. Hiding navigation is not authorization.

If access is revoked or the global switch is disabled:

- Do not delete existing beta data.
- Stop new jobs from starting.
- Preserve already-created drafts and outputs.
- Do not leave paid provider operations running unless stopping would cause corruption or duplicate external effects.
- Document the exact job behavior.

Add server-only management commands:

- `npm run studio-beta:grant -- <clerk-user-id>`
- `npm run studio-beta:revoke -- <clerk-user-id>`
- `npm run studio-beta:list`

Require `STUDIO_BETA_OPERATOR_SECRET`, use constant-time secret comparison where applicable, rate-limit administrative mutations, and audit every change.

Do not hardcode my Clerk ID. Build the management path first and document how to obtain and grant the ID.

In Settings:

- Non-allowlisted users see nothing about Studio Beta.
- Allowlisted users see one clear opt-in control.
- Enabling it reveals Studio navigation.
- Disabling it hides the workspace without deleting anything.
- Copy must be short, plain, and human.

## Studio route structure

Use a task-separated route structure:

- `/dashboard/studio`
- `/dashboard/studio/research`
- `/dashboard/studio/clips`
- `/dashboard/studio/stitch`
- `/dashboard/studio/edit`
- `/dashboard/studio/publishing`
- `/dashboard/studio/publishing/compose`
- `/dashboard/studio/publishing/calendar`
- `/dashboard/studio/publishing/posts`
- `/dashboard/studio/publishing/analytics`
- `/dashboard/studio/publishing/connections`

The Studio root may provide a concise workflow home or redirect to the most useful starting task. Do not make it a wall of equally weighted cards.

Studio must reuse:

- The active ClipStitchr Product.
- Clerk authentication.
- Existing Library assets.
- Existing R2 storage.
- Existing billing and credit infrastructure where applicable.
- Existing notifications.
- Existing product scoping and ownership rules.
- Existing accessible dashboard primitives.

Beta drafts, projects, analyses, tasks, outputs, and publishing records must use separate versioned storage so they cannot corrupt classic data.

Turning Studio off must not delete or mutate classic or beta records.

Create a cohesive Studio sub-navigation. Do not paste several unrelated vendor shells into the app. Imported behavior should feel like one ClipStitchr product.

## Phase 1: Studio Beta foundation

Implement and fully verify the following before beginning major imports:

- Convex allowlist schema and operations.
- Settings opt-in.
- Server and client eligibility state.
- Sidebar visibility.
- Studio route layout and guards.
- Studio API guard.
- Worker access contract.
- Operator commands.
- Audit events.
- Tests for unauthorized, allowlisted-disabled, allowlisted-enabled, revoked, and globally-disabled states.
- Dedicated feature documentation.
- Rate-limit documentation.
- Desktop and mobile browser verification.
- Pointer and keyboard verification.

Do not build fake navigation destinations. If a later phase route is not implemented yet, either omit it temporarily or clearly mark it unavailable without rendering a dead control.

## Phase 2: Full LazyReel workspace

Bring LazyReel’s current functionality into `/dashboard/studio/research` as a real product surface independent of the existing Hook Lab.

The user needs to experience LazyReel substantially as it currently works before we decide whether it replaces or merges with Hook Lab.

Include all current LazyReel research tools:

- `niche_report`
- `study_videos`
- `teardown`
- `make_brief`
- `breakout_laws`
- `kill_the_slop`
- `get_status`

Include the complete current corpus, frameworks, classifications, methodology, examples, and relevant Wiki content.

Include all six companion workflows:

- Format deconstructor
- Format prompt builder
- Higgsfield director
- UGC ad director
- UGC ad generator
- Video editor

Adapt the MCP server’s internal functions into authenticated ClipStitchr server functions or a focused service. The web application must not require the user to configure a separate MCP client just to use LazyReel.

Preserve the existing tool semantics and evidence. Do not replace real corpus results with generic LLM output.

The research workspace should support:

- Choosing one research job at a time.
- Niche reports.
- Search and filters over real examples.
- Opening and hook analysis.
- Format teardown from description, transcript, or supported URL.
- Product-specific creative briefs using the active ClipStitchr Product.
- Saved research runs.
- Saved creative briefs.
- Clear observed evidence versus inferred conclusions.
- Opening original public example links safely.
- Sending approved briefs into Studio Stitch or the Studio editor.
- Browsing LazyReel’s niche and hook-pattern research without presenting every section at once.

Preserve current Hook Lab untouched. Do not merge schemas or redirect Hook Lab yet.

If bringing in the ingestion pipeline:

- Make it an internal or operator-controlled worker workflow.
- Do not expose scraping administration to normal beta testers.
- Do not claim real-time ingestion if the upstream implementation does not provide it.
- Validate external URLs.
- Treat scraped content as untrusted.
- Bound provider cost and corpus size.
- Do not store or redistribute raw media unless explicitly required and permitted by the configured storage workflow.

Add atomic types, validators, queries, mutations, services, tests, and dedicated documentation.

## Phase 3: OpenCut browser editor rewritten for Next.js

Port the current OpenCut browser editor into `/dashboard/studio/edit`.

This must be a real Next.js App Router integration:

- No iframe.
- No separate Vite dev application in production.
- No duplicated authentication shell.
- No unrelated OpenCut marketing site.
- No standalone OpenCut account model.
- No duplicate file library.

Inspect OpenCut’s current `apps/web`, packages, and core architecture. Port all currently working browser-editor functionality that is relevant to ClipStitchr.

Convert:

- Vite entry points to Next.js App Router boundaries.
- TanStack Router navigation to ClipStitchr routes and state.
- Browser-only editor surfaces to focused `"use client"` components.
- Upstream persistence to ClipStitchr project records.
- Upstream media selection to ClipStitchr Library and Studio outputs.
- Upstream export paths to ClipStitchr’s Media Bunny or server-worker rendering.
- Worker and WASM assets to Next-compatible loading and response headers.

Keep the editor route shell server-renderable, but lazy-load the heavy editor client where appropriate.

The editor should eventually support at least:

- Importing existing Library media.
- Importing SupoClip results.
- Importing Studio Stitch outputs.
- Multiple video, image, text, voice, music, and caption layers.
- Timeline reordering.
- Frame-accurate trimming and splitting.
- Crop, scale, positioning, and rotation.
- Volume and mute controls.
- Audio fades.
- Playback speed.
- Text and caption styling.
- A restrained set of working transitions.
- Project autosave.
- Undo and redo.
- Keyboard shortcuts.
- Preview.
- Export.
- Saving final output to R2 and the active Product’s Library.
- Reopening a saved project.
- Versioned editor-project data.

Reuse the existing Media Bunny implementation where it is already the stronger browser path. Read the Media Bunny guides and API declarations before modifying it.

Do not use Media Bunny’s single-input `Conversion` API for multi-clip composition. Preserve ClipStitchr’s established fresh-`Output`, retimestamped-sample approach when applicable.

For operations that cannot run reliably in the browser, use an authenticated beta worker job and keep the UI honest about background processing.

Do not import OpenCut’s desktop Rust shell unless a specific reusable core module is needed. The target is the browser editor inside Next.js.

Build an upstream feature inventory and a parity checklist. Do not claim the rewrite complete until every included upstream behavior has a working test or explicit documented exclusion.

## Phase 4: Full SupoClip workflow

Bring SupoClip into `/dashboard/studio/clips`.

Include its complete useful long-video-to-short-video workflow:

- YouTube URL input.
- Local video upload.
- Source preview.
- Caption template selection.
- Font selection and custom fonts.
- Font size and color.
- Subtitle enable or disable.
- Optional B-roll.
- Vertical or original output.
- Background task creation.
- Queued, processing, completed, error, and cancelled states.
- Live progress.
- Task history.
- Task detail.
- Transcript excerpts.
- AI-selected clip candidates.
- Virality or potential score with reasoning.
- Preview and download.
- Trim.
- Split.
- Merge.
- Caption updates.
- Regeneration.
- Project-wide styling.
- Platform-specific export.
- Cancel, resume, and delete.
- Saving accepted clips into the active Product’s ClipStitchr Library.
- Opening accepted clips in the Studio editor.
- Sending accepted clips into Studio Stitch.

Remove or replace SupoClip infrastructure that ClipStitchr already owns:

- Replace Better Auth with Clerk.
- Replace SupoClip users with ClipStitchr owner IDs.
- Remove SupoClip sign-in and sign-up pages.
- Remove SupoClip billing and Stripe implementation.
- Remove SupoClip admin UI.
- Remove its marketing shell.
- Remove duplicate settings.
- Remove duplicate feedback systems.
- Replace SupoClip file storage with owner-scoped R2.
- Replace duplicate product concepts with ClipStitchr Products.
- Prefer Convex for task and result metadata.
- Use ClipStitchr’s job and notification patterns.
- Reuse Pexels configuration where available.
- Reuse existing LLM-provider configuration where practical.

The SupoClip processing pipeline is Python and FFmpeg-heavy. Keep it out of Vercel request execution.

Create a focused Cloud Run worker or service for clipping. Do not destabilize the current media worker. The new worker must:

- Authenticate claims.
- Recheck Studio access.
- Verify owner and Product ownership.
- Claim one task safely.
- Support retryable versus permanent failure classification.
- Publish progress.
- Use bounded temporary storage.
- Delete temporary input and output files after durable upload.
- Save outputs to R2.
- Never log API keys or signed URLs.
- Have a Docker health or `--check` path.
- Be documented for local and production deployment.
- Not be deployed until explicitly requested.

Apply cost controls before transcription, downloading, LLM calls, B-roll calls, and rendering.

For YouTube input:

- Accept only recognized YouTube URL forms.
- Do not allow arbitrary URL fetching.
- Bound duration and size.
- Validate the downloaded media before processing.
- Prevent SSRF and redirect abuse.

## Phase 5: ReelClaw-enhanced Studio Stitch

Bring ReelClaw’s useful production workflows into `/dashboard/studio/stitch`.

Preserve classic Stitchr unchanged. Studio Stitch is a separate beta implementation that can later replace or merge with it.

Include both ReelClaw pipelines.

### Classic reel workflow

- Source or select UGC reaction clips.
- Use existing ClipStitchr UGC and Demo media.
- Support DanSUGC sourcing when configured.
- Analyze demo recordings.
- Choose useful demo segments.
- Assemble 7 to 15 second reels.
- Text overlays.
- Music.
- Transitions.
- Batch variations.
- Save results to the active Product’s Library.
- Hand off to Studio editor.
- Hand off to Studio publishing.

### Talking-video workflow

- 20 to 30 second narrated testimonial-style videos.
- Script generation.
- Multiple supported hook families.
- Voice assignment.
- ElevenLabs voiceover.
- Word-level timestamps.
- CapCut-style synchronized captions.
- Music bed preparation and mixing.
- Reaction clips.
- Demo cutaways.
- Timeline JSON or an equivalent versioned recipe.
- CTA ending.
- Batch generation.
- Review a sample subset before generating the remaining batch.
- Save every output and recipe.
- Reopen a recipe.
- Edit output in Studio editor.
- Publish through Studio publishing.

Use server-side environment variables for DanSUGC, Gemini, ElevenLabs, and any related provider credentials. Never expose them to the browser.

Reuse existing ClipStitchr hook templates, Product facts, Hook Lab briefs, and LazyReel briefs where that improves the workflow without changing classic data.

Generated product claims must be grounded in the active Product’s saved details. Reference content may contribute structure and pacing but must not invent unsupported product features.

Add rate limits and credit treatment before every paid provider operation.

If a provider is not configured, show a clear unavailable state. Do not render a control that appears operational but fails after clicking.

## Phase 6: Restore Postiz beside Zernio

Add a complete Postiz-based publishing and analytics workspace under `/dashboard/studio/publishing`.

Zernio must remain untouched and fully operational at:

- Existing Schedule.
- Existing Analytics.
- Existing social-publishing APIs.
- Existing Zernio settings.
- Existing schedules and history.

Do not migrate, delete, redirect, or dual-write Zernio records.

Postiz Beta must use separate:

- Routes.
- API paths.
- settings.
- credentials.
- provider connections.
- posts.
- schedules.
- analytics.
- database records.
- worker/service runtime.
- environment variables.
- R2 media references.
- documentation.

Use `/api/studio/publishing/*` or another clearly isolated namespace.

Restore and update the useful parts of the previous integration from commit `9af6be85`. Do not blindly cherry-pick it. Compare it against:

- The current ClipStitchr architecture.
- The current official Postiz source.
- The current Postiz provider contracts.
- The reason the old path had to coexist with an approved provider.

Support only:

- TikTok.
- Instagram.
- YouTube.

Remove unrelated Postiz functionality:

- All other social providers.
- Postiz authentication and JWT sessions.
- Postiz organization and team account model.
- Postiz billing and subscriptions.
- Postiz marketplace.
- Postiz Copilot or unrelated AI generation.
- Browser extensions.
- Generic public API products not needed by ClipStitchr.
- Postiz admin and support consoles.
- Postiz marketing pages.
- Postiz email system.
- Duplicate media library.
- Postiz branding and navigation shell.

Include the complete useful publishing product:

- Social connection management.
- OAuth callbacks.
- Connection health.
- Refresh and reconnect.
- Composer.
- Platform-specific settings.
- Drafts.
- Immediate publishing.
- Scheduled publishing.
- Calendar.
- Post list.
- Post detail.
- Per-destination status.
- Partial success.
- Cancellation where supported.
- Safe retry.
- Analytics by account.
- Analytics by post where supported.
- Analytics synchronization.
- Media compatibility checks.
- YouTube titles, descriptions, visibility, and other required settings.
- TikTok creator information, privacy, commercial-content disclosures, and explicit consent.
- Instagram media-shape and carousel rules.
- Product-scoped publishing history.
- Publishing from Studio outputs and durable Library items.

Inside Studio, label this provider clearly as Postiz Beta. Do not confuse it with Zernio.

No automatic cross-provider publishing. The user must explicitly choose the Postiz Beta workflow or the existing Zernio workflow.

Provider approval is not an implementation blocker:

- Build connections and callbacks.
- Configure safe placeholder environment names.
- Disable a provider with direct human copy when credentials or approval are missing.
- Do not claim live publishing until an observable real provider result has been verified.
- Do not use Zernio credentials as Postiz credentials.

### Publishing service boundary

Use a separate long-running publishing service rather than Vercel requests for scheduling and retries.

Start from the previous `web/services/publishing-service` architecture if it remains sound, then update it for current requirements and YouTube.

Use:

- PostgreSQL for durable publishing state and outbox records.
- Redis for ephemeral OAuth state, replay protection, coordination, and rate limiting where appropriate.
- A durable scheduler or transactional outbox.
- Per-destination attempts.
- Stable idempotency keys.
- Immutable success receipts.
- Recoverable leases.
- Explicit uncertain-outcome states.
- Reconciliation instead of blind retries across non-idempotent provider boundaries.

Prefix new environment variables clearly, for example:

- `STUDIO_PUBLISHING_SERVICE_ORIGIN`
- `STUDIO_PUBLISHING_SERVICE_ISSUER`
- `STUDIO_PUBLISHING_SERVICE_AUDIENCE`
- `STUDIO_PUBLISHING_SERVICE_ASSERTION_KEY_BASE64`
- `STUDIO_PUBLISHING_DATABASE_URL`
- `STUDIO_PUBLISHING_REDIS_URL`
- Provider-specific Meta, TikTok, and Google credentials

Choose exact names consistently and document them.

### Publishing security requirements

Do not copy unsafe upstream network behavior.

Require:

- Clerk owner resolution at the ClipStitchr gateway.
- Short-lived, audience-bound service assertions.
- Tenant and action binding.
- Assertion expiry and replay protection.
- Random, short-lived, provider-bound OAuth state.
- PKCE where supported.
- Single-use state consumption.
- Authenticated encryption for access and refresh tokens.
- Versioned encryption envelopes.
- No provider tokens in browser responses or logs.
- Fixed provider host allowlists.
- SSRF-safe provider media handling.
- Durable owned R2 media identity, not persisted expiring URLs.
- Just-in-time provider-readable media URLs.
- R2 object ownership checks.
- Content type, size, duration, codec, and dimension verification.
- TikTok range and HEAD support where required.
- No automatic retry after an uncertain provider publish boundary.
- Accurate states such as accepted, processing, requires user action, published, partially published, rejected, rate limited, auth required, and outcome unknown.
- Server-side per-user, per-tenant, and global provider limits.
- Clear HTTP `429` responses with retry timing.

Add YouTube to the provider inventory, test matrix, connection UI, composer, status model, analytics model, and deployment documentation.

## Data and integration model

Create separate, versioned Studio records. Exact table names may be refined after inspecting the existing schema, but the responsibilities should remain separated:

- Beta access grants.
- Beta preferences.
- Beta audit events.
- LazyReel research runs.
- LazyReel saved reports.
- Studio creative briefs.
- SupoClip tasks.
- SupoClip outputs.
- Editor projects.
- Editor project revisions.
- Reel recipes.
- Reel generation runs.
- Reel outputs.
- Publishing media references or mappings where needed.

Do not place unrelated concepts into a single generic Studio document.

Every owner-scoped query and mutation must enforce ownership independently from rate limits.

Use separate status and summary records where needed to keep frequently polled Convex documents bounded.

Do not store large transcripts, timelines, binary media, or imported corpus files directly in hot Convex documents when R2 or a focused durable record is more appropriate.

## User experience requirements

Studio should feel like one ClipStitchr production environment:

Research → Clips → Stitch → Edit → Publish

Use the current active Product throughout the flow.

Preserve drafts, selections, projects, research reports, generation results, and publishing state across route changes.

Use progressive disclosure:

- One clear primary job per route.
- Results readable before editing controls appear.
- Details available on demand.
- Actions next to the context needed to choose them.
- Expensive reruns clearly identified.
- Existing results use Open or View instead of implying regeneration.
- Loading, error, and success feedback beside the triggering action.
- Mobile preserves the same hierarchy.
- All controls work with keyboard and pointer input.

Do not copy vendor styling wholesale.

The Studio visual identity should be based on a real, populated cutting-room timeline and media contact sheet, not a fake app window or decorative dashboard prop.

Avoid:

- Purple and blue-purple gradients.
- Glowy pill buttons.
- Fake floating cards.
- Icon tiles.
- Generic SaaS cards everywhere.
- Default filled-plus-outlined button pairs.
- Dead controls.
- Hidden entrance-animation content.
- Hover lift or button boop.
- Decorative hairline rules.
- Generic graph-paper backgrounds.
- Low-contrast text.
- Clipped content.
- Unverified centering.
- Excessive labels and chips.
- Vendor UIs pasted together without a cohesive design system.

Do not remove every icon to avoid generic iconography. Use real platform marks and purposeful ClipStitchr visual language where icons genuinely help.

## Abuse protection

Before implementing every user-triggered backend operation, identify:

- Compute cost.
- Storage cost.
- Bandwidth cost.
- Third-party API cost.
- Shared provider limits.
- Potential abuse.
- Ownership requirements.

Add limits before expensive work begins.

At minimum cover:

- Studio access administration.
- LazyReel reports and LLM-backed tools.
- External URL analysis.
- Corpus ingestion.
- Video uploads.
- YouTube metadata and downloads.
- Transcription.
- B-roll retrieval.
- Clip analysis.
- Clip generation and regeneration.
- Caption generation.
- Voiceover.
- Reel batches.
- Editor background exports.
- R2 signed URLs.
- Postiz OAuth.
- Media registration.
- Immediate publishing.
- Schedule creation.
- Cancellation.
- Retry.
- Analytics synchronization and polling.

Update `docs/operations/security/rate-limits.md` in the same changes.

## Documentation requirements

Create focused documentation under a clear Studio feature tree, such as:

- `docs/features/studio-beta/access-control.md`
- `docs/features/studio-beta/workspace.md`
- `docs/features/studio-beta/lazyreel.md`
- `docs/features/studio-beta/supoclip.md`
- `docs/features/studio-beta/editor.md`
- `docs/features/studio-beta/reelclaw.md`
- `docs/features/studio-beta/postiz-publishing.md`
- `docs/features/studio-beta/data-model.md`
- `docs/features/studio-beta/worker-architecture.md`

Each document must include:

- What the capability does.
- User workflow.
- Architecture.
- Security boundaries.
- Rate limits.
- External providers.
- Relevant environment variables.
- Source references.
- Imported source location and upstream commit.
- File tree.
- Testing and verification.
- Known limitations.
- Relationship to existing classic ClipStitchr tools.

Update existing docs when behavior they describe changes.

## Testing requirements

Use Vitest and the existing test patterns. Add focused tests rather than one giant suite.

Required access tests:

- Unauthenticated.
- Authenticated but not allowlisted.
- Allowlisted but not enabled.
- Allowlisted and enabled.
- Revoked.
- Global switch disabled.
- Direct route guessing.
- Direct API calls.
- Convex calls.
- Worker claims.
- Development auth bypass.

Required product tests:

- Owner and Product isolation.
- Cross-user denial.
- Draft persistence.
- R2 ownership.
- Rate limits.
- Idempotency.
- Job cancellation and retry.
- Partial results.
- Worker recovery.
- Media cleanup.
- LazyReel tool output parsing.
- SupoClip task lifecycle.
- Editor project persistence and export.
- Reel recipe and batch generation.
- Postiz OAuth state and replay protection.
- Token encryption.
- Provider response parsing.
- Media compatibility.
- Publishing uncertain outcomes.
- YouTube, Instagram, and TikTok provider settings.
- Zernio regression coverage.

Run from `web/`:

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

Run targeted tests during development before the full suite.

For UI:

- Start the dev server only when needed.
- Test the full workflow in a real browser.
- Desktop and mobile.
- Pointer and keyboard.
- Focus states.
- Route guards.
- Refresh behavior.
- Empty, loading, success, and error states.
- Every visible control must respond correctly.
- Ensure content remains visible if motion fails.
- Kill the dev server after testing.

Perform the complete anti-slop audit at the end of every finished UI phase and fix every issue found before reporting completion.

## Work protocol

1. Inspect `git status` before editing and preserve unrelated user changes.
2. Inventory each upstream project and the previous Postiz implementation.
3. Write the architecture and migration-free coexistence plan.
4. Create and maintain a detailed implementation plan.
5. Implement Studio access and the shell first.
6. Verify it fully.
7. Add integrations one vertical slice at a time.
8. Keep every completed phase locally usable.
9. Do not leave placeholder controls that imply unavailable functionality.
10. Do not modify or remove Zernio.
11. Do not redirect classic routes.
12. Do not deploy production.
13. Do not commit or push unless I explicitly ask.
14. Do not claim live provider publishing without a verified provider result.
15. Do not call the overall project complete while required phases remain.

At the end of each substantial phase, report:

- What is working.
- Files and documentation added or changed.
- Tests run and their results.
- Browser workflows verified.
- External credentials still needed.
- Known limitations.
- The next phase.

Begin now with repository inspection, upstream inventories, the durable implementation plan, and Phase 1 Studio Beta access control. Then continue into the first complete LazyReel vertical slice once Phase 1 passes its tests.

Afterward continue in the next phase once you commit and push the changes to main, and so on repeating until all phases are complete.
