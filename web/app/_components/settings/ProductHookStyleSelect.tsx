"use client";

import { SelectInput } from "@/app/_components/ui/SelectInput";
import { cliprHookStyleOptions } from "@/lib/clipstitchr/resources/clipr/cliprHookStyleOptions";

const hookStyleOptions = [
  {
    label: "Auto",
    value: "",
  },
  ...cliprHookStyleOptions,
];

type ProductHookStyleSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ProductHookStyleSelect({
  value,
  onChange,
}: ProductHookStyleSelectProps) {
  return (
    <SelectInput
      label="Preferred hook style"
      value={value}
      options={hookStyleOptions}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
}
