"use client";

import { Plus } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { SwiprLibraryCoverImage } from "@/app/_components/swipr/SwiprLibraryCoverImage";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";

type SwiprLibraryPhotoCardProps = {
  background: SwiprBackgroundAsset;
  isSaving: boolean;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onSelect: (background: SwiprBackgroundAsset) => void;
};

export function SwiprLibraryPhotoCard({
  background,
  isSaving,
  onLoadBackgroundBlob,
  onSelect,
}: SwiprLibraryPhotoCardProps) {
  return (
    <article className="w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
      <div className="aspect-[9/16] bg-surface-muted">
        <SwiprLibraryCoverImage
          backgroundId={background.id}
          onLoadBackgroundBlob={onLoadBackgroundBlob}
        />
      </div>
      <div className="grid gap-2 p-2">
        <p className="truncate text-xs font-semibold text-text-secondary">
          {background.libraryQuery || background.name}
        </p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={<Plus aria-hidden className="h-4 w-4" />}
          disabled={isSaving}
          onClick={() => onSelect(background)}
        >
          Use
        </Button>
      </div>
    </article>
  );
}
