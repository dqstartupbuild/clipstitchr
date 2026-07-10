"use client";

import { swiprCallToActionStyleOptions } from "@/lib/clipstitchr/constants/swiprCallToActionStyleOptions";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";

type SwiprCallToActionStylePickerProps = {
  disabled?: boolean;
  value: SwiprCallToActionStyle;
  onChange: (value: SwiprCallToActionStyle) => void;
};

export function SwiprCallToActionStylePicker({
  disabled = false,
  value,
  onChange,
}: SwiprCallToActionStylePickerProps) {
  return (
    <div className="grid gap-2">
      <div>
        <p className="text-sm font-semibold text-text-primary">
          Last-slide CTA
        </p>
        <p className="text-xs text-text-secondary">
          Choose what you want the final slide to ask people to do.
        </p>
      </div>
      <div className="flex min-w-0 flex-wrap gap-2">
        {swiprCallToActionStyleOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            className={[
              "inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              value === option.id
                ? "border-accent bg-surface-muted text-accent-dark"
                : "border-border bg-white text-text-secondary hover:border-accent",
            ].join(" ")}
            disabled={disabled}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
