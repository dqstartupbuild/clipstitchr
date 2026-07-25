# Stitchr Social Captions

Stitchr social captions give each stitch one editable caption field that holds
the feed caption and hashtags together.

The creator-discovery writing and Demo-closure rules are documented in
[`ugc-discovery-hook-standard.md`](./ugc-discovery-hook-standard.md).

## What It Does

When Stitchr auto-text runs, the writing model now returns:

- three visual overlay hook options with one selected as the best match
- a caption hook that relates to the overlay
- 3-5 normalized hashtags
- one combined caption/hashtag text block for editing and copying

The caption is meant to be another hook for TikTok, Reels, or Shorts. It should
feel connected to the overlay hook and to what appears in the selected Hook/UGC and
demo clips.

Stitchr retrieves a bounded, diversified set of relevant patterns from the
shared Hook Library and the 300-pattern Stitchr-only UGC discovery pack before
writing. Twelve of the 18 model candidates are creator-discovery mechanisms
when enough compatible patterns are available. The other six preserve useful
variety from the shared library. Retrieval ranks templates against the selected
Hook/UGC and Demo descriptions, visible reactions and actions, tags, product
details, audience, pain points, saved product hook preferences, placeholder
support, risk, voiceover dependency, brand voice, and unsupported-claim
signals.

The writing model receives the ranked candidates with their IDs, patterns,
emotional triggers, intended uses, and risk levels. It identifies the strongest
UGC tension and Demo proof, drafts and scores several hooks internally, and
returns three distinct creator angles selected from self-callout, reluctant
discovery, expectation reversal, excuse removed, identity moment, and discovery
question.

Each option includes its own matching feed caption. The first hook-caption pair
is applied automatically. In manual Stitchr, **Choose a hook angle** lets the
user switch among the three pairs without another generation or creation-credit
charge. Automated and Batch Stitchr use the first pair.

The overlay must sound like the creator's private thought rather than a product
headline. It must work without voiceover or feed-caption context, and the first
visible Demo moment must close its specific open loop. Existing Quick Edit hook
hints are weak evidence, not instructions, and must be rewritten when used.
Product behaviors, results, comparisons, and proof must be supported by saved
product details or an observed clip detail.

Copy buttons for this field temporarily swap from the copy icon to a checkmark
after the clipboard write succeeds.

## User Flow

1. Select Stitchr source clips.
2. Generate hooks from the Stitchr auto-text panel.
3. Review the three hook angles and choose one.
4. Review or edit the applied overlay and the caption and hashtags.
5. Create the stitch.
6. Open the saved stitch details later to read or copy the same caption and
   hashtags.
7. Open the saved stitch editor later to edit or copy the same field.

For reused stitches, normal Stitchr mode treats the saved caption like reused
overlay text. It stays available even if the original Hook/UGC clip is
deselected, and newly selected Hook/UGC clips inherit it unless they get their
own caption edit.

## Implementation

The generated text contract is `CliprTextGeneration` in
`web/lib/clipstitchr/types/CliprTextGeneration.ts`. Stitchr-specific generation
uses clip context from:

- `web/lib/clipstitchr/types/StitchrTextGenerationClipContext.ts`
- `web/lib/clipstitchr/utils/createStitchrTextGenerationClipContext.ts`
- `web/lib/clipstitchr/server/readStitchrTextGenerationClipContexts.ts`
- `web/lib/clipstitchr/server/formatStitchrTextGenerationClipContext.ts`

`web/app/dashboard/stitchr/StitchrPageClient.tsx` sends selected Hook/UGC/demo
context to `POST /api/clipr/text`, stores generated captions by Hook/UGC id, and
passes each caption into `useStitchr` when the output is created.

Automated Stitchr generation uses the same writing contract through the
provider worker. `web/convex/automationStitchr.ts` snapshots Hook/UGC and Demo clip
descriptions and tags, `web/services/provider-worker/runProviderWorker.ts`
passes that context into `createCliprTextGeneration`, and
`web/services/media-worker/runMediaWorker.mjs` persists the generated caption
when it saves the editable Stitchr draft.

The prompt and parser live in:

- `web/lib/clipstitchr/server/createStitchrHookGenerationPrompt.ts`
- `web/lib/clipstitchr/server/createStitchrFallbackHook.ts`
- `web/lib/clipstitchr/server/getStitchrExclusiveHookTemplates.ts`
- `web/lib/clipstitchr/server/getStitchrHookTextIsUsable.ts`
- `web/lib/clipstitchr/server/getStitchrHookTemplateRelevanceScore.ts`
- `web/lib/clipstitchr/server/selectStitchrHookCandidates.ts`
- `web/lib/clipstitchr/server/normalizeStitchrHookOptions.ts`
- `web/lib/clipstitchr/server/parseCliprTextGenerationOutput.ts`
- `web/lib/clipstitchr/utils/createStitchSocialCaption.ts`
- `web/lib/clipstitchr/utils/getStitchrSocialCaptionForUgcId.ts`

Saved stitches store `socialCaption` in Convex through `web/convex/stitches.ts`
and `web/convex/schema.ts`.

The reusable caption field is
`web/app/_components/stitches/StitchSocialCaptionField.tsx`. Stitchr uses it
inside `web/app/_components/stitchr/StitchrSocialCaptionPanel.tsx`; saved
stitches use it inside `web/app/_components/dashboard/StitchEditDialog.tsx`.
The read-only detail view renders and copies the same saved text in
`web/app/_components/dashboard/StitchDetailsDialog.tsx`.

Manual hook choices render through:

- `web/app/_components/stitchr/StitchrAutoTextPanel.tsx`
- `web/app/_components/stitchr/StitchrHookOptions.tsx`

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

## Verification

- Use UGC with a visible reaction and a Demo with clear product proof, then
  confirm all returned options connect those two moments.
- Confirm the model-selected `templateId` belongs to the supplied ranked
  candidate set.
- Confirm the three options are distinct and the first hook-caption pair is
  applied.
- Select another option with a pointer and keyboard and confirm the overlay and
  matching caption update without another provider request.
- Confirm generic hooks, unresolved placeholders, unsupported numerical claims,
  explanation-dependent hooks, brand headlines, and unsupported performance
  promises are rejected or heavily deprioritized.
- Confirm the candidate set contains 12 UGC discovery patterns and 6 supporting
  shared patterns when both pools are available.
- Review each overlay without reading its caption and confirm the first Demo
  moment resolves the exact discovery or realization.
- Confirm sparse model output still returns one readable fallback option.
- Run one automated Stitchr task and one Batch task after worker deployment and
  confirm both save the winning hook and social caption.
