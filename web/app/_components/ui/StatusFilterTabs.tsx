"use client";

import { SegmentedControl } from "@/app/_components/ui/SegmentedControl";

type StatusFilterTabsOption<Value extends string> = {
  label: string;
  value: Value;
};

type StatusFilterTabsProps<Value extends string> = {
  ariaLabel: string;
  counts?: Record<Value, number>;
  options: StatusFilterTabsOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
};

export function StatusFilterTabs<Value extends string>({
  ariaLabel,
  counts,
  options,
  value,
  onChange,
}: StatusFilterTabsProps<Value>) {
  return (
    <SegmentedControl
      ariaLabel={ariaLabel}
      options={options.map((option) => ({
        ...option,
        count: counts?.[option.value],
      }))}
      value={value}
      onChange={onChange}
    />
  );
}
