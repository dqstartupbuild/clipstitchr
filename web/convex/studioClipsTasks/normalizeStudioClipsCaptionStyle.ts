import type { StudioClipsCaptionStyle } from "../../lib/clipstitchr/types/studioClips/StudioClipsCaptionStyle";
import { assertStudioClipsBoundedText } from "./assertStudioClipsBoundedText";
import { assertStudioClipsProductUploadObjectKey } from "./assertStudioClipsProductUploadObjectKey";

export function normalizeStudioClipsCaptionStyle(
  value: StudioClipsCaptionStyle,
  ownerId: string,
  productId: string,
): StudioClipsCaptionStyle {
  const templateId = assertStudioClipsBoundedText(value.templateId, {
    label: "Caption template",
    maxLength: 50,
  });
  const fontFamily = value.fontFamily
    ? assertStudioClipsBoundedText(value.fontFamily, {
        label: "Caption font",
        maxLength: 100,
      })
    : undefined;
  if (
    value.fontSizePx !== undefined &&
    (!Number.isInteger(value.fontSizePx) ||
      value.fontSizePx < 8 ||
      value.fontSizePx > 200)
  ) {
    throw new Error("Caption font size must be between 8 and 200 pixels.");
  }
  if (
    value.fontColorHex !== undefined &&
    !/^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/.test(value.fontColorHex)
  ) {
    throw new Error("Caption color must be a six- or eight-digit hex color.");
  }
  if (value.customFontObjectKey) {
    assertStudioClipsProductUploadObjectKey({
      kind: "font",
      objectKey: value.customFontObjectKey,
      ownerId,
      productId,
    });
  }
  return {
    templateId,
    ...(fontFamily ? { fontFamily } : {}),
    ...(value.fontSizePx !== undefined ? { fontSizePx: value.fontSizePx } : {}),
    ...(value.fontColorHex
      ? { fontColorHex: value.fontColorHex.toUpperCase() }
      : {}),
    ...(value.customFontObjectKey
      ? { customFontObjectKey: value.customFontObjectKey }
      : {}),
  };
}
