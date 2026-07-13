# TikTok Safe-Zone Overlay

## Purpose

The TikTok Safe-Zone Overlay gives app founders and marketers an early text-
placement check without uploading their frame. A visitor can select one local
JPG, PNG, or WebP image, type the message they plan to add, and drag the planned
text box over a conservative TikTok In-Feed interface overlay.

The result says whether the planned box intersects the shaded top-interface,
right-action, or bottom-caption buffers. It does not claim that TikTok has
approved or certified the placement.

## How It Works

The browser validates a selected image at 20 MB or smaller and creates a
temporary object URL. The URL is revoked when the selected file changes or the
component unmounts. The image is not uploaded or persisted.

The preview uses a normalized 9:16 coordinate system. The draggable planned
text rectangle and the three obstruction rectangles are expressed from `0` to
`1`, so the intersection result does not depend on the rendered preview size.
Pointer dragging and arrow-key movement both clamp the text rectangle inside
the preview.

The bundled preset is named `TikTok In-Feed conservative LTR`, version
`2026.07`, verified July 12, 2026. It is deliberately a planning buffer rather
than a copied official template. TikTok states that the actual safe area varies
with dimensions, caption length, and interactive add-ons and provides separate
files for standard LTR, Arabic RTL, and anchor configurations.

## Use Cases

- Check whether an app benefit line is too close to TikTok's action rail.
- Move a CTA away from caption and navigation interface areas.
- Give a creator a quick placement note before editing begins.
- Review a representative exported frame while keeping it browser-local.

## Boundaries

- No image upload, server processing, account storage, or analytics derived from
  the selected frame.
- No burned-in text, edited-image export, permanent template, or media repair.
- No platform approval prediction or certification.
- The preview fills a 9:16 canvas and may crop a non-vertical image.
- Visitors must use TikTok's current matching safe-zone asset and placement
  preview before launch.

## Relevant Code

```text
web/app/(content)/tools/tiktok-safe-zone-overlay/page.tsx
web/app/_components/tools/tiktok-safe-zone/
  TikTokSafeZonePage.tsx
  TikTokSafeZoneTool.tsx
  TikTokSafeZoneCanvas.tsx
  SafeZonePlannedTextBox.tsx
  SafeZoneObstructionLayer.tsx
  SafeZoneAssessmentCard.tsx
  LocalSafeZoneImagePicker.tsx
web/lib/clipstitchr/tools/tiktokSafeZone/
  tiktokInFeedConservativePreset.ts
  getSafeZoneAssessment.ts
  rectanglesIntersect.ts
  clampPlannedTextBox.ts
  validateSafeZoneImage.ts
web/lib/clipstitchr/hooks/useObjectUrl.ts
  *.test.ts
```

## Source References

Checked July 12, 2026:

- [TikTok creative best practices for performance ads](https://ads.tiktok.com/help/article/creative-best-practices)
  recommends vertical 9:16, at least 720p, sound or music, and keeping content
  visible inside the UI safe zone.
- [TikTok reservation In-Feed ad specifications](https://ads.tiktok.com/help/article/tiktok-reservation-in-feed-ads-reach-frequency)
  says text and logos outside the safe zone may be covered or cropped and that
  the safe area changes with dimensions, caption length, and interactive
  add-ons. It recommends TikTok's preview tool before launch.

## Verification

- Pure tests cover clear and intersecting planned-text positions.
- Clamp tests prove that keyboard or pointer movement cannot place the planned
  box outside the preview.
- The page test covers the version, local object-URL disclosure, exact lead
  source, certification boundary, and paid-plan link.

The candid release status and next refinement are recorded in
`docs/features/public-tool-quality-register.md`.
