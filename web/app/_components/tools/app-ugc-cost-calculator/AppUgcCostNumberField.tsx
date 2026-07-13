"use client";

import { useState } from "react";

type AppUgcCostNumberFieldProps = {
  description: string;
  id: string;
  label: string;
  max: number;
  step?: number;
  suffix?: string;
  value: number;
  onChange: (value: number) => void;
};

export function AppUgcCostNumberField({
  description,
  id,
  label,
  max,
  step = 1,
  suffix,
  value,
  onChange,
}: AppUgcCostNumberFieldProps) {
  const descriptionId = `${id}-description`;
  const [draftValue, setDraftValue] = useState<string | null>(null);

  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      <div className="relative mt-2">
        <input
          id={id}
          aria-describedby={descriptionId}
          type="number"
          inputMode={step === 1 ? "numeric" : "decimal"}
          min={0}
          max={max}
          step={step}
          value={draftValue ?? value}
          className={`h-11 w-full rounded-lg border border-border bg-surface px-3 text-base font-bold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15 ${suffix ? "pr-14" : ""}`}
          onBlur={(event) => {
            if (event.currentTarget.value !== "") {
              const rawValue = event.currentTarget.valueAsNumber;
              const boundedValue = Number.isFinite(rawValue)
                ? Math.min(Math.max(rawValue, 0), max)
                : 0;
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
                ? Math.min(Math.max(rawValue, 0), max)
                : 0;
              onChange(
                step === 1 ? Math.floor(boundedValue) : boundedValue,
              );
            }
          }}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-bold text-text-tertiary">
            {suffix}
          </span>
        ) : null}
      </div>
      <span
        className="mt-2 block text-xs leading-5 text-text-tertiary"
        id={descriptionId}
      >
        {description}
      </span>
    </label>
  );
}
