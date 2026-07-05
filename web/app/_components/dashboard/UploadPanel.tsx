"use client";

import { ImagePlus, UploadCloud, X } from "lucide-react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { UploadAssetTabs } from "@/app/_components/dashboard/UploadAssetTabs";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { Panel } from "@/app/_components/ui/Panel";
import { UploadQueueList } from "@/app/_components/dashboard/UploadQueueList";
import { ACCEPTED_PHOTO_TYPES } from "@/lib/clipstitchr/constants/acceptedPhotoTypes";
import { ACCEPTED_VIDEO_TYPES } from "@/lib/clipstitchr/constants/acceptedVideoTypes";
import { useUploadProcessor } from "@/lib/clipstitchr/hooks/useUploadProcessor";
import type { UploadAssetType } from "@/lib/clipstitchr/types/UploadAssetType";
import { getUploadBatchLimit } from "@/lib/clipstitchr/utils/getUploadBatchLimit";
import { getUploadBatchLimitMessage } from "@/lib/clipstitchr/utils/getUploadBatchLimitMessage";

type UploadPanelProps = {
  allowedAssetTypes?: UploadAssetType[];
  onUploaded: () => void | Promise<void>;
  onPhotoUploaded: (
    files: FileList | File[],
    options?: { shouldExpandWithAi?: boolean },
  ) => void | Promise<boolean | void>;
  isPhotoUploading: boolean;
  initialAssetType?: UploadAssetType;
  onAssetTypeChange?: (assetType: UploadAssetType) => void;
  onDismiss?: () => void;
  canUploadDemo?: boolean;
  demoProductId?: string;
  demoUploadBlockedMessage?: string;
  demoControls?: ReactNode;
  onPhotoExpandPreferenceChange?: (shouldExpandWithAi: boolean) => void;
  photoControls?: ReactNode;
};

const contentByAssetType: Record<
  UploadAssetType,
  {
    title: string;
    description: string;
    dropTitle: string;
    dropDescription: string;
    acceptedTypes: string[];
  }
> = {
  ugc: {
    title: "Add opener clips",
    description:
      "Use these as hooks, reactions, b-roll, or social proof before the product demo.",
    dropTitle: "Drop opener clips here",
    dropDescription: "Drag in videos, or choose files below.",
    acceptedTypes: ACCEPTED_VIDEO_TYPES,
  },
  demo: {
    title: "Add product demos",
    description:
      "Use these as the product walkthrough that comes after the opener.",
    dropTitle: "Drop demo videos here",
    dropDescription: "Drag in videos, or choose files below.",
    acceptedTypes: ACCEPTED_VIDEO_TYPES,
  },
  photo: {
    title: "Add avatar photos",
    description:
      "Use avatar photos when you need more source clips without another shoot.",
    dropTitle: "Drop photos here",
    dropDescription: "Use JPG or PNG photos.",
    acceptedTypes: ACCEPTED_PHOTO_TYPES,
  },
};

export function UploadPanel({
  allowedAssetTypes,
  onUploaded,
  onPhotoUploaded,
  isPhotoUploading,
  initialAssetType = "ugc",
  onAssetTypeChange,
  onDismiss,
  canUploadDemo = true,
  demoProductId,
  demoUploadBlockedMessage = "Choose a product before uploading demo videos.",
  demoControls,
  onPhotoExpandPreferenceChange,
  photoControls,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [shouldExpandPhotosWithAi, setShouldExpandPhotosWithAi] =
    useState(false);
  const assetType = initialAssetType;
  const shouldShowAssetTabs =
    !allowedAssetTypes || allowedAssetTypes.length > 1;
  const uploadProcessor = useUploadProcessor({
    demoProductId,
    initialClipType: initialAssetType === "demo" ? "demo" : "ugc",
    onClipSaved: onUploaded,
  });
  const setClipType = uploadProcessor.setClipType;
  const content = contentByAssetType[assetType];
  const isPhoto = assetType === "photo";
  const isProcessing = isPhoto ? isPhotoUploading : uploadProcessor.isProcessing;
  const uploadBatchLimit = getUploadBatchLimit({
    assetType,
    shouldExpandWithAi: shouldExpandPhotosWithAi,
  });
  const uploadBatchLimitMessage = getUploadBatchLimitMessage({
    assetType,
    limit: uploadBatchLimit,
    shouldExpandWithAi: shouldExpandPhotosWithAi,
  });
  const currentUploadError = uploadError ?? (isPhoto ? null : uploadProcessor.error);

  const handleAssetTypeChange = (nextAssetType: UploadAssetType) => {
    setUploadError(null);
    onAssetTypeChange?.(nextAssetType);

    if (nextAssetType !== "photo") {
      setClipType(nextAssetType);
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    const selectedFileCount = Array.from(files).filter((file) =>
      content.acceptedTypes.includes(file.type),
    ).length;

    if (selectedFileCount > uploadBatchLimit) {
      setUploadError(uploadBatchLimitMessage);
      return;
    }

    if (selectedFileCount === 0) {
      setUploadError(isPhoto ? "Choose JPG or PNG photos." : "Choose videos.");
      return;
    }

    if (assetType === "demo" && !canUploadDemo) {
      setUploadError(demoUploadBlockedMessage);
      return;
    }

    setUploadError(null);

    if (isPhoto) {
      void onPhotoUploaded(files, {
        shouldExpandWithAi: shouldExpandPhotosWithAi,
      });
      return;
    }

    void uploadProcessor.processFiles(files);
  };

  return (
    <Panel id="upload-panel" className="p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Upload</p>
          <h2 className="mt-2 text-xl font-bold text-text-primary">
            {content.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            {content.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {shouldShowAssetTabs ? (
            <UploadAssetTabs
              assetTypes={allowedAssetTypes}
              value={assetType}
              onChange={handleAssetTypeChange}
            />
          ) : null}
          {onDismiss ? (
            <IconButton
              type="button"
              label="Dismiss upload controls"
              icon={<X aria-hidden className="h-4 w-4" />}
              onClick={onDismiss}
            />
          ) : null}
        </div>
      </div>

      {isPhoto && photoControls ? (
        <div className="mt-5">{photoControls}</div>
      ) : null}
      {assetType === "demo" && demoControls ? (
        <div className="mt-5">{demoControls}</div>
      ) : null}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={[
          "mt-5 flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors",
          isDragging
            ? "border-accent bg-surface-muted"
            : "border-border bg-slate-50",
        ].join(" ")}
      >
        {isPhoto ? (
          <ImagePlus aria-hidden className="h-10 w-10 text-accent" />
        ) : (
          <UploadCloud aria-hidden className="h-10 w-10 text-accent" />
        )}
        <p className="mt-4 text-sm font-semibold text-text-primary">
          {content.dropTitle}
        </p>
        <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
          {content.dropDescription}
        </p>
        <p className="mt-1 text-xs font-semibold text-text-tertiary">
          {uploadBatchLimitMessage}
        </p>
        <Button
          type="button"
          className="mt-5"
          isLoading={isProcessing}
          disabled={assetType === "demo" && !canUploadDemo}
          onClick={() => inputRef.current?.click()}
        >
          Choose Files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple={uploadBatchLimit > 1}
          accept={content.acceptedTypes.join(",")}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) {
              handleFiles(event.target.files);
              event.target.value = "";
            }
          }}
        />
      </div>

      {isPhoto ? (
        <label className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-surface-elevated p-3">
          <input
            type="checkbox"
            checked={shouldExpandPhotosWithAi}
            className="mt-1 h-4 w-4 accent-accent"
            onChange={(event) => {
              const nextShouldExpandWithAi = event.currentTarget.checked;

              setUploadError(null);
              setShouldExpandPhotosWithAi(nextShouldExpandWithAi);
              onPhotoExpandPreferenceChange?.(nextShouldExpandWithAi);
            }}
          />
          <span className="text-sm leading-6 text-text-secondary">
            Fill the background instead of cropping tightly. Best for photos
            that need more room.
          </span>
        </label>
      ) : (
        <UploadQueueList queue={uploadProcessor.queue} />
      )}
      {currentUploadError ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {currentUploadError}
        </div>
      ) : null}
    </Panel>
  );
}
