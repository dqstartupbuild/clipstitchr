"use client";

import type { UploadAssetType } from "@/lib/clipstitchr/types/UploadAssetType";

type UploadAssetTabsProps = {
  assetTypes?: UploadAssetType[];
  value: UploadAssetType;
  onChange: (assetType: UploadAssetType) => void;
};

const tabs: { label: string; value: UploadAssetType }[] = [
  { label: "Hook/UGC", value: "ugc" },
  { label: "Demo", value: "demo" },
  { label: "Photo", value: "photo" },
];

export function UploadAssetTabs({
  assetTypes,
  value,
  onChange,
}: UploadAssetTabsProps) {
  const visibleTabs = assetTypes
    ? tabs.filter((tab) => assetTypes.includes(tab.value))
    : tabs;

  return (
    <div className="inline-flex rounded-lg border border-border bg-surface-muted p-1">
      {visibleTabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={[
            "h-8 rounded-md px-3 text-sm font-semibold transition-colors",
            value === tab.value
              ? "bg-surface text-accent-dark shadow-sm"
              : "text-text-secondary hover:text-text-primary",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
