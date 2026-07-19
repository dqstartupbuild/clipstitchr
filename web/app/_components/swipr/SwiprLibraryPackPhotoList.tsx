"use client";

import { SwiprLibraryPackEditorPhoto } from "@/app/_components/swipr/SwiprLibraryPackEditorPhoto";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type SwiprLibraryPackPhotoListProps = {
  backgrounds: SwiprBackgroundAsset[];
  canRemove: boolean;
  isSaving: boolean;
  onLoadBackgroundBlob: (
    id: string,
    imageObject?: R2ObjectReference,
  ) => Promise<Blob>;
  onRemovePhoto: (background: SwiprBackgroundAsset) => void;
};

export function SwiprLibraryPackPhotoList({
  backgrounds,
  canRemove,
  isSaving,
  onLoadBackgroundBlob,
  onRemovePhoto,
}: SwiprLibraryPackPhotoListProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {backgrounds.map((background) => (
        <SwiprLibraryPackEditorPhoto
          key={background.id}
          background={background}
          canRemove={canRemove}
          isSaving={isSaving}
          onLoadBackgroundBlob={onLoadBackgroundBlob}
          onRemove={onRemovePhoto}
        />
      ))}
    </div>
  );
}
