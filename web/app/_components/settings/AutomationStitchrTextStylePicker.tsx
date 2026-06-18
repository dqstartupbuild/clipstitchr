import { Shuffle } from "lucide-react";
import { TEXT_OVERLAY_STYLES } from "@/lib/clipstitchr/constants/textOverlayStyles";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";
import { getTextPreviewBackgroundColor } from "@/lib/clipstitchr/utils/getTextPreviewBackgroundColor";

type AutomationStitchrTextStylePickerProps = {
  disabled: boolean;
  previewBackgroundColor?: string;
  previewStrokeColor?: string;
  previewTextColor?: string;
  value: AutomationStitchrTextStyleChoice;
  onChange: (value: AutomationStitchrTextStyleChoice) => void;
};

export function AutomationStitchrTextStylePicker({
  disabled,
  previewBackgroundColor,
  previewStrokeColor,
  previewTextColor,
  value,
  onChange,
}: AutomationStitchrTextStylePickerProps) {
  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={value === "any"}
        title="Any"
        className={[
          "inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          value === "any"
            ? "border-accent bg-surface-muted text-accent-dark"
            : "border-border bg-white text-text-secondary hover:border-accent",
        ].join(" ")}
        disabled={disabled}
        onClick={() => onChange("any")}
      >
        <Shuffle aria-hidden className="h-4 w-4" />
        Any
      </button>
      {TEXT_OVERLAY_STYLES.map((style) => {
        const previewColor = previewTextColor ?? style.color;
        const styleBackgroundColor = style.backgroundColor
          ? (previewBackgroundColor ?? style.backgroundColor)
          : getTextPreviewBackgroundColor(previewColor);
        const styleStrokeColor = previewStrokeColor ?? style.strokeColor;

        return (
          <button
            key={style.id}
            type="button"
            aria-pressed={value === style.id}
            title={style.label}
            className={[
              "inline-flex h-10 min-w-12 items-center justify-center rounded-lg border px-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              value === style.id
                ? "border-accent bg-surface-muted text-accent-dark"
                : "border-border bg-white text-text-secondary hover:border-accent",
            ].join(" ")}
            disabled={disabled}
            style={{
              fontFamily: style.fontFamily,
              fontWeight: style.fontWeight,
              textTransform: style.textTransform,
            }}
            onClick={() => onChange(style.id)}
          >
            <span
              className={[
                "inline-flex h-6 min-w-8 items-center justify-center px-2 leading-none shadow-inner",
                style.fullWidthBand ? "w-10 rounded-none" : "rounded-md",
              ].join(" ")}
              style={{
                backgroundColor: styleBackgroundColor,
                color: previewColor,
                WebkitTextStroke:
                  styleStrokeColor && style.strokeWidthRatio
                    ? `${style.strokeWidthRatio}em ${styleStrokeColor}`
                    : undefined,
              }}
            >
              Aa
            </span>
          </button>
        );
      })}
    </div>
  );
}
