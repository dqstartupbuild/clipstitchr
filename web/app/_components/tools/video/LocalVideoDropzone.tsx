"use client";

import { Loader2, ShieldCheck, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { ACCEPTED_VIDEO_TYPES } from "@/lib/clipstitchr/constants/acceptedVideoTypes";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";

type LocalVideoDropzoneProps = {
  emptyPrompt?: string;
  errorMessage: string | null;
  file: File | null;
  inputId: string;
  isInspecting: boolean;
  onFile: (file: File) => void;
};

export function LocalVideoDropzone({
  emptyPrompt = "Drop one app demo here",
  errorMessage,
  file,
  inputId,
  isInspecting,
  onFile,
}: LocalVideoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div>
      <div
        className={[
          "flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors",
          isDragging
            ? "border-accent bg-accent/5"
            : "border-border bg-slate-50",
        ].join(" ")}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const nextFile = event.dataTransfer.files.item(0);

          if (nextFile) {
            onFile(nextFile);
          }
        }}
      >
        {isInspecting ? (
          <Loader2 aria-hidden className="h-10 w-10 animate-spin text-accent" />
        ) : (
          <UploadCloud aria-hidden className="h-10 w-10 text-accent" />
        )}
        <p className="mt-4 text-base font-bold text-text-primary">
          {isInspecting
            ? "Checking this video in your browser"
            : file
              ? "Choose a different video"
              : emptyPrompt}
        </p>
        <p className="mt-2 max-w-lg text-sm leading-6 text-text-secondary">
          MP4, MOV, WebM, and M4V files work best. The file is inspected on this
          device and is never uploaded.
        </p>
        {file ? (
          <p className="mt-3 max-w-full truncate text-xs font-semibold text-text-tertiary">
            {file.name} · {formatBytes(file.size)}
          </p>
        ) : null}
        <button
          type="button"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-bold text-white transition-colors hover:bg-accent-dark disabled:cursor-wait disabled:bg-text-tertiary"
          disabled={isInspecting}
          onClick={() => inputRef.current?.click()}
        >
          {file ? "Replace video" : "Choose video"}
        </button>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED_VIDEO_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => {
            const nextFile = event.currentTarget.files?.item(0);

            if (nextFile) {
              onFile(nextFile);
            }

            event.currentTarget.value = "";
          }}
        />
        <p className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-text-tertiary">
          <ShieldCheck aria-hidden className="h-4 w-4 text-accent-dark" />
          Local-only check. No video upload or account required.
        </p>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {isInspecting
          ? "Checking video."
          : file && !errorMessage
            ? "Video check finished."
            : ""}
      </p>
      {errorMessage ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
