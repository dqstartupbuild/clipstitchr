"use client";

import { useState } from "react";

type AppAdTestPlanNumberFieldProps = {
  description: string;
  id: string;
  label: string;
  max: number;
  min?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
};

export function AppAdTestPlanNumberField({
  description,
  id,
  label,
  max,
  min = 0,
  step = 1,
  value,
  onChange,
}: AppAdTestPlanNumberFieldProps) {
  const descriptionId = `${id}-description`;
  const [draftValue, setDraftValue] = useState<string | null>(null);

  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      <input
        id={id}
        aria-describedby={descriptionId}
        type="number"
        inputMode={step === 1 ? "numeric" : "decimal"}
        min={min}
        max={max}
        step={step}
        value={draftValue ?? value}
        className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-base font-bold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
        onBlur={(event) => {
          if (event.currentTarget.value !== "") {
            const rawValue = event.currentTarget.valueAsNumber;
            const boundedValue = Number.isFinite(rawValue)
              ? Math.min(Math.max(rawValue, min), max)
              : min;
            onChange(
              step === 1 ? Math.floor(boundedValue) : boundedValue,
            );
          }

          setDraftValue(null);
        }}
        onChange={(event) => {
          const nextDraftValue = event.currentTarget.value;
          setDraftValue(nextDraftValue);

          if (nextDraftValue !== "") {
            const rawValue = event.currentTarget.valueAsNumber;
            const boundedValue = Number.isFinite(rawValue)
              ? Math.min(Math.max(rawValue, min), max)
              : min;
            onChange(
              step === 1 ? Math.floor(boundedValue) : boundedValue,
            );
          }
        }}
      />
      <span
        className="mt-2 block text-xs leading-5 text-text-tertiary"
        id={descriptionId}
      >
        {description}
      </span>
    </label>
  );
}
