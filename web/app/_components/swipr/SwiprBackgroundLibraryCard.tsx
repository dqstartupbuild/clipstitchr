"use client";

import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";

type SwiprBackgroundLibraryCardProps = {
  background: SwiprBackgroundAsset;
  isSelected: boolean;
  onSelect: (background: SwiprBackgroundAsset) => void;
};

export function SwiprBackgroundLibraryCard({
  background,
  isSelected,
  onSelect,
}: SwiprBackgroundLibraryCardProps) {
  const backgroundUrl = useObjectUrl(background.blob);

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={[
        "w-24 shrink-0 overflow-hidden rounded-lg border bg-white text-left transition-colors",
        isSelected
          ? "border-accent ring-2 ring-accent/15"
          : "border-border hover:border-accent",
      ].join(" ")}
      onClick={() => onSelect(background)}
    >
      <span
        aria-hidden
        className="block aspect-[4/3] bg-slate-100 bg-cover bg-center"
        style={
          backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : {}
        }
      />
      <span className="block min-w-0 p-1.5">
        <span className="block truncate text-xs font-bold text-text-primary">
          {background.name}
        </span>
      </span>
    </button>
  );
}
