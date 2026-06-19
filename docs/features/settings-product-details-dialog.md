# Product Details Dialog

Saved products can be edited or opened in a read-only details dialog from the
Product settings section in Settings.

## What It Does

- Clicking a saved product card opens the product's full readable context.
- Edit, make active, and delete stay as separate icon buttons.
- The active product is labeled clearly, matching the sidebar product switcher.
- The dialog shows product details, audience details, emotional narrative,
  website, hook style, audience problem, pain points, writing angles, phrase
  bank, and saved dates when those values exist.
- The view is read-only, so users can review the product context without opening
  the edit form.

## Implementation

- `web/app/_components/settings/ProductSettingsCard.tsx` makes the product card
  clickable and opens the details dialog.
- `web/app/_components/settings/ProductSettingsList.tsx` renders the editable
  product list in Settings.
- `web/app/_components/settings/SettingsProductSection.tsx` groups product
  editing with product automation.
- `web/app/_components/settings/ProductSettingsDetailsDialog.tsx` renders the
  read-only product data and closes from the backdrop or close button.
- `web/app/_components/settings/ProductSettingsEditDialog.tsx` remains the only
  place where the product context is edited.

## Tests

- `web/app/_components/settings/ProductSettingsDetailsDialog.test.tsx`
- `web/app/_components/settings/SettingsComponents.test.tsx`
