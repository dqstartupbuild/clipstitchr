# ClipStitchr

ClipStitchr is a short-form content workspace for indie app builders, mobile
marketers, and small teams that have product demos, Hook/UGC clips, avatar photos, and
raw ideas but do not want to spend every week inside a traditional video
editor.

The main product is Stitchr. Users upload Hook/UGC clips and product demos
once, keep them organized in a reusable library, then create finished vertical
ads by pairing attention-first clips with product demos. AI-assisted tools such
as Clipr, Swapr, Swipr, avatar photos, Hook Lab, Quick Edit, and automation help
create or improve source material, but they all feed the same content library.

## Product Goal

ClipStitchr is not a general video editor, AI playground, or social scheduler.
It is built around one practical job: turn scattered marketing footage into
finished TikTok and Reels assets with less repetitive editing.

The product should make users feel like they can:

- upload raw footage once
- find usable clips later
- create more than one ad from the same source library
- keep source clips safe while editing with metadata
- use AI only where it saves real content work
- download or schedule finished assets without rebuilding them

## Core Workflow

```text
Upload Hook/UGC clips and product demos
        |
        v
Normalize uploads to 9:16 vertical media
        |
        v
Save media files in Cloudflare R2
Save metadata, trims, tags, ownership, and state in Convex
        |
        v
Browse everything from the Library
        |
        v
Use Stitchr, Clipr, Swapr, Swipr, Quick Edit, and Hook Lab
        |
        v
Save finished Stitches, Swipes, generated clips, templates, and assets
        |
        v
Download, reuse, mark posted, or schedule
```

## Main Features

### Library

The authenticated Library at `/dashboard/library` is the single place for
saved Hook/UGC clips, product demos, generated outputs, finished work, avatar
photos, and imported Pexels packs. Reusable inspiration and Stitch recipes live
in Hook Lab Ideas.

Library groups:

- Videos: Hook/UGC, Product demos, Swaps
- Finished: Stitches, Carousels
- Assets: Avatars, Pexels

Compatibility redirects keep older dashboard URLs working:

- `/dashboard/uploads` -> `/dashboard/library`
- `/dashboard/avatars` -> `/dashboard/library?tab=avatars`
- `/dashboard/templates` -> `/dashboard/hooks?view=ideas`
- `/dashboard/stitches` -> `/dashboard/library?tab=stitches`

### Stitchr

Stitchr is the primary workflow. It creates finished vertical videos from saved
Hook/UGC clips and product demos.

Normal Stitchr behavior:

- select up to 20 Hook/UGC clips
- select one product-linked Demo clip
- preview each Hook/UGC-then-Demo sequence
- copy source trims and Quick Edit metadata into the Stitchr session
- adjust trims, playback speed, source audio, music, captions, and text
- create one finished Stitch per selected Hook/UGC clip
- save renders, posters, metadata, and editable settings
- download finished 9:16 videos whenever needed

Every standard Stitch output follows this sequence:

```text
Hook/UGC clip first -> Product demo second -> One saved vertical video
```

Stitchr also supports:

- Batch mode for automated daily draft creation
- Longr mode for ordered multi-clip sequences
- reusable Hook Lab Idea recipes, with legacy Template fallback during migration
- multiple editable text overlays
- social captions and hashtags
- selected, uploaded, or TikTok-imported sounds
- Stitch scoring for pre-posting feedback
- active/posted library state

### Hook Lab

Hook Lab has **Ideas** and **Review** views. Users can save a useful line, a
supported public TikTok or Instagram post, or a past Stitch; Hook Lab learns a
structured writing pattern or creative beat and can turn it into 1, 3, or 5
fresh, editable Stitches. Review keeps every generated hook on its own card so
Use, Save idea, and Not for me never affect sibling hooks.

### Quick Edit

Quick Edit stores non-destructive edit suggestions and source adjustments such
as trims, crop metadata, playback changes, overlay suggestions, and manual cuts.
Applying Quick Edit to a source clip affects future selections. Existing saved
Stitches keep their copied settings so older outputs do not change behind the
user's back.

### Clipr

Clipr generates reusable short-form engagement clips that save back into the
UGC library.

Current visible modes:

- Reaction
- B-roll

Clipr rules:

- generated non-demo outputs are UGC-compatible
- outputs can be downloaded or used in Stitchr
- product settings guide topics, audience, pain points, and vocabulary
- Clipr should not directly promote the user's product
- Clipr should not include platform or sales calls to action
- Script mode exists behind a feature flag and is hidden by default
- optional music is mixed at export time instead of mutating the saved video

### Swapr

Swapr lets a user choose a saved avatar or person photo plus a saved
UGC-compatible video, then generate a new motion-transfer style video through a
server-side AI provider workflow.

Swapr outputs:

- are saved to the Library Swaps tab
- keep provenance back to the source photo, source clip, model, and prompt
- remain reusable as Hook/UGC clips
- can feed future Stitchr and Swapr workflows

### Swipr

Swipr creates TikTok-ready carousel image posts. A saved Swipe stores editable
carousel state, not final rendered PNGs.

Swipr supports:

- Batch mode for 10 draft carousels from saved products and Pexels packs
- Manual mode for one editable carousel
- 3 to 8 vertical slides
- Pexels photos, saved packs, avatar photos, uploads, and AI backgrounds
- per-slide text overlays
- product-aware generated slide text
- generated caption, description, and hashtags
- browser-rendered 9:16 PNG ZIP downloads
- active/posted state in the Library

### Avatars And Photos

Avatar photos live in the Library Avatars tab. Users can upload reference
photos, manage avatar assignment, save wardrobe and voice preferences, choose a
default avatar, and generate additional scenario photos when AI providers are
configured.

### Automation

Provider and media workers run outside the Next.js app as Google Cloud Run Jobs.
They support automated provider tasks, media finalization, batch generation,
worker recovery, and durable workflows.

Worker code lives in:

- `web/services/provider-worker/`
- `web/services/media-worker/`

Deployment details live in:

- `AGENTS.md`
- `docs/backend/media-worker-deployment.md`
- `docs/backend/provider-automation-workflows.md`
- `docs/backend/durable-workflows.md`

### Scheduling And Analytics

Post Bridge integrations support scheduling and analytics surfaces. Dashboard
routes include schedule and analytics pages, with backend docs covering API
configuration, stored post state, media upload behavior, and analytics sync.

Relevant docs:

- `docs/features/post-bridge-scheduling.md`
- `docs/features/post-bridge-analytics.md`

### Content, SEO, And Marketing Pages

The app also includes public content routes for marketing, SEO, examples, docs,
pricing, blog posts, case studies, terms, and privacy.

SEO support includes:

- sitemap routes
- video sitemap route
- RSS feed
- `llms.txt`
- Open Graph images
- JSON-LD metadata helpers
- content collection builds
- IndexNow submission support

## Tech Stack

The application code lives under `web/`.

| Layer | Tooling |
| --- | --- |
| App framework | Next.js 16 |
| UI | React 19, Tailwind CSS 4, lucide-react |
| Auth | Clerk |
| Backend/database | Convex |
| Object storage | Cloudflare R2 |
| Browser media processing | Media Bunny |
| AI/provider workflows | Replicate and configurable model IDs |
| Analytics | PostHog and Vercel Analytics |
| Content | Content Collections, MDX, remark-gfm |
| Testing | Vitest, Testing Library patterns, coverage |
| Workers | Node/tsx workers packaged as Cloud Run Jobs |

## Architecture

```text
Browser / Next.js client
  |
  | Clerk auth
  | Media Bunny upload normalization, preview, render, poster, and export work
  v
Next.js routes and API routes
  |
  | signed upload/download/delete flows
  | provider job creation
  | rate-limit checks
  v
Convex
  |
  | metadata, ownership, workflow state, counts, library records
  v
Cloudflare R2
  |
  | normalized videos, generated videos, posters, thumbnails, music, photos
  v
Cloud Run workers and provider APIs
  |
  | paid generation, durable workflow recovery, media finalization
  v
Saved library assets
```

## Media Processing Model

ClipStitchr is browser-first for media processing.

Media Bunny handles:

- upload validation
- upload normalization to TikTok-style 9:16 media
- poster generation
- Stitchr previews and exports
- Longr exports
- Clipr and Stitchr music mixing at download/export time
- Swipr slide and carousel rendering support through browser canvas utilities

Important media rules:

- source videos are normalized before they become usable library clips
- source clips are preserved
- trims are editable metadata
- crop and Quick Edit data are non-destructive
- saved Stitch settings are copied into each output
- music can be changed later because it is stored separately from clean video
- full video/audio blobs are loaded lazily from R2
- library pages load Convex metadata first and hydrate visible media on demand

For Media Bunny work, read:

- `project-scope.md`
- `docs/media-bunny/media-bunny-llms.md`
- `docs/media-bunny/media-bunny-api.md`

## Data Storage

Convex stores durable metadata, ownership, workflow state, and R2 object
references. Cloudflare R2 stores the binary files.

Common stored records include:

- video clips
- photo assets
- avatar preferences
- product profiles
- saved Stitches
- Stitchr templates
- saved Swipes
- shared and private music tracks
- provider jobs
- media jobs
- automation runs and tasks
- notifications
- post/schedule records
- generated blog/content records

R2 stores:

- normalized source videos
- generated Clipr and Swapr videos
- saved Stitch renders
- posters and thumbnails
- uploaded and generated photos
- Swipr/Pexels images
- music files
- downloadable media objects

## Routes

Public and content routes:

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/pricing` | Pricing page |
| `/blog` | Blog index |
| `/blog/[slug]` | Blog post |
| `/case-studies` | Case studies index |
| `/case-studies/[slug]` | Case study detail |
| `/docs` | Public docs index |
| `/docs/[slug]` | Public docs page |
| `/examples` | Examples index |
| `/examples/[slug]` | Example page |
| `/privacy` | Privacy page |
| `/terms` | Terms page |
| `/feed.xml` | RSS feed |
| `/llms.txt` | LLM discovery file |
| `/video-sitemap.xml` | Video sitemap |

Dashboard routes:

| Route | Purpose |
| --- | --- |
| `/dashboard` | Main authenticated workspace |
| `/dashboard/library` | Unified asset library |
| `/dashboard/stitchr` | Stitchr video creation |
| `/dashboard/clipr` | Clipr generated engagement clips |
| `/dashboard/swipr` | Swipr carousel creation |
| `/dashboard/swapr` | Swapr motion-transfer studio |
| `/dashboard/hooks` | Hook Lab |
| `/dashboard/schedule` | Scheduling workspace |
| `/dashboard/analytics` | Post Bridge analytics |
| `/dashboard/settings` | Product and account settings |
| `/dashboard/onboarding` | First-run onboarding |
| `/dashboard/uploads` | Redirect to Library |
| `/dashboard/avatars` | Redirect to Library Avatars tab |
| `/dashboard/templates` | Redirect to Hook Lab Ideas |
| `/dashboard/stitches` | Redirect to Library Stitches tab |

## Repository Layout

```text
.
|-- README.md
|-- AGENTS.md
|-- project-scope.md
|-- coding-guidelines.md
|-- docs/
|   |-- architecture/
|   |-- backend/
|   |-- features/
|   |-- media-bunny/
|   `-- product/
|-- resources/
|   `-- clipr/
|-- assets/
|   |-- brand/
|   |-- hooks/
|   `-- mockup/
`-- web/
    |-- app/
    |-- convex/
    |-- lib/
    |-- public/
    |-- scripts/
    |-- services/
    |-- package.json
    `-- README.md
```

## Key Code Areas

| Path | Purpose |
| --- | --- |
| `web/app/` | Next.js App Router pages, layouts, API routes, dashboard routes |
| `web/app/_components/` | Atomic React components grouped by domain |
| `web/lib/clipstitchr/media/` | Media Bunny processing, rendering, posters, audio, export helpers |
| `web/lib/clipstitchr/utils/` | Focused single-purpose app utilities |
| `web/lib/clipstitchr/types/` | Shared ClipStitchr TypeScript types |
| `web/lib/clipstitchr/constants/` | Focused constants |
| `web/convex/` | Convex schema-facing functions, queries, mutations, actions, validators |
| `web/services/provider-worker/` | Provider worker job runner |
| `web/services/media-worker/` | Media worker job runner |
| `web/content/` | MDX content collections |
| `resources/clipr/` | Internal hook and template resources |
| `docs/features/` | Feature-specific implementation docs |
| `docs/backend/` | Backend, rate limit, worker, storage, and workflow docs |

## Local Development

Run app commands from `web/`.

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`.

The committed lockfile is `web/package-lock.json`, so use npm unless the
project intentionally changes package managers.

## Common Commands

```bash
cd web

npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm test
npm run content:build
npm run submit:indexnow
```

Command meanings:

| Command | What it does |
| --- | --- |
| `npm run dev` | Watches content collections and starts Next.js dev server |
| `npm run build` | Builds content collections and production Next.js app |
| `npm run start` | Starts the production Next.js server |
| `npm run lint` | Builds content collections and runs ESLint |
| `npm run typecheck` | Builds content collections and runs TypeScript checks |
| `npm test` | Builds content collections and runs Vitest with coverage |
| `npm run content:build` | Builds content collection artifacts |
| `npm run submit:indexnow` | Submits IndexNow URLs using local env config |

## Environment Configuration

Start from `web/.env.example` and create `web/.env.local`.

Major configuration groups:

- Site: `NEXT_PUBLIC_SITE_URL`
- Clerk: publishable key, secret key, sign-in/sign-up URLs
- Convex: deployment and public Convex URL
- Cloudflare R2: account, bucket, access key, secret key, signed URL TTL
- Replicate/provider models: token and model IDs
- Rate limits: `RATE_LIMIT_API_SECRET`
- Post Bridge: API key encryption secret, base URL, media limits
- TikTok: pixel and Events API values
- PostHog: project token and host
- IndexNow and blog publish webhook secrets

Never commit real secrets or local environment files.

## Rate Limits And Abuse Protection

Any user-triggered backend operation that can create storage, compute,
bandwidth, provider cost, or destructive effects must be rate-limited before
the expensive work starts.

This includes:

- signed R2 URL creation
- uploads, downloads, and delete routes
- Replicate and other provider calls
- Convex writes
- generation jobs
- polling endpoints
- automation workflows
- scheduling and analytics sync routes

Preserve authorization separately from rate limits. A rate limit is not an
ownership check.

Rate-limit documentation lives in:

- `docs/backend/rate-limits.md`

## Coding Standards

This repository enforces Atomic Code Splitting: one file, one purpose.

Core rules:

- one React component per file
- one hook per file
- one utility/function per file
- shared types belong in dedicated type files unless strictly coupled to one
  export
- constants may be grouped only when they belong to one clear concept
- new files should go in the nearest relevant existing folder
- every new capability needs a matching feature doc
- user-facing copy must be simple, human, and non-technical

Read `coding-guidelines.md` before adding or restructuring code.

## Feature Documentation

Start here:

- `project-scope.md` for the full product scope and architecture decisions
- `web/README.md` for app-level setup notes
- `docs/product/positioning.md` for product positioning
- `docs/product/copywriting-guide.md` for user-facing language
- `docs/features/public-marketing-pages.md` for public landing-page UI and copy
- `docs/features/stitchr.md` for the primary workflow
- `docs/features/library.md` for the unified Library
- `docs/features/clipr.md` for Clipr generation rules
- `docs/features/swipr.md` for carousel generation
- `docs/features/swapr_scope.md` for Swapr scope
- `docs/features/quick-edit.md` for non-destructive source edits
- `docs/features/stitchr-batch.md` for automated draft creation
- `docs/features/stitchr-templates.md` for reusable Stitchr setups
- `docs/features/post-bridge-scheduling.md` for scheduling
- `docs/features/post-bridge-analytics.md` for analytics
- `docs/backend/rate-limits.md` for backend cost protection
- `docs/backend/durable-workflows.md` for provider workflow recovery
- `docs/backend/media-worker-deployment.md` for worker deployment
- `docs/media-bunny/media-bunny-llms.md` for Media Bunny implementation
- `docs/media-bunny/media-bunny-api.md` for exact Media Bunny TypeScript APIs

## Testing Expectations

Tests use Vitest. Keep tests scoped to the single-purpose unit being verified.

Important coverage areas:

- upload normalization
- 9:16 output dimensions
- poster generation
- R2 signed URL flows
- Convex metadata behavior
- Stitchr Hook/UGC-then-Demo export
- Stitchr batch selection
- text overlay rendering
- Quick Edit behavior
- Swipr carousel rendering and ZIP output
- provider job and rate-limit behavior
- dashboard route flows

Run:

```bash
cd web
npm test
```

## Deployment

The Next.js app can deploy to a standard Node-compatible host such as Vercel,
Netlify, or another Node.js platform.

Build command:

```bash
cd web
npm run build
```

Production server command:

```bash
cd web
npm run start
```

Before production deploys:

- set `NEXT_PUBLIC_SITE_URL` to the production domain
- configure Clerk
- configure Convex
- configure R2
- configure provider secrets and model IDs
- configure rate-limit secrets
- configure Post Bridge, TikTok, PostHog, and IndexNow values only when those
  features are enabled
- deploy Cloud Run worker jobs when worker code or shared worker backend code
  changes

Cloud Run worker deployment commands and smoke checks are documented in
`AGENTS.md` and backend deployment docs.

## Security Notes

- Do not commit uploaded media, generated outputs, secrets, or local env files.
- Dashboard routes are Clerk-authenticated.
- API routes must perform server-side auth checks.
- R2 access happens through signed URLs and owner-aware server routes.
- Paid provider calls must be gated by auth, ownership, rate limits, and budget
  checks before work starts.
- Browser codec support varies, so Media Bunny and WebCodecs support checks
  must stay visible to users when processing is not available.

## Current Status

The project is an active MVP implementation. The codebase already contains the
Next.js app, Convex backend functions, R2-backed media flows, Media Bunny
browser processing, dashboard routes, content routes, workers, tests, and
feature documentation. Some planning documents still describe phased rollout
items, so use the implementation files and feature docs together when checking
current behavior.
