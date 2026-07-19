# Swipr

Swipr is ClipStitchr's TikTok carousel generator. A Swipe is the saved,
editable carousel project created by Swipr. Unlike Stitchr outputs, a saved
Swipe does not store final rendered images. It stores the editable carousel
state so the user can reopen it, change slide photos, update slide text, add
or remove slides, change each slide's photo, and download the latest saved
version at any time.

## User Workflow

1. The user opens `/dashboard/swipr`.
2. Swipr opens in Batch mode by default. The user chooses a saved Settings
   product, chooses at least one saved Pexels pack, optionally adds a topic or
   creative direction, chooses the final-slide CTA style, and generates 10
   editable draft Swipes at once. Batch draft generation always creates 10
   draft Swipes, always requests the max Swipr slide count of 8, and the backend
   enforces both values even if an older client sends a different count or slide
   count.
3. The user can switch to Manual mode to build one Swipe by hand.
4. In Manual mode, the user starts with the default slides, adds slides up to
   the max of 8, and can remove slides they do not need.
5. The user chooses one photo for the selected carousel image:
   - A Pexels photo from the built-in search panel.
   - A saved Pexels query-pack photo imported from a previous search.
   - A saved avatar photo.
   - Uploaded background images.
   - One AI-generated background image for the selected carousel image, using
     product context and an optional user prompt.
6. The user can copy the selected slide photo to every slide when the same
   image should be reused.
7. The user edits text independently on each carousel image.
8. The user can generate editable slide text from the shared hidden Clipr
   hook-template engine. The first slide uses the generated hook, and the
   remaining slides pay it off with supporting points. Swipr auto-text can draw
   from the product/ad hook library as well as non-promotional engagement
   templates, but the source names and template IDs stay hidden. The backend
   writing call uses `TEXT_WRITING_MODEL_ID`, which defaults to
   `anthropic/claude-sonnet-4.6`; `anthropic/claude-opus-4.6` is supported for
   higher-cost writing tests. The default generator mode writes text for all
   slides. The user can switch to selected-slide mode, which sends the previous
   and next slide text as context and updates only the selected slide. Manual
   generation accepts the same optional topic/direction and final-slide CTA
   choice as Batch mode.
9. Swipr auto-text and batch-generated Swipes also generate one editable post
   text block containing a short caption, a substantial long-form description,
   and up to three useful hashtags. The description aims for 1000-2000
   characters because long post copy is part of the TikTok and Instagram
   carousel strategy. Emojis and hashtags are optional instead of being added
   to fill a template. Manual saves keep this single field editable and
   copyable.
10. The user saves the editable Swipe.
11. The saved Swipe appears in the Library under the Swipes tab.
12. From the library, the user can open the Swipe detail view, swipe through its
   images, download the current saved version, or continue editing it in Swipr.

## Carousel Writing Behavior

Full-carousel generation keeps the audience problem or desired outcome as the
main topic. Exactly one non-final slide mentions the saved product by name as a
subtle part of a useful list, routine, recommendation, example, or set of
steps. The product is not the hook or the whole carousel, and the prompt bans
invented personal use, results, testimonials, medical claims, statistics, and
studies.

The user controls the final slide independently:

- `Any` lets Swipr choose and vary a fitting CTA.
- `Save this` asks the viewer to save or bookmark the carousel.
- `Follow` asks the viewer to follow for more.
- `Engagement` asks for a natural comment, answer, like, share, or question.
- `Promote product` gives the saved product a direct final action.

Only `Promote product` may repeat the product on the final slide. The other CTA
styles keep the product mention to its single non-final placement.

The optional topic/direction field is a creative brief, not a source of verified
facts. It can steer topic, point of view, audience situation, and examples, but
cannot override output, safety, product-placement, or CTA rules.

Generated descriptions are deliberately substantial without being padded. Each
paragraph must contribute a new audience situation, explanation, consequence,
supported example, or practical step. The description must not restate every
slide or repeat the hook in different words. When the available context cannot
support 1000 useful characters without repetition or invention, the generator
may return shorter truthful copy. When generation omits a usable description,
the fallback is assembled once from the caption, audience, problem, and slide
text. The fallback is not padded with generic advice.

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
- Optional caption, long post description, hashtags, combined social copy, and
  performance note generated by Swipr.
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

The Library includes a Swipes tab alongside UGC, Demo, Swaps, Stitches,
Avatars, and Pexels.

In the grouped Library navigation, saved Swipes are labeled as Carousels under
Finished so users can find finished image posts without knowing the internal
tool name first.

The Swipes tab shows saved Swipe cards with:

- Swipe title.
- Slide count.
- Background preview.
- Last updated date.
- Caption, description, and hashtag preview when they exist.
- Download action for the current saved version when all saved photos still
  exist.
- Mark posted or active action.
- Detail action.
- Continue editing action.
- Delete action for the saved Swipe record.

Saved Swipe cards expose Continue editing as the visible primary action. The
details, download, schedule, posted-state, and delete actions remain available
from the card action menu.

Swipe posted status is stored on the saved Swipe record and is separate from
video clip posted status.

If a user deletes a Pexels pack or another saved photo that a Swipe still
references, the Swipe stays visible in the library with a missing-photo state
instead of disappearing from the list. Missing-photo Swipes keep their Edit and
Delete actions so the user can choose new photos or remove the saved Swipe.
Download is disabled until every referenced photo exists again.

The Swipe detail view lets the user swipe or step through the saved carousel
images. The detail view renders previews from the saved editable data and the
saved per-slide photo blobs. It also shows saved caption, description, and
hashtags in one copyable field, plus the generation note when they exist. It
stays within the mobile viewport and does not require horizontal page
scrolling. The Edit action opens Swipr with
`mode=edit` and the saved Swipe ID. That special edit mode hides the Batch and
Manual tabs, loads the saved Swipe into the editor, and lets the user change
slide text, change photos, add slides, remove slides, save, and download again.

When a saved Swipe is opened for editing, Swipr loads the saved slide photo IDs
directly if the current in-memory photo list is missing one. The editor fetches
the accessible Convex photo record by ID, downloads the R2 blob through the
existing signed Swipr photo download path, and adds the loaded asset back to the
local Swipr background list before rendering the slide. Private upload, AI, and
avatar-photo backgrounds remain owner-scoped. Pexels backgrounds in saved packs
are globally readable so any user can preview and adopt shared packs.

When a generated Swipe is edited and saved again, Swipr preserves its existing
social copy and performance note unless the user edits the social copy field.
Manual Swipes created from scratch can add or copy social copy from the same
single caption, description, and hashtag field.

## Slide Photo Storage

Swipr no longer exposes a generic shared Swipr photo library. Pexels packs are
managed from the Library Pexels tab and selected from Swipr Batch mode.

When a user chooses a Pexels photo in Manual mode, avatar photo, uploaded photo,
or generated AI photo, the selected image is saved as a Swipr photo record in
Convex and R2. Non-Pexels records stay private to the owner. Pexels records with
a `libraryQuery` belong to a global pack that other users can browse and add to
their own account.

Pexels query imports are the reusable pack path. The user can import a Pexels
search query from the Library Pexels tab, and each imported photo is saved with
`source: "pexels"` and `libraryQuery` set to the trimmed query. The importer is
automatically given that pack in their Mine list. Other users can find the pack
under All and add it to Mine for Swipr batch generation and automation.

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
- Optional Pexels query pack name in `libraryQuery`.
- R2 image object reference.
- Uploader owner ID for authorization.
- Tags generated by AI analysis or supplied from Pexels/provider metadata.
- Hidden description generated by AI analysis or supplied from Pexels/provider
  metadata.
- Hidden visual details generated by AI analysis or supplied from
  Pexels/provider metadata.
- MIME type, size, width, and height.
- Created timestamp.

Signed download URLs are owner-scoped for private Swipr photos. Pexels photos
with a pack name are globally readable because the Library Pexels tab must show
shared imported packs to every authenticated user.

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

The Library Pexels tab and manual Swipr editor can search Pexels through
`POST /api/swipr/pexels/search`. The route:

- Requires an authenticated user.
- Consumes the `pexelsSearch` per-user and `pexelsSearchGlobal` shared limits
  before calling Pexels.
- Reads `PEXELS_API_KEY` server-side and sends it in the Pexels
  `Authorization` header.
- Calls `GET https://api.pexels.com/v1/search` with `orientation=portrait`.
- Accepts a clamped `page` value so the editor can load later Pexels result
  pages for the same query instead of showing the same first results every
  time.
- Returns only the photo fields needed by the client: ID, dimensions, Pexels
  URL, photographer credit/link, alt text, and source URLs.

The Pexels search UI shows a Load more button when a page returns a full result
set. Load more requests the next Pexels page and appends new photo IDs.
Already-imported global Pexels photos are hidden from the visible result list.
Library imports save the visible loaded results for the query, so a user can
load more pages and import those new photos as a reusable pack.

When a user adds a Pexels photo, the client downloads the selected portrait
image, saves it through the existing Swipr background analysis/R2/Convex path,
and assigns it to the selected slide only. Pexels imports use source `pexels`
and keep the Pexels URL and photographer in hidden background details for
maintenance. The UI shows
“Photos provided by Pexels” and displays photographer credit on each result.

Swipr can also import a full query through
`POST /api/swipr/pexels/import`. The import route saves Pexels photos directly
to R2 and Convex with `libraryQuery` set to the query. If the normalized query
already matches an existing global pack, the import reuses that pack name. The
Library Pexels tab shows saved query packs with cover images, lets the user
filter All or Mine, lets the user add global packs to Mine, and lets users
click any pack to view its photos. Removing a pack or photo only removes it
from that user's account copy; the global pack and images remain available to
everyone.

## Batch Draft Generation

`POST /api/swipr/drafts/generate` creates multiple editable Swipe drafts from
saved Pexels packs. It requires a saved Settings product and at least one
account-added Pexels pack with saved photos.

The Batch tab is the default UI for this route. It does not expose manual slide
controls or a draft-count input. It sends the selected pack names, bounded
creative context, and CTA choice, and the server creates 10 generated draft
Swipes with the max Swipr slide count of 8.

The route:

- Consumes counted text-generation quota before provider work.
- Loads the selected product and the user's account-added Swipr backgrounds.
- Requires selected Pexels query packs.
- Uses compact account-pack summaries for picker names and exact available
  photo counts without loading pack photos for the labels.
- Loads up to 500 compact photo records from each selected pack for generation,
  so every photo in current packs participates in randomized selection.
- Generates multiple slideshow text drafts with a SlideSmith-style prompt that
  writes complete, distinct slide decks without exposing internal template IDs.
  Every deck follows the shared product-placement and final-slide CTA rules.
- Randomizes saved Pexels background IDs for each deck. The batch first picks a
  random preview-photo order, then each Swipe uses a shuffled non-repeating
  background cycle. If a selected pack has fewer photos than the slide count,
  repeats only happen after the available photos have been used.
- Saves every generated deck through `swipes.save`, so it can be reopened and
  edited like a manually saved Swipe.

The editor still keeps manual generation controls separate. The selected-slide
text toggle updates only the active slide and uses surrounding slide text as
context. Batch draft generation creates new saved drafts and does not overwrite
the currently open Swipe.

## Automation

Automatic Swipr generation can use selected Mine Pexels packs for slide photos.
The planner queues one batch task when the user has an eligible product. The
provider worker sends the full requested draft count through one shared text
generation request, matching page Batch mode's ability to make the carousels
distinct and vary automatic CTA choices across the batch. It then saves every
returned carousel as its own editable Swipe. If selected
packs are available, the provider worker randomizes those saved background IDs
with the same non-repeating cycle used by batch generation. If no selected pack
backgrounds are available, it searches a larger Pexels candidate set from the
product and audience context, randomly picks the max 8 photos, saves private
one-off Pexels photo records, generates text with the same carousel-writing
prompt used by Swipr page Batch mode, and saves an editable Swipe draft.
Automation Settings persist the optional Swipr topic/direction and final-slide
CTA style. Daily task snapshots carry those bounded values to
the provider worker so delayed work uses the choices captured at planning time.

## Abuse Protection

Swipr persistence adds new cost surfaces:

- R2 signed upload URLs for photo uploads and generated photo saves.
- R2 signed download URLs for private Swipr photo previews, global Pexels pack
  previews, and exports.
- GPT-4.1 mini background analysis.
- Pexels API search requests.
- Pexels query-pack imports, including image downloads, R2 writes, and Convex
  background saves.
- Batch Swipr draft generation, including counted text-writing provider calls
  and Convex Swipe saves.
- Provider-worker Pexels searches and private Swipr photo saves for automatic
  Swipr drafts. One automatic run uses one shared batch text request for its
  requested draft count instead of isolated one-draft provider requests.
- Convex record saves for private and global Swipr photos.
- Convex record saves, updates, and deletes for user-owned Swipes.

Required protections:

- R2 signed URL requests remain authenticated and rate-limited before URL
  creation.
- Background analysis is rate-limited before calling Replicate.
- AI background generation remains rate-limited before calling Replicate.
- Pexels search is rate-limited before calling Pexels.
- Pexels query imports are rate-limited by requested image count before
  downloading or saving images. Loaded-photo imports do not call Pexels search
  again because the page results were already loaded through the search route.
- Pexels pack add/remove account actions and account-only photo removals
  consume existing Convex metadata-update limits before changing account-pack
  rows or user-specific photo exclusion rows.
- The Library Pexels catalog reads bounded pack summaries, and opening a pack
  reads only that pack's bounded compact photo cards. These authenticated,
  indexed, cached reads do not receive a write-backed rate bucket. Cover
  downloads retain the existing signed-R2 limits.
- Settings and Swipr Batch use the compact account-pack counts for their pack
  labels. Settings does not load pack photo records.
- Batch draft generation consumes counted text-generation quota before the
  writing provider is called.
- Automatic Swipr is protected by the Swipr automation daily/global budget
  before the provider worker calls Pexels or saves draft assets.
- Convex saves and updates consume existing record-save or metadata-update
  limits before writes.
- Private Swipr photo records and signed download URLs are owner-scoped.
- Global Pexels pack photo records are readable by authenticated users.
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
- Private Swipr photos are owner-owned and are not exposed as a shared
  searchable Swipr gallery.
- Pexels is the searchable user-facing photo library.
- Pexels query packs are global imported groups that users add to their Mine
  list before using in Swipr Batch mode or automation.
