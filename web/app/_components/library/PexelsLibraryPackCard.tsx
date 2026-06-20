"use client";

import { Check, Eye, Plus, X } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { SwiprLibraryCoverImage } from "@/app/_components/swipr/SwiprLibraryCoverImage";
import type { SwiprLibraryPack } from "@/lib/clipstitchr/types/SwiprLibraryPack";

type PexelsLibraryPackCardProps = {
  isMine: boolean;
  isSaving: boolean;
  pack: SwiprLibraryPack;
  onAdd: (name: string) => void;
  onLoadBackgroundBlob: (id: string) => Promise<Blob>;
  onRemove: (name: string) => void | Promise<void>;
  onView: (name: string) => void;
};

export function PexelsLibraryPackCard({
  isMine,
  isSaving,
  pack,
  onAdd,
  onLoadBackgroundBlob,
  onRemove,
  onView,
}: PexelsLibraryPackCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-white">
      <button
        type="button"
        className="block w-full text-left transition-colors hover:bg-surface-elevated"
        onClick={() => onView(pack.name)}
      >
        <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2 bg-surface-muted">
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
        <div className="p-3 pb-0">
          <h3 className="truncate text-sm font-bold text-text-primary">
            {pack.name}
          </h3>
          <p className="text-xs font-semibold text-text-tertiary">
            {pack.count} photos
          </p>
        </div>
      </button>
      <div className="grid gap-3 p-3">
        <div className="flex flex-wrap gap-2">
          {isMine ? (
            <Button
              type="button"
              size="sm"
              variant="subtle"
              icon={<Check aria-hidden className="h-4 w-4" />}
              disabled
            >
              Added
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={<Plus aria-hidden className="h-4 w-4" />}
              isLoading={isSaving}
              onClick={() => onAdd(pack.name)}
            >
              Add
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            icon={<Eye aria-hidden className="h-4 w-4" />}
            disabled={isSaving}
            onClick={() => onView(pack.name)}
          >
            View
          </Button>
          {isMine ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={<X aria-hidden className="h-4 w-4" />}
              isLoading={isSaving}
              onClick={() => {
                void onRemove(pack.name);
              }}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
