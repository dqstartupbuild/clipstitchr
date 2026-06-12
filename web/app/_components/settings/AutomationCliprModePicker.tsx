"use client";

import { cliprGenerationModeOptions } from "@/lib/clipstitchr/constants/cliprGenerationModeOptions";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";

type AutomationCliprModePickerProps = {
  disabled?: boolean;
  value: CliprGenerationMode;
  onChange: (value: CliprGenerationMode) => void;
};

export function AutomationCliprModePicker({
  disabled = false,
  value,
  onChange,
}: AutomationCliprModePickerProps) {
  return (
    <div
      aria-label="Clipr automation mode"
      className="inline-flex flex-wrap rounded-lg border border-border bg-slate-100 p-1"
      role="group"
    >
      {cliprGenerationModeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          disabled={disabled}
          className={[
            "h-8 rounded-md px-3 text-sm font-semibold transition-colors",
            value === option.value
              ? "bg-white text-accent shadow-sm"
              : "text-text-secondary hover:text-text-primary",
          ].join(" ")}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
