# Stitchr Hook Lab

> Current implementation reference. The approved successor design that turns
> Hook Lab into a repeatable-Idea workspace and replaces Templates is documented
> in `docs/features/hook-lab-ideas.md`. Until that design is implemented, the
> behavior below describes the shipped feature.

Hook Lab exists because writing overlay text that does not sound fake is hard
for people who are not natural copywriters.

Public copy should lead with that painful moment, not with prompt memory or
model behavior.

## What It Does

Stitchr Hook Lab stores a small taste file on each product profile so generated
Stitchr hooks sound closer to what already works for that app, audience, and
founder taste.

New users must add at least one winning hook during onboarding before they move
to uploads. Existing users can add or change the same hook memory from the
dashboard Hook Lab page.

Hook Lab stores:

- winning hook examples the user wants ClipStitchr to learn from
- rejected hook examples the user wants ClipStitchr to avoid
- the main hook goal, such as views, clicks, comments, trust, or demo watches
- the tone level: safe, punchy, or bold

The onboarding copy tells users they can paste lines from posts that made them
stop scrolling, plus their own winners. The writing prompt treats those examples
as taste and emotional pattern, not as copy to reuse verbatim.

## User Workflow

1. New user adds product name and website.
2. Product review asks for Hook Lab examples before uploads are available.
3. User pastes at least one hook from their own winners or viral niche content.
4. User can add hooks to avoid, choose the goal, and choose the tone.
5. In Stitchr Normal or Longr mode, Generate text applies the best hook and
   saves the ranked hook options.
6. In Normal mode, the user can switch generated hooks from the Hook dropdown,
   save a hook as a winner, or add a hook to the avoid list.
7. In Batch mode, hook plans from the current generation appear with the same
   dropdown and accept/reject controls.
8. The Hook Lab history page paginates saved batches and keeps each batch's
   full option list inside a dropdown so review stays compact.
9. Saved normal and batch Stitches can be edited from the Library Stitches tab,
   where the user can choose another saved hook option for that Stitch.
10. Accepted hooks are saved as product winners. When the hook has a finished
   Stitch, ClipStitchr also saves that Stitch setup as a Template.
11. Batch and scheduled Stitchr drafts use the same saved product hook memory
   without asking the user again.

This is mostly a one-time setup step. Users only revisit it when they learn
which hooks performed better or when the product needs a different tone.

## Implementation

Product fields are stored on `products` in Convex:

- `winningHookExamples`
- `rejectedHookExamples`
- `hookGenerationGoal`
- `hookEdgeLevel`

The product API reads and normalizes those fields through:

- `web/lib/clipstitchr/server/readProductProfileInput.ts`
- `web/lib/clipstitchr/server/readProductHookExamples.ts`
- `web/lib/clipstitchr/server/readHookGenerationGoal.ts`
- `web/lib/clipstitchr/server/readHookEdgeLevel.ts`

Product forms reuse one focused component:

- `web/app/_components/hooks/ProductHookMemoryFields.tsx`

It appears in:

- `web/app/dashboard/hooks/HookLabPageClient.tsx`
- `web/app/_components/hooks/HookLabMemoryPanel.tsx`
- `web/app/_components/hooks/HookLabMemoryForm.tsx`
- `web/app/_components/onboarding/OnboardingProductReviewForm.tsx`
- `web/app/_components/products/ProductCreateDialog.tsx`

Stitchr text generation now returns ranked hook candidates and saves manual
generations to Hook Lab history through:

- `web/lib/clipstitchr/types/StitchrHookVariant.ts`
- `web/lib/clipstitchr/types/CliprTextGeneration.ts`
- `web/lib/clipstitchr/server/createStitchrHookGenerationPrompt.ts`
- `web/lib/clipstitchr/server/parseCliprTextGenerationOutput.ts`
- `web/app/api/clipr/text/route.ts`
- `web/lib/clipstitchr/client/generateCliprText.ts`
- `web/convex/stitchrHookPlans.ts`
- `web/lib/clipstitchr/hooks/useStitchrHookPlans.ts`
- `web/app/_components/stitchr/StitchrAutoTextPanel.tsx`
- `web/app/_components/stitchr/StitchrHookOptionSelector.tsx`
- `web/app/_components/stitchr/StitchrBatchHookReviewList.tsx`
- `web/app/dashboard/stitchr/StitchrPageClient.tsx`
- `web/app/_components/dashboard/StitchEditDialog.tsx`
- `web/app/_components/dashboard/StitchCard.tsx`
- `web/app/_components/hooks/HookLabPaginatedHistoryGrid.tsx`
- `web/app/_components/hooks/HookPlanOptionsDetails.tsx`
- `web/app/_components/hooks/HookPlanOptionItem.tsx`
- `web/lib/clipstitchr/constants/hookHistoryPageSize.ts`

Batch and automation task snapshots include the Hook Lab fields so provider
worker drafts match manual Stitchr generation:

- `web/convex/stitchrBatch.ts`
- `web/convex/automationStitchr.ts`
- `web/services/provider-worker/runProviderWorker.ts`

Batch and manual generations both store one selected hook plus the full ranked
option list in `stitchrHookPlans`. Each option can be marked as a winner or
added to the avoid list independently. Accepting a hook adds that exact option
to `winningHookExamples`; rejecting one adds that exact option to
`rejectedHookExamples`. The dashboard Hook Lab page shows the same option-level
controls, so batch-generated hooks no longer require accepting or rejecting the
single selected hook only.

Accepted hooks also try to create a Template automatically when the hook plan is
linked to a finished Stitch. The template uses the saved Stitch source clips,
trims, playback rates, audio settings, caption, and overlay styling, with the
accepted hook placed into the first text overlay. Duplicate templates for the
same source Stitch are skipped.

Normal Stitchr creation links the generated hook plan to the finished Stitch
after the render saves. Batch hook plans store the deterministic final Stitch id
from their automation task. The Library Stitches editor first matches by that
saved Stitch id and falls back to the UGC + Demo pair for older hook records.
Selecting a hook option in the editor updates the first text overlay in the
draft; the normal Save changes button persists that text to the Stitch.

Public copy appears on:

- `web/app/_components/landing/LandingHookLabSection.tsx`
- `web/app/_components/pricing/PricingGuaranteeSection.tsx`
- `web/content/case-studies/fitness-app-growth-case-study-guppy.mdx`

## Expected Results

Hook Lab should reduce generic and repeated Stitchr hooks because the model gets
product-specific taste examples and returns several ranked candidates instead of
one final line. It should not be treated as a guarantee that every generated
hook will outperform a manually chosen caption. The practical expectation is
less fake-sounding overlay text, fewer blank-page moments, and a clear place for
users to feed real performance learnings back into future generations.

## Abuse Protection

Hook Lab does not add a new paid endpoint.

Saving hook examples uses the existing product create/update paths:

- `POST /api/settings/products`
- `PATCH /api/settings/products/{id}`

Those routes already consume the product enrichment and website import limit
before Firecrawl or Replicate work starts.

Generating Stitchr hook options still uses `POST /api/clipr/text` and the
existing Clipr hook/script generation limit before provider writing work starts.
Saving manual hook options uses the shared Convex record-save limit. Linking,
switching, accepting, or rejecting hook options uses the shared Convex
metadata-update limit. Accepting a hook that creates a Template also consumes
the shared Convex record-save limit before inserting the template. None of those
selector actions call a provider.

## Maintenance Notes

Keep Hook Lab examples short and bounded. They are prompt memory, not a content
database.

If the Stitchr prompt shape changes, keep `hookVariants[0].text`,
`filledHook`, and `overlayText` aligned so manual Stitchr can apply the top hook
automatically while still showing alternatives.

If worker task snapshots change again, update both `stitchrBatch.ts` and
`automationStitchr.ts`, then redeploy the provider worker. Shared prompt/parser
changes should be shipped with the worker image that runs queued drafts.
