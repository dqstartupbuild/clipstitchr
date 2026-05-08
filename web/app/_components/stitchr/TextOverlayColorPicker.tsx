"use client";

import { TextOverlaySwatchPicker } from "@/app/_components/stitchr/TextOverlaySwatchPicker";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayColor } from "@/lib/clipstitchr/utils/getTextOverlayColor";

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
