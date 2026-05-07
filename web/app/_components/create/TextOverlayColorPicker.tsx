"use client";

import { TextOverlaySwatchPicker } from "@/app/_components/create/TextOverlaySwatchPicker";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { getTextOverlayColor } from "@/lib/clipr/utils/getTextOverlayColor";

type TextOverlayColorPickerProps = {
  textOverlay: TextOverlay;
  onChange: (textOverlay: TextOverlay) => void;
};

export function TextOverlayColorPicker({
  textOverlay,
  onChange,
}: TextOverlayColorPickerProps) {
  const selectedColor = getTextOverlayColor(textOverlay);

  return (
    <TextOverlaySwatchPicker
      label="Text"
      selectedColor={selectedColor}
      onChange={(color) => onChange({ ...textOverlay, color })}
    />
  );
}
