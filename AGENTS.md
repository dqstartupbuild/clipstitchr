# Repository Guidelines

## Project Structure & Module Organization

Clipr is currently in planning stage. The repository root contains project documentation:

- `project-scope.md` defines the MVP, target architecture, routes, data model, and video-processing decisions.
- `coding-guidelines.md` defines the required Atomic Code Splitting approach.

When implementation is added, keep the planned Next.js shape from `project-scope.md`: app routes such as `/`, `/dashboard`, and `/dashboard/create`; browser-first storage for MVP using IndexedDB; and video stitching via FFmpeg.wasm. Place source, tests, and assets in conventional framework directories once the app is scaffolded, and update this guide with exact paths.

## Build, Test, and Development Commands

No package manifest or build system exists yet. Do not invent commands until the scaffold is committed. After the Next.js app is created, document the canonical scripts from `package.json`, for example:

```bash
npm install
npm run dev
npm run build
npm test
```

Prefer the package manager indicated by the committed lockfile.

## Coding Style & Naming Conventions

Follow `coding-guidelines.md`. This project requires one file, one purpose:

- One React component per file.
- One hook, utility, action, or helper per file.
- Keep shared types in dedicated files unless they are exclusively coupled to one export.
- Split any file whose name needs "and" to describe its contents.

Use TypeScript for application code. Prefer descriptive PascalCase component names, camelCase functions and hooks, and route/file names that match the feature they own.

## Testing Guidelines

No testing framework is configured yet. When tests are introduced, colocate or mirror them near the unit under test and keep them scoped to the single-purpose file being verified. Use clear names such as `VideoClipCard.test.tsx` or `stitchVideos.test.ts`.

Cover browser storage, FFmpeg.wasm stitching, overlay timing, thumbnail export, and route-level dashboard flows before treating the MVP as complete.

## Commit & Pull Request Guidelines

Current history uses direct, imperative commit messages, for example `Initial commit: add project scope documentation`. Keep messages concise and specific: `Add dashboard upload panel`, `Document IndexedDB clip model`.

Pull requests should include a short summary, testing performed, linked issue or task when available, and screenshots or recordings for UI changes. Note any changes to architecture decisions in `project-scope.md`.

## Security & Configuration Tips

Do not commit uploaded media, generated videos, secrets, or local environment files. Browser video processing may require COOP/COEP headers for `SharedArrayBuffer`; document any header changes with the FFmpeg.wasm setup.
