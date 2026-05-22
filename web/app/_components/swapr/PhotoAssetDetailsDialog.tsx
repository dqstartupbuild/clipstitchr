"use client";

import { X } from "lucide-react";
import { MediaActionButtonList } from "@/app/_components/dashboard/MediaActionButtonList";
import { AssetTagList } from "@/app/_components/uploads/AssetTagList";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";

type PhotoAssetDetailsDialogProps = {
  actionItems?: MediaCardActionMenuItem[];
  avatarName?: string;
  imageUrl: string | null;
  photo: PhotoAssetMetadata;
  onClose: () => void;
};

export function PhotoAssetDetailsDialog({
  actionItems = [],
  avatarName,
  imageUrl,
  photo,
  onClose,
}: PhotoAssetDetailsDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-details-dialog-title"
        className="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Photo details
            </p>
            <h2
              id="photo-details-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {photo.name}
            </h2>
            <MediaActionButtonList items={actionItems} className="mt-3" />
          </div>
          <IconButton
            type="button"
            label="Close photo details"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-[260px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-lg bg-slate-100">
            <div className="aspect-[9/16]">
              {imageUrl ? (
                <div
                  aria-hidden
                  className="h-full w-full bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-text-tertiary">
                  Photo
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-5">
            {avatarName ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                  Avatar
                </p>
                <p className="mt-1 text-sm font-semibold text-accent-dark">
                  {avatarName}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Title
              </p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {photo.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Tags
              </p>
              <AssetTagList
                tags={photo.tags}
                className="mt-2"
                maxVisible={12}
                requiredTag="photo"
              />
            </div>
            {photo.poseDescription ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                  Pose
                </p>
                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  {photo.poseDescription}
                </p>
              </div>
            ) : null}
            {photo.outfitDescription ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                  Outfit
                </p>
                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  {photo.outfitDescription}
                </p>
              </div>
            ) : null}
            {photo.locationDescription ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                  Location
                </p>
                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  {photo.locationDescription}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                File
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {photo.width} x {photo.height} . {formatBytes(photo.size)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
