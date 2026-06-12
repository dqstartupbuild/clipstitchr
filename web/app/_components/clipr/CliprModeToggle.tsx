"use client";

import { cliprGenerationModeOptions } from "@/lib/clipstitchr/constants/cliprGenerationModeOptions";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";

type CliprModeToggleProps = {
  value: CliprGenerationMode;
  onChange: (mode: CliprGenerationMode) => void;
};

export function CliprModeToggle({ value, onChange }: CliprModeToggleProps) {
  return (
    <div
      aria-label="Clipr mode"
      className="inline-flex rounded-lg border border-border bg-slate-100 p-1"
      role="group"
    >
      {cliprGenerationModeOptions.map((mode) => (
        <button
          key={mode.value}
          type="button"
          aria-pressed={value === mode.value}
          className={[
            "h-8 rounded-md px-3 text-sm font-semibold transition-colors",
            value === mode.value
              ? "bg-white text-accent shadow-sm"
              : "text-text-secondary hover:text-text-primary",
          ].join(" ")}
          onClick={() => onChange(mode.value)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
