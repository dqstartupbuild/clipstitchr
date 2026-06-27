"use client";

import type { LibraryTab } from "@/lib/clipstitchr/types/LibraryTab";

type LibraryTabsProps = {
  value: LibraryTab;
  onChange: (tab: LibraryTab) => void;
};

const tabs: { label: string; value: LibraryTab }[] = [
  { label: "UGC", value: "ugc" },
  { label: "Demo", value: "demo" },
  { label: "Swaps", value: "swaps" },
  { label: "Swipes", value: "swipes" },
  { label: "Pexels", value: "pexels" },
  { label: "Stitches", value: "stitches" },
  { label: "Avatars", value: "avatars" },
  { label: "Templates", value: "templates" },
];

export function LibraryTabs({ value, onChange }: LibraryTabsProps) {
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
