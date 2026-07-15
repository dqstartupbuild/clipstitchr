import { Shuffle } from "lucide-react";
import { TEXT_OVERLAY_COLOR_OPTIONS } from "@/lib/clipstitchr/constants/textOverlayColorOptions";
import type { AutomationStitchrColorChoice } from "@/lib/clipstitchr/types/AutomationStitchrColorChoice";

type AutomationStitchrColorChoicePickerProps = {
  disabled: boolean;
  fallbackColor: string;
  label: string;
  value: AutomationStitchrColorChoice;
  onChange: (value: AutomationStitchrColorChoice) => void;
};

export function AutomationStitchrColorChoicePicker({
  disabled,
  fallbackColor,
  label,
  value,
  onChange,
}: AutomationStitchrColorChoicePickerProps) {
  const selectedColor = value === "any" ? fallbackColor : value;

  return (
    <div className="grid gap-2">
      <p className="text-sm font-semibold text-text-primary">{label}</p>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={value === "any"}
          title={`${label} Any`}
          className={[
            "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
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
        {TEXT_OVERLAY_COLOR_OPTIONS.map((color) => {
          const isSelected =
            value !== "any" && color.toLowerCase() === value.toLowerCase();

          return (
            <button
              key={color}
              type="button"
              aria-label={`Use ${label.toLowerCase()} ${color}`}
              aria-pressed={isSelected}
              className={[
                "h-8 w-8 rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60",
                isSelected
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-border hover:border-border-hover",
              ].join(" ")}
              disabled={disabled}
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          );
        })}
        <label className="relative inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-white focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
          <span
            aria-hidden
            className="h-5 w-5 rounded-full"
            style={{ backgroundColor: selectedColor }}
          />
          <input
            type="color"
            aria-label={`Custom ${label.toLowerCase()}`}
            value={selectedColor}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
