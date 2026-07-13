"use client";

import { Download } from "lucide-react";
import { downloadTextFile } from "@/lib/clipstitchr/tools/resources/downloadTextFile";

type ResourceDownloadButtonProps = {
  contents: string;
  fileName: string;
  label: string;
  type?: string;
};

export function ResourceDownloadButton({
  contents,
  fileName,
  label,
  type,
}: ResourceDownloadButtonProps) {
  return (
    <button
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-bold text-text-primary transition-colors hover:border-accent hover:bg-surface-elevated"
      onClick={() => downloadTextFile(contents, fileName, type)}
      type="button"
    >
      <Download aria-hidden className="h-4 w-4" />
      {label}
    </button>
  );
}
