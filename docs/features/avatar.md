# Avatar Model and Generation

## Product Shape

Avatars are reusable person identities for Swapr. An avatar is not a single photo. It is the named person profile that one or more avatar photos belong to.

Avatar photos are individual image assets for that avatar. Each photo can have its own outfit, location, pose, and upload context, but those details must not be mixed into the avatar identity description.

Avatar and Swapr features are secondary to the main Stitchr workflow. They exist
to create or improve source material that can become UGC-style inputs for
finished ad variants.

## Data Model

### Avatar

Each avatar stores identity-level fields:

- `id`
- `name`
- `description`
- `createdAt`
- `updatedAt`

The avatar description should describe only stable, non-sensitive visual traits of the person:

- face shape
- hair style and color
- facial hair when visible
- eyebrows
- eyes
- nose
- lips
- build
- distinctive non-sensitive visual features

The avatar description must not include:

- clothing or outfit details
- location or background details
- pose, posture, gesture, body position, or activity details
- private identity
- race, ethnicity, nationality, religion, gender identity, health, disability, or other sensitive guesses

### Avatar Photo

Each photo stores image-level fields:

- `avatarId`
- `name`
- `tags`
- `outfitDescription`
- `locationDescription`
- `poseDescription`
- image object references, thumbnail object references, dimensions, sizes, and preparation metadata

Outfit, location, and pose descriptions are per-photo metadata. They can help users understand and search images, but they should not be injected into generation prompts as identity context.

## Upload Flow

Avatar photo upload controls are hidden on the Avatars page until the user opens
them from the dashboard upload selector or a direct upload link.

When uploading avatar photos, the user stages photo files first, then creates or
selects the avatar the images belong to before saving. Staging files without an
avatar assignment must show an idle/ready state instead of failing the upload.

If the user creates a new avatar:

- They provide the avatar name before saving the staged upload.
- Upload analysis produces a clean avatar description and per-photo outfit/location/pose descriptions.
- The first uploaded photo can populate the avatar description if the avatar does not already have one.

If the user selects an existing avatar:

- New photos are attached to that avatar.
- Upload analysis stores outfit/location/pose on each photo.
- Existing avatar descriptions should not be overwritten unless a future explicit edit flow is added.

## Browsing and Selection

The Avatars dashboard page must provide an avatar selector dropdown for browsing photos, with `All avatars` as the default.

The Swapr photo selector must also provide an avatar selector dropdown, with `All avatars` as the default, so users can narrow the selectable images to one avatar.

## Swapr Source Videos

Swapr can use saved UGC clips and finished stitches as source motion. Product
demo videos are not valid Swapr source videos and must not appear in the Swapr
source selector or receive a `Use in Swapr` action.

## Generation Flow

The avatar photo generation UI supports:

- output count: `3`, `5`, or `10`
- style dropdown with `UGC` as the default style
- lighting dropdown
- optional location/scenario input
- optional context input for what the avatar should be doing or how they should pose

The Content Library UGC cards also support creating a new avatar from a UGC clip.
This flow uses the clip poster as the reference image and pre-fills the person
description from the clip metadata. Users can choose whether generation should
preserve the source person or create a similar but different person. Successful
outputs are saved as avatar photos under a newly created avatar.

Generation uses the selected source photo as the reference image, but the prompt should receive only the avatar identity description as identity text. It must not receive outfit, location, or pose information from the source photo as identity context.

The optional context input is generation-only prompt guidance. It should appear
in the generation controls, not in the empty state copy.

For each requested output image, ClipStitchr creates a unique variant:

- unique outfit description generated at request time
- location/scenario generated at request time unless the user entered one
- pose/action generated at request time unless the user entered context
- lighting generated at request time when the user selected `Any`
- selected style from the UI

`AVATAR_PHOTO_MODEL_ID` defaults to `openai/gpt-image-2` and can also target
`prunaai/z-image-turbo-img2img:5c958e90e0f904240629ee35c69196e3bd790b5528c0696705ebdb1656871dd8`.
Replicate `openai/gpt-image-2` supports `number_of_images` up to 10, but it
accepts a single prompt per prediction. To provide unique per-image prompts and
avoid grid/contact-sheet outputs, ClipStitchr runs one prediction per requested
output image with `number_of_images: 1`. The Pruna z-image-turbo img2img
workflow also runs one prediction per requested output, but sends the reference
photo as `image` with image-to-image settings instead of GPT Image 2
`input_images`.

Avatar generation speed is controlled by the shared generation speed profile:

- Creator runs 1 image prediction at a time.
- Pro runs up to 2 image predictions at a time.
- Studio runs up to 4 image predictions at a time.

All tiers still use one generated image per prediction. A future experiment can test combining multiple labeled variant prompts into one prompt, but that should not replace the current approach until output quality and prompt adherence are measured.

Each variant prompt must clearly request exactly one standalone image:

- one finished photo only
- no collage
- no contact sheet
- no grid
- no split panel
- no before/after layout
- no UI, text, captions, logos, or watermarks

Each successful generated image is saved as a new avatar photo attached to the same avatar.

## Backend and Rate Limits

Avatar photo generation is a user-triggered paid backend operation. It must be rate-limited before any Replicate prediction is created.

Each Replicate prediction created for avatar photo generation must be recorded in Convex as a Replicate job with the `avatar-photo` purpose. Status and output URL should be updated after completion so backend activity is auditable.

## Durability

Avatar photo generation must not depend on the browser staying open after
Replicate predictions are created.

Each `avatar-photo` job should store the avatar ID, source photo ID, generated
variant metadata, prediction ID, model ID, output URL, and final photo asset ID
after save. A server-side finalizer should download successful Replicate outputs,
upload them to R2, create the `photoAssets` record, and mark the job finalized.

The same finalizer should support both Replicate webhook delivery and manual
recovery of succeeded, unfinalized jobs. See
`docs/backend/durable-workflows.md`.
