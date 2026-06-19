"use client";

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
    <div
      className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-slate-100 p-1"
      aria-label="Pexels pack filter"
    >
      {filterOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={[
            "h-8 rounded-md px-3 text-sm font-semibold transition-colors",
            value === option.value
              ? "bg-white text-accent shadow-sm"
              : "text-text-secondary hover:text-text-primary",
          ].join(" ")}
        >
          {option.label}
          <span className="ml-1 text-xs text-text-tertiary">
            {counts[option.value]}
          </span>
        </button>
      ))}
    </div>
  );
}
