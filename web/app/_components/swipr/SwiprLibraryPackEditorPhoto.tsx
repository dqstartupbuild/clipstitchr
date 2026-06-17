"use client";

import { X } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { SwiprLibraryCoverImage } from "@/app/_components/swipr/SwiprLibraryCoverImage";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";

type SwiprLibraryPackEditorPhotoProps = {
  background: SwiprBackgroundAsset;
  isSaving: boolean;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onRemove: (background: SwiprBackgroundAsset) => void;
};

export function SwiprLibraryPackEditorPhoto({
  background,
  isSaving,
  onLoadBackgroundBlob,
  onRemove,
}: SwiprLibraryPackEditorPhotoProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="aspect-[9/16] bg-surface-muted">
        <SwiprLibraryCoverImage
          backgroundId={background.id}
          onLoadBackgroundBlob={onLoadBackgroundBlob}
        />
      </div>
      <div className="grid gap-2 p-2">
        <p className="truncate text-xs font-semibold text-text-secondary">
          {background.name}
        </p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={<X aria-hidden className="h-4 w-4" />}
          disabled={isSaving}
          onClick={() => onRemove(background)}
        >
          Remove
        </Button>
      </div>
    </article>
  );
}
