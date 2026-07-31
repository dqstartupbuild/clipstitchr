# Post Bridge Product Account Settings

> **Legacy migration path.** These account IDs belong to Post Bridge and are
> never copied into the in-house tables. Users reconnect TikTok and Instagram
> directly and choose new product defaults in Settings. The Post Bridge panel
> appears only while `SOCIAL_PUBLISHING_PROVIDER=post_bridge`. See
> `docs/features/social-publishing/post-bridge-migration.md`.

Post Bridge product account links live in Settings so users can review and edit
every product's posting defaults in one place.

## How It Works

The Post Bridge card in Account settings still owns the user's API key. Its
`Config` button opens a dialog for product account links. The dialog lists
all saved products, not only the active dashboard product, and each product row
shows the currently selected Post Bridge accounts.

When the dialog opens, the browser calls the existing
`GET /api/post-bridge/accounts` route once to load supported TikTok, Instagram,
and YouTube accounts. The saved product links come from the local product list.
Saving a product row calls `products.updatePostBridgeSocialAccountIds`, which
uses the existing Convex metadata update limiter before writing.

The Schedule page no longer owns account linking. It only shows scheduled and
queued Post Bridge posts for the active product.

## Use Cases

- Link different products to different TikTok, Instagram, or YouTube accounts.
- Review product posting defaults without changing the active dashboard product.
- Fix product defaults before using single-post scheduling or dashboard bulk
  queue.

## Source Files

- `web/app/_components/settings/SettingsPostBridgePanel.tsx`
- `web/app/_components/settings/SettingsPostBridgeProductConfigDialog.tsx`
- `web/app/_components/settings/PostBridgeProductAccountConfigRow.tsx`
- `web/lib/clipstitchr/utils/createPostBridgeProductAccountSelections.ts`
- `web/app/api/post-bridge/accounts/route.ts`
- `web/convex/products.ts`
- `docs/operations/security/rate-limits.md`
