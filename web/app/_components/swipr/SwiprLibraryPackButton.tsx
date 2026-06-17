"use client";

import { Check, Pencil } from "lucide-react";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SwiprLibraryCoverImage } from "@/app/_components/swipr/SwiprLibraryCoverImage";
import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";

type SwiprLibraryPackButtonProps = {
  isSelected: boolean;
  pack: SwiprLibraryPack;
  onEdit?: (name: string) => void;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onToggle: (name: string) => void;
};

export function SwiprLibraryPackButton({
  isSelected,
  pack,
  onEdit,
  onLoadBackgroundBlob,
  onToggle,
}: SwiprLibraryPackButtonProps) {
  return (
    <article
      className={[
        "relative overflow-hidden rounded-lg border bg-white text-left transition-colors",
        isSelected
          ? "border-accent shadow-sm shadow-indigo-100"
          : "border-border hover:border-accent",
      ].join(" ")}
    >
      <button
        type="button"
        aria-pressed={isSelected}
        className="block w-full text-left"
        onClick={() => onToggle(pack.name)}
      >
        <div className="grid aspect-[4/5] grid-cols-2 grid-rows-2 bg-surface-muted">
          {Array.from({ length: 4 }).map((_, index) => {
            const backgroundId = pack.coverBackgroundIds[index];

            return (
              <div key={index} className="overflow-hidden bg-surface-muted">
                {backgroundId ? (
                  <SwiprLibraryCoverImage
                    backgroundId={backgroundId}
                    onLoadBackgroundBlob={onLoadBackgroundBlob}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-5">
          <p className="truncate text-xs font-bold text-white">{pack.name}</p>
          <p className="text-[10px] font-semibold text-white/75">
            {pack.count} photos
          </p>
        </div>
      </button>
      {onEdit ? (
        <IconButton
          label={`Edit ${pack.name}`}
          icon={<Pencil aria-hidden className="h-4 w-4" />}
          className="absolute left-1.5 top-1.5 bg-white/95"
          onClick={() => onEdit(pack.name)}
        />
      ) : null}
      {isSelected ? (
        <span className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
          <Check aria-hidden className="h-3 w-3" />
        </span>
      ) : null}
    </article>
  );
}
