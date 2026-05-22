"use client";

import { X } from "lucide-react";
import { TextOverlayBackgroundColorPicker } from "@/app/_components/stitchr/TextOverlayBackgroundColorPicker";
import { TextOverlayColorPicker } from "@/app/_components/stitchr/TextOverlayColorPicker";
import { TextOverlayStrokeColorPicker } from "@/app/_components/stitchr/TextOverlayStrokeColorPicker";
import { TextOverlayStylePicker } from "@/app/_components/stitchr/TextOverlayStylePicker";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";

type TextOverlayQuickControlsProps = {
  textOverlay: TextOverlay;
  totalDuration: number;
  onChange: (textOverlay: TextOverlay) => void;
  onClose: () => void;
};

export function TextOverlayQuickControls({
  textOverlay,
  totalDuration,
  onChange,
  onClose,
}: TextOverlayQuickControlsProps) {
  const handleChange = (nextOverlay: TextOverlay) => {
    onChange(clampTextOverlay(nextOverlay, totalDuration));
  };

  return (
    <div
      data-overlay-control="true"
      data-swipe-ignore="true"
      className="absolute inset-x-2 bottom-2 z-30 rounded-lg border border-white/80 bg-white/95 p-2 text-left font-sans normal-case text-text-primary shadow-xl shadow-slate-950/25 backdrop-blur"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-text-primary">Text style</p>
        <button
          type="button"
          aria-label="Close text style controls"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          onClick={onClose}
        >
          <X aria-hidden className="h-3.5 w-3.5" />
        </button>
      </div>
      <TextOverlayStylePicker
        textOverlay={textOverlay}
        variant="compact"
        onChange={handleChange}
      />
      <div className="mt-1 grid gap-1">
        <TextOverlayColorPicker
          textOverlay={textOverlay}
          variant="compact"
          onChange={handleChange}
        />
        <TextOverlayBackgroundColorPicker
          textOverlay={textOverlay}
          variant="compact"
          onChange={handleChange}
        />
        <TextOverlayStrokeColorPicker
          textOverlay={textOverlay}
          variant="compact"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
