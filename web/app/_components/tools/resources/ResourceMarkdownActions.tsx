"use client";

import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import { ResourceDownloadButton } from "@/app/_components/tools/resources/ResourceDownloadButton";

type ResourceMarkdownActionsProps = {
  copyLabel: string;
  downloadLabel: string;
  fileName: string;
  markdown: string;
};

export function ResourceMarkdownActions({
  copyLabel,
  downloadLabel,
  fileName,
  markdown,
}: ResourceMarkdownActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <CopyTextButton label={copyLabel} text={markdown} />
      <ResourceDownloadButton
        contents={markdown}
        fileName={fileName}
        label={downloadLabel}
        type="text/markdown;charset=utf-8"
      />
    </div>
  );
}
