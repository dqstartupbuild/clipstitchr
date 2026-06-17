"use client";

import { SwiprLibraryPackEditorPhoto } from "@/app/_components/swipr/SwiprLibraryPackEditorPhoto";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";

type SwiprLibraryPackPhotoListProps = {
  backgrounds: SwiprBackgroundAsset[];
  isSaving: boolean;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onRemovePhoto: (background: SwiprBackgroundAsset) => void;
};

export function SwiprLibraryPackPhotoList({
  backgrounds,
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
          isSaving={isSaving}
          onLoadBackgroundBlob={onLoadBackgroundBlob}
          onRemove={onRemovePhoto}
        />
      ))}
    </div>
  );
}
