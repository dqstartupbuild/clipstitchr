"use client";

import { TextOverlaySwatchPicker } from "@/app/_components/create/TextOverlaySwatchPicker";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { getCssColorHex } from "@/lib/clipr/utils/getCssColorHex";
import { getTextOverlayStyle } from "@/lib/clipr/utils/getTextOverlayStyle";

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
