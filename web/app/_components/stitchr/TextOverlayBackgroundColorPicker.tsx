"use client";

import { TextOverlaySwatchPicker } from "@/app/_components/stitchr/TextOverlaySwatchPicker";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getCssColorHex } from "@/lib/clipstitchr/utils/getCssColorHex";
import { getTextOverlayStyle } from "@/lib/clipstitchr/utils/getTextOverlayStyle";

type TextOverlayBackgroundColorPickerProps = {
  textOverlay: TextOverlay;
  onChange: (textOverlay: TextOverlay) => void;
};

export function TextOverlayBackgroundColorPicker({
  textOverlay,
  onChange,
}: TextOverlayBackgroundColorPickerProps) {
  const overlayStyle = getTextOverlayStyle(textOverlay.styleId);

  if (!overlayStyle.backgroundColor) {
    return null;
  }

  const selectedColor =
    textOverlay.backgroundColor ?? getCssColorHex(overlayStyle.backgroundColor);

  return (
    <TextOverlaySwatchPicker
      label="Background"
      selectedColor={selectedColor}
      onChange={(backgroundColor) =>
        onChange({ ...textOverlay, backgroundColor })
      }
    />
  );
}
