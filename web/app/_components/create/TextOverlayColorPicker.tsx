"use client";

import { TEXT_OVERLAY_COLOR_OPTIONS } from "@/lib/clipr/constants/textOverlayColorOptions";
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
    <div className="flex flex-wrap items-center gap-2">
      {TEXT_OVERLAY_COLOR_OPTIONS.map((color) => {
        const isSelected =
          color.toLowerCase() === selectedColor.toLowerCase();

        return (
          <button
            key={color}
            type="button"
            aria-label={`Use text color ${color}`}
            aria-pressed={isSelected}
            className={[
              "h-8 w-8 rounded-full border transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              isSelected
                ? "scale-105 border-accent ring-2 ring-accent/30"
                : "border-border hover:scale-105",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ backgroundColor: color }}
            onClick={() => onChange({ ...textOverlay, color })}
          />
        );
      })}
      <label className="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-white focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
        <span
          aria-hidden
          className="h-5 w-5 rounded-full"
          style={{ backgroundColor: selectedColor }}
        />
        <input
          type="color"
          aria-label="Custom text color"
          value={selectedColor}
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(event) =>
            onChange({ ...textOverlay, color: event.target.value })
          }
        />
      </label>
    </div>
  );
}
