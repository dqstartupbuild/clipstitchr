"use client";

import type { UploadLibraryTab } from "@/lib/clipstitchr/types/UploadLibraryTab";

type UploadLibraryTabsProps = {
  value: UploadLibraryTab;
  onChange: (tab: UploadLibraryTab) => void;
};

const tabs: { label: string; value: UploadLibraryTab }[] = [
  { label: "All", value: "all" },
  { label: "UGC", value: "ugc" },
  { label: "Demo", value: "demo" },
  { label: "Swaps", value: "swaps" },
  { label: "Stitches", value: "stitches" },
];

export function UploadLibraryTabs({ value, onChange }: UploadLibraryTabsProps) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={[
            "h-8 rounded-md px-3 text-sm font-semibold transition-colors",
            value === tab.value
              ? "bg-white text-accent shadow-sm"
              : "text-text-secondary hover:text-text-primary",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
