# Swipr

Swipr is ClipStitchr's TikTok carousel generator. A Swipe is the saved,
editable carousel project created by Swipr. Unlike Stitchr outputs, a saved
Swipe does not store final rendered images. It stores the editable carousel
state so the user can reopen it, change slide photos, update slide text, add
or remove slides, change each slide's photo, and download the latest saved
version at any time.

## User Workflow

1. The user opens `/dashboard/swipr`.
2. The user chooses a saved Settings product as the product context.
3. The user starts with the default slides, adds slides up to the max of 8, and
   can remove slides they do not need.
4. The user chooses one photo for the selected carousel image:
   - A Pexels photo from the built-in search panel.
   - A saved avatar photo.
   - Uploaded background images.
   - One AI-generated background image for the selected carousel image, using
     product context and an optional user prompt.
5. The user can copy the selected slide photo to every slide when the same
   image should be reused.
6. The user edits text independently on each carousel image.
7. The user can generate editable slide text from the shared hidden Clipr
   hook-template engine. The first slide uses the generated hook, and the
   remaining slides pay it off with supporting points. Swipr auto-text can draw
   from the product/ad hook library as well as non-promotional engagement
   templates, but the source names and template IDs stay hidden. The backend
   writing call uses `TEXT_WRITING_MODEL_ID`, which defaults to
   `anthropic/claude-sonnet-4.6`; `anthropic/claude-opus-4.6` is supported for
   higher-cost writing tests. The default generator mode writes text for all
   slides. The user can switch to selected-slide mode, which sends the previous
   and next slide text as context and updates only the selected slide.
8. The user saves the editable Swipe.
9. The saved Swipe appears in the Content Library under the Swipes tab.
10. From the library, the user can open the Swipe detail view, swipe through its
   images, download the current saved version, or continue editing it in Swipr.

## Saved Swipe Model

A Swipe is persisted as metadata and editable state in Convex. It must not save
the rendered PNG carousel images.

The saved record includes:

- Owner ID from Clerk/Convex auth.
- Stable Swipe ID.
- Display name.
- Saved Settings product ID.
- Product context snapshot used for export naming and prompt context.
- Fallback selected background ID for compatibility.
- Ordered slide records.
- Text overlay state for each slide.
- Created and updated timestamps.

Each slide stores only the editable data needed to render it again, including
its selected background ID. The ordered slide records determine the current
slide count.
The final PNG is rendered in the browser on demand when the user downloads the
Swipe.

## Download Behavior

The download action renders the currently saved version of the Swipe. It uses:

- The saved per-slide photo blobs loaded from R2.
- The saved ordered slide list.
- The saved text overlay for each slide.
- The existing 9:16 Swipr rendering pipeline.

The output remains a ZIP of 9:16 PNG files. Because the rendered images are not
persisted, any export after editing must first save the edited Swipe state if it
should become the version available from the library.

## Library Behavior

The Content Library includes a Swipes tab alongside All, UGC, Demo, Swaps, and
Stitches.

The Swipes tab shows saved Swipe cards with:

- Swipe title.
- Slide count.
- Background preview.
- Last updated date.
- Download action for the current saved version.
- Mark posted or active action.
- Detail action.
- Continue editing action.
- Delete action for the saved Swipe record.

The All tab includes Swipes with the other saved content types. Swipe posted
status is stored on the saved Swipe record and is separate from video clip
posted status.

The Swipe detail view lets the user swipe or step through the saved carousel
images. The detail view renders previews from the saved editable data and the
saved per-slide photo blobs. It stays within the mobile viewport and does not
require horizontal page scrolling. The Edit action opens the full Swipr editor
with the saved Swipe loaded, so the user can change slide text, change photos,
add slides, remove slides, save, and download again.

## Slide Photo Storage

Swipr no longer exposes a shared Swipr photo library. Pexels is the searchable
photo library users browse from the editor.

When a user chooses a Pexels photo, avatar photo, uploaded photo, or generated
AI photo, the selected image is saved as an owner-owned Swipr photo record in
Convex and R2. That record is not shown as a reusable shared gallery item for
other users. It exists so saved Swipes can reopen, render, and download later.

## AI Background Generation

`SWIPR_BACKGROUND_MODEL_ID` defaults to `openai/gpt-image-2`. It also supports
`prunaai/p-image` and `prunaai/wan-2.2-image`.

The generation route chooses the prompt framing and Replicate input schema from
the selected model:

- `openai/gpt-image-2` requests a 2:3 portrait image with GPT Image 2-specific
  inputs because the app crops the result to 9:16.
- `prunaai/p-image` requests direct 9:16 output with P-Image's text-to-image
  schema and uses a simplified photography-backdrop prompt.
- `prunaai/wan-2.2-image` requests direct 9:16 output with Wan 2.2 Image's
  text-to-image schema and uses a simplified photography-backdrop prompt.

The Pruna prompt path intentionally avoids downstream usage words such as app,
carousel, screen, mockup, text overlay, and social media because those models
can latch onto those terms and render UI-like layouts. The product context is
also sanitized before it is added to Pruna prompts.

Each AI background request also receives a product-aware variation brief. The
route classifies the product context into broad categories such as food,
fitness, beauty, home, software, or generic, then chooses a scene, lighting
setup, camera angle, surface, palette, composition, and background preset from
that category. The variation metadata is saved into hidden background details so
generated outputs can be inspected later without adding visible UI labels.

## Photo Storage

Photo binary data is stored in Cloudflare R2. Convex stores private
metadata and the R2 object reference.

Swipr photo records include:

- Stable background ID.
- Name.
- Source: upload, avatar-photo, Pexels, AI, or legacy seed records from the
  removed shared library.
- R2 image object reference.
- Uploader owner ID for authorization.
- Tags generated by AI analysis or supplied from Pexels/provider metadata.
- Hidden description generated by AI analysis or supplied from Pexels/provider
  metadata.
- Hidden visual details generated by AI analysis or supplied from
  Pexels/provider metadata.
- MIME type, size, width, and height.
- Created timestamp.

Signed download URLs are owner-scoped. A user can only request Swipr photo
download URLs for records they own.

The `seed` source remains in the schema only so production can tolerate old
shared-library records while the R2 objects and matching Convex documents are
cleaned up. Current Swipr UI and automation paths do not create, browse, or
reuse shared seed photos.

## Background Analysis

When a background is uploaded or generated, OpenAI GPT-4.1 mini through
Replicate analyzes the image before or during save. This mirrors the avatar
photo analysis flow but uses background-specific fields.

The analysis is not user-facing. It exists for search and future prompt
selection.

The hidden analysis should include:

- A short descriptive name when useful.
- 3-8 lowercase tags.
- A plain-language background description.
- Visual details such as setting, subject matter, composition, colors, texture,
  lighting, mood, available copy space, and product/category fit.

The Swipr creation page can upload multiple photos in one selection. Uploaded
photos are assigned across the current carousel images. AI generation is
intentionally single-slide only: the selected slide receives one generated
photo, and a user who wants AI photos on every slide must select each slide and
tap Generate.

Avatar photos can also be added to the selected slide. Avatar-photo Swipr
photo records are saved with source `avatar-photo` and remain visible only to
the owner who imported them.

## Pexels Search

Swipr can search Pexels through `POST /api/swipr/pexels/search`. The route:

- Requires an authenticated user.
- Consumes the `pexelsSearch` per-user and `pexelsSearchGlobal` shared limits
  before calling Pexels.
- Reads `PEXELS_API_KEY` server-side and sends it in the Pexels
  `Authorization` header.
- Calls `GET https://api.pexels.com/v1/search` with `orientation=portrait`.
- Returns only the photo fields needed by the client: ID, dimensions, Pexels
  URL, photographer credit/link, alt text, and source URLs.

When a user adds a Pexels photo, the client downloads the selected portrait
image, saves it through the existing Swipr background analysis/R2/Convex path,
and assigns it to the selected slide only. Pexels imports use source `pexels`,
are owner-owned, and keep the Pexels URL and photographer in hidden background
details for maintenance. The UI shows
“Photos provided by Pexels” and displays photographer credit on each result.

## Automation

Automatic Swipr generation uses Pexels for slide photos. The planner queues the
task when the user has an eligible product. The provider worker searches Pexels
from the product and audience context, saves owner-owned Pexels photo records,
generates text for the max 8 slides, and saves an editable Swipe draft. Each
automated slide receives its own saved Pexels photo ID.

## Abuse Protection

Swipr persistence adds new cost surfaces:

- R2 signed upload URLs for photo uploads and generated photo saves.
- R2 signed download URLs for owner-owned Swipr photo previews and exports.
- GPT-4.1 mini background analysis.
- Pexels API search requests.
- Provider-worker Pexels searches and owner-owned Swipr photo saves for
  automatic Swipr drafts.
- Convex record saves for owner-owned Swipr photos.
- Convex record saves, updates, and deletes for user-owned Swipes.

Required protections:

- R2 signed URL requests remain authenticated and rate-limited before URL
  creation.
- Background analysis is rate-limited before calling Replicate.
- AI background generation remains rate-limited before calling Replicate.
- Pexels search is rate-limited before calling Pexels.
- Automatic Swipr is protected by the Swipr automation daily/global budget
  before the provider worker calls Pexels or saves draft assets.
- Convex saves and updates consume existing record-save or metadata-update
  limits before writes.
- Swipr photo records and signed download URLs are owner-scoped.
- User-owned Swipes must be owner-scoped for list, get, save, update, and
  delete operations.

## MVP Constraints

- Swipr exports static 9:16 PNG carousel images in a ZIP.
- Each Swipe keeps a fallback background for compatibility, and each slide
  stores its selected photo ID.
- Each slide has one text overlay.
- The editor starts with 3 slides and supports up to 8 slides.
- Rendered PNG images are not stored.
- Background analysis metadata is hidden from users.
- Hook style names, template IDs, risk labels, and placeholder mechanics are
  hidden from users when Swipr auto-text is generated.
- Swipr photos are owner-owned and are not exposed as a shared searchable
  Swipr gallery.
- Pexels is the searchable user-facing photo library.
