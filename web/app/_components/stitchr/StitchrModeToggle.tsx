"use client";

import type { StitchrMode } from "@/lib/clipstitchr/types/StitchrMode";

type StitchrModeToggleProps = {
  value: StitchrMode;
  onChange: (mode: StitchrMode) => void;
};

const modes: { label: string; value: StitchrMode }[] = [
  { label: "Batch", value: "batch" },
  { label: "Normal", value: "normal" },
  { label: "Longr", value: "longr" },
];

export function StitchrModeToggle({
  value,
  onChange,
}: StitchrModeToggleProps) {
  return (
    <div
      aria-label="Stitchr mode"
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
