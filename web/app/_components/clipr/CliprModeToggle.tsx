"use client";

import { SegmentedControl } from "@/app/_components/ui/SegmentedControl";
import { cliprGenerationModeOptions } from "@/lib/clipstitchr/constants/cliprGenerationModeOptions";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";

type CliprModeToggleProps = {
  value: CliprGenerationMode;
  onChange: (mode: CliprGenerationMode) => void;
};

export function CliprModeToggle({ value, onChange }: CliprModeToggleProps) {
  return (
    <SegmentedControl
      ariaLabel="Clipr mode"
      options={cliprGenerationModeOptions}
      value={value}
      onChange={onChange}
    />
  );
}
