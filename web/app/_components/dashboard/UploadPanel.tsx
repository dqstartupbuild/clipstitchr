"use client";

import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { ClipTypeTabs } from "@/app/_components/dashboard/ClipTypeTabs";
import { UploadQueueList } from "@/app/_components/dashboard/UploadQueueList";
import { ACCEPTED_VIDEO_TYPES } from "@/lib/clipr/constants/acceptedVideoTypes";
import { useUploadProcessor } from "@/lib/clipr/hooks/useUploadProcessor";

type UploadPanelProps = {
  onUploaded: () => void | Promise<void>;
};

export function UploadPanel({ onUploaded }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const uploadProcessor = useUploadProcessor({ onClipSaved: onUploaded });

  return (
    <Panel id="upload-panel" className="p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Upload</p>
          <h2 className="mt-2 text-xl font-bold text-text-primary">
            Add videos to the local library
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            Selected files are normalized to 1080 x 1920 before they are saved.
          </p>
        </div>
        <ClipTypeTabs
          value={uploadProcessor.clipType}
          onChange={uploadProcessor.setClipType}
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
          void uploadProcessor.processFiles(event.dataTransfer.files);
        }}
        className={[
          "mt-5 flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors",
          isDragging
            ? "border-accent bg-surface-muted"
            : "border-border bg-slate-50",
        ].join(" ")}
      >
        <UploadCloud aria-hidden className="h-10 w-10 text-accent" />
        <p className="mt-4 text-sm font-semibold text-text-primary">
          Drop videos here
        </p>
        <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
          Use the segmented control above before selecting files.
        </p>
        <Button
          type="button"
          className="mt-5"
          isLoading={uploadProcessor.isProcessing}
          onClick={() => inputRef.current?.click()}
        >
          Choose Files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_VIDEO_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) {
              void uploadProcessor.processFiles(event.target.files);
              event.target.value = "";
            }
          }}
        />
      </div>

      <UploadQueueList queue={uploadProcessor.queue} />
    </Panel>
  );
}
