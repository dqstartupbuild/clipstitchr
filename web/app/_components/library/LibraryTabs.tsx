"use client";

import { SegmentedControl } from "@/app/_components/ui/SegmentedControl";
import type { LibraryTab } from "@/lib/clipstitchr/types/LibraryTab";

type LibraryTabsProps = {
  value: LibraryTab;
  onChange: (tab: LibraryTab) => void;
};

const tabGroups: {
  label: string;
  tabs: { label: string; value: LibraryTab }[];
}[] = [
  {
    label: "Videos",
    tabs: [
      { label: "UGC", value: "ugc" },
      { label: "Product demos", value: "demo" },
      { label: "Swaps", value: "swaps" },
    ],
  },
  {
    label: "Finished",
    tabs: [
      { label: "Stitches", value: "stitches" },
      { label: "Carousels", value: "swipes" },
    ],
  },
  {
    label: "Assets",
    tabs: [
      { label: "Avatars", value: "avatars" },
      { label: "Pexels", value: "pexels" },
    ],
  },
];

export function LibraryTabs({ value, onChange }: LibraryTabsProps) {
  return (
    <div className="library-tabs flex flex-wrap gap-3">
      {tabGroups.map((group) => (
        <div key={group.label} className="min-w-0">
          <p className="library-tab-group-label mb-1 px-1 text-[11px] font-bold uppercase text-text-tertiary">
            {group.label}
          </p>
          <SegmentedControl
            ariaLabel={`${group.label} library tabs`}
            options={group.tabs}
            value={value}
            onChange={onChange}
          />
        </div>
      ))}
    </div>
  );
}
