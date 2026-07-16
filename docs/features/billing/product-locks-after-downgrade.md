# Product Locks After a Plan Downgrade

## What This Does

ClipStitchr never deletes a saved product because a plan changes. When an
account has more active products than its current plan includes, the excess
products stay saved and readable but cannot be selected for new work.

The product switcher shows a lock beside each affected product. Choosing a
locked product, or choosing **New product** after every slot is used, opens a
short explanation with a link to **Settings -> Plan and usage**.

The explanation behaves as a true modal: focus enters it when it opens, stays
inside while it is visible, closes with Escape, and returns to the control that
opened it. This keeps the same upgrade path usable by keyboard and assistive
technology users. Its isolated theme variables keep the same warm dashboard
palette even though the provider mounts the modal above the page shell.

## Which Products Stay Available

The selection is deterministic:

1. Keep the valid saved default product available.
2. Fill remaining slots with the oldest active products, ordered by creation
   time and then product ID.
3. Lock every remaining active product.

Starter therefore keeps only the saved default selectable. Pro keeps the
default plus up to two older products. Agency keeps the default plus up to nine
older products. A pending downgrade does not change access until Stripe's paid
renewal webhook makes the lower plan effective.

Archiving an available product immediately opens a slot for the next locked
product. An upgrade immediately expands the available set. No stored lock flag
is trusted, so access cannot become stale after a plan or product change.

## Enforcement

`convex/products/getProductAccessState.ts` exposes the authenticated, reactive
access projection used by the dashboard. The pure ordering rule lives in
`lib/clipstitchr/products/getUnlockedProductIds.ts` and is shared by Convex
reconciliation.

`productPreferences.setDefaultProduct` rechecks the same server-owned plan and
product state before changing the default. It rejects archived products and
locked products even if a caller bypasses the switcher. Product creation and
restoration keep their existing paid-entitlement and product-limit checks.

The downgrade reconciliation record stores the locked IDs for audit context,
but it is not the source of truth. The current plan, products, and saved default
always produce the live projection.

## File Tree

- `web/lib/clipstitchr/products/getUnlockedProductIds.ts`
- `web/lib/clipstitchr/hooks/useDialogFocusManagement.ts`
- `web/convex/products/getProductAccessStateForOwner.ts`
- `web/convex/products/getProductAccessState.ts`
- `web/convex/products/assertProductIsUnlockedForOwner.ts`
- `web/app/_components/products/ProductPlanLimitDialog.tsx`
- `web/app/_components/dashboard/DashboardProductSwitcher.tsx`
- `web/app/_components/settings/ProductSettingsCard.tsx`

## Security and Cost

The access query is authenticated, owner-scoped, read-only, and performs no
provider call. Default-product changes still consume the existing
`convexMetadataUpdate` rate limit. Product creation and restoration retain their
existing write limits and fail before any provider enrichment begins.
