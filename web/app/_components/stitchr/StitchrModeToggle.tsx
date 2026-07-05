"use client";

import { SegmentedControl } from "@/app/_components/ui/SegmentedControl";
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
    <SegmentedControl
      ariaLabel="Stitchr mode"
      options={modes}
      value={value}
      onChange={onChange}
    />
  );
}
