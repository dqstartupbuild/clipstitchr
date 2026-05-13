"use client";

import { Download, Trash2 } from "lucide-react";
import { Badge } from "@/app/_components/ui/Badge";
import { IconButton } from "@/app/_components/ui/IconButton";
import { LongVideoPreview } from "@/app/_components/dashboard/LongVideoPreview";
import { Panel } from "@/app/_components/ui/Panel";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { LongrVideo } from "@/lib/clipstitchr/types/LongrVideo";
import { downloadBlob } from "@/lib/clipstitchr/utils/downloadBlob";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type LongrVideoCardProps = {
  longrVideo: LongrVideo;
  onDelete: (id: string) => void | Promise<void>;
};

export function LongrVideoCard({
  longrVideo,
  onDelete,
}: LongrVideoCardProps) {
  const url = useObjectUrl(longrVideo.blob);
  const posterUrl = useObjectUrl(longrVideo.posterBlob);

  return (
    <Panel className="w-full max-w-[390px] justify-self-center overflow-hidden">
      <LongVideoPreview
        src={url}
        posterSrc={posterUrl}
        label={longrVideo.name}
        duration={longrVideo.duration}
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-text-primary">
              {longrVideo.name}
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">
              {formatDuration(longrVideo.duration)} . {formatBytes(longrVideo.size)}
            </p>
            <p className="mt-2 text-xs text-text-secondary">
              {formatDate(longrVideo.createdAt)}
            </p>
          </div>
          <Badge>LONG</Badge>
        </div>
        <div className="mt-4 flex gap-2">
          <IconButton
            label="Download Long"
            icon={<Download aria-hidden className="h-4 w-4" />}
            onClick={() => downloadBlob(longrVideo.blob, longrVideo.name)}
          />
          <IconButton
            label="Delete Long"
            variant="danger"
            icon={<Trash2 aria-hidden className="h-4 w-4" />}
            onClick={() => void onDelete(longrVideo.id)}
          />
        </div>
      </div>
    </Panel>
  );
}
