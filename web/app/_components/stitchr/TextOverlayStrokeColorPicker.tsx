"use client";

import { TextOverlaySwatchPicker } from "@/app/_components/stitchr/TextOverlaySwatchPicker";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getCssColorHex } from "@/lib/clipstitchr/utils/getCssColorHex";
import { getTextOverlayStyle } from "@/lib/clipstitchr/utils/getTextOverlayStyle";

type TextOverlayStrokeColorPickerProps = {
  textOverlay: TextOverlay;
  onChange: (textOverlay: TextOverlay) => void;
};

export function TextOverlayStrokeColorPicker({
  textOverlay,
  onChange,
}: TextOverlayStrokeColorPickerProps) {
  const overlayStyle = getTextOverlayStyle(textOverlay.styleId);

  if (!overlayStyle.strokeColor) {
    return null;
  }

  const selectedColor =
    textOverlay.strokeColor ?? getCssColorHex(overlayStyle.strokeColor);

  return (
    <TextOverlaySwatchPicker
      label="Outline"
      selectedColor={selectedColor}
      onChange={(strokeColor) => onChange({ ...textOverlay, strokeColor })}
    />
  );
}
