"use client";

import { VideoPreview } from "@/app/_components/ui/VideoPreview";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";

type LocalVideoPreviewProps = {
  file: File;
};

export function LocalVideoPreview({ file }: LocalVideoPreviewProps) {
  const videoUrl = useObjectUrl(file);

  return (
    <div className="mx-auto w-full max-w-xs">
      <VideoPreview
        controls
        label={`Local preview of ${file.name}`}
        muted={false}
        src={videoUrl}
      />
    </div>
  );
}
