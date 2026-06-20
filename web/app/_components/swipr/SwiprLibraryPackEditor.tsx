"use client";

import { Minus, X } from "lucide-react";
import { SwiprLibraryPackPhotoList } from "@/app/_components/swipr/SwiprLibraryPackPhotoList";
import { Button } from "@/app/_components/ui/Button";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";
import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";
import { getSwiprLibraryBackgroundsByPackName } from "@/lib/clipstitchr/utils/getSwiprLibraryBackgroundsByPackName";

type SwiprLibraryPackEditorProps = {
  backgrounds: SwiprBackgroundAsset[];
  isMine: boolean;
  isSaving: boolean;
  pack: SwiprLibraryPack;
  onDismiss: () => void;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onRemovePack: (packName: string) => Promise<void>;
  onRemovePhoto: (background: SwiprBackgroundAsset) => Promise<void>;
};

export function SwiprLibraryPackEditor({
  backgrounds,
  isMine,
  isSaving,
  pack,
  onDismiss,
  onLoadBackgroundBlob,
  onRemovePack,
  onRemovePhoto,
}: SwiprLibraryPackEditorProps) {
  const packBackgrounds = getSwiprLibraryBackgroundsByPackName(
    backgrounds,
    pack.name,
  );

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-surface-elevated p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-text-tertiary">
            Pack photos
          </p>
          <h3 className="mt-0.5 text-sm font-bold text-text-primary">
            {pack.name}
          </h3>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {isMine ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={<Minus aria-hidden className="h-4 w-4" />}
              isLoading={isSaving}
              onClick={() => {
                void onRemovePack(pack.name).catch(() => undefined);
              }}
            >
              Remove pack
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="subtle"
            icon={<X aria-hidden className="h-4 w-4" />}
            disabled={isSaving}
            onClick={onDismiss}
          >
            Close
          </Button>
        </div>
      </div>
      {packBackgrounds.length ? (
        <SwiprLibraryPackPhotoList
          backgrounds={packBackgrounds}
          canRemove={isMine}
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
