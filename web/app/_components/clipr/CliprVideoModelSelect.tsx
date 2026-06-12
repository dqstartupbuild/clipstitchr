"use client";

import { FlaskConical } from "lucide-react";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";
import { getCliprVideoModelOptionsForMode } from "@/lib/clipstitchr/utils/getCliprVideoModelOptionsForMode";

type CliprVideoModelSelectProps = {
  mode: CliprGenerationMode;
  value: CliprVideoModelId;
  onChange: (value: CliprVideoModelId) => void;
};

export function CliprVideoModelSelect({
  mode,
  value,
  onChange,
}: CliprVideoModelSelectProps) {
  const options = getCliprVideoModelOptionsForMode(mode);
  const selectedValue = options.some((option) => option.id === value)
    ? value
    : "auto";

  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <FlaskConical aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Model</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Video test
          </h2>
        </div>
      </div>
      <SelectInput
        label="Video model"
        value={selectedValue}
        options={options.map((option) => ({
          label: option.label,
          value: option.id,
        }))}
        onChange={(event) => onChange(event.currentTarget.value as CliprVideoModelId)}
      />
    </section>
  );
}
