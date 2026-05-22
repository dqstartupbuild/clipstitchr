"use client";

import { TextOverlaySwatchPicker } from "@/app/_components/stitchr/TextOverlaySwatchPicker";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayColor } from "@/lib/clipstitchr/utils/getTextOverlayColor";

type TextOverlayColorPickerProps = {
  textOverlay: TextOverlay;
  variant?: "default" | "compact";
  onChange: (textOverlay: TextOverlay) => void;
};

export function TextOverlayColorPicker({
  textOverlay,
  variant = "default",
  onChange,
}: TextOverlayColorPickerProps) {
  const selectedColor = getTextOverlayColor(textOverlay);

  return (
    <TextOverlaySwatchPicker
      label="Text"
      selectedColor={selectedColor}
      variant={variant}
      onChange={(color) => onChange({ ...textOverlay, color })}
    />
  );
}
