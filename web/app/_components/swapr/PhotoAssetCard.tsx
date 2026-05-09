"use client";

import { Check, Download, Edit3, Trash2 } from "lucide-react";
import { useState } from "react";
import { PhotoAssetDetailsDialog } from "@/app/_components/swapr/PhotoAssetDetailsDialog";
import { AssetMetadataEditDialog } from "@/app/_components/uploads/AssetMetadataEditDialog";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import { downloadBlob } from "@/lib/clipstitchr/utils/downloadBlob";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { getAssetDownloadFileName } from "@/lib/clipstitchr/utils/getAssetDownloadFileName";
import { getMimeTypeFileExtension } from "@/lib/clipstitchr/utils/getMimeTypeFileExtension";

type PhotoAssetCardProps = {
  photo: PhotoAssetMetadata;
  avatarName?: string;
  isSelected?: boolean;
  onSelect?: (photo: PhotoAssetMetadata) => void;
  onLoadPhoto?: (id: string) => Promise<PhotoAsset | null>;
  onDelete?: (id: string) => void | Promise<void>;
  onUpdateMetadata?: (
    photo: PhotoAssetMetadata,
    metadata: AssetMetadataUpdate,
  ) => void | Promise<void>;
  showDownload?: boolean;
};

export function PhotoAssetCard({
  photo,
  avatarName,
  isSelected,
  onSelect,
  onLoadPhoto,
  onDelete,
  onUpdateMetadata,
  showDownload = true,
}: PhotoAssetCardProps) {
  const imageUrl = useObjectUrl(photo.thumbnailBlob);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownload = async () => {
    if (!onLoadPhoto) {
      return;
    }

    setIsDownloading(true);

    try {
      const loadedPhoto = await onLoadPhoto(photo.id);

      if (!loadedPhoto) {
        return;
      }

      downloadBlob(
        loadedPhoto.blob,
        getAssetDownloadFileName(
          photo.name,
          getMimeTypeFileExtension(loadedPhoto.blob.type || photo.mimeType, "jpg"),
        ),
      );
    } finally {
      setIsDownloading(false);
    }
  };
  const preview = (
    <div className="relative aspect-square">
      {imageUrl ? (
        <div
          aria-hidden
          className="h-full w-full bg-cover bg-top bg-no-repeat"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-text-tertiary">
          Photo
        </div>
      )}
      {avatarName ? (
        <span className="absolute left-2 top-2 max-w-[75%] truncate rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold leading-none text-accent-dark shadow-sm shadow-slate-900/10">
          {avatarName}
        </span>
      ) : null}
    </div>
  );

  return (
    <div
      className={[
        "rounded-lg border bg-white p-2 transition-colors",
        isSelected ? "border-accent ring-2 ring-accent/15" : "border-border",
      ].join(" ")}
    >
      <div className="relative overflow-hidden rounded-md bg-slate-100">
        <button
          type="button"
          aria-label={`Open details for ${photo.name}`}
          className="block w-full text-left"
          onClick={() => setIsDetailsOpen(true)}
        >
          {preview}
        </button>
        {onSelect ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={Boolean(isSelected)}
            aria-label={`${isSelected ? "Deselect" : "Select"} ${photo.name}`}
            className={[
              "absolute right-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-md border-[4px] shadow-[0_4px_12px_rgba(15,23,42,0.32)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              isSelected
                ? "border-white/90 bg-accent text-white"
                : "border-white bg-white/90 text-transparent hover:bg-white hover:text-text-tertiary",
            ].join(" ")}
            onClick={() => onSelect(photo)}
          >
            <Check aria-hidden className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <button
          type="button"
          className="min-w-0 flex-1 rounded-md text-left outline-none transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          onClick={() => setIsDetailsOpen(true)}
        >
          <p className="truncate text-sm font-bold text-text-primary">
            {photo.name}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {photo.width} x {photo.height} . {formatBytes(photo.size)}
          </p>
        </button>
        <div className="flex shrink-0 gap-1">
          {showDownload && onLoadPhoto ? (
            <IconButton
              label="Download photo"
              icon={<Download aria-hidden className="h-4 w-4" />}
              disabled={isDownloading}
              onClick={() => void handleDownload()}
            />
          ) : null}
          {onUpdateMetadata ? (
            <IconButton
              label="Edit photo details"
              icon={<Edit3 aria-hidden className="h-4 w-4" />}
              onClick={() => setIsMetadataOpen(true)}
            />
          ) : null}
          {onDelete ? (
            <IconButton
              label="Delete photo"
              variant="danger"
              icon={<Trash2 aria-hidden className="h-4 w-4" />}
              onClick={() => void onDelete(photo.id)}
            />
          ) : null}
        </div>
      </div>
      {isDetailsOpen ? (
        <PhotoAssetDetailsDialog
          avatarName={avatarName}
          imageUrl={imageUrl}
          photo={photo}
          onClose={() => setIsDetailsOpen(false)}
        />
      ) : null}
      {isMetadataOpen ? (
        <AssetMetadataEditDialog
          initialLocationDescription={photo.locationDescription}
          title={photo.name}
          initialName={photo.name}
          initialOutfitDescription={photo.outfitDescription}
          initialPoseDescription={photo.poseDescription}
          initialTags={photo.tags}
          requiredTag="photo"
          showPhotoDescriptionFields
          onClose={() => setIsMetadataOpen(false)}
          onSave={async (metadata) => {
            await onUpdateMetadata?.(photo, metadata);
            setIsMetadataOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
