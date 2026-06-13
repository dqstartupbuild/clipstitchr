"use client";

import { automationCliprGenerationModeOptions } from "@/lib/clipstitchr/constants/automationCliprGenerationModeOptions";
import type { AutomationCliprGenerationMode } from "@/lib/clipstitchr/types/AutomationPreferencesInput";

type AutomationCliprModePickerProps = {
  disabled?: boolean;
  value: AutomationCliprGenerationMode;
  onChange: (value: AutomationCliprGenerationMode) => void;
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
      {automationCliprGenerationModeOptions.map((option) => (
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
