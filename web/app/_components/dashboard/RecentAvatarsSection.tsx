"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import { PhotoAssetCard } from "@/app/_components/swapr/PhotoAssetCard";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

type RecentAvatarsSectionProps = {
  avatars: Avatar[];
  photos: PhotoAssetMetadata[];
  onLoadPhoto: (id: string) => Promise<PhotoAsset | null>;
  onDelete: (id: string) => void | Promise<void>;
  onUpdateMetadata: (
    photo: PhotoAssetMetadata,
    metadata: AssetMetadataUpdate,
  ) => void | Promise<void>;
};

export function RecentAvatarsSection({
  avatars,
  photos,
  onLoadPhoto,
  onDelete,
  onUpdateMetadata,
}: RecentAvatarsSectionProps) {
  const avatarNamesById = new Map(
    avatars.map((avatar) => [avatar.id, avatar.name]),
  );

  return (
    <section id="recent-avatars">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-text-primary">
          Recent Avatars
        </h2>
        <SecondaryButtonLink
          href="/dashboard/avatars"
          className="h-9 px-3 text-xs"
        >
          See all
        </SecondaryButtonLink>
      </div>
      {photos.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {photos.map((photo) => (
            <PhotoAssetCard
              key={photo.id}
              avatarName={
                photo.avatarId ? avatarNamesById.get(photo.avatarId) : undefined
              }
              photo={photo}
              onDelete={onDelete}
              onLoadPhoto={onLoadPhoto}
              onUpdateMetadata={onUpdateMetadata}
            />
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title="No avatars yet"
          description="Upload avatar photos to make them available for Swapr."
        />
      )}
    </section>
  );
}
