"use client";

import { Download, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { LongrVideoDetailsDialog } from "@/app/_components/dashboard/LongrVideoDetailsDialog";
import {
  MediaCardActionMenu,
  type MediaCardActionMenuItem,
} from "@/app/_components/ui/MediaCardActionMenu";
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const actionItems: MediaCardActionMenuItem[] = [
    {
      label: "Download Long",
      icon: <Download aria-hidden className="h-4 w-4" />,
      onClick: () => downloadBlob(longrVideo.blob, longrVideo.name),
    },
    {
      label: "Delete Long",
      variant: "danger",
      icon: <Trash2 aria-hidden className="h-4 w-4" />,
      onClick: () => void onDelete(longrVideo.id),
    },
  ];

  return (
    <>
      <div className="mx-auto h-full w-full max-w-[280px] min-w-0 overflow-hidden rounded-lg border border-border bg-white p-2 transition-colors">
        <div className="relative overflow-hidden rounded-md bg-slate-100">
          <button
            type="button"
            aria-label={`Open details for ${longrVideo.name}`}
            className="group relative block aspect-square w-full text-left"
            onClick={() => setIsDetailsOpen(true)}
          >
            {posterUrl ? (
              <span
                aria-hidden
                className="block h-full w-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${posterUrl})` }}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs text-text-tertiary">
                Video
              </span>
            )}
            <span className="absolute inset-0 bg-slate-950/10 transition-colors group-hover:bg-slate-950/20" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-accent shadow-lg shadow-slate-900/20">
                <Play aria-hidden className="ml-0.5 h-5 w-5 fill-current" />
              </span>
            </span>
          </button>
          <span className="pointer-events-none absolute left-2 top-2 max-w-[75%] truncate rounded-md border border-purple-200 bg-white/95 px-2 py-1 text-[11px] font-bold leading-none text-accent-dark shadow-sm shadow-slate-900/10">
            LONG
          </span>
        </div>
        <div className="mt-3 flex items-start justify-between gap-2">
          <button
            type="button"
            className="min-w-0 flex-1 rounded-md text-left outline-none transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={() => setIsDetailsOpen(true)}
          >
            <h3 className="truncate text-sm font-bold text-text-primary">
              {longrVideo.name}
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">
              {formatDuration(longrVideo.duration)} .{" "}
              {formatBytes(longrVideo.size)}
            </p>
            <p className="mt-2 text-xs text-text-secondary">
              {formatDate(longrVideo.createdAt)}
            </p>
          </button>
          <MediaCardActionMenu
            label={`Actions for ${longrVideo.name}`}
            items={actionItems}
          />
        </div>
      </div>
      {isDetailsOpen ? (
        <LongrVideoDetailsDialog
          longrVideo={longrVideo}
          posterUrl={posterUrl}
          videoUrl={url}
          onClose={() => setIsDetailsOpen(false)}
        />
      ) : null}
    </>
  );
}
