"use client";

import { UserRound } from "lucide-react";
import { PhotoAssetCard } from "@/app/_components/swapr/PhotoAssetCard";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

type SwiprAvatarPhotoPanelProps = {
  photos: PhotoAssetMetadata[];
  onLoadPhoto: (id: string) => Promise<PhotoAsset | null>;
  onSelectPhoto: (photo: PhotoAssetMetadata) => void;
};

export function SwiprAvatarPhotoPanel({
  photos,
  onLoadPhoto,
  onSelectPhoto,
}: SwiprAvatarPhotoPanelProps) {
  return (
    <section className="min-w-0 border-t border-border pt-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <UserRound aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Avatar photos</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Use saved photos
          </h2>
        </div>
      </div>
      {photos.length ? (
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {photos.map((photo) => (
            <div key={photo.id} className="w-32 shrink-0">
              <PhotoAssetCard
                photo={photo}
                onLoadPhoto={onLoadPhoto}
                onSelect={onSelectPhoto}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface-elevated px-3 py-3 text-sm font-semibold text-text-secondary">
          No avatar photos yet
        </div>
      )}
    </section>
  );
}
