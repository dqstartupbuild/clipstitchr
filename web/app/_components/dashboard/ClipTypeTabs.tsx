"use client";

import type { ClipType } from "@/lib/clipr/types/ClipType";

type ClipTypeTabsProps = {
  value: ClipType;
  onChange: (clipType: ClipType) => void;
};

const tabs: { label: string; value: ClipType }[] = [
  { label: "UGC", value: "ugc" },
  { label: "Demo", value: "demo" },
];

export function ClipTypeTabs({ value, onChange }: ClipTypeTabsProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-slate-100 p-1">
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
