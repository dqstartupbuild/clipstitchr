"use client";

import { TEXT_OVERLAY_STYLES } from "@/lib/clipstitchr/constants/textOverlayStyles";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { applyCssColorAlpha } from "@/lib/clipstitchr/utils/applyCssColorAlpha";
import { getCssColorAlpha } from "@/lib/clipstitchr/utils/getCssColorAlpha";
import { getTextPreviewBackgroundColor } from "@/lib/clipstitchr/utils/getTextPreviewBackgroundColor";

type TextOverlayStylePickerProps = {
  textOverlay: TextOverlay;
  variant?: "default" | "compact";
  onChange: (textOverlay: TextOverlay) => void;
};

export function TextOverlayStylePicker({
  textOverlay,
  variant = "default",
  onChange,
}: TextOverlayStylePickerProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={
        isCompact
          ? "flex min-w-0 items-center gap-1.5 overflow-x-auto py-1"
          : "grid grid-cols-2 gap-2 sm:grid-cols-5"
      }
    >
      {TEXT_OVERLAY_STYLES.map((style) => {
        const isSelected = style.id === textOverlay.styleId;
        const previewColor = textOverlay.color ?? style.color;
        const previewBackgroundColor =
          style.backgroundColor && textOverlay.backgroundColor
            ? applyCssColorAlpha(
                textOverlay.backgroundColor,
                getCssColorAlpha(style.backgroundColor),
              )
            : (style.backgroundColor ??
              getTextPreviewBackgroundColor(previewColor));
        const previewStrokeColor = textOverlay.strokeColor ?? style.strokeColor;

        return (
          <button
            key={style.id}
            type="button"
            aria-pressed={isSelected}
            title={style.label}
            className={[
              isCompact
                ? "h-10 min-w-12 shrink-0 px-1"
                : "h-14 text-sm",
              "flex flex-col items-center justify-center gap-0.5 rounded-lg border font-bold transition-colors",
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
                isCompact ? "h-6 min-w-9 text-sm" : "h-7 min-w-12 text-base",
                "inline-flex items-center justify-center px-2 leading-none shadow-inner",
                style.fullWidthBand ? "w-16 rounded-none" : "rounded-md",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                backgroundColor: previewBackgroundColor,
                color: previewColor,
                WebkitTextStroke:
                  previewStrokeColor && style.strokeWidthRatio
                    ? `${style.strokeWidthRatio}em ${previewStrokeColor}`
                    : undefined,
              }}
            >
              Aa
            </span>
            <span
              className={
                isCompact
                  ? "sr-only"
                  : "text-[10px] leading-none text-text-tertiary"
              }
            >
              {style.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
