"use client";

import { TEXT_OVERLAY_STYLES } from "@/lib/clipr/constants/textOverlayStyles";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";

type TextOverlayStylePickerProps = {
  textOverlay: TextOverlay;
  onChange: (textOverlay: TextOverlay) => void;
};

export function TextOverlayStylePicker({
  textOverlay,
  onChange,
}: TextOverlayStylePickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {TEXT_OVERLAY_STYLES.map((style) => {
        const isSelected = style.id === textOverlay.styleId;

        return (
          <button
            key={style.id}
            type="button"
            aria-pressed={isSelected}
            title={style.label}
            className={[
              "flex h-12 items-center justify-center rounded-lg border text-sm font-bold transition-colors",
              isSelected
                ? "border-accent bg-surface-muted text-accent-dark"
                : "border-border bg-white text-text-secondary hover:border-accent",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              fontFamily: style.fontFamily,
              fontWeight: style.fontWeight,
              textTransform: style.textTransform,
            }}
            onClick={() => onChange({ ...textOverlay, styleId: style.id })}
          >
            Aa
          </button>
        );
      })}
    </div>
  );
}
