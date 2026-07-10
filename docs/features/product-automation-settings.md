# Product Automation Settings

Product automation settings let each product decide which daily tools run and
how those drafts should look. This exists because showing up consistently on
social is hard when the user does not like social.

Public copy should describe daily drafts as reviewable starting points, not as
autoposting or a promise that content runs itself. Account settings such as
appearance, support, and subscription remain shared across the whole account.

## What It Does

- Settings reads and saves automation preferences in the Product settings
  section for the active sidebar product.
- Each product can enable a different set of daily tools.
- Stitchr and Swipr can each prepare 3, 5, or 10 daily drafts per product.
- Tool-specific controls only appear after that tool is selected, and each
  selected tool keeps its settings behind a `{Tool} Config` button.
- Stitchr and Swipr each have their own text style, text color, background
  color, and outline color choices.
- Outline color appears in Settings for outline-capable styles, matching the
  editor controls.
- Stitchr daily drafts can allocate work to saved templates. Any unallocated
  draft count stays Random, so a 3-draft run can use 2 template-matched drafts
  and 1 fresh random draft.
- Swipr automation can use selected saved Pexels packs. If selected packs have
  usable images, the provider worker reuses those saved backgrounds. If no
  selected pack image is available, it falls back to Pexels search.
- Swipr automation uses the same carousel-writing prompt as Swipr page Batch
  mode, so automatic and on-demand drafts follow the same writing standard.
- Swipr Config lets the user save an optional topic/direction and choose the
  final-slide CTA: Any, Save this, Follow, Engagement, or Promote product.
- Generated Swipes include exactly one natural product mention on a non-final
  slide. Only the Promote product CTA repeats the product on the final slide.

## Product Scope

Automation preferences are stored in `automationPreferences` with an optional
`productId`. The planner lists enabled preferences and queues one run per
product preference. Run IDs and idempotency keys include the product scope, so
two products can both run Swipr with 10 drafts on the same day.

Queued automation tasks also store the product scope. Before a worker claims a
task, Convex checks the matching product preference again and skips the task if
automation was paused or the tool was removed after planning. Older queued tasks
that do not have task-level product scope fall back to their parent run's
`productId`.

Legacy owner-level automation preferences still work as a fallback until a user
saves settings for a product.

Uploaded UGC, product demos, generated Clipr clips, and generated Swapr clips
are product-scoped. Stitchr automation only pairs Hook/UGC and Demo clips that
belong to the same product.

## Generation Counts

The shared count type is `3 | 5 | 10`. The default remains 10.

- Stitchr uses the selected count when choosing Hook/UGC and Demo pairs.
- Swipr creates one provider task per selected draft count. Each task delegates
  text writing to the same batch generator used by the Swipr page and snapshots
  the saved topic/direction and CTA choice.
- Counts are capped by the existing maximum so new settings cannot exceed the
  current automation limit.

## Stitchr Template Allocation

The Stitchr Config panel lists the user's saved Stitchr templates with small
minus and plus buttons. Each template count reserves that many automated drafts
for the template's saved text overlay style and caption. The Random row is the
remaining count and always keeps the total equal to the selected draft count.

Saved allocations are owner-scoped. The client normalizes duplicate and stale
template entries before saving, and `automationPreferences.save` verifies that
every requested template belongs to the signed-in user before persisting the
settings.

## Text Styling

The settings UI writes separate fields for Stitchr and Swipr:

- text style
- text color
- background color
- outline color

The provider worker resolves `Any` choices deterministically from the task id
before it creates the final overlay.

## File Tree

- `web/app/_components/settings/SettingsAutomationPanel.tsx`
- `web/app/_components/settings/SettingsProductSection.tsx`
- `web/app/_components/settings/AutomationGenerationCountPicker.tsx`
- `web/app/_components/settings/AutomationStitchrTemplateAllocationPicker.tsx`
- `web/app/_components/settings/AutomationSwiprPackPicker.tsx`
- `web/app/_components/swipr/SwiprCreativeContextField.tsx`
- `web/app/_components/swipr/SwiprCallToActionStylePicker.tsx`
- `web/app/_components/settings/AutomationToolConfigDisclosure.tsx`
- `web/app/dashboard/settings/SettingsPageClient.tsx`
- `web/lib/clipstitchr/hooks/useAutomationPreferences.ts`
- `web/lib/clipstitchr/types/AutomationPreferencesInput.ts`
- `web/lib/clipstitchr/types/AutomationGenerationCount.ts`
- `web/lib/clipstitchr/types/AutomationStitchrTemplateAllocation.ts`
- `web/lib/clipstitchr/types/SwiprCallToActionStyle.ts`
- `web/lib/clipstitchr/utils/normalizeAutomationStitchrTemplateAllocations.ts`
- `web/convex/automationPreferences.ts`
- `web/convex/validators/automationStitchrTemplateAllocation.ts`
- `web/convex/automationPlannerCandidates.ts`
- `web/convex/automationScheduler.ts`
- `web/convex/automationStitchr.ts`
- `web/convex/automationSwipr.ts`
- `web/convex/automationClipr.ts`
- `web/convex/automationSwapr.ts`
- `web/convex/automationAvatarPhoto.ts`
- `web/lib/clipstitchr/server/createSwiprAutomationTextGeneration.ts`
- `web/services/provider-worker/runProviderWorker.ts`

## Abuse Protection

Tool-generation quotas are keyed by owner and product, so each product can use
its selected daily count. Provider spend and automatic asset-save limits remain
owner/global protections and still apply across all products. Swipr creative
context is capped at 1,000 characters before it is saved or copied into a task
snapshot.

## Source References

- `docs/features/product-switcher.md`
- `docs/features/swipr-pexels-pack-library.md`
- `docs/backend/rate-limits.md`
- `docs/backend/provider-automation-workflows.md`
