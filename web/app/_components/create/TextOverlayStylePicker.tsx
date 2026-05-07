"use client";

import { TEXT_OVERLAY_STYLES } from "@/lib/clipr/constants/textOverlayStyles";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { getTextPreviewBackgroundColor } from "@/lib/clipr/utils/getTextPreviewBackgroundColor";

type TextOverlayStylePickerProps = {
  textOverlay: TextOverlay;
  onChange: (textOverlay: TextOverlay) => void;
};

export function TextOverlayStylePicker({
  textOverlay,
  onChange,
}: TextOverlayStylePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {TEXT_OVERLAY_STYLES.map((style) => {
        const isSelected = style.id === textOverlay.styleId;
        const previewColor = textOverlay.color ?? style.color;
        const previewBackgroundColor =
          getTextPreviewBackgroundColor(previewColor);

        return (
          <button
            key={style.id}
            type="button"
            aria-pressed={isSelected}
            title={style.label}
            className={[
              "flex h-14 flex-col items-center justify-center gap-0.5 rounded-lg border text-sm font-bold transition-colors",
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
            <span
              className={[
                "inline-flex h-7 min-w-12 items-center justify-center px-2 text-base leading-none shadow-inner",
                style.fullWidthBand ? "w-16 rounded-none" : "rounded-md",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                backgroundColor: style.fullWidthBand
                  ? style.backgroundColor
                  : previewBackgroundColor,
                color: previewColor,
              }}
            >
              Aa
            </span>
            <span className="text-[10px] leading-none text-text-tertiary">
              {style.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
