"use client";

import { useState } from "react";
import { SwiprLibraryPackDeleteAction } from "@/app/_components/swipr/SwiprLibraryPackDeleteAction";
import { SwiprLibraryPackPhotoList } from "@/app/_components/swipr/SwiprLibraryPackPhotoList";
import { SwiprLibraryPackRenameForm } from "@/app/_components/swipr/SwiprLibraryPackRenameForm";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";
import { getSwiprLibraryBackgroundsByPackName } from "@/lib/clipstitchr/utils/getSwiprLibraryBackgroundsByPackName";

type SwiprLibraryPackEditorProps = {
  backgrounds: SwiprBackgroundAsset[];
  isSaving: boolean;
  pack: SwiprLibraryPack;
  onDeletePack: (packName: string) => Promise<void>;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onRemovePhoto: (background: SwiprBackgroundAsset) => Promise<void>;
  onRenamePack: (fromName: string, toName: string) => Promise<string>;
};

export function SwiprLibraryPackEditor({
  backgrounds,
  isSaving,
  pack,
  onDeletePack,
  onLoadBackgroundBlob,
  onRemovePhoto,
  onRenamePack,
}: SwiprLibraryPackEditorProps) {
  const [draftName, setDraftName] = useState(pack.name);
  const packBackgrounds = getSwiprLibraryBackgroundsByPackName(
    backgrounds,
    pack.name,
  );

  const handleRename = () => {
    void onRenamePack(pack.name, draftName)
      .then(setDraftName)
      .catch(() => undefined);
  };

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-surface-elevated p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-text-tertiary">Edit pack</p>
          <h3 className="mt-0.5 text-sm font-bold text-text-primary">
            {pack.name}
          </h3>
        </div>
        <SwiprLibraryPackDeleteAction
          isSaving={isSaving}
          onDelete={() => {
            void onDeletePack(pack.name).catch(() => undefined);
          }}
        />
      </div>
      <SwiprLibraryPackRenameForm
        draftName={draftName}
        isSaving={isSaving}
        onDraftNameChange={setDraftName}
        onSubmit={handleRename}
      />
      {packBackgrounds.length ? (
        <SwiprLibraryPackPhotoList
          backgrounds={packBackgrounds}
          isSaving={isSaving}
          onLoadBackgroundBlob={onLoadBackgroundBlob}
          onRemovePhoto={(background) => {
            void onRemovePhoto(background).catch(() => undefined);
          }}
        />
      ) : (
        <p className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-text-secondary">
          This pack is empty.
        </p>
      )}
    </div>
  );
}
