# Stitchr Hook Lab

## What It Does

Stitchr Hook Lab stores a small taste file on each product profile so generated
Stitchr hooks sound closer to what already works for that account and niche.

New users must add at least one winning hook during onboarding before they move
to uploads. Existing users can add or change the same hook memory from product
Settings.

Hook Lab stores:

- winning hook examples the user wants ClipStitchr to learn from
- rejected hook examples the user wants ClipStitchr to avoid
- the main hook goal, such as views, clicks, comments, trust, or demo watches
- the tone level: safe, punchy, or bold

The onboarding copy explicitly tells users they can copy hooks from viral
content in their niche. The writing prompt treats those examples as taste and
emotional pattern, not as copy to reuse verbatim.

## User Workflow

1. New user adds product name and website.
2. Product review asks for Hook Lab examples before uploads are available.
3. User pastes at least one hook from their own winners or viral niche content.
4. User can add hooks to avoid, choose the goal, and choose the tone.
5. In Stitchr Normal or Longr mode, Generate text applies the best hook and
   shows alternate hook options.
6. User clicks any alternate hook to replace the active overlay.
7. Batch and scheduled Stitchr drafts use the same saved product hook memory
   without asking the user again.

This is mostly a one-time setup step. Users only revisit it when they learn
which hooks performed better or when they want a different tone for a product.

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

- `web/app/_components/settings/ProductHookMemoryFields.tsx`

It appears in:

- `web/app/_components/onboarding/OnboardingProductReviewForm.tsx`
- `web/app/_components/products/ProductCreateDialog.tsx`
- `web/app/_components/settings/ProductSettingsForm.tsx`
- `web/app/_components/settings/ProductSettingsEditDialog.tsx`
- `web/app/_components/settings/ProductSettingsDetailsDialog.tsx`

Stitchr text generation now returns ranked hook candidates through:

- `web/lib/clipstitchr/types/StitchrHookVariant.ts`
- `web/lib/clipstitchr/types/CliprTextGeneration.ts`
- `web/lib/clipstitchr/server/createStitchrHookGenerationPrompt.ts`
- `web/lib/clipstitchr/server/parseCliprTextGenerationOutput.ts`
- `web/app/api/clipr/text/route.ts`
- `web/lib/clipstitchr/client/generateCliprText.ts`
- `web/app/_components/stitchr/StitchrAutoTextPanel.tsx`
- `web/app/dashboard/stitchr/StitchrPageClient.tsx`

Batch and automation task snapshots include the Hook Lab fields so provider
worker drafts match manual Stitchr generation:

- `web/convex/stitchrBatch.ts`
- `web/convex/automationStitchr.ts`
- `web/services/provider-worker/runProviderWorker.ts`

Public copy appears on:

- `web/app/_components/landing/LandingHookLabSection.tsx`
- `web/app/_components/pricing/PricingGuaranteeSection.tsx`
- `web/content/case-studies/fitness-app-growth-case-study-guppy.mdx`

## Expected Results

Hook Lab should reduce generic and repeated Stitchr hooks because the model gets
account-specific taste examples and returns several ranked candidates instead
of one final line. It should not be treated as a guarantee that every generated
hook will outperform a manually chosen caption. The practical expectation is
less editing, more usable first drafts, and a clear place for users to feed
real performance learnings back into future generations.

## Abuse Protection

Hook Lab does not add a new paid endpoint.

Saving hook examples uses the existing product create/update paths:

- `POST /api/settings/products`
- `PATCH /api/settings/products/{id}`

Those routes already consume the product enrichment and website import limit
before Firecrawl or Replicate work starts.

Generating Stitchr hook options still uses `POST /api/clipr/text` and the
existing Clipr hook/script generation limit before provider writing work starts.
Choosing a candidate in the Stitchr panel is client-side overlay editing and
does not call a provider.

## Maintenance Notes

Keep Hook Lab examples short and bounded. They are prompt memory, not a content
database.

If the Stitchr prompt shape changes, keep `hookVariants[0].text`,
`filledHook`, and `overlayText` aligned so manual Stitchr can apply the top hook
automatically while still showing alternatives.

If worker task snapshots change again, update both `stitchrBatch.ts` and
`automationStitchr.ts`, then redeploy the provider worker. Shared prompt/parser
changes should be shipped with the worker image that runs queued drafts.
