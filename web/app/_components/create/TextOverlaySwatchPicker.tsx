"use client";

import { TEXT_OVERLAY_COLOR_OPTIONS } from "@/lib/clipr/constants/textOverlayColorOptions";

type TextOverlaySwatchPickerProps = {
  label: string;
  selectedColor: string;
  onChange: (color: string) => void;
};

export function TextOverlaySwatchPicker({
  label,
  selectedColor,
  onChange,
}: TextOverlaySwatchPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-text-tertiary">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {TEXT_OVERLAY_COLOR_OPTIONS.map((color) => {
          const isSelected =
            color.toLowerCase() === selectedColor.toLowerCase();

          return (
            <button
              key={color}
              type="button"
              aria-label={`Use ${label.toLowerCase()} color ${color}`}
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
              onClick={() => onChange(color)}
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
            aria-label={`Custom ${label.toLowerCase()} color`}
            value={selectedColor}
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
