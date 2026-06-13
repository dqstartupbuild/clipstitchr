# Stitchr Social Captions

Stitchr social captions give each stitch one editable caption field that holds
the feed caption and hashtags together.

## What It Does

When Stitchr auto-text runs, the writing model now returns:

- the visual overlay hook
- a caption hook that relates to the overlay
- 3-5 normalized hashtags
- one combined caption/hashtag text block for editing and copying

The caption is meant to be another hook for TikTok, Reels, or Shorts. It should
feel connected to the overlay hook and to what appears in the selected UGC and
demo clips.

Copy buttons for this field temporarily swap from the copy icon to a checkmark
after the clipboard write succeeds.

## User Flow

1. Select Stitchr source clips.
2. Generate text from the Stitchr auto-text panel.
3. Review or edit the caption and hashtags in the single caption field.
4. Create the stitch.
5. Open the saved stitch details later to read or copy the same caption and
   hashtags.
6. Open the saved stitch editor later to edit or copy the same field.

For reused stitches and templates, normal Stitchr mode treats the saved caption
like reused overlay text. It stays available even if the original UGC is
deselected, and newly selected UGC clips inherit it unless they get their own
caption edit.

## Implementation

The generated text contract is `CliprTextGeneration` in
`web/lib/clipstitchr/types/CliprTextGeneration.ts`. Stitchr-specific generation
uses clip context from:

- `web/lib/clipstitchr/types/StitchrTextGenerationClipContext.ts`
- `web/lib/clipstitchr/utils/createStitchrTextGenerationClipContext.ts`
- `web/lib/clipstitchr/server/readStitchrTextGenerationClipContexts.ts`
- `web/lib/clipstitchr/server/formatStitchrTextGenerationClipContext.ts`

`web/app/dashboard/stitchr/StitchrPageClient.tsx` sends selected UGC/demo
context to `POST /api/clipr/text`, stores generated captions by UGC id, and
passes each caption into `useStitchr` when the output is created.

Automated Stitchr generation uses the same writing contract through the
provider worker. `web/convex/automationStitchr.ts` snapshots UGC/Demo clip
descriptions and tags, `web/services/provider-worker/runProviderWorker.ts`
passes that context into `createCliprTextGeneration`, and
`web/services/media-worker/runMediaWorker.mjs` persists the generated caption
when it saves the editable Stitchr draft.

The prompt and parser live in:

- `web/lib/clipstitchr/server/createStitchrHookGenerationPrompt.ts`
- `web/lib/clipstitchr/server/parseCliprTextGenerationOutput.ts`
- `web/lib/clipstitchr/utils/createStitchSocialCaption.ts`
- `web/lib/clipstitchr/utils/getStitchrSocialCaptionForUgcId.ts`

Saved stitches store `socialCaption` in Convex through `web/convex/stitches.ts`
and `web/convex/schema.ts`. Templates copy the same field through
`web/convex/stitchTemplates/createStitchTemplateDocumentFromStitch.ts`.

The reusable caption field is
`web/app/_components/stitches/StitchSocialCaptionField.tsx`. Stitchr uses it
inside `web/app/_components/stitchr/StitchrSocialCaptionPanel.tsx`; saved
stitches use it inside `web/app/_components/dashboard/StitchEditDialog.tsx`.
The read-only detail view renders and copies the same saved text in
`web/app/_components/dashboard/StitchDetailsDialog.tsx`.

## Abuse Protection

Caption generation shares the existing `POST /api/clipr/text` hook/script
generation limit before provider work starts. Editing a saved stitch caption is
the Convex mutation `stitches.updateSocialCaption`, protected by the shared
`convexMetadataUpdate` limit.

## Maintenance Notes

Do not split captions and hashtags into separate user-facing fields unless the
product workflow changes. The current goal is one text block users can edit,
copy, paste, and keep with the saved stitch.

Because automated Stitchr captions run in the provider and media workers,
deploying Convex alone is not enough after changing this path. Redeploy both
worker images so queued automation can generate and save the caption/hashtag
field.
