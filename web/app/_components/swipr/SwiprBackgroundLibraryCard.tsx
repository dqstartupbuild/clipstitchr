"use client";

import { useEffect, useState } from "react";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";

type SwiprBackgroundLibraryCardProps = {
  background: SwiprBackgroundAsset;
  isSelected: boolean;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onSelect: (background: SwiprBackgroundAsset) => void;
};

export function SwiprBackgroundLibraryCard({
  background,
  isSelected,
  onLoadBackgroundBlob,
  onSelect,
}: SwiprBackgroundLibraryCardProps) {
  const [loadedBackground, setLoadedBackground] = useState<{
    blob: Blob;
    id: string;
  } | null>(null);
  const blob =
    background.blob ??
    (loadedBackground?.id === background.id ? loadedBackground.blob : undefined);
  const backgroundUrl = useObjectUrl(blob);

  useEffect(() => {
    let isCancelled = false;

    if (background.blob) {
      return () => {
        isCancelled = true;
      };
    }

    void onLoadBackgroundBlob(background.id)
      .then((loadedBlob) => {
        if (!isCancelled) {
          setLoadedBackground({
            id: background.id,
            blob: loadedBlob,
          });
        }
      })
      .catch(() => undefined);

    return () => {
      isCancelled = true;
    };
  }, [background.blob, background.id, onLoadBackgroundBlob]);

  return (
    <button
      type="button"
      aria-label={`Select ${background.name} background`}
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
    </button>
  );
}
