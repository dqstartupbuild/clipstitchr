"use client";

import { useState } from "react";
import { adVariantInputMax } from "@/lib/clipstitchr/tools/adVariantCalculator/adVariantInputMax";
import { normalizeAdVariantCount } from "@/lib/clipstitchr/tools/adVariantCalculator/normalizeAdVariantCount";

type AdVariantNumberFieldProps = {
  description: string;
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export function AdVariantNumberField({
  description,
  id,
  label,
  value,
  onChange,
}: AdVariantNumberFieldProps) {
  const descriptionId = `${id}-description`;
  const [draftValue, setDraftValue] = useState<string | null>(null);

  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      <input
        id={id}
        aria-describedby={descriptionId}
        type="number"
        inputMode="numeric"
        min={0}
        max={adVariantInputMax}
        step={1}
        value={draftValue ?? value}
        className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-base font-bold text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/15"
        onBlur={(event) => {
          if (event.currentTarget.value !== "") {
            onChange(
              normalizeAdVariantCount(event.currentTarget.valueAsNumber),
            );
          }

          setDraftValue(null);
        }}
        onChange={(event) => {
          const nextDraftValue = event.currentTarget.value;
          setDraftValue(nextDraftValue);

          if (nextDraftValue !== "") {
            onChange(
              normalizeAdVariantCount(event.currentTarget.valueAsNumber),
            );
          }
        }}
      />
      <span
        id={descriptionId}
        className="mt-2 block text-xs leading-5 text-text-tertiary"
      >
        {description}
      </span>
    </label>
  );
}
