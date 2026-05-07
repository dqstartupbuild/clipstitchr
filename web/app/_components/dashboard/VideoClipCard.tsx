"use client";

import { Edit3, Trash2 } from "lucide-react";
import { Badge } from "@/app/_components/ui/Badge";
import { IconButton } from "@/app/_components/ui/IconButton";
import { Panel } from "@/app/_components/ui/Panel";
import { VideoPreview } from "@/app/_components/ui/VideoPreview";
import { useObjectUrl } from "@/lib/clipr/hooks/useObjectUrl";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";
import { formatBytes } from "@/lib/clipr/utils/formatBytes";
import { formatDuration } from "@/lib/clipr/utils/formatDuration";

type VideoClipCardProps = {
  clip: VideoClip;
  onDelete: (id: string) => void | Promise<void>;
  onRename: (clip: VideoClip, name: string) => void | Promise<void>;
};

export function VideoClipCard({ clip, onDelete, onRename }: VideoClipCardProps) {
  const url = useObjectUrl(clip.blob);

  return (
    <Panel className="overflow-hidden">
      <VideoPreview src={url} label={clip.name} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-text-primary">
              {clip.name}
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">
              {formatDuration(clip.duration)} . {formatBytes(clip.size)}
            </p>
          </div>
          <Badge tone={clip.clipType === "ugc" ? "purple" : "green"}>
            {clip.clipType.toUpperCase()}
          </Badge>
        </div>
        <div className="mt-4 flex gap-2">
          <IconButton
            label="Rename clip"
            icon={<Edit3 aria-hidden className="h-4 w-4" />}
            onClick={() => {
              const nextName = window.prompt("Rename clip", clip.name);

              if (nextName?.trim()) {
                void onRename(clip, nextName.trim());
              }
            }}
          />
          <IconButton
            label="Delete clip"
            variant="danger"
            icon={<Trash2 aria-hidden className="h-4 w-4" />}
            onClick={() => void onDelete(clip.id)}
          />
        </div>
      </div>
    </Panel>
  );
}
