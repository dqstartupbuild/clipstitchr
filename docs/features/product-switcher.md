# Product Switcher

Products are global dashboard projects. The active product is selected from the
dashboard sidebar and is used across the app for library content, avatars,
Stitchr, Clipr, Swipr, and Swapr.

## What It Does

- The sidebar product switcher shows the active product and lets the user switch
  products globally.
- The same switcher can create a new product. New products become active right
  away.
- Settings stays account-focused for appearance, support, subscription, and
  automation. Product creation no longer lives on the Settings page.
- Uploaded UGC, demo clips, generated Clipr clips, generated Swapr clips,
  stitches, avatars, avatar photos, and saved Swipes are scoped to the active
  product.
- Swipr background packs remain account-wide so they can be used across
  products.
- Favorite avatars are product-specific, so each product can have its own main
  avatar.
- Existing unscoped content is assigned to the first active product. If an
  existing user has content and no product, a required product dialog appears
  before they continue.

## Implementation

- `web/app/dashboard/DashboardProductProvider.tsx` loads products, exposes the
  active product context, opens the required setup dialog, and starts legacy
  backfill when needed.
- `web/app/_components/dashboard/DashboardProductSwitcher.tsx` renders the
  sidebar switcher and product creation entry point.
- `web/app/_components/products/ProductCreateDialog.tsx` is the shared product
  creation dialog.
- `web/convex/products.ts` creates products, reports setup state, and assigns
  legacy content to the primary product.
- `web/convex/assignLegacyRecordsToProduct.ts` patches old records that do not
  have a product ID.
- `web/convex/videoClips.ts`, `web/convex/stitches.ts`,
  `web/convex/photoAssets.ts`, `web/convex/avatars.ts`, and
  `web/convex/swipes.ts` filter and save product-scoped records.
- `web/lib/clipstitchr/hooks/useClipLibraryState.ts`,
  `web/lib/clipstitchr/hooks/usePhotoLibraryState.ts`, and
  `web/lib/clipstitchr/hooks/useSwiprLibraryState.ts` receive the active
  product from the dashboard provider and use it in Convex queries.

## File Tree

- `web/app/_components/dashboard/DashboardProductSwitcher.tsx`
- `web/app/_components/products/ProductCreateDialog.tsx`
- `web/app/dashboard/DashboardProductProvider.tsx`
- `web/lib/clipstitchr/context/DashboardProductContext.ts`
- `web/lib/clipstitchr/hooks/useDashboardProduct.ts`
- `web/lib/clipstitchr/types/DashboardProductContextValue.ts`
- `web/convex/assignLegacyRecordsToProduct.ts`
- `web/convex/getOwnerHasContent.ts`
- `web/convex/getOwnerHasLegacyProductRecords.ts`
- `web/convex/getPrimaryProductForOwner.ts`

## Abuse Protection

Product creation continues to use the existing product enrichment and Convex
record-save limits. Automatic legacy backfill uses the existing Convex metadata
update limiter before patching old records.

## Source References

- `docs/backend/rate-limits.md`
- `docs/features/settings-product-website-import.md`
- `project-scope.md`
