"use client";

import { X } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { SwiprLibraryCoverImage } from "@/app/_components/swipr/SwiprLibraryCoverImage";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type SwiprLibraryPackEditorPhotoProps = {
  background: SwiprBackgroundAsset;
  canRemove: boolean;
  isSaving: boolean;
  onLoadBackgroundBlob: (
    id: string,
    imageObject?: R2ObjectReference,
  ) => Promise<Blob>;
  onRemove: (background: SwiprBackgroundAsset) => void;
};

export function SwiprLibraryPackEditorPhoto({
  background,
  canRemove,
  isSaving,
  onLoadBackgroundBlob,
  onRemove,
}: SwiprLibraryPackEditorPhotoProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="aspect-[9/16] bg-surface-muted">
        <SwiprLibraryCoverImage
          backgroundId={background.id}
          imageObject={background.imageObject}
          onLoadBackgroundBlob={onLoadBackgroundBlob}
        />
      </div>
      <div className="grid gap-2 p-2">
        <p className="truncate text-xs font-semibold text-text-secondary">
          {background.name}
        </p>
        {canRemove ? (
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
        ) : null}
      </div>
    </article>
  );
}
