"use client";

import { Download, Trash2 } from "lucide-react";
import { IconButton } from "@/app/_components/ui/IconButton";
import { Panel } from "@/app/_components/ui/Panel";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";
import { useObjectUrl } from "@/lib/clipr/hooks/useObjectUrl";
import type { CreatedVideo } from "@/lib/clipr/types/CreatedVideo";
import { formatBytes } from "@/lib/clipr/utils/formatBytes";
import { formatDate } from "@/lib/clipr/utils/formatDate";
import { formatDuration } from "@/lib/clipr/utils/formatDuration";

type CreatedVideoCardProps = {
  createdVideo: CreatedVideo;
  onDelete: (id: string) => void | Promise<void>;
};

export function CreatedVideoCard({
  createdVideo,
  onDelete,
}: CreatedVideoCardProps) {
  const url = useObjectUrl(createdVideo.blob);

  return (
    <Panel className="overflow-hidden">
      <VideoPreview src={url} label={createdVideo.name} />
      <div className="p-4">
        <h3 className="truncate text-sm font-bold text-text-primary">
          {createdVideo.name}
        </h3>
        <p className="mt-1 text-xs text-text-tertiary">
          {formatDuration(createdVideo.duration)} . {formatBytes(createdVideo.size)}
        </p>
        <p className="mt-2 text-xs text-text-secondary">
          {formatDate(createdVideo.createdAt)}
        </p>
        <div className="mt-4 flex gap-2">
          <a
            href={url ?? undefined}
            download={createdVideo.name}
            aria-label="Download created video"
            title="Download created video"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            <Download aria-hidden className="h-4 w-4" />
          </a>
          <IconButton
            label="Delete created video"
            variant="danger"
            icon={<Trash2 aria-hidden className="h-4 w-4" />}
            onClick={() => void onDelete(createdVideo.id)}
          />
        </div>
      </div>
    </Panel>
  );
}
