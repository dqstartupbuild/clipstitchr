"use client";

import { SegmentedControl } from "@/app/_components/ui/SegmentedControl";
import type { PexelsLibraryFilter } from "@/lib/clipstitchr/types/PexelsLibraryFilter";

type PexelsLibraryFilterTabsProps = {
  counts: Record<PexelsLibraryFilter, number>;
  value: PexelsLibraryFilter;
  onChange: (filter: PexelsLibraryFilter) => void;
};

const filterOptions: { label: string; value: PexelsLibraryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Mine", value: "mine" },
];

export function PexelsLibraryFilterTabs({
  counts,
  value,
  onChange,
}: PexelsLibraryFilterTabsProps) {
  return (
    <SegmentedControl
      ariaLabel="Pexels pack filter"
      options={filterOptions.map((option) => ({
        ...option,
        count: counts[option.value],
      }))}
      value={value}
      onChange={onChange}
    />
  );
}
