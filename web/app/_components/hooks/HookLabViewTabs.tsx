"use client";

import { SegmentedControl } from "@/app/_components/ui/SegmentedControl";
import type { HookLabView } from "@/lib/clipstitchr/types/HookLabView";

type HookLabViewTabsProps = {
  value: HookLabView;
  onChange: (view: HookLabView) => void;
};

export function HookLabViewTabs({ value, onChange }: HookLabViewTabsProps) {
  return (
    <SegmentedControl
      ariaLabel="Hook Lab views"
      options={[
        { label: "Ideas", value: "ideas" },
        { label: "Review", value: "review" },
      ]}
      value={value}
      onChange={onChange}
    />
  );
}
