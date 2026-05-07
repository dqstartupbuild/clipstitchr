"use client";

import { ImagePlus, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { UploadAssetTabs } from "@/app/_components/dashboard/UploadAssetTabs";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { UploadQueueList } from "@/app/_components/dashboard/UploadQueueList";
import { ACCEPTED_PHOTO_TYPES } from "@/lib/clipr/constants/acceptedPhotoTypes";
import { ACCEPTED_VIDEO_TYPES } from "@/lib/clipr/constants/acceptedVideoTypes";
import { useUploadProcessor } from "@/lib/clipr/hooks/useUploadProcessor";
import type { UploadAssetType } from "@/lib/clipr/types/UploadAssetType";

type UploadPanelProps = {
  onUploaded: () => void | Promise<void>;
  onPhotoUploaded: (
    files: FileList | File[],
    options?: { shouldExpandWithAi?: boolean },
  ) => void | Promise<void>;
  isPhotoUploading: boolean;
  initialAssetType?: UploadAssetType;
  onAssetTypeChange?: (assetType: UploadAssetType) => void;
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
    title: "Add UGC videos to the local library",
    description:
      "Selected UGC files are normalized to 1080 x 1920 before they are saved.",
    dropTitle: "Drop UGC videos here",
    dropDescription: "Use the segmented control above before selecting files.",
    acceptedTypes: ACCEPTED_VIDEO_TYPES,
  },
  demo: {
    title: "Add demo videos to the local library",
    description:
      "Selected demo files are normalized to 1080 x 1920 before they are saved.",
    dropTitle: "Drop demo videos here",
    dropDescription: "Use the segmented control above before selecting files.",
    acceptedTypes: ACCEPTED_VIDEO_TYPES,
  },
  photo: {
    title: "Add photos to the local library",
    description:
      "Photos are saved as 1080 x 1920 portrait references for Swapr.",
    dropTitle: "Drop photos here",
    dropDescription: "Use JPG or PNG source photos.",
    acceptedTypes: ACCEPTED_PHOTO_TYPES,
  },
};

export function UploadPanel({
  onUploaded,
  onPhotoUploaded,
  isPhotoUploading,
  initialAssetType = "ugc",
  onAssetTypeChange,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [shouldExpandPhotosWithAi, setShouldExpandPhotosWithAi] =
    useState(false);
  const assetType = initialAssetType;
  const uploadProcessor = useUploadProcessor({
    initialClipType: initialAssetType === "demo" ? "demo" : "ugc",
    onClipSaved: onUploaded,
  });
  const setClipType = uploadProcessor.setClipType;
  const content = contentByAssetType[assetType];
  const isPhoto = assetType === "photo";
  const isProcessing = isPhoto ? isPhotoUploading : uploadProcessor.isProcessing;

  const handleAssetTypeChange = (nextAssetType: UploadAssetType) => {
    onAssetTypeChange?.(nextAssetType);

    if (nextAssetType !== "photo") {
      setClipType(nextAssetType);
    }
  };

  const handleFiles = (files: FileList | File[]) => {
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
        <UploadAssetTabs
          value={assetType}
          onChange={handleAssetTypeChange}
        />
      </div>

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
        <Button
          type="button"
          className="mt-5"
          isLoading={isProcessing}
          onClick={() => inputRef.current?.click()}
        >
          Choose Files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
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
            onChange={(event) =>
              setShouldExpandPhotosWithAi(event.currentTarget.checked)
            }
          />
          <span className="text-sm leading-6 text-text-secondary">
            AI-expand the background instead of cropping. When off, photos are
            auto-cropped to 9:16.
          </span>
        </label>
      ) : (
        <UploadQueueList queue={uploadProcessor.queue} />
      )}
    </Panel>
  );
}
