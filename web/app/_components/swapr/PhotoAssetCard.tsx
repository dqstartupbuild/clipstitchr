"use client";

import { Check, Download, Edit3, Trash2 } from "lucide-react";
import { useState } from "react";
import { AssetMetadataEditDialog } from "@/app/_components/uploads/AssetMetadataEditDialog";
import { AssetTagList } from "@/app/_components/uploads/AssetTagList";
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
  isSelected,
  onSelect,
  onLoadPhoto,
  onDelete,
  onUpdateMetadata,
  showDownload = true,
}: PhotoAssetCardProps) {
  const imageUrl = useObjectUrl(photo.thumbnailBlob);
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
  );

  return (
    <div
      className={[
        "rounded-lg border bg-white p-2 transition-colors",
        isSelected ? "border-accent ring-2 ring-accent/15" : "border-border",
      ].join(" ")}
    >
      {onSelect ? (
        <button
          type="button"
          aria-label={`Select ${photo.name}`}
          className="block w-full overflow-hidden rounded-md bg-slate-100 text-left"
          onClick={() => onSelect(photo)}
        >
          {preview}
        </button>
      ) : (
        <div className="overflow-hidden rounded-md bg-slate-100">{preview}</div>
      )}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text-primary">
            {photo.name}
          </p>
          <p className="mt-1 text-xs text-text-tertiary">
            {photo.width} x {photo.height} . {formatBytes(photo.size)}
          </p>
          <AssetTagList tags={photo.tags} className="mt-3" requiredTag="photo" />
        </div>
        <div className="flex shrink-0 gap-1">
          {isSelected ? (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
              <Check aria-hidden className="h-4 w-4" />
            </span>
          ) : null}
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
      {isMetadataOpen ? (
        <AssetMetadataEditDialog
          title={photo.name}
          initialName={photo.name}
          initialTags={photo.tags}
          requiredTag="photo"
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
