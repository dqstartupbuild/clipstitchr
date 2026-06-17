"use client";

import type { SwiprMode } from "@/lib/clipstitchr/types/SwiprMode";

type SwiprModeToggleProps = {
  value: SwiprMode;
  onChange: (mode: SwiprMode) => void;
};

const modes: { label: string; value: SwiprMode }[] = [
  { label: "Batch", value: "batch" },
  { label: "Manual", value: "manual" },
];

export function SwiprModeToggle({ value, onChange }: SwiprModeToggleProps) {
  return (
    <div
      aria-label="Swipr mode"
      className="inline-flex rounded-lg border border-border bg-slate-100 p-1"
      role="group"
    >
      {modes.map((mode) => (
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
