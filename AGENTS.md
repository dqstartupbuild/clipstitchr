# Repository Guidelines

## Project Structure & Module Organization

ClipStitchr is a browser-local Next.js MVP app under `web/`. The repository root contains project documentation:

- `project-scope.md` defines the MVP, target architecture, routes, data model, and video-processing decisions.
- `coding-guidelines.md` defines the required Atomic Code Splitting approach.
- `docs/media-bunny/media-bunny-llms.md` contains the full Media Bunny guide content. Read this first for Media Bunny workflows, recommended patterns, and conceptual guidance.
- `docs/media-bunny/media-bunny-api.md` contains the Media Bunny TypeScript API declarations. Use this as the source of truth for exact class names, option shapes, method signatures, and return types.

The app uses the planned Next.js shape from `project-scope.md`: app routes such as `/`, `/dashboard`, `/dashboard/stitchr`, `/dashboard/uploads`, and `/dashboard/stitches`; browser-first storage for MVP using IndexedDB; video processing via Media Bunny; upload normalization to TikTok 9:16; automatic generated poster images for video preview default states; and UGC-then-Demo stitching for preview, Stitchr, and download.

## Media Bunny Implementation Guidance

For any Media Bunny-related change, read the relevant parts of these files before editing code:

- Start with `project-scope.md` to confirm product behavior, especially 9:16 normalization, UGC-then-Demo sequencing, and MVP exclusions.
- Read `docs/media-bunny/media-bunny-llms.md` for implementation patterns from the official guides, such as reading files, conversions, media sinks, media sources, output formats, and codec support checks.
- Use `docs/media-bunny/media-bunny-api.md` to verify exact imports, constructor options, method signatures, and types before writing TypeScript.

Use Media Bunny's `Conversion` API for single-upload normalization from one input file to one normalized 9:16 output. Do not use `Conversion` for UGC + Demo stitching; create a fresh `Output`, read both normalized clips with sinks, re-timestamp samples, and write them with media sources as described in `project-scope.md`.

## Build, Test, and Development Commands

Run app commands from `web/`. Prefer the package manager indicated by the committed lockfile.

```bash
npm install
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
```

## Coding Style & Naming Conventions

Follow `coding-guidelines.md`. This project requires one file, one purpose:

- One React component per file.
- One hook, utility, action, or helper per file.
- Keep shared types in dedicated files unless they are exclusively coupled to one export.
- Split any file whose name needs "and" to describe its contents.

Use TypeScript for application code. Prefer descriptive PascalCase component names, camelCase functions and hooks, and route/file names that match the feature they own.

## Testing Guidelines

Vitest is configured. Colocate or mirror tests near the unit under test and keep them scoped to the single-purpose file being verified. Use clear names such as `VideoClipCard.test.tsx`, `normalizeVideo.test.ts`, or `stitchVideos.test.ts`.

Cover browser storage, Media Bunny upload normalization, TikTok 9:16 output dimensions, generated poster image behavior, UGC-then-Demo stitching, download output, and route-level dashboard flows before treating the MVP as complete. Text overlays are post-MVP, and user-authored thumbnail generation/editing is out of scope.

## Commit & Pull Request Guidelines

Current history uses direct, imperative commit messages, for example `Initial commit: add project scope documentation`. Keep messages concise and specific: `Add dashboard upload panel`, `Document IndexedDB clip model`.

Pull requests should include a short summary, testing performed, linked issue or task when available, and screenshots or recordings for UI changes. Note any changes to architecture decisions in `project-scope.md`.

## Security & Configuration Tips

Do not commit uploaded media, generated videos, secrets, or local environment files. Browser video processing depends on Media Bunny and browser codec support; document any codec polyfills, worker/WASM assets, or response-header changes with the Media Bunny setup.

## Abuse Protection & Rate Limit Requirements

Any future feature that adds or changes a user-triggered backend operation must account for abuse and rate limiting before implementation is considered complete. This includes Next.js API routes, Convex queries/mutations/actions, signed R2 URL flows, Replicate or other paid external API calls, file/object download or proxy routes, generation jobs, polling endpoints, destructive operations, and any workflow that can create storage, compute, bandwidth, or third-party API cost.

Required workflow:

- Identify the abuse surface and cost before editing code.
- Add or update server-side rate limits before expensive work happens. For R2, gate signed URL creation. For Replicate or other external APIs, gate before the provider call. For Convex writes, gate the mutation/action itself.
- Enforce per-user limits for fairness and global limits for shared provider or spend protection when a shared resource is involved.
- Preserve authorization and ownership checks separately from rate limits; rate limits do not replace access control.
- Return a clear `429` response with retry timing for HTTP routes where a rate limit is exceeded.
- Update `docs/backend/rate-limits.md` whenever limits, enforcement points, environment variables, or verification steps change.
- If a backend operation is intentionally not rate-limited, document the reason in `docs/backend/rate-limits.md`.
