<wizard-report>
# PostHog post-wizard report

Follow-up consent wiring has been added after the wizard run. The durable
tracking plan and consent rules now live in `../docs/integrations/analytics/posthog.md`.
PostHog is gated by the `analytics` cookie category on both browser and server
captures.

The wizard has completed a deep integration of PostHog analytics into ClipStitchr. Here's a summary of all changes made:

**Core setup:**
- Created `instrumentation-client.ts` at the project root — initializes `posthog-js` on the client side using the Next.js 15.3+ instrumentation pattern, with reverse proxy routing and exception capture enabled.
- Created `lib/posthog-server.ts` — a lightweight server-side PostHog client factory using `posthog-node`, configured for immediate flushing (no batching) to work correctly in short-lived serverless functions.
- Updated `next.config.ts` — added `/ingest/*` reverse proxy rewrites so PostHog requests route through your own domain (less likely to be blocked by ad blockers), and set `skipTrailingSlashRedirect: true` as required by PostHog.
- Set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` in `.env.local`.

**Client-side events:**
- `app/_components/dashboard/StitchCard.tsx` — tracks stitch preview views, downloads (with exception capture on failure), and deletions.
- `app/_components/avatars/AvatarGenerationPanel.tsx` — tracks avatar photo generation button clicks with style and count context.
- `app/_components/dashboard/CreateAvatarFromClipDialog.tsx` — tracks successful avatar creation from a clip.

**Server-side events (6):**
- `app/api/clipr/jobs/route.ts` — tracks `clipr_job_created` on success and `clipr_job_failed` on error, each with job/product/avatar context and the authenticated user's distinct ID.
- `app/api/swapr/jobs/route.ts` — tracks `swapr_job_created` with mode, speed tier, and prediction ID.
- `app/api/avatars/photos/generate/route.ts` — tracks `avatar_photos_generation_requested` with count, style, and model context.
- `app/api/r2/upload-url/route.ts` — tracks `upload_url_requested` with kind, content type, and file size.

---

## Event inventory

| Event | Description | File |
|---|---|---|
| `stitch_preview_viewed` | User opens the preview/details dialog for a stitch — top of the stitch conversion funnel. | `app/_components/dashboard/StitchCard.tsx` |
| `stitch_downloaded` | User successfully downloads an exported stitch file. | `app/_components/dashboard/StitchCard.tsx` |
| `stitch_deleted` | User deletes a stitch from the dashboard. | `app/_components/dashboard/StitchCard.tsx` |
| `avatar_photos_generate_clicked` | User clicks the Create Photos button in the avatar generation panel. | `app/_components/avatars/AvatarGenerationPanel.tsx` |
| `avatar_created_from_clip` | User successfully submits the Create Avatar from Clip dialog. | `app/_components/dashboard/CreateAvatarFromClipDialog.tsx` |
| `clipr_job_created` | Server: a Clipr AI video generation job was successfully started. | `app/api/clipr/jobs/route.ts` |
| `clipr_job_failed` | Server: a Clipr AI video generation job failed. | `app/api/clipr/jobs/route.ts` |
| `swapr_job_created` | Server: a Swapr face/motion-swap job was successfully queued. | `app/api/swapr/jobs/route.ts` |
| `avatar_photos_generation_requested` | Server: avatar photo generation was successfully initiated via the API. | `app/api/avatars/photos/generate/route.ts` |
| `upload_url_requested` | Server: a signed R2 upload URL was issued, meaning an upload started. | `app/api/r2/upload-url/route.ts` |

## Next steps

We've built a dashboard and five insights to keep an eye on user behavior, based on the events just instrumented:

- [Analytics basics dashboard](/dashboard/1591369)
- [AI Job Volume (Clipr & Swapr)](/insights/YWXabZWj) — daily Clipr and Swapr job creation trends
- [Clipr Job Failure Rate](/insights/RaEnlIcU) — percentage of Clipr jobs that fail, a key reliability signal
- [Stitch Engagement Funnel](/insights/lpwwj1zh) — conversion from stitch preview → download
- [Avatar Generation Activity](/insights/pnbwkPcJ) — avatar photo generate clicks and clip-to-avatar creation
- [Upload Activity](/insights/8jnyEP19) — video and media upload volume

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
