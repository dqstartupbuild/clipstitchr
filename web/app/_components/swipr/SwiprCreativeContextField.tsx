"use client";

import { SWIPR_CREATIVE_CONTEXT_MAX_LENGTH } from "@/lib/clipstitchr/constants/swiprCreativeContextMaxLength";

type SwiprCreativeContextFieldProps = {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export function SwiprCreativeContextField({
  disabled = false,
  value,
  onChange,
}: SwiprCreativeContextFieldProps) {
  return (
    <label className="grid gap-2">
      <span>
        <span className="block text-sm font-semibold text-text-primary">
          Topic or direction
        </span>
        <span className="block text-xs text-text-secondary">
          Optional. Tell Swipr what the slides should focus on.
        </span>
      </span>
      <textarea
        className="min-h-24 w-full resize-y rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        maxLength={SWIPR_CREATIVE_CONTEXT_MAX_LENGTH}
        placeholder="Example: Talk about adult acne routines for busy women. Keep it honest and practical."
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      <span className="text-right text-xs text-text-secondary">
        {value.length}/{SWIPR_CREATIVE_CONTEXT_MAX_LENGTH}
      </span>
    </label>
  );
}
