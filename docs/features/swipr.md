# Swipr

Swipr is ClipStitchr's TikTok carousel generator. A Swipe is the saved,
editable carousel project created by Swipr. Unlike Stitchr outputs, a saved
Swipe does not store final rendered images. It stores the editable carousel
state so the user can reopen it, change the background, update slide text, add
or remove images, and download the latest saved version at any time.

## User Workflow

1. The user opens `/dashboard/swipr`.
2. The user chooses a saved Settings product as the product context.
3. The user chooses 3-8 carousel images.
4. The user chooses one photo for each carousel image:
   - A saved background from the shared Background Library.
   - Uploaded background images.
   - AI-generated background images from product context and an optional user
     prompt.
5. The user edits text independently on each carousel image.
6. The user can generate editable slide text from the shared hidden Clipr
   hook-template engine. The first slide uses the generated hook, and the
   remaining slides pay it off with supporting points. Swipr auto-text can draw
   from the product/ad hook library as well as non-promotional engagement
   templates, but the source names and template IDs stay hidden. The backend
   writing call uses `TEXT_WRITING_MODEL_ID`, which defaults to
   `anthropic/claude-sonnet-4.6`; `anthropic/claude-opus-4.6` is supported for
   higher-cost writing tests.
7. The user saves the editable Swipe.
8. The saved Swipe appears in the Content Library under the Swipes tab.
9. From the library, the user can open the Swipe detail view, swipe through its
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
- Fallback selected background ID for compatibility and default rendering.
- Slide count.
- Ordered slide records.
- Text overlay state for each slide.
- Created and updated timestamps.

Each slide stores only the editable data needed to render it again, including
its selected background ID when it differs from the saved fallback background.
The final PNG is rendered in the browser on demand when the user downloads the
Swipe.

## Download Behavior

The download action renders the currently saved version of the Swipe. It uses:

- The saved background image blobs loaded from R2.
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
- Detail action.
- Continue editing action.
- Delete action for the saved Swipe record.

The All tab includes Swipes with the other saved content types.

The Swipe detail view lets the user swipe or step through the saved carousel
images. The detail view renders previews from the saved editable data and the
saved background blob. It does not expose hidden background analysis metadata.

## Background Library

Swipr uses a shared Background Library. The Background Library contains seeded,
uploaded, and AI-generated backgrounds saved to R2 and described in Convex.

The Background Library is shared across all users:

- Any authenticated user can view and use saved backgrounds.
- Seeded, uploaded, and generated backgrounds are saved durably to R2.
- Users cannot delete shared background images from the library.
- The background metadata is searchable by all authenticated users.

Local starter backgrounds are not part of the current saved background model.
When a user generates or uploads a background for reuse, it becomes a shared
background asset.

Seeded backgrounds use deterministic seed plans from
`createSwiprBackgroundSeedPlans`. The seed catalog currently produces 1,000
planned backgrounds from 25 niches, 5 relevant scenes per niche, and 8 visual
styles. Each seed plan includes a provider prompt plus the same searchable
metadata the analysis route would normally create: name, tags, description,
details, category, preset, niche, style, and scene.

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

## Background Storage

Background binary data is stored in Cloudflare R2. Convex stores searchable
metadata and the R2 object reference.

Background records include:

- Stable background ID.
- Name.
- Source: seed, upload, or AI.
- R2 image object reference.
- Optional uploader owner ID for audit/debugging only.
- Tags generated by AI analysis or supplied by seed metadata.
- Hidden description generated by AI analysis or supplied by seed metadata.
- Hidden visual details generated by AI analysis or supplied by seed metadata.
- MIME type, size, width, and height.
- Created timestamp.

Because backgrounds are shared, background download authorization differs from
user-owned media. Authenticated users may request signed download URLs for
background objects recorded in the shared background table. Delete routes must
not allow users to delete shared background R2 objects.

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

Search in the Background Library should match against the name, tags,
description, and visual details.

Seeded backgrounds do not need to call the analysis route after generation. The
seed plan metadata is saved directly because it is already structured for search
and future category/filter selection.

In development, the Swipr Background panel exposes a `Seed 5` button. The
button calls `POST /api/dev/swipr/backgrounds/seed`, which is unavailable
outside `NODE_ENV=development`. Each click imports the next five missing seed
plans, skips seed IDs already saved in Convex, generates the image, uploads it
to the shared Swipr R2 prefix, and saves the prefilled seed metadata directly.

The Swipr creation page can upload multiple photos in one selection and
generate one AI photo per current carousel image. Each generated image consumes
the existing Swipr AI background generation limit, then follows the existing
analysis, R2 upload, and `swiprBackgrounds.save` path.

## Abuse Protection

Swipr persistence adds new cost surfaces:

- R2 signed upload URLs for background uploads and generated background saves.
- R2 signed download URLs for shared background previews and exports.
- GPT-4.1 mini background analysis.
- Convex record saves for shared backgrounds.
- Any future admin seed runner that generates and imports the 1,000-image
  background catalog.
- Convex record saves, updates, and deletes for user-owned Swipes.

Required protections:

- R2 signed URL requests remain authenticated and rate-limited before URL
  creation.
- Background analysis is rate-limited before calling Replicate.
- AI background generation remains rate-limited before calling Replicate.
- Seed catalog generation/import must be admin-only, batch-capped,
  checkpointed, and must not run through user-triggered background routes.
- Convex saves and updates consume existing record-save or metadata-update
  limits before writes.
- Shared backgrounds are not user-deletable.
- User-owned Swipes must be owner-scoped for list, get, save, update, and
  delete operations.

## MVP Constraints

- Swipr exports static 9:16 PNG carousel images in a ZIP.
- Each Swipe keeps a fallback background for compatibility, and each slide can
  use its own selected background image.
- Each slide has one text overlay.
- The carousel contains 3-8 images.
- Rendered PNG images are not stored.
- Background analysis metadata is hidden from users.
- Hook style names, template IDs, risk labels, and placeholder mechanics are
  hidden from users when Swipr auto-text is generated.
- Backgrounds are shared globally and cannot be deleted by users.
- Pinterest or stock background provider integration remains future scope.
