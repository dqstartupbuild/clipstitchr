# PostHog Analytics

Last updated: July 13, 2026

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
| `auth_cta_clicked` | Header sign-in clicks | Tracks the sign-in action, header location, and desktop/mobile variant. |
| `pricing_cta_clicked` | Signed-out header pricing clicks | Tracks the fixed pricing destination, header location, and desktop/mobile variant. |
| `dashboard_cta_clicked` | Header dashboard CTA | Tracks header location and variant. |
| `waitlist_form_submitted` | Waitlist form submit | No name or email is sent in event properties. |
| `waitlist_joined` | Waitlist entry saved | Tracks created/updated status only. |
| `waitlist_join_failed` | Waitlist save fails | Tracks a simple error category only. |
| `tool_lead_accepted` | Public tool mailing-list request accepted | Fires only after the server returns its exact opaque accepted response and uses the fixed public-tool metadata contract below. |
| `app_hook_generator_submitted` | Public App Hook Generator request starts | Tracks only the selected edge level and whether this is the first or another set. |
| `app_hook_generator_completed` | Public App Hook Generator returns results | Tracks edge level, request kind, and the fixed result count; no submitted or generated text. |
| `app_hook_generator_failed` | Public App Hook Generator request fails | Tracks request kind and a simple rate-limited/request-failed category. |
| `dashboard_navigation_clicked` | Dashboard sidebar navigation | Tracks destination and label. |
| `upload_menu_opened` | Dashboard upload menu opens | Tracks current page path. |
| `upload_destination_selected` | Upload type chosen | Tracks asset type and destination. |
| `stitch_preview_viewed` | Stitch details/preview opened | Tracks stitch ID and non-content metadata. |
| `stitch_downloaded` | Stitch export download succeeds | Tracks stitch ID, duration, size, and option flags. |
| `stitch_scheduled` | Stitch schedule request succeeds in the browser | Tracks stitch ID, Post Bridge post ID, and platform count. |
| `stitch_deleted` | Stitch deletion is requested | Tracks stitch ID and non-content metadata. |
| `avatar_photos_generate_clicked` | Avatar photo generation button clicked | Tracks avatar ID, count, style, and lighting. |
| `avatar_created_from_clip` | Clip-to-avatar creation succeeds | Tracks clip ID and generation options. |
| `hook_lab_hook_used` | A generated Review hook is selected | No user-entered hook text is sent. |
| `hook_lab_hook_saved_as_idea` | A Review hook is explicitly saved as an Idea | No user-entered hook text is sent. |
| `hook_lab_hook_marked_not_for_me` | A Review hook is added to product avoid memory | No user-entered hook text is sent. |
| `hook_lab_idea_analysis_completed` | The live Ideas view observes an Idea move from analyzing to ready | Tracks source/scope enums and capability flags only. |
| `hook_lab_idea_analysis_failed` | The live Ideas view observes an Idea move from analyzing to failed or needs attention | Tracks source/scope enums and the terminal status only. |
| `hook_lab_idea_use_completed` | The current-use subscription reaches completed or partial | Tracks variation result counts; partial means at least one Stitch is ready. |
| `hook_lab_idea_use_failed` | The current-use subscription reaches failed with no ready Stitch | Tracks variation result counts only. |

Server-side product events:

| Event | Trigger | Notes |
| --- | --- | --- |
| `upload_url_requested` | R2 signed upload URL issued | Tracks kind, content type, and size. |
| `clipr_job_created` | Clipr generation job is created | Tracks job/product/avatar IDs, duration, requested/resolved mode, requested/resolved video model, voice ID, and music flag. |
| `clipr_job_failed` | Clipr job creation fails after starting | Tracks job/product/avatar IDs, resolved mode/model, and error name only. |
| `swapr_job_created` | Swapr job is created | Tracks prediction ID and generation options. |
| `avatar_photos_generation_requested` | Avatar photo generation API starts | Tracks count, style, lighting, speed tier, and model. |
| `sound_uploaded` | Private sound upload succeeds | Tracks source, content type, and size. |
| `post_bridge_post_scheduled` | Post Bridge schedule API succeeds | Tracks source type, source ID, Post Bridge post ID, platform count, queue mode, media size, and audio flag. |
| `post_bridge_analytics_synced` | Post Bridge analytics sync succeeds | No user-entered content is sent. |
| `hook_lab_idea_created` | An Idea is durably created | Tracks scope, source type, and platform enum only. |
| `hook_lab_idea_analysis_started` | An initial or retry analysis job is accepted | Tracks retry/source metadata only. |
| `hook_lab_idea_used` | An Idea use and its variants are created | Tracks requested variation count only. |

## Public Tool Gate Event Contract

The public-tool helper allowlists six event names:

| Event | Intended seam |
| --- | --- |
| `tool_started` | A visitor deliberately starts an interactive public tool. |
| `tool_result_displayed` | The assigned complete result or useful preview becomes visible. |
| `tool_gate_displayed` | An approved inline value exchange is shown. |
| `tool_lead_accepted` | The non-enumerating capture response is accepted. |
| `tool_resource_unlocked` | Approved browser-local value becomes available. |
| `tool_paid_cta_clicked` | A relevant paid ClipStitchr CTA is chosen. |

Every one of these events has exactly four app-provided properties. PostHog may
still add its standard consented session and page context:

| Property | Allowed value |
| --- | --- |
| `event_type` | The allowlisted event name. |
| `experiment_variant` | `control` or `hybrid-v1`. |
| `gate_mode` | `open-result`, `useful-preview`, `gated-portability`, or `email-native`. |
| `tool_key` | One fixed key from the fifty-tool catalog. |

The shared lead form emits `tool_lead_accepted`. Every tool-specific paid-plan
link uses the shared public-tool CTA wrapper, which preserves the existing
general CTA analytics and also emits `tool_paid_cta_clicked` with the page's
fixed tool key, gate mode, and assigned variant. The other names are available
only for explicit tool-result, gate, and unlock seams as those seams are wired.
The helper does not accept an open property bag, so callers cannot add name,
email, token, or result content. PostHog still receives nothing when analytics
consent is absent.

Eligible result-view, resource-unlock, and paid-CTA events may also request a
bounded server-side qualification interaction through the same-origin API. The
server reads its opaque recognition cookie itself; that token is never copied
into the PostHog event or browser JavaScript.

Hook Lab lifecycle completion/failure events are browser events because the
browser has the visitor's analytics-consent decision. They fire only when the
live Hook Lab view observes the transition; closing the page before completion
does not create a delayed event. A tab-session claim prevents React rerenders,
remounts, or repeated live-query snapshots from emitting the same lifecycle
twice. Events are not queued or backfilled when analytics consent is absent.

## Data Rules

Do not send user-entered media names, prompts, descriptions, or free-form error messages as event properties. IDs and non-content metadata are okay.

For public tools, do not send names, email addresses, app names, product
descriptions, audience details, hook or brief text, planning or cost numbers,
campaign metrics, creator quotes, worksheet notes, course progress, filenames,
video dimensions, codec details, sampled media signals, or generated results. The
public-tool event boundary accepts only `event_type`, `experiment_variant`,
`gate_mode`, and `tool_key`. It must not include created/duplicate status,
request failures, the local unlock marker, the HttpOnly recognition token, a
course-session token, confirmation token, course entitlement, or any other
property that could identify or enumerate an email address.

`/email/confirm` is a standalone HTML route rather than a React page. It loads
no PostHog script, emits no analytics event, uses no third-party resource, and
sends `Referrer-Policy: no-referrer` plus `Cache-Control: private, no-store`.
Its scanner-safe `GET` cannot record marketing consent; only the explicit
same-origin, CSRF-protected `POST` can do so.

For Hook Lab specifically, do not send source text, social URLs, usernames,
captions, extracted post data, Actor dataset contents, provider payloads, or
Idea, use, variant, Stitch, product, provider-job, or prediction IDs.

Identified PostHog profiles are only created after analytics consent. Signed-in users may be identified with account ID, email, and name for product analytics and support context.
