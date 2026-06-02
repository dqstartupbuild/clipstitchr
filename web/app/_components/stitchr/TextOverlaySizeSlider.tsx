"use client";

import {
  TEXT_OVERLAY_MAX_FONT_SIZE,
  TEXT_OVERLAY_MIN_FONT_SIZE,
} from "@/lib/clipstitchr/constants/textOverlayBounds";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

type TextOverlaySizeSliderProps = {
  textOverlay: TextOverlay;
  variant?: "default" | "compact";
  onChange: (textOverlay: TextOverlay) => void;
};

export function TextOverlaySizeSlider({
  textOverlay,
  variant = "default",
  onChange,
}: TextOverlaySizeSliderProps) {
  const isCompact = variant === "compact";

  return (
    <label
      className={
        isCompact
          ? "grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-2"
          : "flex flex-col gap-2"
      }
    >
      <span
        className={
          isCompact
            ? "text-xs font-bold text-text-secondary"
            : "text-xs font-semibold text-text-tertiary"
        }
      >
        Size
      </span>
      <input
        type="range"
        min={TEXT_OVERLAY_MIN_FONT_SIZE}
        max={TEXT_OVERLAY_MAX_FONT_SIZE}
        step={0.002}
        value={textOverlay.fontSize}
        className="h-8 min-w-0 flex-1 accent-accent"
        onChange={(event) =>
          onChange({
            ...textOverlay,
            fontSize: Number(event.currentTarget.value),
          })
        }
      />
    </label>
  );
}
