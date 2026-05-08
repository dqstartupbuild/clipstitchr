"use client";

import type { UploadAssetType } from "@/lib/clipstitchr/types/UploadAssetType";

type UploadAssetTabsProps = {
  value: UploadAssetType;
  onChange: (assetType: UploadAssetType) => void;
};

const tabs: { label: string; value: UploadAssetType }[] = [
  { label: "UGC", value: "ugc" },
  { label: "Demo", value: "demo" },
  { label: "Photo", value: "photo" },
];

export function UploadAssetTabs({ value, onChange }: UploadAssetTabsProps) {
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
