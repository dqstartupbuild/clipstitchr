# Product Automation Settings

Product automation settings let each product decide which daily tools run and
how those drafts should look. Account settings such as appearance, support, and
subscription remain shared across the whole account.

## What It Does

- Settings reads and saves automation preferences in the Product settings
  section for the active sidebar product.
- Each product can enable a different set of daily tools.
- Stitchr and Swipr can each generate 3, 5, or 10 automatic drafts per product.
- Stitchr and Swipr each have their own text style, text color, background
  color, and outline color choices.
- Outline color appears in Settings for outline-capable styles, matching the
  editor controls.
- Swipr automation can use selected saved Pexels packs. If selected packs have
  usable images, the provider worker reuses those saved backgrounds. If no
  selected pack image is available, it falls back to Pexels search.

## Product Scope

Automation preferences are stored in `automationPreferences` with an optional
`productId`. The planner lists enabled preferences and queues one run per
product preference. Run IDs and idempotency keys include the product scope, so
two products can both run Swipr with 10 drafts on the same day.

Legacy owner-level automation preferences still work as a fallback until a user
saves settings for a product.

## Generation Counts

The shared count type is `3 | 5 | 10`. The default remains 10.

- Stitchr uses the selected count when choosing UGC/Demo pairs.
- Swipr creates one provider task per selected draft count.
- Counts are capped by the existing maximum so new settings cannot exceed the
  current automation limit.

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
- `web/app/_components/settings/AutomationSwiprPackPicker.tsx`
- `web/app/dashboard/settings/SettingsPageClient.tsx`
- `web/lib/clipstitchr/hooks/useAutomationPreferences.ts`
- `web/lib/clipstitchr/types/AutomationPreferencesInput.ts`
- `web/lib/clipstitchr/types/AutomationGenerationCount.ts`
- `web/convex/automationPreferences.ts`
- `web/convex/automationPlannerCandidates.ts`
- `web/convex/automationScheduler.ts`
- `web/convex/automationStitchr.ts`
- `web/convex/automationSwipr.ts`
- `web/convex/automationClipr.ts`
- `web/convex/automationSwapr.ts`
- `web/convex/automationAvatarPhoto.ts`
- `web/services/provider-worker/runProviderWorker.ts`

## Abuse Protection

Tool-generation quotas are keyed by owner and product, so each product can use
its selected daily count. Provider spend and automatic asset-save limits remain
owner/global protections and still apply across all products.

## Source References

- `docs/features/product-switcher.md`
- `docs/features/swipr-pexels-pack-library.md`
- `docs/backend/rate-limits.md`
- `docs/backend/provider-automation-workflows.md`
