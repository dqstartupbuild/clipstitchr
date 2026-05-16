# PostHog Analytics

Last updated: May 16, 2026

## Consent

PostHog is tied to the `analytics` cookie category. The browser SDK starts opted out and does not persist or capture until a visitor accepts analytics cookies.

If a visitor chooses essentials only, PostHog capture stays off and any PostHog user identity is reset. Server-side PostHog events also check the same consent cookie before sending events.

Marketing consent is separate. TikTok uses the `marketing` category.

PostHog autocapture, pageleave, scroll depth properties, exceptions, and
performance capture are enabled after analytics consent. Autocapture masks text
and ignores sensitive element attributes, so explicit events are still the
source of truth for button labels, feature names, and funnel context.

## Environment

Set these in the web app environment:

```bash
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Client events are proxied through `/ingest` by the Next.js rewrites.

## Captured Events

Core browser tracking:

| Event | Trigger | Notes |
| --- | --- | --- |
| `$pageview` | Route changes after analytics consent | Includes page path, URL, title, and page category. |
| `$pageleave` | Browser page hide/unload after analytics consent | Supports bounce rate, session duration, and final scroll-depth properties. |
| `$prev_pageview_*_scroll*` | Attached to following `$pageview` or `$pageleave` events | Built-in PostHog scroll-depth properties remain enabled with `disable_scroll_properties: false`. |
| `cta_clicked` | Landing page CTA links | Tracks CTA ID, label, location, and destination. |
| `auth_cta_clicked` | Header sign-in/sign-up clicks | Tracks action, header location, and desktop/mobile variant. |
| `dashboard_cta_clicked` | Header dashboard CTA | Tracks header location and variant. |
| `waitlist_form_submitted` | Waitlist form submit | No name or email is sent in event properties. |
| `waitlist_joined` | Waitlist entry saved | Tracks created/updated status only. |
| `waitlist_join_failed` | Waitlist save fails | Tracks a simple error category only. |
| `dashboard_navigation_clicked` | Dashboard sidebar navigation | Tracks destination and label. |
| `upload_menu_opened` | Dashboard upload menu opens | Tracks current page path. |
| `upload_destination_selected` | Upload type chosen | Tracks asset type and destination. |
| `stitch_preview_viewed` | Stitch details/preview opened | Tracks stitch ID and non-content metadata. |
| `stitch_downloaded` | Stitch export download succeeds | Tracks stitch ID, duration, size, and option flags. |
| `stitch_music_generated` | Stitch music generation succeeds | Tracks stitch ID. |
| `stitch_deleted` | Stitch deletion is requested | Tracks stitch ID and non-content metadata. |
| `avatar_photos_generate_clicked` | Avatar photo generation button clicked | Tracks avatar ID, count, style, and lighting. |
| `avatar_created_from_clip` | Clip-to-avatar creation succeeds | Tracks clip ID and generation options. |

Server-side product events:

| Event | Trigger | Notes |
| --- | --- | --- |
| `upload_url_requested` | R2 signed upload URL issued | Tracks kind, content type, and size. |
| `clipr_job_created` | Clipr generation job is created | Tracks job/product/avatar IDs and options. |
| `clipr_job_failed` | Clipr job creation fails after starting | Tracks job/product/avatar IDs and error name only. |
| `swapr_job_created` | Swapr job is created | Tracks prediction ID and generation options. |
| `avatar_photos_generation_requested` | Avatar photo generation API starts | Tracks count, style, lighting, speed tier, and model. |
| `library_music_generated` | Music track generation succeeds | Tracks track ID, source, style, and duration. |

## Data Rules

Do not send user-entered media names, prompts, descriptions, or free-form error messages as event properties. IDs and non-content metadata are okay.

Identified PostHog profiles are only created after analytics consent. Signed-in users may be identified with account ID, email, and name for product analytics and support context.
